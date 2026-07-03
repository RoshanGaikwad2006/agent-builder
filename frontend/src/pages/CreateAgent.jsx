import React from 'react';
import { useNavigate } from 'react-router-dom';

import AgentForm from '../components/Agent/AgentForm';
import { agentApi } from '../services/agentApi';


const CreateAgent = () => {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      await agentApi.createAgent(formData);
      navigate('/agents');
    } catch (err) {
      alert("Failed to build agent: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Build AI Agent</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a new agent profile, configure descriptions, and specify system instructions.
        </p>
      </div>

      <div className="max-w-2xl p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <AgentForm 
          onSubmit={handleCreate} 
          onCancel={() => navigate('/agents')} 
          buttonLabel="Build Agent Profile"
        />
      </div>
    </div>
  );
};

export default CreateAgent;
