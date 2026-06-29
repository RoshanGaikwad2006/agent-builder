import React from 'react';

const UploadProgress = ({ progress, status }) => {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{status === 'indexing' ? 'Indexing vectors in Pinecone...' : 'Uploading PDF...'}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            status === 'indexing'
              ? 'bg-blue-500 animate-pulse'
              : 'bg-green-600 dark:bg-green-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
