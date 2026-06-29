import React, { useState } from 'react';
import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import { chatApi } from '../services/chatApi';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      sender: 'agent',
      text: 'Hello! I am your RAG Chat Assistant. Ask me questions about the documents you have uploaded.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await chatApi.sendMessage(text);
      const botMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: response.answer,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'agent',
        text: 'Sorry, I encountered an error while processing your request. Please check that the backend service is running and configured correctly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] space-y-4">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Assistant</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Query your documents using Retrieval-Augmented Generation (RAG).
        </p>
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

export default Chat;
