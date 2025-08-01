import React, { useState, useEffect } from 'react';
import { LogTemplate, Focus, LogType, logTypeDetails, ChecklistItem } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';
import ColorPicker from './forms/ColorPicker';
import IconPicker from './forms/IconPicker';

const StarRatingInput: React.FC<{ rating: number; onSetRating: (rating: number) => void }> = ({
  rating,
  onSetRating,
}) => (
  <div className="flex items-center gap-1 py-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onSetRating(star)}
        className="p-1 rounded-full text-yellow-400 hover:text-yellow-500 transition-colors"
        aria-label={`Set rating to ${star}`}
      >
        <Icons.StarIcon
          className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-yellow-400' : 'fill-gray-300 hover:fill-yellow-200'}`}
        />
      </button>
    ))}
  </div>
);

interface TemplateDetailProps {
  template: LogTemplate | null;
  foci: Focus[];
  onSave: (
    templateData: Omit<LogTemplate, 'id'> | Partial<LogTemplate>,
    templateId?: string
  ) => void;
  onDelete: (templateId: string) => void;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({ template, foci, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof Icons>('ListIcon');
  const [focusId, setFocusId] = useState('');
  const [logType, setLogType] = useState<LogType>(LogType.TEXT);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<Pick<ChecklistItem, 'text' | 'completed'>[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [rating, setRating] = useState(3);

  useEffect(() => {
    setName(template?.name || '');
    setIcon(template?.icon || 'ListIcon');
    setFocusId(template?.focusId || foci[0]?.id || '');
    setLogType(template?.logType || LogType.TEXT);
    setTitle(template?.title || '');
    setDescription(template?.description || '');
    setChecklist(template?.checklist || []);
    setRating(template?.rating || 3);
  }, [template, foci]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !focusId || !title.trim()) return;

    const data: Omit<LogTemplate, 'id'> = {
      name,
      icon,
      focusId,
      logType,
      title,
      description,
      checklist: logType === LogType.CHECKLIST ? checklist : undefined,
      rating: logType === LogType.RATING ? rating : undefined,
    };

    if (template) {
      onSave(data, template.id);
    } else {
      onSave(data);
    }
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      e.preventDefault();
      setChecklist([...checklist, { text: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-white/90 p-6 flex flex-col h-full overflow-y-auto">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="template-title" className="block text-sm font-medium text-gray-700">
            Default Title
          </label>
          <input
            type="text"
            id="template-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Weekly Review - {{date}}"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            {'Use `{{date}}` as a placeholder for the current date.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="template-focus" className="block text-sm font-medium text-gray-700">
              Default Focus
            </label>
            <select
              id="template-focus"
              value={focusId}
              onChange={(e) => setFocusId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {foci.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="template-logtype" className="block text-sm font-medium text-gray-700">
              Log Type
            </label>
            <select
              id="template-logtype"
              value={logType}
              onChange={(e) => setLogType(e.target.value as LogType)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(LogType).map((type) => (
                <option key={type} value={type}>
                  {logTypeDetails[type].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />

        {logType === LogType.RATING && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Rating</label>
            <StarRatingInput rating={rating} onSetRating={setRating} />
          </div>
        )}

        {logType === LogType.TEXT && (
          <div>
            <label htmlFor="template-desc" className="block text-sm font-medium text-gray-700">
              Default Description
            </label>
            <textarea
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            ></textarea>
          </div>
        )}

        {logType === LogType.CHECKLIST && (
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-gray-700">
              Default Checklist Items
            </label>
            <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {checklist.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700 pr-2">
                  <Icons.CheckSquareIcon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={handleAddChecklistItem}
              placeholder="Add item and press Enter..."
              className="w-full bg-white rounded px-2 py-1.5 text-sm border border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            {template && (
              <button
                type="button"
                onClick={() => onDelete(template.id)}
                className="px-4 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50"
              >
                Delete Template
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateDetail;
