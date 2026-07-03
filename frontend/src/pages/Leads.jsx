import React, { useState, useEffect } from 'react';

import { agentApi } from '../services/agentApi';
import apiClient from '../services/apiClient';


const Leads = () => {
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedAgent ? `/leads?agent_id=${selectedAgent}` : '/leads';
      const response = await apiClient.get(url);
      setLeads(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leads records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [selectedAgent]);

  const getAgentName = (agentId) => {
    const found = agents.find(a => a.id === agentId);
    return found ? found.name : `Agent (${agentId.substring(0, 6)})`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Captured Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automatically captured business leads containing hot intent keywords (pricing, cost, demo, contact, purchase).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-500 font-medium">Filter Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-sm px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 py-6">Loading leads...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-sm text-red-655 dark:text-red-450 rounded-xl">
          {error}
        </div>
      ) : leads.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-850 rounded-2xl">
          No hot leads captured yet. Try testing sandbox chat with keywords like "pricing" or "demo".
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-808 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-900 text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Triggering Query Message</th>
                  <th className="px-6 py-4">Status / Type</th>
                  <th className="px-6 py-4">Date Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm text-gray-705 dark:text-gray-300">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {getAgentName(lead.agent_id)}
                    </td>
                    <td className="px-6 py-4 italic max-w-md truncate" title={lead.message}>
                      "{lead.message}"
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                        {lead.lead_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
