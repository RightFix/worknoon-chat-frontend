import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
};

export default Login;