import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Agents from './pages/Agents';
import CreateAgent from './pages/CreateAgent';
import AgentDetails from './pages/AgentDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Default redirect to /chat */}
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="upload" element={<Upload />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/create" element={<CreateAgent />} />
          <Route path="agents/:id" element={<AgentDetails />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
