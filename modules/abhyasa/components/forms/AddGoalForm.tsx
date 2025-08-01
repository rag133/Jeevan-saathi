import React, { useState, useEffect } from 'react';
import * as Icons from '~/components/Icons';
import { Goal } from '~/modules/abhyasa/types';
import IconPicker from './IconPicker';
import { Focus } from '~/modules/dainandini/types';

interface AddGoalFormProps {
  onSave: (data: Omit<Goal, 'id' | 'startDate' | 'status'>, id?: string) => void;
  onDelete: (id: string) => void;
  initialGoal: Goal | null;
  allFoci: Focus[];
}

const AddGoalForm: React.FC<AddGoalFormProps> = ({ onSave, onDelete, initialGoal, allFoci }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [icon, setIcon] = useState<keyof typeof Icons>('TargetIcon');
  const [focusAreaId, setFocusAreaId] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setIcon(initialGoal.icon);
      setTargetEndDate(
        initialGoal.targetEndDate
          ? new Date(initialGoal.targetEndDate).toISOString().split('T')[0]
          : ''
      );
      setFocusAreaId(initialGoal.focusAreaId || '');
    } else {
      // Reset for new goal
      setTitle('');
      setDescription('');
      setIcon('TargetIcon');
      setTargetEndDate('');
      if (allFoci.length > 0) {
        setFocusAreaId(allFoci[0].id);
      }
    }
  }, [initialGoal, allFoci]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        title,
        description,
        icon,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
        focusAreaId: focusAreaId || undefined,
      },
      initialGoal?.id
    );
  };

  const handleDelete = () => {
    if (
      initialGoal &&
      window.confirm(
        `Are you sure you want to delete the goal "${initialGoal.title}"? This will also delete all associated milestones.`
      )
    ) {
      onDelete(initialGoal.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="goal-title" className="label">
          Goal Title
        </label>
        <input
          id="goal-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </div>
      <div>
        <label htmlFor="goal-desc" className="label">
          Description
        </label>
        <textarea
          id="goal-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal-date" className="label">
            Target End Date (Optional)
          </label>
          <input
            id="goal-date"
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="goal-focus" className="label">
            Focus Area
          </label>
          <select
            id="goal-focus"
            value={focusAreaId}
            onChange={(e) => setFocusAreaId(e.target.value)}
            className="input"
          >
            {allFoci.map((focus) => (
              <option key={focus.id} value={focus.id}>
                {focus.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
      <div className="flex justify-between items-center pt-4">
        <div>
          {initialGoal && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary">
          {initialGoal ? 'Save Changes' : 'Create Goal'}
        </button>
      </div>
      <style>{`
            .label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4a5568; }
            .input, .textarea { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; background-color: white; color: #1a202c; outline: none; transition: box-shadow 0.2s; }
            .input:focus, .textarea:focus { box-shadow: 0 0 0 2px #63b3ed; border-color: #4299e1; }
            select.input {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23a0aec0%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: right 0.75rem center;
                background-size: 1.25em 1.25em;
                padding-right: 2.5rem;
            }
            .btn-primary { padding: 0.5rem 1rem; font-weight: 600; border-radius: 0.375rem; background-color: #4299e1; color: white; transition: background-color 0.2s; }
            .btn-primary:hover { background-color: #3182ce; }
            `}</style>
    </form>
  );
};

export default AddGoalForm;
