import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  UserCredential,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../lib/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
  userProfile: UserProfile | null | undefined;
  refreshUserProfile: () => Promise<void>;
  linkEmailPassword: (email: string, password: string) => Promise<UserCredential>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null | undefined>(undefined);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const fetchAndSetUserProfile = async (user: User) => {
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

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email: string, password: string) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        throw new Error('No account found with this email. Please check your email or sign up.');
      }

      // If the email is only associated with Google
      if (methods.length === 1 && methods[0] === GoogleAuthProvider.PROVIDER_ID) {
        throw new Error('This email is associated with a Google account. Please sign in with Google to proceed, then you can set up a password.');
      }

      // If email/password method is available, try to sign in
      if (methods.includes(EmailAuthProvider.PROVIDER_ID)) {
        return await signInWithEmailAndPassword(auth, email, password);
      } else {
        // This case should ideally not be reached if methods is not empty and doesn't contain password provider
        // but includes other providers not handled (e.g., Facebook, Twitter without email/password)
        throw new Error('This email is associated with a different login method. Please try signing in with Google or another linked provider.');
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      // Re-throw specific errors thrown above, or general Firebase errors
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  async function googleSignIn() {
    const result = await signInWithPopup(auth, googleProvider);
    setIsGoogleUser(true);
    return result;
  }

  async function linkEmailPassword(email: string, password: string) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Check if the email matches the current user's email
    if (email !== currentUser.email) {
      throw new Error('Email must match your Google account email');
    }

    try {
      // Create email/password credential
      const credential = EmailAuthProvider.credential(email, password);
      
      // Link the credential to the current user
      const result = await linkWithCredential(currentUser, credential);
      
      // Update user profile to indicate email/password is now available
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAndSetUserProfile(user);
        // Check if the user signed in with Google
        const isGoogle = user.providerData.some(
          provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID
        );
        setIsGoogleUser(isGoogle);
      } else {
        setUserProfile(undefined);
        setIsGoogleUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    googleSignIn,
    userProfile,
    refreshUserProfile,
    linkEmailPassword,
    isGoogleUser,
    checkEmailProvider
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 