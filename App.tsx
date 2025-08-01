import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import ProfileModal from './components/ProfileModal';
import DainandiniView from './modules/dainandini/views/DainandiniView';
import KaryView from './modules/kary/views/KaryView';
import VidyaView from './modules/vidya/views/VidyaView';
import AbhyasaView from './modules/abhyasa/views/AbhyasaView';
import AuthModal from './components/AuthModal';
import {
  onAuthStateChange,
  signOutUser,
  updateUserProfile,
} from './services/authService';
import { uploadProfilePicture } from './services/storageService';
import { useKaryStore } from './modules/kary/karyStore';
import { useDainandiniStore } from './modules/dainandini/dainandiniStore';
import { useAbhyasaStore } from './modules/abhyasa/abhyasaStore';

const navItems = [
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
  user: any;
}> = ({ activeView, onSetView, onProfileClick, onSignOut, user }) => {
  return (
    <aside className="w-20 bg-gray-50/80 flex-shrink-0 flex flex-col items-center border-r border-gray-200">
      <div className="py-4 mt-2">
        <button
          onClick={onProfileClick}
          className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          aria-label="User Profile and Settings"
        >
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/40?u=a042581f4e29026704d'}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
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
            onClick={() => onSetView(viewId)}
          />
        ))}
      </nav>

      <div className="mt-auto mb-4">
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
  const [activeView, setActiveView] = useState<View>('kary');
  const [apiKey, setApiKey] = useState<string | null>(() => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }
    return localStorage.getItem('gemini-api-key');
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Zustand Stores ---
  const karyState = useKaryStore();
  const dainandiniState = useDainandiniStore();
  const abhyasaState = useAbhyasaStore();

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

  const handleUpdateProfilePicture = async (file: File) => {
    if (user) {
      const photoURL = await uploadProfilePicture(user.uid, file);
      await updateUserProfile(user, { photoURL });
      setUser({ ...user, photoURL });
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Jeevan Saathi</h1>
          <p className="text-gray-600 mb-8">Your personal life management companion</p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
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
      case 'dainandini':
        return <DainandiniView {...dainandiniState} onToggleKaryTask={karyState.updateTask} />;
      case 'kary':
        return <KaryView {...karyState} />;
      case 'abhyasa':
        return <AbhyasaView {...abhyasaState} />;
      case 'vidya':
        return <VidyaView />;
      default:
        return <DainandiniView {...dainandiniState} onToggleKaryTask={karyState.updateTask} />;
    }
  };

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-transparent">
      <IconSidebar
        activeView={activeView}
        onSetView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
        user={user}
      />
      {renderActiveView()}
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
          onUpdateProfilePicture={handleUpdateProfilePicture}
        />
      )}
    </div>
  );
};

export default App;