import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProfileSetup } from './components/ProfileSetup';
import Profile from './pages/Profile';
import { Navbar } from './components/Navbar';
import GlobalChat from './components/GlobalChat';
import Admin from './pages/Admin';
import { Toaster } from 'sonner';

console.log("Test Message from .env:", import.meta.env.VITE_TEST_MESSAGE);

function App() {
  const { currentUser, userProfile } = useAuth();

  return (
    <Router>
      <Toaster position="top-right" />
      {currentUser && <Navbar />}
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              userProfile ? (
                <Dashboard />
              ) : (
                <ProfileSetup />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={currentUser ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={currentUser ? <GlobalChat /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={currentUser ? <Admin /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
