import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AgentForm from '../components/Agent/AgentForm';
import { agentApi } from '../services/agentApi';
import { uploadApi } from '../services/uploadApi';
import apiClient from '../services/apiClient';


const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tabs configuration: 'settings' | 'knowledge'
  const [activeTab, setActiveTab] = useState('settings');

  // Knowledge base state variables
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, indexing, success, error
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);

  const fetchAgent = async () => {
    try {
      const data = await agentApi.getAgent(id);
      setAgent(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load agent specifications from database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await uploadApi.getAgentDocuments(id);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchAgent();
    fetchDocuments();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await agentApi.updateAgent(id, formData);
      navigate('/agents');
    } catch (err) {
      alert("Failed to update agent: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeploy = async () => {
    try {
      const response = await apiClient.post(`/agents/${id}/deploy`);
      setAgent(response.data);
      alert("Agent deployed successfully!");
    } catch (err) {
      alert("Failed to deploy agent: " + (err.response?.data?.detail || err.message));
    }
  };

  const copyDeploymentLink = () => {
    if (!agent?.public_url) return;
    const fullUrl = `${window.location.origin}${agent.public_url}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Public link copied to clipboard!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadStatus('error');
      setUploadError("Only PDF files are supported.");
      return;
    }

    setUploadProgress(0);
    setUploadStatus('uploading');
    setUploadError(null);
    setUploadSuccessMessage(null);

    try {
      const response = await uploadApi.uploadAgentFile(id, file, (percent) => {
        setUploadProgress(percent);
        if (percent === 100) {
          setUploadStatus('indexing');
        }
      });

      if (response.status === 'success') {
        setUploadStatus('success');
        setUploadSuccessMessage(`Successfully uploaded and indexed "${file.name}" for this agent.`);
        fetchDocuments();
      } else {
        throw new Error(response.message || 'Failed to ingest file');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setUploadError(err.response?.data?.detail || err.message || 'An error occurred during document indexing.');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document from the agent's knowledge base?")) return;
    try {
      await uploadApi.deleteDocument(docId);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex-none flex items-center justify-between border-b border-gray-155 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {agent ? `Configure specifications for agent: ${agent.name}` : "Configure specifications and knowledge base for this agent."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-6">Loading agent specifications...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-xl max-w-2xl">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors duration-150 outline-none ${
                activeTab === 'settings'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors duration-150 outline-none ${
                activeTab === 'knowledge'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Knowledge Base
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'settings' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Form Settings */}
              <div className="md:col-span-2 p-6 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-2xl">
                <AgentForm 
                  initialValues={agent}
                  onSubmit={handleUpdate} 
                  onCancel={() => navigate('/agents')} 
                  buttonLabel="Update Agent Profile"
                />
              </div>

              {/* Deployment Settings Panel */}
              <div className="p-6 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Deploy this agent publicly to generate a standalone shareable chat link.
                </p>

                <div className="flex flex-col space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
                      agent.is_deployed 
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {agent.is_deployed ? 'Live (Public)' : 'Draft (Local Only)'}
                    </span>
                  </div>

                  {agent.is_deployed && agent.public_url && (
                    <div className="flex flex-col space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <label className="text-2xs text-gray-500 dark:text-gray-450 font-bold uppercase tracking-wider">Share Link:</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}${agent.public_url}`}
                          className="flex-1 text-2xs px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 outline-none select-all"
                        />
                        <button
                          onClick={copyDeploymentLink}
                          className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors"
                          title="Copy link to clipboard"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 3h3m-9-3h.01M5 16h.01" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDeploy}
                    className="w-full mt-4 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                  >
                    {agent.is_deployed ? 'Re-deploy Agent' : 'Deploy Publicly'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Upload Panel */}
              <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-808 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Agent Documents</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload PDF documents to parse, embed, and index them into this agent's isolated namespace.
                </p>

                {/* Upload Action */}
                <div className="mt-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-500 transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'indexing'}
                  />
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-green-600 dark:text-green-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PDF documents up to 10MB</p>
                </div>

                {/* Status Indicator */}
                {(uploadStatus === 'uploading' || uploadStatus === 'indexing') && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                      <span>{uploadStatus === 'uploading' ? 'Uploading file...' : 'Splitting & Indexing vectors...'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-805 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'success' && uploadSuccessMessage && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm text-green-755 dark:text-green-400 rounded-xl font-medium">
                    {uploadSuccessMessage}
                  </div>
                )}

                {uploadStatus === 'error' && uploadError && (
                  <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-sm text-red-655 dark:text-red-400 rounded-xl font-medium">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Ingested Documents List */}
              <div className="p-6 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-808 rounded-2xl flex flex-col min-h-[350px]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ingested Knowledge</h3>

                {loadingDocs ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                    Loading agent documents...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-500 text-center">
                    No documents ingested for this agent yet.
                  </div>
                ) : (
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl animate-fade-in"
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
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-955/30 p-1.5 rounded-lg transition-colors flex-shrink-0"
                          title="Remove document"
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
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDetails;
