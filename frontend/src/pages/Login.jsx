import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { authApi } from '../services/authApi';


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/chat');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-808 rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          {/* Logo Icon */}
          <div className="mx-auto h-12 w-12 bg-green-50 dark:bg-green-950/30 flex items-center justify-center rounded-2xl mb-4 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1.5">Sign in to manage your AI agent platform.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 text-xs font-medium text-red-655 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-305 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-green-600 hover:text-green-700">
              Register here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
