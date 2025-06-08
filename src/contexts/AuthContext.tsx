import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  User as FirebaseUser,
  UserCredential as FirebaseUserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { UserProfile } from '../lib/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<FirebaseUserCredential>;
  signUp: (email: string, password: string) => Promise<FirebaseUserCredential>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  linkEmailPassword: (email: string, password: string) => Promise<FirebaseUserCredential>;
  refreshUserProfile: () => Promise<void>;
  googleSignIn: () => Promise<FirebaseUserCredential>;
  isGoogleUser: boolean;
  checkEmailProvider: (email: string) => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  const fetchAndSetUserProfile = async (user: FirebaseUser) => {
    try {
      const docRef = doc(db, 'userProfiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await fetchAndSetUserProfile(auth.currentUser);
    }
  };

  async function checkEmailProvider(email: string) {
    return await fetchSignInMethodsForEmail(auth, email);
  }

  function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await firebaseSignOut(auth);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updateProfile(currentUser, data as any);
      if (userProfile) {
        await setDoc(doc(db, 'userProfiles', currentUser.uid), {
          ...userProfile,
          ...data
        }, { merge: true });
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      // Update the error state if needed, though current error is handled by console.error
    }
  }

  async function linkEmailPassword(email: string, password: string) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    if (email !== currentUser.email) {
      throw new Error('Email must match your Google account email');
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(currentUser, credential);
      
      const userRef = doc(db, 'userProfiles', currentUser.uid);
      await setDoc(userRef, {
        hasEmailPassword: true,
        email: email
      }, { merge: true });

      return result;
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This email/password combination is already in use with another account.');
      }
      throw error;
    }
  }

  async function googleSignIn() {
    const result = await signInWithPopup(auth, googleProvider);
    setIsGoogleUser(true);
    return result;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAndSetUserProfile(user);
        const isGoogle = user.providerData.some(
          provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID
        );
        setIsGoogleUser(isGoogle);
      } else {
        setUserProfile(null);
        setIsGoogleUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error: null, // Error is not actively managed by setError, so it's always null or set by signIn/signUp
    signIn,
    signUp,
    logout,
    updateUserProfile,
    linkEmailPassword,
    refreshUserProfile,
    googleSignIn,
    isGoogleUser,
    checkEmailProvider,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 