import React from 'react';
import { Link } from 'react-router-dom';


const AgentCard = ({ agent, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-205 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            agent.status === 'active' 
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-300'
          }`}>
            {agent.status}
          </span>
          <div className="flex space-x-2">
            <Link 
              to={`/agents/${agent.id}`} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit Agent Specs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
            <button 
              onClick={() => onDelete(agent.id)}
              className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Delete Agent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {agent.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
          {agent.description || "No description provided."}
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto flex justify-between items-center">
        <Link 
          to={`/agents/${agent.id}`} 
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Configure Settings
        </Link>
        <Link 
          to={`/agents/${agent.id}/chat`} 
          className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center"
        >
          Chat Session &rarr;
        </Link>
      </div>
    </div>
  );
};

export default AgentCard;
