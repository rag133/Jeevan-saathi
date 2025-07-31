

import React, { useState, useEffect } from 'react';
import { Focus, LogType, logTypeDetails, LogTemplate } from '../../types';
import * as Icons from '../../../../components/Icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';

interface AddFocusFormProps {
    onSave: (focus: Omit<Focus, 'id'>, id?: string) => void;
    onDelete: (id: string) => void;
    initialData: Focus | null;
    templates: LogTemplate[];
}

const AddFocusForm: React.FC<AddFocusFormProps> = ({ onSave, onDelete, initialData, templates }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('gray-500');
    const [icon, setIcon] = useState<keyof typeof Icons>('ListIcon');
    const [allowedLogTypes, setAllowedLogTypes] = useState<LogType[]>([LogType.TEXT, LogType.CHECKLIST, LogType.RATING]);
    const [defaultTemplateId, setDefaultTemplateId] = useState<string>('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setColor(initialData.color);
            setIcon(initialData.icon);
            setAllowedLogTypes(initialData.allowedLogTypes);
            setDefaultTemplateId(initialData.defaultTemplateId || '');
        } else {
            // Reset to defaults for a new form
            setName('');
            setDescription('');
            setColor('gray-500');
            setIcon('ListIcon');
            setAllowedLogTypes([LogType.TEXT, LogType.CHECKLIST, LogType.RATING]);
            setDefaultTemplateId('');
        }
    }, [initialData]);

    const handleLogTypeChange = (logType: LogType) => {
        setAllowedLogTypes(prev => {
            const newTypes = new Set(prev);
            if (newTypes.has(logType)) {
                // Prevent unselecting the last item
                if (newTypes.size > 1) {
                    newTypes.delete(logType);
                }
            } else {
                newTypes.add(logType);
            }
            return Array.from(newTypes);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const focusData: Omit<Focus, 'id'> = {
            name,
            description,
            icon,
            color,
            allowedLogTypes,
            defaultTemplateId: defaultTemplateId || undefined,
        };

        onSave(focusData, initialData?.id);
    };
    
    const handleDelete = () => {
        if (initialData && window.confirm(`Are you sure you want to delete the "${initialData.name}" focus area? This cannot be undone.`)) {
            onDelete(initialData.id);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="focus-name" className="block text-sm font-medium text-gray-700">Focus Name</label>
                <input
                    type="text"
                    id="focus-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., Gratitude"
                    required
                />
            </div>

            <div>
                <label htmlFor="focus-description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                    id="focus-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    rows={2}
                    placeholder="What is this focus area for?"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Log Types</label>
                <div className="flex flex-wrap gap-4">
                    {Object.values(LogType).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`log-type-${type}`}
                                checked={allowedLogTypes.includes(type)}
                                onChange={() => handleLogTypeChange(type)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`log-type-${type}`} className="ml-2 text-sm text-gray-700">{logTypeDetails[type].name}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                <label htmlFor="focus-template" className="block text-sm font-medium text-gray-700">Default Log Template</label>
                <select
                    id="focus-template"
                    value={defaultTemplateId}
                    onChange={(e) => setDefaultTemplateId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                    <option value="">Ask each time</option>
                    <option value="BLANK">Blank Log (Don't ask)</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Assign a template to skip the selection step when adding a log to this focus area.</p>
            </div>

            <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
            <ColorPicker selectedColor={color} onSelectColor={setColor} />

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
                <div>
                     {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Delete
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {initialData ? 'Save Changes' : 'Create Focus'}
                </button>
            </div>
        </form>
    );
};

export default AddFocusForm;