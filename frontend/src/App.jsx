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
import Conversations from './pages/Conversations';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/Common/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Public standalone chat route without sidebar */}
        <Route path="agent/:id" element={<PublicAgentChat />} />

        {/* Protected Dashboard routes with sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<Chat />} />
            <Route path="upload" element={<Upload />} />
            <Route path="agents" element={<Agents />} />
            <Route path="agents/create" element={<CreateAgent />} />
            <Route path="agents/:id" element={<AgentDetails />} />
            <Route path="agents/:id/chat" element={<AgentChat />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="leads" element={<Leads />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
