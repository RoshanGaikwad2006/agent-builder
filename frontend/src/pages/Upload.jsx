import React, { useState } from 'react';
import PDFUploader from '../components/Upload/PDFUploader';
import { uploadApi } from '../services/uploadApi';

const Upload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, indexing, success, error
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleUpload = async (file) => {
    setProgress(0);
    setStatus('uploading');
    setError(null);
    setSuccessMessage(null);

    try {
      // Axios upload file with progress reporting callback
      const response = await uploadApi.uploadFile(file, (percent) => {
        setProgress(percent);
        if (percent === 100) {
          setStatus('indexing'); // transitions status to database indexing phase
        }
      });

      if (response.status === 'success') {
        setStatus('success');
        setSuccessMessage(`Document "${file.name}" uploaded and indexed successfully into the vector database.`);
      } else {
        throw new Error(response.message || 'Failed to ingest file');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.detail || err.message || 'An error occurred during document indexing.');
    }
  };

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-7rem)]">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Knowledge Base</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload PDF documents to parse, embed, and index them into the RAG vector store.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <PDFUploader
          onUpload={handleUpload}
          progress={progress}
          status={status}
          error={error}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
};

export default Upload;
