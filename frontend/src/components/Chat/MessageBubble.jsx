import React from 'react';

const MessageBubble = ({ message }) => {
  const { sender, text, timestamp, sources } = message;
  const isUser = sender === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white shrink-0 ${
          isUser ? 'ml-3 bg-green-600 dark:bg-green-500' : 'mr-3 bg-gray-500 dark:bg-gray-600'
        }`}>
          {isUser ? 'U' : 'A'}
        </div>

        {/* Message Bubble container */}
        <div className="flex flex-col">
          <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
            isUser
              ? 'bg-green-600 text-white dark:bg-green-500 rounded-tr-none'
              : 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 rounded-tl-none'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{text}</p>

            {/* Sources list */}
            {!isUser && sources && sources.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                  Sources
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                    >
                      📄 {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <span className={`text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
