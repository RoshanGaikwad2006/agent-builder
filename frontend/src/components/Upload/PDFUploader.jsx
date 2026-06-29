import React, { useState, useRef } from 'react';
import Button from '../Common/Button';
import UploadProgress from './UploadProgress';

const PDFUploader = ({ onUpload, progress, status, error, successMessage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are supported.');
      return;
    }
    setSelectedFile(file);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadClick = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
  };

  const handleClear = () => {
    setSelectedFile(null);
  };

  const isUploading = status === 'uploading' || status === 'indexing';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl p-8 bg-white border border-gray-200 rounded-2xl dark:bg-gray-950 dark:border-gray-800 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleChange}
        disabled={isUploading}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : onButtonClick}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
          dragActive
            ? 'border-green-500 bg-green-50/30 dark:bg-green-950/10'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-700'
        } ${selectedFile ? 'cursor-default pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          {selectedFile ? (
            <>
              {/* PDF Icon */}
              <svg className="w-16 h-16 text-green-600 dark:text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              {/* Cloud Upload Icon */}
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                Drag & Drop your PDF here, or <span className="text-green-600 dark:text-green-500 hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports only PDF documents (Max 20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFile && !isUploading && (
        <div className="flex space-x-3 w-full mt-6">
          <Button onClick={handleClear} variant="secondary" className="flex-1">
            Clear File
          </Button>
          <Button onClick={handleUploadClick} variant="primary" className="flex-1">
            Upload & Ingest
          </Button>
        </div>
      )}

      {isUploading && (
        <UploadProgress progress={progress} status={status} />
      )}

      {successMessage && (
        <div className="w-full mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium text-center dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div className="w-full mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium text-center dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
