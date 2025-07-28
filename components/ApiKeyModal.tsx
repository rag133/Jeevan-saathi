
import React, { useState } from 'react';
import Modal from './Modal';
import { MagicWandIcon } from './Icons';

interface ApiKeyModalProps {
    currentApiKey: string | null;
    onSave: (key: string) => void;
    onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ currentApiKey, onSave, onClose }) => {
    const [key, setKey] = useState(currentApiKey || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(key);
    };

    return (
        <Modal title="Set Gemini API Key" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <MagicWandIcon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-blue-800">Your Personal AI Key</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Your API key is stored securely in your browser's local storage and is never sent to our servers. It's used directly from your browser to communicate with the Gemini API for features like smart task creation and subtask generation.
                        </p>
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 font-semibold mt-2 inline-block">
                            Get your API key from Google AI Studio &rarr;
                        </a>
                    </div>
                </div>
                <div>
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                        API Key
                    </label>
                    <input
                        type="password"
                        id="api-key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Enter your Gemini API key"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Key
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ApiKeyModal;
