import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KaryTaskItem from './KaryTaskItem';
import { Task, Tag } from '~/modules/kary/types';

// Mock child components and icons
vi.mock('~/components/common/Checkbox', () => ({
  default: vi.fn(({ checked, onChange, ariaLabel }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      data-testid="mock-checkbox"
    />
  )),
}));

vi.mock('~/components/Icons', () => ({
  FlagIcon: vi.fn(({ className }) => <span data-testid="flag-icon" className={className} />),
  ChevronRightIcon: vi.fn(() => <span data-testid="chevron-right-icon" />),
  ChevronDownIcon: vi.fn(() => <span data-testid="chevron-down-icon" />),
  ClockIcon: vi.fn(() => <span data-testid="clock-icon" />),
}));

const MOCK_DATE = new Date('2025-08-01T12:00:00.000Z');

describe('KaryTaskItem', () => {
  beforeEach(() => {
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const defaultTask: Task = {
    id: '1',
    title: 'Test Task',
    completed: false,
    listId: 'list1',
    createdAt: new Date(),
  };

  const defaultProps = {
    task: defaultTask,
    allTags: [],
    isSelected: false,
    level: 0,
    isParent: false,
    isExpanded: false,
    onSelect: vi.fn(),
    onToggleComplete: vi.fn(),
    onToggleExpand: vi.fn(),
  };

  it('renders the task title', () => {
    render(<KaryTaskItem {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('applies line-through style when task is completed', () => {
    const completedTask = { ...defaultTask, completed: true };
    render(<KaryTaskItem {...defaultProps} task={completedTask} />);
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    render(<KaryTaskItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mock-checkbox'));
    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith(defaultTask.id);
  });

  it('calls onSelect when task item is clicked', () => {
    render(<KaryTaskItem {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Task'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(defaultTask.id);
  });

  it('renders expand/collapse button for parent tasks', () => {
    render(<KaryTaskItem {...defaultProps} isParent={true} />);
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });

  it('calls onToggleExpand when expand/collapse button is clicked', () => {
    render(<KaryTaskItem {...defaultProps} isParent={true} />);
    fireEvent.click(screen.getByTestId('chevron-right-icon'));
    expect(defaultProps.onToggleExpand).toHaveBeenCalledWith(defaultTask.id);
  });

  it('displays due date correctly for today', () => {
    const today = new Date(MOCK_DATE);
    const taskWithDueDate = { ...defaultTask, dueDate: today };
    render(<KaryTaskItem {...defaultProps} task={taskWithDueDate} />);
    expect(screen.getByText('Today 5:30 pm')).toBeInTheDocument();
    expect(screen.getByText('Today 5:30 pm')).toHaveClass('text-blue-600');
  });

  it('displays due date correctly for tomorrow', () => {
    const tomorrow = new Date(MOCK_DATE);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskWithDueDate = { ...defaultTask, dueDate: tomorrow };
    render(<KaryTaskItem {...defaultProps} task={taskWithDueDate} />);
    expect(screen.getByText('Aug 2 5:30 pm')).toBeInTheDocument();
        expect(screen.getByText('Aug 2 5:30 pm')).toHaveClass('text-gray-500');
  });

  it('displays due date correctly for overdue tasks', () => {
    const yesterday = new Date(MOCK_DATE);
    yesterday.setDate(yesterday.getDate() - 1);
    const taskWithDueDate = { ...defaultTask, dueDate: yesterday };
    render(<KaryTaskItem {...defaultProps} task={taskWithDueDate} />);
    expect(screen.getByText('Jul 31 5:30 pm')).toBeInTheDocument();
    expect(screen.getByText('Jul 31 5:30 pm')).toHaveClass('text-red-500');
  });

  it('displays priority icon with correct color', () => {
    const taskWithPriority = { ...defaultTask, priority: 1 };
    render(<KaryTaskItem {...defaultProps} task={taskWithPriority} />);
    expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
    expect(screen.getByTestId('flag-icon')).toHaveClass('text-red-600');
  });

  it('displays tags correctly', () => {
    const mockTags: Tag[] = [{ id: 'tag1', name: 'Work', color: 'purple' }];
    const taskWithTags = { ...defaultTask, tags: ['tag1'] };
    render(<KaryTaskItem {...defaultProps} task={taskWithTags} allTags={mockTags} />);
    expect(screen.getByText('#Work')).toBeInTheDocument();
    expect(screen.getByText('#Work')).toHaveClass('bg-purple/20');
  });

  it('displays source link correctly', () => {
    const taskWithSource = { ...defaultTask, source: { text: 'MarkTechPost', url: 'https://marktechpost.com' } };
    render(<KaryTaskItem {...defaultProps} task={taskWithSource} />);
    expect(screen.getByText('MarkTechPost')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MarkTechPost' })).toHaveAttribute('href', 'https://marktechpost.com');
  });

  it('applies correct indentation based on level prop', () => {
    render(<KaryTaskItem {...defaultProps} level={1} />);
    expect(screen.getByRole('listitem')).toHaveStyle('padding-left: 36px'); // 1 * 24 + 12 = 36
  });
});
