import React, { useState } from 'react';
import { Milestone } from '../../types';
import Checkbox from '../../../../components/common/Checkbox';

interface LinkMilestoneFormProps {
  milestones: Milestone[];
  onLink: (milestoneId: string) => void;
  onClose: () => void;
}

const LinkMilestoneForm: React.FC<LinkMilestoneFormProps> = ({ milestones, onLink, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    selectedIds.forEach((id) => onLink(id));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-h-64 overflow-y-auto border rounded-md p-2 mb-4">
        {milestones.length > 0 ? (
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li
                key={m.id}
                onClick={() => handleToggle(m.id)}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedIds.has(m.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <Checkbox checked={selectedIds.has(m.id)} onChange={() => {}} />
                <span>{m.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">No unlinked milestones available.</p>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={selectedIds.size === 0}
          className="btn-primary disabled:bg-blue-300"
        >
          Link {selectedIds.size} Milestone{selectedIds.size !== 1 && 's'}
        </button>
      </div>
      <style>{`
                .btn-primary { padding: 0.5rem 1rem; font-weight: 600; border-radius: 0.375rem; background-color: #4299e1; color: white; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #3182ce; }
            `}</style>
    </form>
  );
};

export default LinkMilestoneForm;
