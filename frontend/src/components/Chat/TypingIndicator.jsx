import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="flex items-start max-w-[70%] flex-row">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white bg-gray-500 dark:bg-gray-600 shrink-0 mr-3">
          A
        </div>

        {/* Typing Dots Bubble */}
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm dark:bg-gray-800 dark:border-gray-700 rounded-tl-none flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
