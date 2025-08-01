import React, { useState } from 'react';
import { QuickWin } from '../../types';

interface AddQuickWinFormProps {
  onSave: (data: Omit<QuickWin, 'id' | 'createdAt' | 'status'>) => void;
}

const AddQuickWinForm: React.FC<AddQuickWinFormProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, dueDate: dueDate ? new Date(dueDate) : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="qw-title" className="label">
          Title
        </label>
        <input
          id="qw-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
          placeholder="e.g., Reply to Sarah's email"
        />
      </div>
      <div>
        <label htmlFor="qw-date" className="label">
          Due Date (Optional)
        </label>
        <input
          id="qw-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="btn-primary">
          Add Quick Win
        </button>
      </div>
      <style>{`
            .label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4a5568; }
            .input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; background-color: white; color: #1a202c; outline: none; transition: box-shadow 0.2s; }
            .input:focus { box-shadow: 0 0 0 2px #63b3ed; border-color: #4299e1; }
            .btn-primary { padding: 0.5rem 1rem; font-weight: 600; border-radius: 0.375rem; background-color: #4299e1; color: white; transition: background-color 0.2s; }
            .btn-primary:hover { background-color: #3182ce; }
            `}</style>
    </form>
  );
};

export default AddQuickWinForm;
