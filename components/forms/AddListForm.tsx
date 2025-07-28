import React, { useState } from 'react';
import { List, ListFolder } from '../../types';
import * as Icons from '../Icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';

interface AddListFormProps {
    folders: ListFolder[];
    onAddList: (list: Omit<List, 'id' | 'count'>, newFolderName?: string) => void;
}

const AddListForm: React.FC<AddListFormProps> = ({ folders, onAddList }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('gray-500');
    const [icon, setIcon] = useState<keyof typeof Icons>('ListIcon');
    const [selectedFolder, setSelectedFolder] = useState<string>('none');
    const [newFolderName, setNewFolderName] = useState('');

    const isCreatingNewFolder = selectedFolder === 'new';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || (isCreatingNewFolder && !newFolderName.trim())) return;

        const listData: Omit<List, 'id' | 'count'> = {
            name,
            icon,
            color,
            folderId: isCreatingNewFolder ? undefined : (selectedFolder !== 'none' ? selectedFolder : undefined),
        };

        onAddList(listData, isCreatingNewFolder ? newFolderName : undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="list-name" className="block text-sm font-medium text-gray-700">List Name</label>
                <input
                    type="text"
                    id="list-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., Groceries"
                    required
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700">Folder</label>
                 <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                 >
                     <option value="none">No Folder</option>
                     {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                     ))}
                     <option value="new">Create New Folder...</option>
                 </select>
                 {isCreatingNewFolder && (
                     <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="New folder name"
                        required
                    />
                 )}
            </div>
            
            <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
            <ColorPicker selectedColor={color} onSelectColor={setColor} />

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Create List
                </button>
            </div>
        </form>
    );
};

export default AddListForm;