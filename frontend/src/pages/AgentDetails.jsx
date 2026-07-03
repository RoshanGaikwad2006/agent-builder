import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AgentForm from '../components/Agent/AgentForm';
import { agentApi } from '../services/agentApi';


const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchAgent();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await agentApi.updateAgent(id, formData);
      navigate('/agents');
    } catch (err) {
      alert("Failed to update agent: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Specifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify instructions, status, and description for this AI agent profile.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-6">Loading agent specifications...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-xl max-w-2xl">
          {error}
        </div>
      ) : (
        <div className="max-w-2xl p-6 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <AgentForm 
            initialValues={agent}
            onSubmit={handleUpdate} 
            onCancel={() => navigate('/agents')} 
            buttonLabel="Update Agent Profile"
          />
        </div>
      )}
    </div>
  );
};

export default AgentDetails;
