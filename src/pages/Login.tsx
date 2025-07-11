import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import LeftPanelImage from '@/assets/leftpanelimage.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const { signIn, googleSignIn, linkEmailPassword, isGoogleUser, checkEmailProvider } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      if (isGoogleUser && showPasswordSetup) {
        await linkEmailPassword(email, password);
        setShowPasswordSetup(false);
        navigate('/');
      } else {
        // Before attempting login, check methods for debugging
        const methods = await checkEmailProvider(email);
        console.log('Sign-in methods for email', email, ':', methods);

        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      if (err.message.includes('Google account')) {
        setError(err.message);
        setShowPasswordSetup(true);
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      const result = await googleSignIn();
      
      // After successful Google sign-in, check if we should show password setup
      if (result.user) {
        const methods = await checkEmailProvider(result.user.email || '');
        if (!methods.includes('password')) {
          setShowPasswordSetup(true);
          setEmail(result.user.email || '');
        }
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl h-[600px] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Left pane for image and testimonial */}
        <div className="hidden md:block w-1/2 h-full bg-cover bg-center relative" style={{ backgroundImage: `url(${LeftPanelImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          <div className="absolute top-6 left-6 flex items-center">
            {/* Placeholder for JobTrackr logo */}
            <span className="ml-2 text-white text-lg font-semibold">JobTrackr</span>
          </div>
          <div className="absolute bottom-10 left-10 text-white text-left max-w-sm">
            <blockquote className="text-xl font-semibold leading-relaxed mb-4">
              "The future depends on what you do today."
            </blockquote>
            <p className="text-lg font-medium">John Mark Papelirin</p>
            <p className="text-sm text-gray-300">Full Stack Web Developer</p>
          </div>
        </div>

        {/* Right pane for login form */}
        <Card className="w-full md:w-1/2 p-8 space-y-8 bg-white dark:bg-gray-800 shadow-none border-none rounded-none">
          <CardHeader className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              {showPasswordSetup ? 'Set Up Password Login' : 'Welcome back to JobTrackr'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {showPasswordSetup 
                ? 'Set up password login for your Google account.'
                : 'Build your job search effortlessly with our powerful application tracker.'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md animate-fade-in-down">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out bg-white dark:bg-gray-700 dark:text-white"
                  disabled={showPasswordSetup && isGoogleUser}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {showPasswordSetup ? 'New Password' : 'Password'}
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading 
                  ? (showPasswordSetup ? 'Setting up password...' : 'Logging in...') 
                  : (showPasswordSetup ? 'Set Password' : 'Log in')}
              </Button>
            </form>
            {!showPasswordSetup && (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <span className="w-full border-b border-gray-300 dark:border-gray-600"></span>
                  <span className="px-2 text-gray-500 dark:text-gray-400 text-sm">OR</span>
                  <span className="w-full border-b border-gray-300 dark:border-gray-600"></span>
                </div>
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full mt-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-105"
                  disabled={loading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-8">
            {!showPasswordSetup && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 transition duration-150 ease-in-out">
                  Sign up
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 