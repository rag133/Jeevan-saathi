import React, { useState } from 'react';
import { List, ListFolder, Tag, TagFolder, Selection } from '~/modules/kary/types';
import * as Icons from '~/components/Icons';

interface KarySidebarProps {
  smartLists: List[];
  customLists: List[];
  listFolders: ListFolder[];
  tags: Tag[];
  tagFolders: TagFolder[];
  selectedItem: Selection;
  onSelectItem: (selection: Selection) => void;
  onOpenModal: (modal: 'add-list' | 'add-tag') => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

const ListItem: React.FC<{
  list: List;
  isSelected: boolean;
  onSelect: () => void;
  isChild?: boolean;
}> = ({ list, isSelected, onSelect, isChild = false }) => {
  const IconComponent = Icons[list.icon as keyof typeof Icons] || Icons.ListIcon;

  return (
    <li className={`${isChild ? 'pl-6' : ''}`}>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isSelected
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className={`w-5 h-5 flex items-center justify-center ${list.color ? `text-${list.color}` : 'text-gray-500'}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="flex-1 truncate text-left">{list.name}</span>
        {list.count != null && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {list.count}
          </span>
        )}
      </button>
    </li>
  );
};

const SidebarHeader: React.FC<{ title: string; onAdd: () => void; icon: keyof typeof Icons }> = ({ title, onAdd, icon }) => {
  const IconComponent = Icons[icon];
  
  return (
    <div className="px-3 pt-6 pb-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <button 
        onClick={onAdd}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
      >
        <Icons.PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const KarySidebar: React.FC<KarySidebarProps> = ({
  smartLists,
  customLists,
  listFolders,
  tags,
  tagFolders,
  selectedItem,
  onSelectItem,
  onOpenModal,
  isMobile,
  isSidebarOpen,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const listsWithoutFolders = customLists.filter((l) => !l.folderId);
  const tagsWithoutFolders = tags.filter((t) => !t.folderId);

  return (
    <aside
      className={`w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
        ${isMobile ? 'fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icons.MagicWandIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Kary AI</h1>
            <p className="text-xs text-gray-500">Organize your work</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Smart Lists */}
        <div className="mb-6">
          <SidebarHeader title="Quick Access" onAdd={() => {}} icon="ZapIcon" />
          <ul className="space-y-1">
            {smartLists.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                isSelected={selectedItem.type === 'list' && selectedItem.id === list.id}
                onSelect={() => onSelectItem({ type: 'list', id: list.id })}
              />
            ))}
          </ul>
        </div>

        {/* Custom Lists */}
        <div className="mb-6">
          <SidebarHeader title="Lists" onAdd={() => onOpenModal('add-list')} icon="ListIcon" />
          <ul className="space-y-1">
            {listFolders.map((folder) => {
              const isCollapsed = collapsedFolders[folder.id];
              const folderLists = customLists.filter((l) => l.folderId === folder.id);
              
              return (
                <React.Fragment key={folder.id}>
                  <li>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        {isCollapsed ? (
                          <Icons.ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <Icons.FolderIcon className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                      <span className="text-xs text-gray-500">{folderLists.length}</span>
                    </button>
                  </li>
                  {!isCollapsed && folderLists.map((list) => (
                    <ListItem
                      key={list.id}
                      list={list}
                      isSelected={selectedItem.type === 'list' && selectedItem.id === list.id}
                      onSelect={() => onSelectItem({ type: 'list', id: list.id })}
                      isChild
                    />
                  ))}
                </React.Fragment>
              );
            })}
            {listsWithoutFolders.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                isSelected={selectedItem.type === 'list' && selectedItem.id === list.id}
                onSelect={() => onSelectItem({ type: 'list', id: list.id })}
              />
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <SidebarHeader title="Tags" onAdd={() => onOpenModal('add-tag')} icon="TagIcon" />
          <ul className="space-y-1">
            {tagFolders.map((folder) => {
              const isCollapsed = collapsedFolders[folder.id];
              const folderTags = tags.filter((t) => t.folderId === folder.id);
              
              return (
                <React.Fragment key={folder.id}>
                  <li>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        {isCollapsed ? (
                          <Icons.ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <Icons.FolderIcon className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                      <span className="text-xs text-gray-500">{folderTags.length}</span>
                    </button>
                  </li>
                  {!isCollapsed && folderTags.map((tag) => (
                    <li key={tag.id} className="pl-6">
                      <button
                        onClick={() => onSelectItem({ type: 'tag', id: tag.id })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedItem.type === 'tag' && selectedItem.id === tag.id
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-${tag.color}`}></div>
                        <span className="flex-1 truncate text-left">{tag.name}</span>
                      </button>
                    </li>
                  ))}
                </React.Fragment>
              );
            })}
          </ul>
          
          {/* Tags without folders */}
          {tagsWithoutFolders.length > 0 && (
            <div className="mt-3 px-3">
              <div className="flex flex-wrap gap-2">
                {tagsWithoutFolders.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onSelectItem({ type: 'tag', id: tag.id })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                      selectedItem.type === 'tag' && selectedItem.id === tag.id
                        ? `bg-${tag.color} text-white shadow-sm`
                        : `bg-${tag.color}/10 text-${tag.color} hover:bg-${tag.color}/20`
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-${tag.color}`}></div>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default KarySidebar;