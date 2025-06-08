import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { GoogleAuthProvider, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Save, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../lib/types';

export default function Profile() {
  const { currentUser, userProfile, linkEmailPassword, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '',
    photoURL: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(formData.displayName || '');
  const [tempPhotoURL, setTempPhotoURL] = useState(formData.photoURL || '');
  const [tempAge, setTempAge] = useState(userProfile?.age || '');
  const [tempCourse, setTempCourse] = useState(userProfile?.course || '');
  const [tempMotivation, setTempMotivation] = useState(userProfile?.motivation || '');
  const [tempName, setTempName] = useState(userProfile?.name || '');

  const hasEmailPasswordProvider = currentUser?.providerData.some(
    (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
  );
  const isGoogleLinked = currentUser?.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName,
        email: userProfile.email,
        photoURL: userProfile.photoURL
      });
    }
  }, [userProfile]);

  // Effect to update profile picture from Google when user signs in
  useEffect(() => {
    const updateProfileFromGoogle = async () => {
      if (currentUser && isGoogleLinked) {
        const googleProvider = currentUser.providerData.find(
          (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
        );
        
        if (googleProvider?.photoURL && googleProvider.photoURL !== currentUser.photoURL) {
          try {
            await updateProfile(currentUser, {
              photoURL: googleProvider.photoURL
            });
            setTempPhotoURL(googleProvider.photoURL);
            await refreshUserProfile();
          } catch (err) {
            console.error('Failed to update profile picture from Google:', err);
          }
        }
      }
    };

    updateProfileFromGoogle();
  }, [currentUser, isGoogleLinked, refreshUserProfile]);

  // Update temp values when displayName, photoURL, or userProfile changes
  useEffect(() => {
    setTempDisplayName(formData.displayName || '');
    setTempPhotoURL(formData.photoURL || '');
    setTempAge(userProfile?.age || '');
    setTempCourse(userProfile?.course || '');
    setTempMotivation(userProfile?.motivation || '');
    setTempName(userProfile?.name || '');
  }, [formData, userProfile]);

  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await linkEmailPassword(email, password);
      setSuccess('Email and password successfully linked!');
      await refreshUserProfile();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to link email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setError('');
    setSuccess('');

    try {
      if (currentUser) {
        // Update Firebase Auth profile (displayName, photoURL)
        await updateProfile(currentUser, {
          displayName: tempDisplayName,
          photoURL: tempPhotoURL || null
        });
        setFormData({
          displayName: tempDisplayName,
          photoURL: tempPhotoURL
        });

        // Update Firestore user profile (age, course, motivation, name)
        const userRef = doc(db, 'userProfiles', currentUser.uid);
        await setDoc(userRef, {
          age: tempAge,
          course: tempCourse,
          motivation: tempMotivation,
          name: tempName,
        }, { merge: true });

        setSuccess('Profile updated successfully!');
        await refreshUserProfile(); // Refresh user profile to reflect Firestore changes
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setTempDisplayName(formData.displayName || '');
    setTempPhotoURL(formData.photoURL || '');
    setTempAge(userProfile?.age || '');
    setTempCourse(userProfile?.course || '');
    setTempMotivation(userProfile?.motivation || '');
    setTempName(userProfile?.name || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-400">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Profile</CardTitle>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
          </div>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Manage your account settings and linked providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture and Display Name Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={isEditing ? tempPhotoURL : currentUser.photoURL || undefined} alt={isEditing ? tempDisplayName : currentUser.displayName || 'User'} />
              <AvatarFallback>{(isEditing ? tempDisplayName : currentUser.displayName)?.[0] || currentUser.email?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <Input
                  id="display-name"
                  type="text"
                  value={isEditing ? tempDisplayName : formData.displayName}
                  onChange={(e) => setTempDisplayName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your display name"
                  disabled={!isEditing}
                />
              </div>
              {!isGoogleLinked && (
                <div>
                  <label htmlFor="photo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture URL
                  </label>
                  <Input
                    id="photo-url"
                    type="url"
                    value={isEditing ? tempPhotoURL : formData.photoURL}
                    onChange={(e) => setTempPhotoURL(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                    placeholder="Enter profile picture URL"
                    disabled={!isEditing}
                  />
                </div>
              )}
              {isEditing && (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Account Information</h3>
            <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {currentUser.email}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>User ID:</strong> {currentUser.uid}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Providers:</strong> {currentUser.providerData.map(p => p.providerId).join(', ') || 'None'}</p>
          </div>

          {/* New Section for Editable User Profile Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personal Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <Input
                  id="user-name"
                  type="text"
                  value={isEditing ? tempName : userProfile?.name || ''}
                  onChange={(e) => setTempName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your name"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="user-age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age
                </label>
                <Input
                  id="user-age"
                  type="number"
                  value={isEditing ? tempAge : userProfile?.age || ''}
                  onChange={(e) => setTempAge(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your age"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="user-course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <Input
                  id="user-course"
                  type="text"
                  value={isEditing ? tempCourse : userProfile?.course || ''}
                  onChange={(e) => setTempCourse(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your course"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label htmlFor="user-motivation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivation
                </label>
                <Input
                  id="user-motivation"
                  type="text"
                  value={isEditing ? tempMotivation : userProfile?.motivation || ''}
                  onChange={(e) => setTempMotivation(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                  placeholder="Enter your motivation"
                  disabled={!isEditing}
                />
              </div>
              {!isEditing && userProfile?.id && (
                <div>
                  <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <Input
                    id="user-id"
                    type="text"
                    value={userProfile.id}
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                    disabled
                  />
                </div>
              )}
              {isEditing && (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Personal Details
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>

          {!hasEmailPasswordProvider && isGoogleLinked && (
            <form onSubmit={handleLinkEmailPassword} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Link Email and Password</h3>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">{success}</div>}
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