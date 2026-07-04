import React, { useState } from 'react';


const AgentForm = ({ initialValues = {}, onSubmit, onCancel, buttonLabel = "Save Agent" }) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [systemPrompt, setSystemPrompt] = useState(initialValues.system_prompt || '');
  const [status, setStatus] = useState(initialValues.status || 'active');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    if (!systemPrompt.trim()) return setError("System prompt instructions are required");
    
    onSubmit({
      name,
      description,
      system_prompt: systemPrompt,
      status
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-green-700 dark:text-green-400 mb-1.5">
          Agent Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sales Assistant"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-green-700 dark:text-green-400 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Answers product questions from support documents."
          rows="3"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-green-700 dark:text-green-400 mb-1.5">
          System Instructions (System Prompt) *
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Instructions that govern agent behavior. Example: You are a professional support agent. Answers must be detailed and polite..."
          rows="6"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-green-700 dark:text-green-400 mb-1.5">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          {buttonLabel}
        </button>
      </div>
    </form>
  );
};

export default AgentForm;
