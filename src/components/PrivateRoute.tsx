import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  console.log('PrivateRoute: currentUser', currentUser);
  console.log('PrivateRoute: userProfile', userProfile);
  console.log('PrivateRoute: loading', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If user is logged in but profile is null (not undefined, meaning we've checked and it doesn't exist),
  // redirect to profile setup unless they are already on the profile setup page
  // This prevents an infinite loop if /profile-setup is itself a private route.
  if (userProfile === null && window.location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" />;
  }

  return <>{children}</>;
} 