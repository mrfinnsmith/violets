'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AppleIIeImageProcessorProps {
  src: string;
  alt: string;
  className?: string;
}

export default function AppleIIeImageProcessor({ src, alt, className = '' }: AppleIIeImageProcessorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorTheme, backgroundTheme } = useTheme();

  // Get theme colors for monochrome Apple IIe palette
  const getThemeColors = () => {
    const bgColor = backgroundTheme === 'dark' ? [0, 0, 0] : [255, 255, 255];
    const themeColor = colorTheme === 'violet' ? [168, 85, 247] : [0, 255, 65];
    
    // Create monochrome Apple IIe palette with only background and theme colors
    return [
      bgColor,      // Background (black or white)
      themeColor    // Theme color (violet or apple green)
    ];
  };

  const HIRES_WIDTH = 800;
  const HIRES_HEIGHT = 1200;

  const findClosestColor = (r: number, g: number, b: number): number[] => {
    const palette = getThemeColors();
    
    // Calculate luminance to determine if pixel should be background or theme color
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Use luminance threshold for monochrome conversion
    // Pixels below threshold become background, above become theme color
    return luminance < 128 ? palette[0] : palette[1];
  };

  const isBackgroundColor = (color: number[]): boolean => {
    const palette = getThemeColors();
    const bgColor = palette[0];
    const [r, g, b] = color;
    return r === bgColor[0] && g === bgColor[1] && b === bgColor[2];
  };

  const applyHorizontalPairing = (data: Uint8ClampedArray, width: number, height: number) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x += 2) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + x + 1) * 4;

        const color1 = [data[idx1], data[idx1 + 1], data[idx1 + 2]];
        const color2 = [data[idx2], data[idx2 + 1], data[idx2 + 2]];

        if (!isBackgroundColor(color1) || !isBackgroundColor(color2)) {
          const dominantColor = !isBackgroundColor(color1) ? color1 : color2;
          
          data[idx1] = dominantColor[0];
          data[idx1 + 1] = dominantColor[1];
          data[idx1 + 2] = dominantColor[2];
          
          data[idx2] = dominantColor[0];
          data[idx2 + 1] = dominantColor[1];
          data[idx2 + 2] = dominantColor[2];
        }
      }
    }
  };

  const applyBlockyDithering = (data: Uint8ClampedArray, width: number, height: number) => {
    for (let y = 0; y < height - 1; y += 2) {
      for (let x = 0; x < width - 1; x += 2) {
        const pixels = [];
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            pixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }

        const colorCounts = new Map();
        for (const pixel of pixels) {
          const key = pixel.join(',');
          colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        }

        const mostCommon = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])[0][0]
          .split(',')
          .map(Number);

        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            data[idx] = mostCommon[0];
            data[idx + 1] = mostCommon[1];
            data[idx + 2] = mostCommon[2];
          }
        }
      }
    }
  };

  useEffect(() => {
    const processImage = async () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load the source image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = src;
        });

        // Set canvas to Apple IIe HIRES resolution
        canvas.width = HIRES_WIDTH;
        canvas.height = HIRES_HEIGHT;

        // Draw source image scaled to Apple IIe resolution with nearest neighbor
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, HIRES_WIDTH, HIRES_HEIGHT);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, HIRES_WIDTH, HIRES_HEIGHT);
        const data = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Find closest color in Apple IIe palette
          const closest = findClosestColor(r, g, b);
          
          data[i] = closest[0];     // R
          data[i + 1] = closest[1]; // G
          data[i + 2] = closest[2]; // B
          // Alpha stays the same
        }

        // Apply horizontal pixel pairing for color artifacting
        applyHorizontalPairing(data, HIRES_WIDTH, HIRES_HEIGHT);

        // Apply blocky dithering
        applyBlockyDithering(data, HIRES_WIDTH, HIRES_HEIGHT);

        // Put processed pixels back
        ctx.putImageData(imageData, 0, 0);

        setIsLoading(false);
      } catch (err) {
        console.error('Image processing error:', err);
        setError(err instanceof Error ? err.message : 'Processing failed');
        setIsLoading(false);
      }
    };

    processImage();
  }, [src, colorTheme, backgroundTheme]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-900 text-red-100 text-xs p-2`}>
        Error: {error}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      style={{
        imageRendering: 'pixelated',
        width: '200px',
        height: '150px'
      }}
      aria-label={alt}
    />
  );
}