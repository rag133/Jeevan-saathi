import React, { useState } from 'react';
import { List, ListFolder, Tag, TagFolder, Selection } from '../types';
import * as Icons from '../../../components/Icons';

interface KarySidebarProps {
    smartLists: List[];
    customLists: List[];
    listFolders: ListFolder[];
    tags: Tag[];
    tagFolders: TagFolder[];
    selectedItem: Selection;
    onSelectItem: (selection: Selection) => void;
    onOpenModal: (modal: 'add-list' | 'add-tag') => void;
}

const ListItem: React.FC<{
    list: List,
    isSelected: boolean,
    onSelect: () => void,
    isChild?: boolean,
}> = ({ list, isSelected, onSelect, isChild = false }) => {
    const IconComponent = Icons[list.icon as keyof typeof Icons] || Icons.ListIcon;

    return (
        <li className={`px-2 ${isChild ? 'pl-6' : ''}`}>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onSelect();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
                <IconComponent className={`w-5 h-5 ${list.color ? `text-${list.color}` : ''}`} />
                <span className="flex-1 truncate">{list.name}</span>
                {list.count != null && <span className="text-xs font-normal">{list.count}</span>}
            </a>
        </li>
    )
}

const SidebarHeader: React.FC<{ title: string, onAdd: () => void }> = ({ title, onAdd }) => (
    <div className="px-4 pt-6 pb-2 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-500">{title}</h2>
        <button className="text-gray-400 hover:text-gray-700" onClick={onAdd}>
            <Icons.PlusIcon className="w-4 h-4" />
        </button>
    </div>
);


const KarySidebar: React.FC<KarySidebarProps> = ({ smartLists, customLists, listFolders, tags, tagFolders, selectedItem, onSelectItem, onOpenModal }) => {
    const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

    const toggleFolder = (folderId: string) => {
        setCollapsedFolders(prev => ({...prev, [folderId]: !prev[folderId]}));
    }

    const listsWithoutFolders = customLists.filter(l => !l.folderId);
    const tagsWithoutFolders = tags.filter(t => !t.folderId);

    return (
        <aside className="w-72 flex-shrink-0 bg-gray-100/80 border-r border-gray-200 p-2 flex flex-col">
            <nav className="flex-1 overflow-y-auto">
                <div className="px-4 pt-4 pb-2 flex items-center gap-3 text-gray-800">
                    <Icons.MagicWandIcon className="w-6 h-6 text-indigo-500" />
                    <h1 className="text-xl font-bold">Kary AI</h1>
                </div>

                <ul className="space-y-1 pt-2">
                    {smartLists.map((list) => (
                        <ListItem 
                            key={list.id} 
                            list={list} 
                            isSelected={selectedItem.type === 'list' && selectedItem.id === list.id} 
                            onSelect={() => onSelectItem({ type: 'list', id: list.id })}
                        />
                    ))}
                </ul>
                
                <SidebarHeader title="Lists" onAdd={() => onOpenModal('add-list')} />
                <ul className="space-y-1">
                     {listFolders.map(folder => {
                         const isCollapsed = collapsedFolders[folder.id];
                         return (
                             <React.Fragment key={folder.id}>
                                <li className="px-2">
                                     <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); toggleFolder(folder.id); }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200"
                                     >
                                        {isCollapsed ? <Icons.ChevronRightIcon className="w-4 h-4 text-gray-500" /> : <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500"/>}
                                        <Icons.FolderIcon className="w-5 h-5 text-gray-500" />
                                        <span className="flex-1 truncate">{folder.name}</span>
                                     </a>
                                </li>
                                {!isCollapsed && customLists.filter(l => l.folderId === folder.id).map(list => (
                                     <ListItem 
                                        key={list.id} 
                                        list={list} 
                                        isSelected={selectedItem.type === 'list' && selectedItem.id === list.id} 
                                        onSelect={() => onSelectItem({ type: 'list', id: list.id })} 
                                        isChild
                                     />
                                ))}
                             </React.Fragment>
                         )
                     })}
                     {listsWithoutFolders.map(list => (
                         <ListItem 
                            key={list.id} 
                            list={list} 
                            isSelected={selectedItem.type === 'list' && selectedItem.id === list.id} 
                            onSelect={() => onSelectItem({ type: 'list', id: list.id })}
                         />
                     ))}
                </ul>

                <SidebarHeader title="Tags" onAdd={() => onOpenModal('add-tag')} />
                <ul className="space-y-1">
                     {tagFolders.map(folder => {
                         const isCollapsed = collapsedFolders[folder.id];
                         return (
                             <React.Fragment key={folder.id}>
                                <li className="px-2">
                                     <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); toggleFolder(folder.id); }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200"
                                     >
                                        {isCollapsed ? <Icons.ChevronRightIcon className="w-4 h-4 text-gray-500" /> : <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500"/>}
                                        <Icons.FolderIcon className="w-5 h-5 text-gray-500" />
                                        <span className="flex-1 truncate">{folder.name}</span>
                                     </a>
                                </li>
                                {!isCollapsed && tags.filter(t => t.folderId === folder.id).map(tag => (
                                    <li key={tag.id} className="px-2 pl-8">
                                        <button onClick={() => onSelectItem({ type: 'tag', id: tag.id })} className={`w-full text-left flex items-center gap-2 px-2 py-1 text-sm font-medium rounded-md ${selectedItem.type === 'tag' && selectedItem.id === tag.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}>
                                            <span className={`w-2 h-2 rounded-full bg-${tag.color}`}></span>
                                            <span>{tag.name}</span>
                                        </button>
                                    </li>
                                ))}
                             </React.Fragment>
                         )
                     })}
                </ul>
                <div className="px-4 py-2 flex flex-wrap gap-2">
                    {tagsWithoutFolders.map(tag => (
                        <button 
                            key={tag.id}
                            onClick={() => onSelectItem({ type: 'tag', id: tag.id })}
                            className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                                selectedItem.type === 'tag' && selectedItem.id === tag.id
                                  ? `bg-${tag.color} text-white`
                                  : `bg-${tag.color}/20 text-${tag.color} hover:bg-${tag.color}/40`
                              }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default KarySidebar;
