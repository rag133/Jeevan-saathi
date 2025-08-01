import React, { useState, useEffect } from 'react';
import { Milestone, Goal } from '../../types';
import { Focus } from '../../../dainandini/types';

interface AddMilestoneFormProps {
  onSave: (data: Omit<Milestone, 'id' | 'status'>, id?: string) => void;
  onDelete: (id: string) => void;
  goals: Goal[];
  initialGoalId?: string | null;
  allFoci: Focus[];
  initialMilestone: Milestone | null;
}

const AddMilestoneForm: React.FC<AddMilestoneFormProps> = ({
  onSave,
  onDelete,
  goals,
  initialGoalId,
  allFoci,
  initialMilestone,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentGoalId, setParentGoalId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState('');
  const [focusAreaId, setFocusAreaId] = useState('');

  useEffect(() => {
    if (initialMilestone) {
      setTitle(initialMilestone.title);
      setDescription(initialMilestone.description || '');
      setParentGoalId(initialMilestone.parentGoalId);
      setStartDate(new Date(initialMilestone.startDate).toISOString().split('T')[0]);
      setTargetEndDate(
        initialMilestone.targetEndDate
          ? new Date(initialMilestone.targetEndDate).toISOString().split('T')[0]
          : ''
      );
      setFocusAreaId(initialMilestone.focusAreaId || '');
    } else {
      setParentGoalId(initialGoalId || goals[0]?.id || '');
      if (allFoci.length > 0 && !focusAreaId) {
        setFocusAreaId(allFoci[0].id);
      }
    }
  }, [initialMilestone, initialGoalId, goals, allFoci]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentGoalId) {
      alert('Please select a parent goal.');
      return;
    }
    onSave(
      {
        title,
        description,
        parentGoalId,
        startDate: new Date(startDate),
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
        focusAreaId: focusAreaId || undefined,
      },
      initialMilestone?.id
    );
  };

  const handleDelete = () => {
    if (
      initialMilestone &&
      window.confirm(`Are you sure you want to delete the milestone "${initialMilestone.title}"?`)
    ) {
      onDelete(initialMilestone.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="milestone-goal" className="label">
          Parent Goal
        </label>
        <select
          id="milestone-goal"
          value={parentGoalId}
          onChange={(e) => setParentGoalId(e.target.value)}
          required
          className="input"
        >
          {goals.length > 0 ? (
            goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Please create a goal first
            </option>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="milestone-title" className="label">
          Milestone Title
        </label>
        <input
          id="milestone-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </div>
      <div>
        <label htmlFor="milestone-focus" className="label">
          Focus Area
        </label>
        <select
          id="milestone-focus"
          value={focusAreaId}
          onChange={(e) => setFocusAreaId(e.target.value)}
          required
          className="input"
        >
          {allFoci.map((focus) => (
            <option key={focus.id} value={focus.id}>
              {focus.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="milestone-desc" className="label">
          Description
        </label>
        <textarea
          id="milestone-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="milestone-start-date" className="label">
            Start Date
          </label>
          <input
            id="milestone-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="milestone-end-date" className="label">
            Target End Date (Optional)
          </label>
          <input
            id="milestone-end-date"
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div>
          {initialMilestone && (
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
          {initialMilestone ? 'Save Changes' : 'Create Milestone'}
        </button>
      </div>
      <style>{`
            .label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4a5568; }
            .input, .textarea { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; background-color: white; color: #1a202c; outline: none; transition: box-shadow 0.2s; }
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
            .input:disabled { background-color: #f7fafc; cursor: not-allowed; }
            .input:focus, .textarea:focus { box-shadow: 0 0 0 2px #63b3ed; border-color: #4299e1; }
            .btn-primary { padding: 0.5rem 1rem; font-weight: 600; border-radius: 0.375rem; background-color: #4299e1; color: white; transition: background-color 0.2s; }
            .btn-primary:hover { background-color: #3182ce; }
            `}</style>
    </form>
  );
};

export default AddMilestoneForm;
