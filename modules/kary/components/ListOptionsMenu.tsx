import React, { useState } from 'react';
import { MoreHorizontalIcon, EditIcon, Trash2Icon, StarIcon } from '~/components/Icons';
import { List } from '../types';

interface ListOptionsMenuProps {
  list: List;
  onEditList: (list: List) => void;
  onDeleteList: (listId: string) => void;
  onSetDefaultList?: (listId: string) => void;
  isSmartList?: boolean;
}

const ListOptionsMenu: React.FC<ListOptionsMenuProps> = ({
  list,
  onEditList,
  onDeleteList,
  onSetDefaultList,
  isSmartList = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    setShowMenu(false);
    onEditList(list);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDeleteList(list.id);
  };

  const handleSetDefault = () => {
    setShowMenu(false);
    onSetDefaultList?.(list.id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="More options"
      >
        <MoreHorizontalIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {/* Edit option - only for regular lists, not smart lists */}
            {!isSmartList && (
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg"
              >
                <EditIcon className="w-4 h-4" />
                Edit List
              </button>
            )}
            
            {/* Set as default option - only for regular lists */}
            {!isSmartList && onSetDefaultList && (
              <button
                onClick={handleSetDefault}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  list.isDefault ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                <StarIcon className="w-4 h-4" />
                {list.isDefault ? 'Default List' : 'Set as Default'}
              </button>
            )}
            
            {/* Delete option - only for regular lists, not smart lists or inbox */}
            {!isSmartList && list.id !== 'inbox' && (
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg"
              >
                <Trash2Icon className="w-4 h-4" />
                Delete List
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListOptionsMenu;
