import React from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <RegisterForm />;
};

export default Register;