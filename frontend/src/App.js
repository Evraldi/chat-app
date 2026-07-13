import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuthPage from './components/auth/AuthPage';
import ChatPage from './components/chat/ChatPage';
import Loader from './components/common/Loader';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Main app content component
const AppContent = () => {
  const { currentUser, loading } = useAuth();

  // Show loader while checking authentication status
  if (loading) {
    return <Loader fullScreen />;
  }

  // Show auth page if not logged in, chat page if logged in
  return currentUser ? <ChatPage /> : <AuthPage />;
};

// Main app component with context providers
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
