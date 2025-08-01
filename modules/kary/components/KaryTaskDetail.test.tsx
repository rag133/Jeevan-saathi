import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KaryTaskDetail from './KaryTaskDetail';
import { Task, Tag, List } from '~/modules/kary/types';
import { Log } from '~/modules/dainandini/types';

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

vi.mock('./DateTimePicker', () => ({
  default: vi.fn(({ currentDate, onSelect, onClear, onClose }) => (
    <div data-testid="mock-date-time-picker">
      <button onClick={() => onSelect(new Date('2025-08-05'))}>Select Date</button>
      <button onClick={onClear}>Clear Date</button>
      <button onClick={onClose}>Close Picker</button>
    </div>
  )),
}));

vi.mock('react-markdown', () => ({
  default: vi.fn(({ children, components }) => {
    const lines = children.split('\n');
    return (
      <div data-testid="mock-react-markdown">
        {lines.map((line, index) => {
          if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
            const checked = line.startsWith('- [x] ');
            const content = line.substring(6);
            if (components && components.li) {
              return components.li({
                key: index,
                children: content,
                checked: checked,
                node: { position: { start: { line: index + 1 } } }
              });
            }
            return <li key={index}>{content}</li>;
          }
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  }),
}));

vi.mock('./SubtaskItem', () => ({
  default: vi.fn(({ task, onToggleComplete, onSelect }) => (
    <li data-testid={`mock-subtask-item-${task.id}`}>
      <span onClick={() => onSelect(task.id)}>{task.title}</span>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        data-testid={`subtask-checkbox-${task.id}`}
      />
    </li>
  )),
}));

vi.mock('~/components/common/LoadingSpinner', () => ({
  default: vi.fn(() => <div data-testid="mock-loading-spinner">Loading...</div>),
}));

vi.mock('./TaskLogItem', () => ({
  default: vi.fn(({ log }) => (
    <li data-testid={`mock-task-log-item-${log.id}`}>{log.title}</li>
  )),
}));

// Mock all icons
vi.mock('~/components/Icons', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    FlagIcon: vi.fn(({ className }) => <span data-testid="flag-icon" className={className} />),
    CalendarIcon: vi.fn(() => <span data-testid="calendar-icon" />),
    BellIcon: vi.fn(({ className }) => <span data-testid="bell-icon" className={className} />),
    MoreHorizontalIcon: vi.fn(() => <span data-testid="more-horizontal-icon" />),
    ListIcon: vi.fn(({ className }) => <span data-testid="list-icon" className={className} />),
    TagIcon: vi.fn(() => <span data-testid="tag-icon" />),
    PlusIcon: vi.fn(() => <span data-testid="plus-icon" />),
    CheckSquareIcon: vi.fn(() => <span data-testid="check-square-icon" />),
    BookOpenIcon: vi.fn(() => <span data-testid="book-open-icon" />),
    CopyIcon: vi.fn(() => <span data-testid="copy-icon" />),
    Trash2Icon: vi.fn(() => <span data-testid="trash-2-icon" />),
    ChevronDownIcon: vi.fn(() => <span data-testid="chevron-down-icon" />),
  };
});

describe('KaryTaskDetail', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    completed: false,
    listId: 'list1',
    createdAt: new Date(),
    description: 'This is a test description.',
    priority: 3,
    tags: ['tag1'],
    dueDate: new Date('2025-08-05T10:00:00Z'),
  };

  const mockTag: Tag = { id: 'tag1', name: 'Work', color: 'blue' };
  const mockList: List = { id: 'list1', name: 'My List', icon: 'ListIcon', color: 'green' };
  const mockAllTags: Tag[] = [mockTag, { id: 'tag2', name: 'Personal', color: 'red' }];
  const mockAllLists: List[] = [mockList, { id: 'list2', name: 'Another List', icon: 'ListIcon' }];
  const mockLogs: Log[] = [
    { id: 'log1', title: 'Log Entry 1', taskId: '1', logDate: new Date(), logType: 'TEXT', focusId: 'f1' },
  ];
  const mockChildrenTasks: Task[] = [
    { id: '1.1', title: 'Subtask 1', completed: false, listId: 'list1', parentId: '1', createdAt: new Date() },
  ];

  const defaultProps = {
    selectedTaskId: mockTask.id,
    tasks: [mockTask, ...mockChildrenTasks],
    allTags: mockAllTags,
    allLists: mockAllLists,
    allLogs: mockLogs,
    childrenTasks: mockChildrenTasks,
    onToggleComplete: vi.fn(),
    onUpdateTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onDuplicateTask: vi.fn(),
    onSelectTask: vi.fn(),
    onAddTask: vi.fn(),
    onOpenLogModal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message when no task is selected', () => {
    render(<KaryTaskDetail {...defaultProps} selectedTaskId={null} />);
    expect(screen.getByText('Select a task to see its details')).toBeInTheDocument();
  });

  it('renders task details when a task is selected', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('My List')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Log Entry 1')).toBeInTheDocument();
  });

  it('toggles task completion when checkbox is clicked', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Mark Test Task as complete'));
    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });

  it('updates task title on blur', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const titleElement = screen.getByText('Test Task');
    fireEvent.click(titleElement);
    const titleTextarea = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleTextarea, { target: { value: 'Updated Title' } });
    fireEvent.blur(titleTextarea);
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { title: 'Updated Title' });
  });

  it('updates task description on blur', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const descriptionDiv = screen.getByText('This is a test description.');
    fireEvent.click(descriptionDiv);
    const descriptionTextarea = screen.getByPlaceholderText('Add more details... (Markdown supported)');
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated description.' } });
    fireEvent.blur(descriptionTextarea);
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { description: 'Updated description.' });
  });

  it('adds a subtask', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const subtaskInput = screen.getByPlaceholderText('Add a subtask');
    fireEvent.change(subtaskInput, { target: { value: 'New Subtask' } });
    fireEvent.submit(subtaskInput);
    expect(defaultProps.onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Subtask' }),
      null,
      mockTask.id
    );
    expect(subtaskInput).toHaveValue('');
  });

  it('opens and closes date picker popup', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const dateButton = screen.getByText('Tuesday, August 5, 2025 at 3:30 PM');
    fireEvent.click(dateButton);
    expect(screen.getByTestId('mock-date-time-picker')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Picker'));
    expect(screen.queryByTestId('mock-date-time-picker')).not.toBeInTheDocument();
  });

  it('selects a new due date from date picker', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const dateButton = screen.getByText('Tuesday, August 5, 2025 at 3:30 PM');
    fireEvent.click(dateButton);
    fireEvent.click(screen.getByText('Select Date'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, {
      dueDate: new Date('2025-08-05'),
      reminder: true,
    });
  });

  it('clears due date from date picker', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const dateButton = screen.getByText('Tuesday, August 5, 2025 at 3:30 PM');
    fireEvent.click(dateButton);
    fireEvent.click(screen.getByText('Clear Date'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, {
      dueDate: undefined,
      reminder: false,
    });
  });

  it('toggles reminder', () => {
    const taskWithReminder = { ...mockTask, reminder: true };
    render(<KaryTaskDetail {...defaultProps} task={taskWithReminder} />);
    fireEvent.click(screen.getByLabelText('Toggle reminder'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { reminder: true });
  });

  it('opens and selects priority from popup', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByTestId('flag-icon')); // Click priority flag icon
    expect(screen.getByText('Urgent (P1)')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Urgent (P1)'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { priority: 1 });
  });

  it('adds a tag from popup', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Add tag'));
    expect(screen.getByText('Personal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Personal'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, {
      tags: ['tag1', 'tag2'],
    });
  });

  it('removes a tag using TagPill', async () => {
    render(<KaryTaskDetail {...defaultProps} />);
    const tagPill = screen.getByText('Work').closest('span');
    if (tagPill) {
      fireEvent.mouseEnter(tagPill);
      await waitFor(() => {
        const removeButton = screen.getByLabelText('Remove Work tag');
        fireEvent.click(removeButton);
      }, { timeout: 10000 }); // Increased timeout
    }
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { tags: [] });
  });

  it('changes task list from popup', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByText('My List')); // Click current list button
    expect(screen.getByText('Another List')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Another List'));
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { listId: 'list2' });
  });

  it('duplicates task from more options', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('More options'));
    fireEvent.click(screen.getByText('Duplicate Task'));
    expect(defaultProps.onDuplicateTask).toHaveBeenCalledWith(mockTask.id);
  });

  it('deletes task from more options after confirmation', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    window.confirm = vi.fn(() => true); // Mock window.confirm to return true
    fireEvent.click(screen.getByLabelText('More options'));
    fireEvent.click(screen.getByText('Delete Task'));
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this task? This will also delete all of its subtasks.'
    );
    expect(defaultProps.onDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });

  it('does not delete task from more options if confirmation is cancelled', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    window.confirm = vi.fn(() => false); // Mock window.confirm to return false
    fireEvent.click(screen.getByLabelText('More options'));
    fireEvent.click(screen.getByText('Delete Task'));
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this task? This will also delete all of its subtasks.'
    );
    expect(defaultProps.onDeleteTask).not.toHaveBeenCalled();
  });

  it('calls onOpenLogModal when Add Entry button is clicked', () => {
    render(<KaryTaskDetail {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Add an entry for this task to your journal'));
    expect(defaultProps.onOpenLogModal).toHaveBeenCalledWith(mockTask);
  });

  it('handles checklist item toggle in description', () => {
    const taskWithChecklist = { ...mockTask, description: '- [ ] Item 1\n- [x] Item 2' };
    render(<KaryTaskDetail {...defaultProps} task={taskWithChecklist} />);

    const checkbox1 = screen.getAllByTestId('mock-checkbox')[0];
    fireEvent.click(checkbox1);
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { description: '- [x] Item 1\n- [x] Item 2' });

    const checkbox2 = screen.getAllByTestId('mock-checkbox')[1];
    fireEvent.click(checkbox2);
    expect(defaultProps.onUpdateTask).toHaveBeenCalledWith(mockTask.id, { description: '- [ ] Item 1\n- [ ] Item 2' });
  });
});
