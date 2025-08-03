import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KaryTaskList from './KaryTaskList';
import { Task, List, Tag } from '~/modules/kary/types';
import { NewTaskData } from '../views/KaryView';
import InteractiveTaskInput from './InteractiveTaskInput';


// Mock child components
vi.mock('./KaryTaskItem', () => ({
  default: vi.fn(({ task, isSelected, level, isParent, isExpanded, onSelect, onToggleComplete, onToggleExpand }) => (
    <li
      data-testid={`task-item-${task.id}`}
      data-task-title={task.title}
      data-is-selected={isSelected}
      data-level={level}
      data-is-parent={isParent}
      data-is-expanded={isExpanded}
      onClick={() => onSelect(task.id)}
    >
      <span>{task.title}</span>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        data-testid={`checkbox-${task.id}`}
      />
      {isParent && (
        <button onClick={() => onToggleExpand(task.id)} data-testid={`expand-button-${task.id}`}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </li>
  )),
}));

vi.mock('./InteractiveTaskInput', () => ({
  default: vi.fn(({ onAddTask, lists, tags }) => (
    <div data-testid="mock-interactive-task-input">
      <button onClick={() => onAddTask({ title: 'New Task from Input' }, null)}>
        Add Task
      </button>
    </div>
  )),
}));

// Mock icons
vi.mock('~/components/Icons', () => ({
  MenuIcon: vi.fn(() => <span data-testid="menu-icon" />),
  SortIcon: vi.fn(() => <span data-testid="sort-icon" />),
  MoreHorizontalIcon: vi.fn(() => <span data-testid="more-horizontal-icon" />),
  ChevronRightIcon: vi.fn(() => <span data-testid="chevron-right-icon" />),
  ChevronDownIcon: vi.fn(() => <span data-testid="chevron-down-icon" />),
}));

describe('KaryTaskList', () => {
  const mockList: List = { id: 'list1', name: 'My List' };
  const mockTag: Tag = { id: 'tag1', name: 'My Tag', color: 'blue' };
  const mockAllLists: List[] = [mockList, { id: 'today', name: 'Today' }, { id: 'upcoming', name: 'Upcoming' }];
  const mockAllTags: Tag[] = [mockTag];

  const defaultProps = {
    viewDetails: mockList,
    tasks: [],
    allLists: mockAllLists,
    allTags: mockAllTags,
    selectedTaskId: null,
    expandedTasks: {},
    onSelectTask: vi.fn(),
    onToggleComplete: vi.fn(),
    onAddTask: vi.fn(),
    onToggleExpand: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders message when no viewDetails are provided', () => {
    render(<KaryTaskList {...defaultProps} viewDetails={undefined} />);
    expect(screen.getByText('Select a list or tag from the sidebar.')).toBeInTheDocument();
  });

  it('renders message when task list is empty', () => {
    render(<KaryTaskList {...defaultProps} tasks={[]} />);
    expect(screen.getByText('No tasks here. Great job!')).toBeInTheDocument();
  });

  it('renders tasks correctly when provided', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, listId: 'list1', createdAt: new Date() },
      { id: '2', title: 'Task 2', completed: false, listId: 'list1', createdAt: new Date() },
    ];
    render(<KaryTaskList {...defaultProps} tasks={tasks} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('No tasks here. Great job!')).not.toBeInTheDocument();
  });

  it('renders hierarchical tasks and handles expansion', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Parent Task', completed: false, listId: 'list1', createdAt: new Date() },
      { id: '1.1', title: 'Subtask 1', completed: false, listId: 'list1', parentId: '1', createdAt: new Date() },
      { id: '1.2', title: 'Subtask 2', completed: false, listId: 'list1', parentId: '1', createdAt: new Date() },
    ];
    render(<KaryTaskList {...defaultProps} tasks={tasks} expandedTasks={{ '1': true }} />);

    expect(screen.getByText('Parent Task')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();

    // Check if expand button is rendered for parent
    const parentTaskItem = screen.getByTestId('task-item-1');
    expect(within(parentTaskItem).getByTestId('expand-button-1')).toBeInTheDocument();
    expect(within(parentTaskItem).getByTestId('expand-button-1')).toHaveTextContent('Collapse');

    // Check levels
    expect(parentTaskItem).toHaveAttribute('data-level', '0');
    expect(screen.getByTestId('task-item-1.1')).toHaveAttribute('data-level', '1');
  });

  it('calls onSelectTask when a task item is clicked', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, listId: 'list1', createdAt: new Date() },
    ];
    render(<KaryTaskList {...defaultProps} tasks={tasks} />);
    fireEvent.click(screen.getByText('Task 1'));
    expect(defaultProps.onSelectTask).toHaveBeenCalledWith('1');
  });

  it('calls onToggleComplete when a task checkbox is clicked', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, listId: 'list1', createdAt: new Date() },
    ];
    render(<KaryTaskList {...defaultProps} tasks={tasks} />);
    fireEvent.click(screen.getByTestId('checkbox-1'));
    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith('1');
  });

  it('calls onAddTask when InteractiveTaskInput button is clicked', () => {
    render(<KaryTaskList {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Task'));
    expect(defaultProps.onAddTask).toHaveBeenCalledWith({ title: 'New Task from Input' }, null);
  });

  it('calls onToggleExpand when expand button is clicked', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Parent Task', completed: false, listId: 'list1', createdAt: new Date() },
      { id: '1.1', title: 'Subtask 1', completed: false, listId: 'list1', parentId: '1', createdAt: new Date() },
    ];
    render(<KaryTaskList {...defaultProps} tasks={tasks} />);
    fireEvent.click(screen.getByTestId('expand-button-1'));
    expect(defaultProps.onToggleExpand).toHaveBeenCalledWith('1');
  });

  it('renders header elements', () => {
    render(<KaryTaskList {...defaultProps} />);
    expect(screen.getByText('My List')).toBeInTheDocument();
    
    expect(screen.getByTestId('sort-icon')).toBeInTheDocument();
    expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
  });

  it('filters out smart lists from InteractiveTaskInput props', () => {
    render(<KaryTaskList {...defaultProps} />);
    expect(InteractiveTaskInput).toHaveBeenCalledWith(
      expect.objectContaining({
        lists: [mockList],
        tags: mockAllTags,
        onAddTask: expect.any(Function),
      }),
      undefined
    );
  });
});
