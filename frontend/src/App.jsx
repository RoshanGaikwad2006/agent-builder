import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Agents from './pages/Agents';
import CreateAgent from './pages/CreateAgent';
import AgentDetails from './pages/AgentDetails';
import AgentChat from './pages/AgentChat';
import PublicAgentChat from './pages/PublicAgentChat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public standalone chat route without sidebar */}
        <Route path="agent/:id" element={<PublicAgentChat />} />

        {/* Dashboard routes with sidebar */}
        <Route path="/" element={<AppLayout />}>
          {/* Default redirect to /chat */}
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="upload" element={<Upload />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/create" element={<CreateAgent />} />
          <Route path="agents/:id" element={<AgentDetails />} />
          <Route path="agents/:id/chat" element={<AgentChat />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
