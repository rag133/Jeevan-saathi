import React, { useState, useEffect, useCallback, Suspense } from 'react';
import * as Icons from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import ProfileModal from './components/ProfileModal';
const HomeView = React.lazy(() => import('./modules/home/views/HomeView'));
const DainandiniView = React.lazy(() => import('./modules/dainandini/views/DainandiniView'));
const KaryView = React.lazy(() => import('./modules/kary/views/KaryView'));
const VidyaView = React.lazy(() => import('./modules/vidya/views/VidyaView'));
const AbhyasaView = React.lazy(() => import('./modules/abhyasa/views/AbhyasaView'));
import AuthModal from './components/AuthModal';
import {
  onAuthStateChange,
  signOutUser,
  updateUserProfile,
} from './services/authService';

import { useKaryStore } from './modules/kary/karyStore';
import { useDainandiniStore } from './modules/dainandini/dainandiniStore';
import { Toaster, toast } from 'react-hot-toast';
import { useAbhyasaStore } from './modules/abhyasa/abhyasaStore';
import useWindowSize from './hooks/useWindowSize'; // Import the custom hook
import LoadingSpinner from './components/LoadingSpinner';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import HelpModal from './components/HelpModal';

const navItems = [
  { viewId: 'home', icon: 'HomeIcon', label: 'Home' },
  { viewId: 'kary', icon: 'CheckSquareIcon', label: 'Kary' },
  { viewId: 'vidya', icon: 'BookOpenIcon', label: 'Vidyā' },
  { viewId: 'abhyasa', icon: 'TargetIcon', label: 'Abhyasa' },
  { viewId: 'dainandini', icon: 'Edit3Icon', label: 'Dainandini' },
] as const;

type View = (typeof navItems)[number]['viewId'];

// --- IconSidebar Component ---
const NavItem: React.FC<{
  icon: keyof typeof Icons;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const IconComponent = Icons[icon];
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      aria-label={label}
    >
      <IconComponent className="w-6 h-6" />
      <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {label}
      </span>
    </button>
  );
};

