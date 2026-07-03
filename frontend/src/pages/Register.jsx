import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { authApi } from '../services/authApi';


const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-808 rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-50 dark:bg-green-950/30 flex items-center justify-center rounded-2xl mb-4 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1.5">Sign up to deploy custom multi-tenant AI agents.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-xs font-medium text-red-655 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-900 text-xs font-medium text-green-655 dark:text-green-400 rounded-xl">
            Registration successful! Redirecting to login page...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-305 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-305 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-205 rounded-xl text-gray-700 dark:text-gray-305 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
