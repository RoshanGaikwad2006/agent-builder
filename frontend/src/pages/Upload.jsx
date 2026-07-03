import React, { useState, useEffect } from 'react';
import PDFUploader from '../components/Upload/PDFUploader';
import { uploadApi } from '../services/uploadApi';

const Upload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, indexing, success, error
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Fetch all documents metadata from MongoDB
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await uploadApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (file) => {
    setProgress(0);
    setStatus('uploading');
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await uploadApi.uploadFile(file, (percent) => {
        setProgress(percent);
        if (percent === 100) {
          setStatus('indexing');
        }
      });

      if (response.status === 'success') {
        setStatus('success');
        setSuccessMessage(`Document "${file.name}" uploaded and indexed successfully into the vector database.`);
        fetchDocuments(); // Refresh documents list after successful upload
      } else {
        throw new Error(response.message || 'Failed to ingest file');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.detail || err.message || 'An error occurred during document indexing.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document's metadata?")) return;
    try {
      await uploadApi.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Knowledge Base</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload PDF documents to parse, embed, and index them into the RAG vector store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Upload Column */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <PDFUploader
            onUpload={handleUpload}
            progress={progress}
            status={status}
            error={error}
            successMessage={successMessage}
          />
        </div>

        {/* Documents List Column */}
        <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col min-h-[350px]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ingested Documents</h2>
          
          {loadingDocs ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500 text-center">
              No documents ingested yet. Upload your first PDF to get started!
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl"
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={doc.filename}>
                      {doc.filename}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(doc.file_size / 1024).toFixed(1)} KB • {doc.number_of_chunks} chunks
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors flex-shrink-0"
                    title="Delete document metadata"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
