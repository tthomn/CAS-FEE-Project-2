import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { createDocRef, getData } from '../services/firebase/firestoreService';
import { AuthUser } from '../types/authUser';

interface AdditionalData {
  title: string;
  name: string;
  surname: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  dob: string;
  addedAt: Date;
  authType: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    additionalData?: AdditionalData,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  //[Is Authentiaced Global State]
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //[USER]
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const functions = getFunctions();

  const fetchAuthUser = useCallback(
    async (uid: string) => {
      try {
        const docRefComplete = await createDocRef('users', uid);
        const docSnap = await getData(docRefComplete);
        let data = docSnap.data();

        if (!data || data.length === 0) {
          return null;
        }

        const userDoc = data;
        const authUser: AuthUser = {
          id: uid,
          userName: userDoc?.email,
          userId: userDoc.id,
          authType: userDoc.authType,
          city: userDoc?.city,
          country: userDoc?.country || '',
          dob: userDoc?.dob || '',
          houseNumber: userDoc?.houseNumber,
          name: userDoc?.name,
          surname: userDoc?.surname,
          zip: userDoc?.zip || '',
          street: userDoc?.street,
          gender: userDoc?.gender || '',
          addedAt: userDoc?.addedAt || undefined, // Date of user creation
        };

        const setAdmin = httpsCallable(functions, 'setAdmin');
        await setAdmin();

        return authUser; // Return the constructed AuthUser object
      } catch (error) {
        console.error('Error fetchAuthUser:', error);
      }
    },
    [functions],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        setIsAuthenticated(true);
        const fetchedUser = await fetchAuthUser(user?.uid);

        if (fetchedUser) {
          setAuthUser(fetchedUser);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, [auth, fetchAuthUser]);

  /*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const fetchedUser = await fetchAuthUser(user?.uid);
        if (fetchedUser) {
          setAuthUser(fetchedUser);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, [auth, fetchAuthUser]);
  */

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setAuthUser(null);
      localStorage.removeItem('userDetails');
    } catch (error: unknown) {
      setAuthUser(null);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to logout');
      }
    } finally {
      setLoading(false);
    }
  };

  //Adds additionalData to the user in the firebase db
  const register = async (
    email: string,
    password: string,
    additionalData?: AdditionalData,
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const setAdditionalUserData = httpsCallable(
        functions,
        'setAdditionalUserData',
      );
      await setAdditionalUserData({
        uid: user.uid,
        ...additionalData,
      });

      const registeredUser = await fetchAuthUser(user.uid);
      if (registeredUser) {
        setAuthUser(registeredUser);
      }

      await sendEmailVerification(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        register,
        resetPassword,
        authUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
