import React, { useState, useEffect } from 'react';
import {
  Habit,
  HabitType,
  HabitFrequency,
  HabitFrequencyType,
  HabitChecklistItem,
  HabitTargetComparison,
} from '../../types';
import * as Icons from '../../../../components/Icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';
import { Focus } from '../../../dainandini/types';

interface AddHabitFormProps {
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'status'>, id?: string) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  initialHabit: Habit | null;
  goalId?: string | null;
  milestoneId?: string | null;
  allFoci: Focus[];
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const FrequencyOption: React.FC<{
  type: HabitFrequencyType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ type, label, isActive, onClick, children }) => (
  <div
    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
        {isActive && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
      </div>
      <label
        htmlFor={`freq-${type}`}
        className="block text-sm font-medium text-gray-900 cursor-pointer"
      >
        {label}
      </label>
    </div>
    {isActive && children && <div className="mt-4 pl-8">{children}</div>}
  </div>
);

export const AddHabitForm: React.FC<AddHabitFormProps> = ({
  onSave,
  onClose,
  onDelete,
  initialHabit,
  goalId,
  milestoneId,
  allFoci,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<keyof typeof Icons>('TargetIcon');
  const [color, setColor] = useState('blue-500');
  const [habitType, setHabitType] = useState<HabitType>(HabitType.BINARY);
  const [frequency, setFrequency] = useState<HabitFrequency>({ type: HabitFrequencyType.DAILY });
  const [dailyTarget, setDailyTarget] = useState<number | undefined>(undefined);
  const [dailyTargetComparison, setDailyTargetComparison] = useState<HabitTargetComparison>(
    HabitTargetComparison.AT_LEAST
  );
  const [totalTarget, setTotalTarget] = useState<number | undefined>(undefined);
  const [totalTargetComparison, setTotalTargetComparison] = useState<HabitTargetComparison>(
    HabitTargetComparison.AT_LEAST
  );
  const [checklistItems, setChecklistItems] = useState<HabitChecklistItem[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [focusAreaId, setFocusAreaId] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setDescription(initialHabit.description || '');
      setIcon(initialHabit.icon);
      setColor(initialHabit.color);
      setHabitType(initialHabit.type);
      setFrequency(initialHabit.frequency);
      setDailyTarget(initialHabit.dailyTarget);
      setDailyTargetComparison(
        initialHabit.dailyTargetComparison || HabitTargetComparison.AT_LEAST
      );
      setTotalTarget(initialHabit.totalTarget);
      setTotalTargetComparison(
        initialHabit.totalTargetComparison || HabitTargetComparison.AT_LEAST
      );
      setChecklistItems(initialHabit.checklist || []);
      setStartDate(new Date(initialHabit.startDate).toISOString().split('T')[0]);
      setEndDate(
        initialHabit.endDate ? new Date(initialHabit.endDate).toISOString().split('T')[0] : ''
      );
      setReminders(initialHabit.reminders || []);
      setFocusAreaId(initialHabit.focusAreaId || '');
    } else {
      setStartDate(new Date().toISOString().split('T')[0]);
      if (allFoci.length > 0 && !focusAreaId) {
        setFocusAreaId(allFoci[0].id);
      }
    }
  }, [initialHabit, allFoci, focusAreaId]);

  const handleFrequencyTypeChange = (type: HabitFrequencyType) => {
    if (type === HabitFrequencyType.DAILY) setFrequency({ type: HabitFrequencyType.DAILY });
    else if (type === HabitFrequencyType.WEEKLY)
      setFrequency({ type: HabitFrequencyType.WEEKLY, times: 3 });
    else if (type === HabitFrequencyType.MONTHLY)
      setFrequency({ type: HabitFrequencyType.MONTHLY, times: 1 });
    else if (type === HabitFrequencyType.SPECIFIC_DAYS)
      setFrequency({ type: HabitFrequencyType.SPECIFIC_DAYS, days: [] });
  };

  const handleSpecificDayToggle = (dayIndex: number) => {
    if (frequency.type === HabitFrequencyType.SPECIFIC_DAYS) {
      const newDays = new Set(frequency.days);
      if (newDays.has(dayIndex)) newDays.delete(dayIndex);
      else newDays.add(dayIndex);
      setFrequency({ ...frequency, days: Array.from(newDays).sort() });
    }
  };

  const handleAddReminder = () => {
    if (newReminder && !reminders.includes(newReminder)) {
      setReminders([...reminders, newReminder].sort());
      setNewReminder('');
    }
  };

  const handleRemoveReminder = (reminderToRemove: string) => {
    setReminders(reminders.filter((r) => r !== reminderToRemove));
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistItemText.trim()) {
      e.preventDefault();
      setChecklistItems([
        ...checklistItems,
        { id: crypto.randomUUID(), text: newChecklistItemText.trim() },
      ]);
      setNewChecklistItemText('');
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalChecklist: HabitChecklistItem[] | undefined = undefined;
    if (habitType === HabitType.CHECKLIST) {
      finalChecklist = newChecklistItemText.trim()
        ? [...checklistItems, { id: crypto.randomUUID(), text: newChecklistItemText.trim() }]
        : checklistItems;
    }

    const data: Omit<Habit, 'id' | 'createdAt' | 'status'> = {
      title: title.trim(),
      description,
      icon,
      color,
      type: habitType,
      frequency,
      ...(dailyTarget !== undefined && { dailyTarget }),
      ...(dailyTargetComparison !== undefined && { dailyTargetComparison }),
      ...(totalTarget !== undefined && { totalTarget }),
      ...(totalTargetComparison !== undefined && { totalTargetComparison }),
      checklist: finalChecklist,
      goalId: goalId || undefined,
      milestoneId: milestoneId || undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      reminders: reminders,
      focusAreaId: focusAreaId || undefined,
    };

    onSave(data, initialHabit?.id);
  };

  const handleDeleteClick = () => {
    if (
      initialHabit &&
      window.confirm(`Are you sure you want to delete the habit "${initialHabit.title}"?`)
    ) {
      onDelete(initialHabit.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="habit-title" className="block text-sm font-medium text-gray-700">
              Habit Name
            </label>
            <input
              type="text"
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.values(HabitType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHabitType(type)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${habitType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
          <ColorPicker selectedColor={color} onSelectColor={setColor} />
          <div>
            <label htmlFor="habit-focus" className="block text-sm font-medium text-gray-700">
              Focus Area
            </label>
            <select
              id="habit-focus"
              value={focusAreaId}
              onChange={(e) => setFocusAreaId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {allFoci.map((focus) => (
                <option key={focus.id} value={focus.id}>
                  {focus.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <>
        {(habitType === HabitType.COUNT || habitType === HabitType.DURATION) && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Goal (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={dailyTargetComparison}
                onChange={(e) => setDailyTargetComparison(e.target.value as HabitTargetComparison)}
                className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm"
              >
                <option value={HabitTargetComparison.AT_LEAST}>At least</option>
                <option value={HabitTargetComparison.EXACTLY}>Exactly</option>
                <option value={HabitTargetComparison.LESS_THAN}>Less than</option>
              </select>
              <input
                type="number"
                value={dailyTarget || ''}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || undefined)}
                min="1"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
                placeholder="e.g., 30"
              />
              <span>{habitType === HabitType.DURATION ? 'minutes' : 'times'} per day</span>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Goal (Optional)
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={totalTargetComparison}
              onChange={(e) => setTotalTargetComparison(e.target.value as HabitTargetComparison)}
              className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm"
            >
              <option value={HabitTargetComparison.AT_LEAST}>At least</option>
              <option value={HabitTargetComparison.EXACTLY}>Exactly</option>
              <option value={HabitTargetComparison.LESS_THAN}>Less than</option>
            </select>
            <input
              type="number"
              value={totalTarget || ''}
              onChange={(e) => setTotalTarget(parseInt(e.target.value) || undefined)}
              min="1"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
              placeholder="e.g., 300"
            />
            <span>{habitType === HabitType.DURATION ? 'minutes' : 'times'} in total</span>
          </div>
        </div>
      </>

      {habitType === HabitType.CHECKLIST && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Checklist Items</label>
          <div className="mt-2 space-y-2">
            {checklistItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-100 rounded-md text-sm">{item.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                >
                  <Icons.Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <input
              type="text"
              value={newChecklistItemText}
              onChange={(e) => setNewChecklistItemText(e.target.value)}
              onKeyDown={handleAddChecklistItem}
              placeholder="Add an item and press Enter..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
        <div className="space-y-3">
          <FrequencyOption
            type={HabitFrequencyType.DAILY}
            label="Daily"
            isActive={frequency.type === HabitFrequencyType.DAILY}
            onClick={() => handleFrequencyTypeChange(HabitFrequencyType.DAILY)}
          />
          <FrequencyOption
            type={HabitFrequencyType.SPECIFIC_DAYS}
            label="Specific days of the week"
            isActive={frequency.type === HabitFrequencyType.SPECIFIC_DAYS}
            onClick={() => handleFrequencyTypeChange(HabitFrequencyType.SPECIFIC_DAYS)}
          >
            <div className="flex justify-between">
              {weekDays.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSpecificDayToggle(i)}
                  className={`w-9 h-9 font-semibold rounded-full transition-colors ${frequency.type === HabitFrequencyType.SPECIFIC_DAYS && frequency.days.includes(i) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </FrequencyOption>
          <FrequencyOption
            type={HabitFrequencyType.WEEKLY}
            label="Times per week"
            isActive={frequency.type === HabitFrequencyType.WEEKLY}
            onClick={() => handleFrequencyTypeChange(HabitFrequencyType.WEEKLY)}
          >
            {frequency.type === HabitFrequencyType.WEEKLY && (
              <input
                type="number"
                min="1"
                max="7"
                value={frequency.times}
                onChange={(e) =>
                  setFrequency({
                    type: HabitFrequencyType.WEEKLY,
                    times: parseInt(e.target.value) || 1,
                  })
                }
                className="w-20 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900"
              />
            )}
          </FrequencyOption>
          <FrequencyOption
            type={HabitFrequencyType.MONTHLY}
            label="Times per month"
            isActive={frequency.type === HabitFrequencyType.MONTHLY}
            onClick={() => handleFrequencyTypeChange(HabitFrequencyType.MONTHLY)}
          >
            {frequency.type === HabitFrequencyType.MONTHLY && (
              <input
                type="number"
                min="1"
                max="31"
                value={frequency.times}
                onChange={(e) =>
                  setFrequency({
                    type: HabitFrequencyType.MONTHLY,
                    times: parseInt(e.target.value) || 1,
                  })
                }
                className="w-20 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900"
              />
            )}
          </FrequencyOption>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            End Date (Optional)
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reminders</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="time"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
          />
          <button
            type="button"
            onClick={handleAddReminder}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {reminders.map((time) => (
            <span
              key={time}
              className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {time}
              <button
                type="button"
                onClick={() => handleRemoveReminder(time)}
                className="text-blue-600 hover:text-blue-800"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div>
          {initialHabit && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            {initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </form>
  );
};
