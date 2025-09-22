'use client';

import { useState } from 'react';

export default function TopMenu() {
  const [isAppleTheme, setIsAppleTheme] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    
    if (isAppleTheme) {
      // Switch to violet theme
      root.style.setProperty('--text-color', '#a855f7');
      root.style.setProperty('--theme-color-violet', '#a855f7');
      root.style.setProperty('--theme-color-apple-green', '#a855f7');
    } else {
      // Switch to apple theme
      root.style.setProperty('--text-color', '#00ff41');
      root.style.setProperty('--theme-color-violet', '#00ff41');
      root.style.setProperty('--theme-color-apple-green', '#00ff41');
    }
    
    setIsAppleTheme(!isAppleTheme);
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
            <div className="absolute right-0 top-full mt-1 border border-violet bg-black min-w-32">
              <button
                onClick={toggleTheme}
                className="w-full px-3 py-2 text-sm font-mono text-violet hover:bg-violet hover:text-black transition-colors duration-200 text-left"
              >
                {isAppleTheme ? '> VIOLET' : '> APPLE II'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}