const IconSidebar: React.FC<{
  activeView: View;
  onSetView: (view: View) => void;
  onProfileClick: () => void;
  onSignOut: () => void;
  onHelpClick: () => void;
  user: any;
  isMobile: boolean;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}> = ({ activeView, onSetView, onProfileClick, onSignOut, onHelpClick, user, isMobile, isSidebarOpen, onCloseSidebar }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 w-20 bg-gray-50/80 border-r border-gray-200 transition-transform duration-300 ease-in-out
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${isMobile ? '' : 'flex flex-col'}
      `}
    >
      <div className="py-4 mt-2 flex justify-center">
        <button
          onClick={onProfileClick}
          className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          aria-label="User Profile and Settings"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Icons.UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <span className="absolute -top-1 -left-1 text-lg" role="img" aria-label="premium">
            👑
          </span>
        </button>
      </div>

      <nav className="flex flex-col items-center space-y-4 px-2 py-4">
        {navItems.map(({ viewId, icon, label }) => (
          <NavItem
            key={viewId}
            icon={icon}
            label={label}
            isActive={activeView === viewId}
            onClick={() => {
              onSetView(viewId);
              if (isMobile) onCloseSidebar();
            }}
          />
        ))}
      </nav>

      <div className="mt-auto mb-4 space-y-2 flex flex-col items-center">
        <button
          onClick={onHelpClick}
          className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Help"
        >
          <Icons.QuestionIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onSignOut}
          className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Sign Out"
        >
          <Icons.LogOutIcon className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
// --- End IconSidebar Component ---

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [apiKey, setApiKey] = useState<string | null>(() => {
    const envApiKey = "AIzaSyBAVXKA-ko41iIzXkv_59jR615RqYz8Zv0";
    if (envApiKey) {
      return envApiKey;
    }
    return localStorage.getItem('gemini-api-key');
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar visibility

  const { width } = useWindowSize();
  const isMobile = width !== undefined && width < 768; // Define mobile breakpoint

  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Zustand Stores ---
  const karyState = useKaryStore();
  const dainandiniState = useDainandiniStore();
  const abhyasaState = useAbhyasaStore();

  useEffect(() => {
    if (karyState.error) {
      toast.error(karyState.error);
    }
  }, [karyState.error]);

  useEffect(() => {
    if (dainandiniState.error) {
      toast.error(dainandiniState.error);
    }
  }, [dainandiniState.error]);

  useEffect(() => {
    if (abhyasaState.error) {
      toast.error(abhyasaState.error);
    }
  }, [abhyasaState.error]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!user || authLoading) return;

    const loadAllData = async () => {
      await Promise.all([
        karyState.fetchKaryData(),
        dainandiniState.fetchDainandiniData(),
        abhyasaState.fetchAbhyasaData(),
      ]);
    };

    loadAllData();
  }, [user, authLoading]);

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem('gemini-api-key', key.trim());
      setApiKey(key.trim());
    } else {
      localStorage.removeItem('gemini-api-key');
      setApiKey(null);
    }
    setIsApiKeyModalOpen(false);
  };



  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="xl" color="blue" className="mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Jeevan Saathi</h2>
          <p className="text-gray-500">Your personal life management companion</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/Jeevan Saathi Logo.png" 
                alt="Jeevan Saathi Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="text-2xl font-bold text-amber-700">Jeevan Saathi</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-amber-600 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-amber-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-amber-600 transition-colors">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">
              Jeevan Saathi
            </h1>
            <h2 className="text-2xl text-gray-700 mb-6">जीवन साथी - Your Life Companion</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              A comprehensive personal management application designed to help you organize your life across tasks, journaling, goal setting, and learning. Your holistic platform for personal growth and productivity.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start Your Journey
              </button>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.CheckSquareIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Task Management</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.TargetIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Habit Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Edit3Icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Personal Journal</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.BookOpenIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Knowledge Base</p>
              </div>
            </div>
          </div>
        </section>

        {/* Four Pillars Section */}
        <section id="features" className="py-20 px-6 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-amber-600 mb-4">Four Pillars of Life Management</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Jeevan Saathi is divided into four comprehensive modules, each designed to support different aspects of your personal growth journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Kary Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <Icons.CheckSquareIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Kary</h3>
                    <p className="text-gray-600">कार्य - Work/Tasks</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A powerful task manager that helps you organize your to-do lists, set due dates, and track your progress. Create custom lists, add tags, and break down large tasks into smaller subtasks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Custom Lists</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Due Dates</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Progress Tracking</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Subtasks</span>
                </div>
              </div>

              {/* Abhyasa Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Icons.TargetIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Abhyasa</h3>
                    <p className="text-gray-600">अभ्यास - Practice/Habits</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A habit tracker that helps you build and maintain good habits. Set goals, track your progress with a calendar view, and get detailed statistics on your habit completion rate.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Goal Setting</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Calendar View</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Statistics</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Streak Tracking</span>
                </div>
              </div>

              {/* Dainandini Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                    <Icons.Edit3Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Dainandini</h3>
                    <p className="text-gray-600">दैनंदिनी - Journal</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A personal journal for your thoughts, reflections, and daily logs. Create different types of entries (text, checklists, ratings) and organize them by focus areas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">Multiple Entry Types</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">Focus Areas</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">Daily Logs</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">Reflections</span>
                </div>
              </div>

              {/* Vidya Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 relative">
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Coming Soon</span>
                </div>
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <Icons.BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Vidya</h3>
                    <p className="text-gray-600">विद्या - Knowledge</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A knowledge base for learning and growth. Build your personal learning repository with articles, notes, and insights organized for easy discovery and reference.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Learning Repository</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Article Management</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Note Organization</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Easy Discovery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Roadmap Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-amber-600 mb-4">Future Roadmap</h2>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Personal Growth</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our vision extends beyond basic productivity tools. We're building intelligent features that learn from your patterns and help you grow in meaningful ways.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Kary AI */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Kary (Tasks)</h3>
                    <p className="text-gray-600">AI-Enhanced Features</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Smart Task Prioritization:</strong> AI analyzes your habits and completion history to suggest which tasks are most important or at risk.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Automatic Task Breakdown:</strong> For complex tasks, AI suggests step-by-step breakdowns. Enter 'Plan a birthday party' and get organized sub-tasks.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Abhyasa AI */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Abhyasa (Habits)</h3>
                    <p className="text-gray-600">AI-Enhanced Features</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Personalized Habit Coaching:</strong> AI acts as your personal coach, providing motivational messages and insights based on your progress patterns.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Habit Prediction & Intervention:</strong> Predict when you're likely to break a streak and proactively send supportive reminders.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Dainandini AI */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dainandini (Journal)</h3>
                    <p className="text-gray-600">AI-Enhanced Features</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Sentiment Analysis & Mood Tracking:</strong> AI analyzes your journal entries to track emotional states and show correlations with other activities.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Automatic Insights & Goal Suggestions:</strong> Extract recurring themes from your reflections and suggest relevant goals and habits for personal growth.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Vidya AI */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Vidya (Knowledge)</h3>
                    <p className="text-gray-600">AI-Enhanced Features</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Personalized Learning Recommendations:</strong> Based on your goals and interests, AI recommends articles, courses, and videos tailored to your learning path.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    <div>
                      <strong>Knowledge Synthesis & Q&A:</strong> AI helps synthesize information, connect ideas, and answer questions based on your saved content.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <span className="text-lg mr-2">✨</span>
                <span>Free to use</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">📱</span>
                <span>Mobile-friendly</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🚀</span>
                <span>Modern & Fast</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🤖</span>
                <span>AI-Powered</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">© 2024 Jeevan Saathi. Your personal life management companion.</p>
          </div>
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView isAppSidebarOpen={!isMobile || isSidebarOpen} />;
      case 'dainandini':
        return <DainandiniView isAppSidebarOpen={!isMobile || isSidebarOpen} />;
      case 'kary':
        return <KaryView isAppSidebarOpen={!isMobile || isSidebarOpen} />;
      case 'abhyasa':
        return <AbhyasaView isAppSidebarOpen={!isMobile || isSidebarOpen} />;
      case 'vidya':
        return <VidyaView />;
      default:
        return <HomeView isAppSidebarOpen={!isMobile || isSidebarOpen} />;
    }
  };

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-transparent">
      <KeyboardShortcuts
        onViewChange={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Sidebar"
        >
          <Icons.MenuIcon className="w-6 h-6" />
        </button>
      )}
      <IconSidebar
        activeView={activeView}
        onSetView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
        onHelpClick={() => setIsHelpModalOpen(true)}
        user={user}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className={`flex-1 flex transition-all duration-300 ease-in-out ${isMobile ? 'ml-0' : 'ml-20'}`}>
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" color="blue" className="mb-4" />
              <p className="text-gray-600">Loading view...</p>
            </div>
          </div>
        }>
          {renderActiveView()}
        </Suspense>
      </div>
      {isApiKeyModalOpen && (
        <ApiKeyModal
          currentApiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
      {isProfileModalOpen && user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
        />
      )}
      {isHelpModalOpen && (
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;