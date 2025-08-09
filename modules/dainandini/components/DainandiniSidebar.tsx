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
    <div
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={`w-5 h-5 flex items-center justify-center ${color ? `text-${color}` : 'text-gray-500'}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <span className="flex-1 truncate text-left">{name}</span>
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
    </div>
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
      className={`w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
        ${isMobile ? 'fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icons.BookOpenIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dainandini</h1>
            <p className="text-xs text-gray-500">Reflect on your day</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Smart Views */}
        <div className="mb-6">
          <ul className="space-y-1">
            <li>
              <SidebarItem
                id="today"
                type="today"
                name="Today's Journal"
                icon="TodayIcon"
                isSelected={selection.type === 'today'}
                onSelect={() => onSelect({ type: 'today' })}
              />
            </li>
            <li>
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Focus Areas */}
        <div className="mb-6">
          <SidebarHeader title="Focus Areas" onAdd={onOpenModal} icon="TargetIcon" />
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
                  className={`transition-all duration-200 cursor-grab ${draggedItemId === focus.id ? 'opacity-40 scale-95 shadow-lg rounded-md' : ''}`}
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Templates */}
        <div className="mb-6">
          <SidebarHeader title="Templates" onAdd={onCreateTemplate} icon="FileTextIcon" />
          <ul className="space-y-1">
            {templates.map((template) => (
              <li key={template.id}>
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
        </div>
      </nav>
    </aside>
  );
};

export default DainandiniSidebar;
