import React, { useState } from 'react';
import { Focus, DainandiniSelection, LogTemplate } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';

interface DainandiniSidebarProps {
  foci: Focus[];
  templates: LogTemplate[];
  selection: DainandiniSelection;
  onSelect: (selection: DainandiniSelection) => void;
  onOpenModal: () => void;
  onCreateTemplate: () => void;
  onEditFocus: (focusId: string) => void;
  onReorderFoci: (reorderedFoci: Focus[]) => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

const SidebarItem: React.FC<{
  id: string;
  type: 'today' | 'calendar' | 'focus' | 'template';
  name: string;
  icon: keyof typeof Icons;
  color?: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}> = ({ name, icon, color, isSelected, onSelect, onEdit, type }) => {
  const IconComponent = Icons[icon] || Icons.ListIcon;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
        isSelected
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <IconComponent className={`w-5 h-5 flex-shrink-0 ${color ? `text-${color}` : ''}`} />
        <span className="flex-1 truncate">{name}</span>
      </div>
      {type === 'focus' && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit();
          }}
          className="ml-auto p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-300 transition-opacity flex-shrink-0"
          aria-label={`Edit ${name}`}
        >
          <Icons.Edit3Icon className="w-4 h-4" />
        </button>
      )}
    </a>
  );
};

const SidebarHeader: React.FC<{ title: string; onAdd: () => void }> = ({ title, onAdd }) => (
  <div className="px-4 pt-6 pb-2 flex justify-between items-center">
    <h2 className="text-sm font-semibold text-gray-500">{title}</h2>
    <button className="text-gray-400 hover:text-gray-700" onClick={onAdd}>
      <Icons.PlusIcon className="w-4 h-4" />
    </button>
  </div>
);

const DainandiniSidebar: React.FC<DainandiniSidebarProps> = ({
  foci,
  templates,
  selection,
  onSelect,
  onOpenModal,
  onCreateTemplate,
  onEditFocus,
  onReorderFoci,
  isMobile,
  isSidebarOpen,
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, focusId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', focusId);
    setDraggedItemId(focusId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetId) return;

    const sourceIndex = foci.findIndex((f) => f.id === sourceId);
    const targetIndex = foci.findIndex((f) => f.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const reorderedFoci = [...foci];
    const [removed] = reorderedFoci.splice(sourceIndex, 1);
    reorderedFoci.splice(targetIndex, 0, removed);

    onReorderFoci(reorderedFoci);
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <aside
      className={`w-72 flex-shrink-0 bg-gray-100/80 border-r border-gray-200 p-2 flex flex-col
        ${isMobile ? 'fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 text-gray-800">
          <Icons.BookOpenIcon className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold">Dainandini</h1>
        </div>

        <ul className="space-y-1 pt-2">
          <li className="px-2">
            <SidebarItem
              id="today"
              type="today"
              name="Today's Journal"
              icon="TodayIcon"
              isSelected={selection.type === 'today'}
              onSelect={() => onSelect({ type: 'today' })}
            />
          </li>
          <li className="px-2">
            <SidebarItem
              id="calendar"
              type="calendar"
              name="Calendar"
              icon="CalendarIcon"
              isSelected={selection.type === 'calendar'}
              onSelect={() => onSelect({ type: 'calendar' })}
            />
          </li>
        </ul>

        <SidebarHeader title="Focus Areas" onAdd={onOpenModal} />
        <ul className="space-y-1">
          {foci.map((focus) => {
            return (
              <li
                key={focus.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, focus.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, focus.id)}
                onDragEnd={handleDragEnd}
                className={`px-2 transition-all duration-200 cursor-grab ${draggedItemId === focus.id ? 'opacity-40 scale-95 shadow-lg rounded-md' : ''}`}
              >
                <SidebarItem
                  id={focus.id}
                  type="focus"
                  name={focus.name}
                  icon={focus.icon}
                  color={focus.color}
                  isSelected={selection.type === 'focus' && selection.id === focus.id}
                  onSelect={() => onSelect({ type: 'focus', id: focus.id })}
                  onEdit={() => onEditFocus(focus.id)}
                />
              </li>
            );
          })}
        </ul>

        <SidebarHeader title="Templates" onAdd={onCreateTemplate} />
        <ul className="space-y-1">
          {templates.map((template) => (
            <li key={template.id} className="px-2">
              <SidebarItem
                id={template.id}
                type="template"
                name={template.name}
                icon={template.icon}
                isSelected={selection.type === 'template' && selection.id === template.id}
                onSelect={() => onSelect({ type: 'template', id: template.id })}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DainandiniSidebar;
