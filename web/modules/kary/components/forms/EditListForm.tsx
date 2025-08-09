import React, { useState } from 'react';
import { List, ListFolder } from '~/modules/kary/types';
import * as Icons from '~/components/Icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';

interface EditListFormProps {
  list: List;
  folders: ListFolder[];
  onUpdateList: (listId: string, updates: Partial<List>, newFolderName?: string) => void;
  onCancel: () => void;
}

const EditListForm: React.FC<EditListFormProps> = ({ 
  list, 
  folders, 
  onUpdateList, 
  onCancel 
}) => {
  const [name, setName] = useState(list.name);
  const [color, setColor] = useState(list.color || 'gray-500');
  const [icon, setIcon] = useState<keyof typeof Icons>(list.icon);
  const [selectedFolder, setSelectedFolder] = useState<string>(list.folderId || 'none');
  const [newFolderName, setNewFolderName] = useState('');
  const [isDefaultList, setIsDefaultList] = useState(list.isDefault || false);

  const isCreatingNewFolder = selectedFolder === 'new';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (isCreatingNewFolder && !newFolderName.trim())) return;

    const updates: Partial<List> = {
      name,
      icon,
      color,
      folderId: isCreatingNewFolder
        ? null
        : selectedFolder !== 'none'
          ? selectedFolder
          : null,
      isDefault: isDefaultList,
    };

    onUpdateList(list.id, updates, isCreatingNewFolder ? newFolderName : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 p-1">
      <div>
        <label htmlFor="list-name" className="block text-sm font-medium text-gray-700">
          List Name
        </label>
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
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
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

      <div className="flex items-center">
        <input
          type="checkbox"
          id="default-list"
          checked={isDefaultList}
          onChange={(e) => setIsDefaultList(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="default-list" className="ml-2 block text-sm text-gray-700">
          Set as default list for new tasks
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update List
        </button>
      </div>
    </form>
  );
};

export default EditListForm;
