import React from 'react';

const Navbar = ({ isDark, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600 text-white font-bold text-lg dark:bg-green-500">
          R
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          RAG Core Agent Builder
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Light/Dark Mode Switcher */}
        <button
          onClick={onToggleTheme}
          type="button"
          className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? (
            // Sun Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Moon Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User profile identifier (generic placeholder) */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-sm text-gray-700 dark:text-gray-300">
            A
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            Developer
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
