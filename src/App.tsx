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
import JobDirectoriesPage from './pages/JobDirectoriesPage';
import { DiscussionBoard } from './components/discussion/DiscussionBoard';

console.log("Test Message from .env:", import.meta.env.VITE_TEST_MESSAGE);

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {currentUser && <Navbar />}
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile-setup" element={currentUser ? <ProfileSetup /> : <Navigate to="/login" />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/chat" element={currentUser ? <GlobalChat /> : <Navigate to="/login" />} />
          <Route path="/admin" element={currentUser ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/job-directories" element={currentUser ? <JobDirectoriesPage /> : <Navigate to="/login" />} />
          <Route path="/discussion" element={currentUser ? <DiscussionBoard /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
