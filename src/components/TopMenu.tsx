'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function TopMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const { backgroundTheme, colorTheme, toggleBackgroundTheme, toggleColorTheme } = useTheme();

  const handleToggleBackground = () => {
    toggleBackgroundTheme();
    setShowMenu(false);
  };

  const handleToggleColor = () => {
    toggleColorTheme();
    setShowMenu(false);
  };

  return (
    <div className="border-b border-violet p-2 relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm font-mono text-violet">
          VALKYRIES DETECTIVE AGENCY
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-3 py-1 text-sm font-mono border border-violet text-violet hover:bg-violet hover:text-black transition-colors duration-200"
          >
            MENU
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 border border-violet min-w-32" style={{backgroundColor: 'var(--bg-color)'}}>
              <button
                onClick={handleToggleBackground}
                className="w-full px-3 py-2 text-sm font-mono text-violet hover:bg-violet hover:text-black transition-colors duration-200 text-left"
              >
                {backgroundTheme === 'dark' ? '> LIGHT MODE' : '> DARK MODE'}
              </button>
              <button
                onClick={handleToggleColor}
                className="w-full px-3 py-2 text-sm font-mono text-violet hover:bg-violet hover:text-black transition-colors duration-200 text-left"
              >
                {colorTheme === 'violet' ? '> APPLE II' : '> VIOLET'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}