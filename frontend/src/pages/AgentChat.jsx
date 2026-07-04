import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import { agentApi } from '../services/agentApi';
import apiClient from '../services/apiClient';


const AgentChat = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      setLoadingAgent(true);
      setError(null);
      try {
        // 1. Fetch agent specifications
        const agentData = await agentApi.getAgent(id);
        setAgent(agentData);

        // 2. Fetch conversation history for this agent
        const historyResponse = await apiClient.get(`/agents/${id}/history`);
        const historyData = historyResponse.data;

        // 3. Transform history into user/agent message objects
        const loadedMessages = [];
        historyData.forEach((item) => {
          const timestamp = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          loadedMessages.push({
            id: `${item.id}-user`,
            sender: 'user',
            text: item.user_question,
            timestamp,
          });
          loadedMessages.push({
            id: `${item.id}-agent`,
            sender: 'agent',
            text: item.ai_answer,
            sources: item.sources_used,
            timestamp,
          });
        });

        // If no history, add greeting message
        if (loadedMessages.length === 0) {
          loadedMessages.push({
            id: 'greeting',
            sender: 'agent',
            text: `Hello! I am ${agentData.name}. ${agentData.description || 'Ask me anything about my knowledge base.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }

        setMessages(loadedMessages);
      } catch (err) {
        console.error(err);
        setError("Failed to load agent chat session. Verify agent ID exists.");
      } finally {
        setLoadingAgent(false);
      }
    };

    initChat();
  }, [id]);

  const handleSendMessage = async (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.post(`/agents/${id}/chat`, { message: text });
      const botMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: response.data.answer,
        sources: response.data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'agent',
        text: 'Sorry, I encountered an error while processing your request. Please check that the agent is configured correctly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAgent) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)] text-gray-500">
        Initializing Agent Chat session...
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-6 h-[calc(100vh-7rem)]">
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-xl max-w-2xl">
          {error || "Agent specifications could not be resolved."}
        </div>
        <Link to="/agents" className="mt-4 inline-block text-sm font-semibold text-green-600 hover:text-green-700">
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] space-y-4">
      <div className="flex-none flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              Active Agent
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {agent.description || "Custom AI agent session."}
          </p>
        </div>
        <Link
          to="/agents"
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Close Session
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <div className="mt-4 flex-none">
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
