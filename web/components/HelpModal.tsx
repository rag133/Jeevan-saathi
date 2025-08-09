import React from 'react';
import Modal from './Modal';
import * as Icons from './Icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl/Cmd + 1', description: 'Switch to Dainandini (Journal)' },
    { key: 'Ctrl/Cmd + 2', description: 'Switch to Kary (Tasks)' },
    { key: 'Ctrl/Cmd + 3', description: 'Switch to Abhyasa (Habits)' },
    { key: 'Ctrl/Cmd + 4', description: 'Switch to Vidya (Learning)' },
    { key: 'Ctrl/Cmd + P', description: 'Open Profile' },
    { key: 'Ctrl/Cmd + Q', description: 'Sign Out' },
  ];

  return (
    <Modal title="Keyboard Shortcuts & Help" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                  {shortcut.key}
                </kbd>
                <span className="text-gray-600">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">App Features</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Icons.Edit3Icon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Dainandini</h4>
                <p className="text-sm text-gray-600">Journal your thoughts, track mood, and reflect on your day</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icons.CheckSquareIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Kary</h4>
                <p className="text-sm text-gray-600">Manage tasks, organize projects, and track progress</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icons.TargetIcon className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Abhyasa</h4>
                <p className="text-sm text-gray-600">Build habits, set goals, and track your practice</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icons.BookOpenIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Vidya</h4>
                <p className="text-sm text-gray-600">Organize learning materials and track your studies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal; 