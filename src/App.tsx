import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { MainLayout } from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Inbox />} />
                <Route path="/chat/:conversationId" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1A1D21',
                  color: '#F0F2F5',
                },
                success: {
                  iconTheme: {
                    primary: '#22C55E',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;