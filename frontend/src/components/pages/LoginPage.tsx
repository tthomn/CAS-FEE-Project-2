import { FirebaseError } from 'firebase/app';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await login(email, password);

      const fromCart = new URLSearchParams(location.search).get('fromCart');
      if (fromCart) {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          setErrorMessage('No account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
          setErrorMessage('Incorrect password.');
        } else {
          setErrorMessage('An error occurred. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false); // Ensures loading is turned off regardless of success or failure
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setResetEmailSent(false);

    if (!email.trim()) {
      setErrorMessage('Please enter your email to reset your password.');
      return;
    }
    try {
      await resetPassword(email);

      setResetEmailSent(true);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          setErrorMessage('No account found with this email.');
        } else {
          setErrorMessage('Failed to send reset email. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-6 shadow-md">
        {!user ? (
          <>
            <h1 className="mb-4 text-2xl font-bold">Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Email"
                required
                className="mb-4 w-full rounded border p-2"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="password"
                placeholder="Password"
                required
                className="mb-4 w-full rounded border p-2"
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded p-2 ${
                  loading ? 'bg-gray-400' : 'bg-green-500 text-white'
                }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <button
              onClick={handleForgotPassword}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
            {resetEmailSent && (
              <p className="mt-4 text-green-600">Password reset email sent!</p>
            )}
            {errorMessage && (
              <p className="mt-4 text-red-500">{errorMessage}</p>
            )}
          </>
        ) : (
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Welcome, {user.email}</h1>
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
