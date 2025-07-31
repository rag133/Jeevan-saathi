import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import Modal from './Modal';
import * as Icons from './Icons';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateProfilePicture: (file: File) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateProfilePicture }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.photoURL);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (selectedFile) {
            await onUpdateProfilePicture(selectedFile);
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title="Profile" onClose={onClose}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <img 
                        src={previewUrl || '/placeholder.jpg'} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                        <Icons.EditIcon className="w-5 h-5" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <h2 className="text-xl font-semibold">{user.displayName || user.email}</h2>
                <div className="flex gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload} 
                        disabled={!selectedFile}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
