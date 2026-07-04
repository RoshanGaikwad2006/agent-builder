import React, { useState, useEffect } from 'react';

import { agentApi } from '../services/agentApi';
import apiClient from '../services/apiClient';


const Conversations = () => {
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await agentApi.getAgents();
        setAgents(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadAgents();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedAgent ? `/conversations?agent_id=${selectedAgent}` : '/conversations';
      const response = await apiClient.get(url);
      setConversations(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve conversation histories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [selectedAgent]);

  const getAgentName = (agentId) => {
    if (!agentId) return "Global RAG";
    const found = agents.find(a => a.id === agentId);
    return found ? found.name : `Agent (${agentId.substring(0, 6)})`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interaction log?")) return;
    try {
      await apiClient.delete(`/conversations/${id}`);
      loadConversations();
    } catch (err) {
      alert("Failed to delete log: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review logged user prompts and generated model answers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-500 font-medium">Filter Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-sm px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="">All Agents & Global</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 py-6">Loading conversations...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-sm text-red-655 dark:text-red-450 rounded-xl">
          {error}
        </div>
      ) : conversations.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-850 rounded-2xl">
          No conversation history recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-150"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                      {getAgentName(conv.agent_id)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.created_at).toLocaleString()}
                    </span>
                    <span className="text-2xs text-gray-400">• Model: {conv.model_name} • Latency: {conv.response_time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
                    Q: {conv.user_question}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                    className="text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {expandedId === conv.id ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === conv.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-850 space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Generated Answer:</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl whitespace-pre-wrap">
                      {conv.ai_answer}
                    </p>
                  </div>
                  {conv.sources_used && conv.sources_used.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Grounding Sources:</label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {conv.sources_used.map((src, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Conversations;
