import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import { agentApi } from '../services/agentApi';
import apiClient from '../services/apiClient';


const PublicAgentChat = () => {
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
        const agentData = await agentApi.getAgent(id);
        if (!agentData.is_deployed) {
          setError("This agent is not deployed publicly by the administrator.");
          return;
        }
        setAgent(agentData);

        // Public session greeting message
        setMessages([
          {
            id: 'greeting',
            sender: 'agent',
            text: `Welcome! I am ${agentData.name}. ${agentData.description || 'How can I assist you today?'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } catch (err) {
        console.error(err);
        setError("The requested agent profile could not be found.");
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
        text: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAgent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500">
        Connecting to Agent...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Access Restrained</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md p-6 flex flex-col h-[85vh]">
        <div className="flex-none flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.description || "Public AI session."}</p>
          </div>
          <span className="text-xs text-gray-400">Powered by Agent Builder</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <div className="mt-4 flex-none">
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAgentChat;
