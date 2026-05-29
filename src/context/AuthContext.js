import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not configured properly (no API keys), we can mock or just wait for keys.
    // We'll wrap in try-catch to prevent crashing if config is placeholder.
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) {
          setIsGuest(false);
        }
        setLoading(false);
      });
    } catch (error) {
      console.warn("Firebase Auth Error: Please ensure your config keys are set.", error);
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    setIsGuest(false);
    return signOut(auth);
  };

  const loginAsGuest = () => {
    setIsGuest(true);
  };

  const value = {
    currentUser,
    isGuest,
    loading,
    login,
    signup,
    logout,
    loginAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
