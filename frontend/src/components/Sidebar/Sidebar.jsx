import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 dark:bg-gray-950 dark:border-gray-800 flex flex-col h-[calc(100vh-4rem)]">
      <nav className="flex-1 px-4 py-6 space-y-1">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`
          }
        >
          {/* Chat Icon */}
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat Assistant
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`
          }
        >
          {/* Upload Icon */}
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Knowledge
        </NavLink>

        <NavLink
          to="/agents"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`
          }
        >
          {/* Agent Icon */}
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Manage Agents
        </NavLink>
      </nav>

      {/* Footer copyright */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2026 AI Agent Builder
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
