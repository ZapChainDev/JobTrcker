import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import Layout from './components/Layout';
import { ProfileSetup } from './components/ProfileSetup';

console.log("Test Message from .env:", import.meta.env.VITE_TEST_MESSAGE);

function App() {
  const { user, isProfileComplete } = useAuth();

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                isProfileComplete ? (
                  <Dashboard />
                ) : (
                  <ProfileSetup />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
