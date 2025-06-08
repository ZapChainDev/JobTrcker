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
  googleSignIn: () => Promise<UserCredential>;
  userProfile: UserProfile | null | undefined;
  refreshUserProfile: () => Promise<void>;
  linkEmailPassword: (email: string, password: string) => Promise<UserCredential>;
  isGoogleUser: boolean;
  checkEmailProvider: (email: string) => Promise<string[]>;
  signOut: () => Promise<void>;
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
      // First try to sign in with email/password
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user not found, check if it's a Google-only account
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes(GoogleAuthProvider.PROVIDER_ID) && !methods.includes(EmailAuthProvider.PROVIDER_ID)) {
          throw new Error('This email is associated with a Google account. Please sign in with Google to proceed, then you can set up a password.');
        }
        throw new Error('No account found with this email. Please check your email or sign up.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-credential') {
        // If invalid credential, recheck for Google-only case for clarity
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes(GoogleAuthProvider.PROVIDER_ID) && !methods.includes(EmailAuthProvider.PROVIDER_ID)) {
          throw new Error('This email is associated with a Google account. Please sign in with Google to proceed, then you can set up a password.');
        }
        throw new Error('Invalid login credentials. Please check your email and password.');
      }
      // For any other unexpected error
      throw error;
    }
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
    googleSignIn,
    userProfile,
    refreshUserProfile,
    linkEmailPassword,
    isGoogleUser,
    checkEmailProvider,
    signOut: () => auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 