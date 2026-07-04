import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AgentForm from '../components/Agent/AgentForm';
import { agentApi } from '../services/agentApi';


const CreateAgent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'custom'

  // Advanced Custom Form State
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customModel, setCustomModel] = useState('gpt-4o-mini');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('https://api.openai.com/v1');
  const [customIndex, setCustomIndex] = useState('rag-index');
  const [customNamespace, setCustomNamespace] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTemperature, setCustomTemperature] = useState(0.7);
  const [customMaxTokens, setCustomMaxTokens] = useState(2048);
  const [customEmbeddingModel, setCustomEmbeddingModel] = useState('sentence-transformers/all-MiniLM-L6-v2');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customError, setCustomError] = useState(null);
  const [customSuccess, setCustomSuccess] = useState(false);

  const handleQuickCreate = async (formData) => {
    try {
      await agentApi.createAgent(formData);
      navigate('/agents');
    } catch (err) {
      alert("Failed to build agent: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCustomCreate = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return setCustomError("Agent Name is required.");
    if (!customPrompt.trim()) return setCustomError("System Instructions are required.");

    setIsSubmitting(true);
    setCustomError(null);

    try {
      // Build agent profile in MongoDB with standard settings + custom details in description
      const desc = customDescription 
        ? `${customDescription} [Model: ${customModel}]`
        : `Custom Agent running ${customModel}`;
      
      await agentApi.createAgent({
        name: customName,
        description: desc,
        system_prompt: customPrompt,
        status: 'active'
      });

      setCustomSuccess(true);
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
    } catch (err) {
      console.error(err);
      setCustomError("Failed to build custom agent: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Build AI Agent</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure, custom-tune, and instantiate tailored RAG-orchestrated conversational agents.
          </p>
        </div>

        {/* Premium Tab Toggle */}
        <div className="flex bg-gray-200/60 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-300 dark:border-gray-800 shadow-inner">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
              activeTab === 'quick'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Quick Build
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
              activeTab === 'custom'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Customized Agent (Advanced)
          </button>
        </div>
      </div>

      {activeTab === 'quick' ? (
        <div className="max-w-2xl p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <AgentForm 
            onSubmit={handleQuickCreate} 
            onCancel={() => navigate('/agents')} 
            buttonLabel="Build Agent Profile"
          />
        </div>
      ) : (
        <div className="max-w-3xl p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-850 pb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Agent Configurator</h2>
            <p className="text-xs text-gray-400">
              Provide model credentials, custom temperature, base endpoint overrides, and index mapping settings.
            </p>
          </div>

          {customError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-655 dark:text-red-400 rounded-xl">
              {customError}
            </div>
          )}

          {customSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm text-green-755 dark:text-green-400 rounded-xl font-medium">
              🎉 Customized agent generated successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleCustomCreate} className="space-y-6">
            {/* Section 1: General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">1. General Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Agent Name *</label>
                  <input
                    type="text" required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Enterprise Assistant"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g. Tailored sales representative"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: LLM Configuration */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">2. LLM Provider Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Model Engine</label>
                  <select
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Recommended)</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="meta-llama-3-70b">Llama 3 70B (OpenRouter)</option>
                    <option value="mistral-large">Mistral Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Custom Provider Base URL</label>
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Decentralized API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="sk-........................................"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-2xs text-gray-400 mt-1">If left blank, the platform's default API credentials will be used.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Vector Store */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">3. Knowledge Base Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Pinecone Target Index</label>
                  <input
                    type="text"
                    value={customIndex}
                    onChange={(e) => setCustomIndex(e.target.value)}
                    placeholder="rag-index"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Custom Index Namespace</label>
                  <input
                    type="text"
                    value={customNamespace}
                    onChange={(e) => setCustomNamespace(e.target.value)}
                    placeholder="e.g. sales-assistant-isolated"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Parameters */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">4. Generation Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Temperature: {customTemperature}</label>
                    <span className="text-2xs text-gray-400 font-semibold">{customTemperature === 0 ? 'Deterministic' : customTemperature > 0.8 ? 'Creative' : 'Balanced'}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.1"
                    value={customTemperature}
                    onChange={(e) => setCustomTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Max Tokens Limit</label>
                  <input
                    type="number"
                    value={customMaxTokens}
                    onChange={(e) => setCustomMaxTokens(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Embeddings Engine</label>
                  <select
                    value={customEmbeddingModel}
                    onChange={(e) => setCustomEmbeddingModel(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-shadow outline-none text-sm"
                  >
                    <option value="sentence-transformers/all-MiniLM-L6-v2">Hugging Face sentence-transformers/all-MiniLM-L6-v2 (384-dim)</option>
                    <option value="openai-text-embedding-3-small">OpenAI text-embedding-3-small (1536-dim)</option>
                    <option value="cohere-embed-multilingual-v3.0">Cohere Embed Multilingual v3.0 (1024-dim)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: System instructions */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">5. Prompt Settings</h3>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Custom System Prompt *</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="You are an expert sales representative. Answer customer questions politely using context. Focus on scheduling demos..."
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-green-500 transition-shadow outline-none"
                  required
                />
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-850">
              <button
                type="button"
                onClick={() => navigate('/agents')}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || customSuccess}
                className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Provisioning...' : 'Build Custom Agent'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateAgent;
