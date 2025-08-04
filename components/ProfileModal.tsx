import React from 'react';
import { User } from 'firebase/auth';
import Modal from './Modal';
import * as Icons from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal title="Profile" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
            <Icons.UserIcon className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold">{user.displayName || user.email}</h2>
        <div className="text-sm text-gray-600 text-center">
          <p>Email: {user.email}</p>
          <p>Account created: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
