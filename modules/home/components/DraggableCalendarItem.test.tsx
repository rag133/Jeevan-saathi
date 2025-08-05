import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import DraggableCalendarItem from './DraggableCalendarItem';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

// Mock the Icons component
vi.mock('~/components/Icons', () => ({
  CircleIcon: ({ className }: { className?: string }) => <div data-testid="circle-icon" className={className} />,
  CheckIcon: ({ className }: { className?: string }) => <div data-testid="check-icon" className={className} />,
  GripVerticalIcon: ({ className }: { className?: string }) => <div data-testid="grip-icon" className={className} />,
}));

const mockItem: CalendarItem = {
  id: 'test-item-1',
  type: CalendarItemType.TASK,
  title: 'Test Task',
  description: 'Test Description',
  date: new Date('2024-01-15'),
  color: 'blue-500',
  icon: 'CircleIcon',
  completed: false,
  originalData: {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: new Date('2024-01-15'),
    dueDate: new Date('2024-01-15'),
    priority: 1,
    listId: 'list-1',
  } as any,
};

const mockOnClick = vi.fn();

const renderWithDndContext = (component: React.ReactElement) => {
  return render(
    <DndContext>
      {component}
    </DndContext>
  );
};

describe('DraggableCalendarItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the item with correct title and description', () => {
    renderWithDndContext(
      <DraggableCalendarItem
        item={mockItem}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays the correct type label', () => {
    renderWithDndContext(
      <DraggableCalendarItem
        item={mockItem}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('shows check icon when item is completed', () => {
    const completedItem = { ...mockItem, completed: true };
    
    renderWithDndContext(
      <DraggableCalendarItem
        item={completedItem}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    renderWithDndContext(
      <DraggableCalendarItem
        item={mockItem}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    fireEvent.click(screen.getByText('Test Task'));
    expect(mockOnClick).toHaveBeenCalledWith(mockItem);
  });

  it('applies selected styling when isSelected is true', () => {
    renderWithDndContext(
      <DraggableCalendarItem
        item={mockItem}
        onClick={mockOnClick}
        isSelected={true}
      />
    );

    // Find the main container div that should have the selected styling
    const container = screen.getByText('Test Task').closest('div[class*="border"]');
    expect(container).toHaveClass('border-blue-500');
    expect(container).toHaveClass('bg-blue-50');
  });

  it('renders with correct color indicator', () => {
    renderWithDndContext(
      <DraggableCalendarItem
        item={mockItem}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    // Look for any element with the blue-500 background class
    const colorIndicator = document.querySelector('.bg-blue-500');
    expect(colorIndicator).toBeInTheDocument();
  });

  it('displays time when date has time information', () => {
    const itemWithTime = {
      ...mockItem,
      date: new Date('2024-01-15T10:30:00'),
    };

    renderWithDndContext(
      <DraggableCalendarItem
        item={itemWithTime}
        onClick={mockOnClick}
        isSelected={false}
      />
    );

    // The time should be displayed in the component
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });
}); 