import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';
import * as Icons from './Icons';

interface LoginPageProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess, onBackToLanding }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login page form submitted');
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        console.log('Attempting sign up from login page');
        await signUp(email, password, displayName);
      } else {
        console.log('Attempting sign in from login page');
        await signIn(email, password);
      }
      onAuthSuccess();
    } catch (error: any) {
      console.error('Auth error from login page:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Jeevan Saathi Logo.png" 
              alt="Jeevan Saathi Logo" 
              className="w-12 h-12 rounded-lg mr-3"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.add('ml-0');
              }}
            />
            <h1 className="text-3xl font-bold text-amber-700">Jeevan Saathi</h1>
          </div>
          <p className="text-gray-600">जीवन साथी - Your Life Companion</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 rounded-md hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <button 
            onClick={onBackToLanding}
            className="text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
          >
            <Icons.ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-8 flex justify-center space-x-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icons.CheckSquareIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Task Management</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icons.TargetIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Habit Tracking</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icons.Edit3Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Personal Journal</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icons.BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Knowledge Base</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 