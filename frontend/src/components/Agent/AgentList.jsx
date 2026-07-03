import React from 'react';
import AgentCard from './AgentCard';


const AgentList = ({ agents = [], onDelete }) => {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No agents built yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new custom AI agent configuration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default AgentList;
