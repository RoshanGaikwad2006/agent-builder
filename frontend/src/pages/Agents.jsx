import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import AgentList from '../components/Agent/AgentList';
import { agentApi } from '../services/agentApi';


const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentApi.getAgents();
      setAgents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch registered agents from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) return;
    try {
      await agentApi.deleteAgent(id);
      fetchAgents();
    } catch (err) {
      alert("Failed to delete agent: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Build and manage custom system prompt rules for specialized AI agents.
          </p>
        </div>
        <Link 
          to="/agents/create" 
          className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Build Agent
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          Loading agents specs directory...
        </div>
      ) : (
        <AgentList agents={agents} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Agents;
