import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';

export default function Profile() {
  const { currentUser, userProfile, linkEmailPassword, refreshUserProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const hasEmailPasswordProvider = currentUser?.providerData.some(
    (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
  );
  const isGoogleLinked = currentUser?.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );

  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await linkEmailPassword(email, password);
      setMessage('Email and password successfully linked!');
      await refreshUserProfile(); // Refresh user profile to get updated providers
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to link email and password.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-400">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Profile</CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Manage your account settings and linked providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Account Information</h3>
            <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {currentUser.email}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>User ID:</strong> {currentUser.uid}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Providers:</strong> {currentUser.providerData.map(p => p.providerId).join(', ') || 'None'}</p>
          </div>

          {!hasEmailPasswordProvider && isGoogleLinked && (
            <form onSubmit={handleLinkEmailPassword} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Link Email and Password</h3>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}
              {message && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">{message}</div>}
              <div>
                <label htmlFor="link-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  id="link-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="link-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <Input
                  id="link-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Linking...' : 'Link Email & Password'}
              </Button>
            </form>
          )}

          {hasEmailPasswordProvider && (
            <p className="text-green-600 dark:text-green-400 font-semibold mt-6">
              Email and password login is already set up for your account.
            </p>
          )}
          
          {!isGoogleLinked && (
            <p className="text-red-600 dark:text-red-400 font-semibold mt-6">
              Your account is not linked with Google. Please sign in with Google to use this feature.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 