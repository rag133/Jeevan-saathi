import React, { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onViewChange: (view: 'kary' | 'vidya' | 'abhyasa' | 'dainandini') => void;
  onProfileClick: () => void;
  onSignOut: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onViewChange,
  onProfileClick,
  onSignOut,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            onViewChange('dainandini');
            break;
          case '2':
            event.preventDefault();
            onViewChange('kary');
            break;
          case '3':
            event.preventDefault();
            onViewChange('abhyasa');
            break;
          case '4':
            event.preventDefault();
            onViewChange('vidya');
            break;
          case 'p':
            event.preventDefault();
            onProfileClick();
            break;
          case 'q':
            event.preventDefault();
            onSignOut();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onViewChange, onProfileClick, onSignOut]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts; 