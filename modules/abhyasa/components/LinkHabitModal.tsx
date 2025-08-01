import React from 'react';
import Modal from '../../../components/common/Modal';
import LinkHabitForm from './forms/LinkHabitForm';
import { Habit } from '../types';

interface LinkHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  habits: Habit[];
  currentGoalId: string;
  milestoneId?: string | null;
}

const LinkHabitModal: React.FC<LinkHabitModalProps> = ({
  isOpen,
  onClose,
  onUpdateHabit,
  habits,
  currentGoalId,
  milestoneId,
}) => {
  if (!isOpen) return null;
  return (
    <Modal title="Link Existing Habits" onClose={onClose}>
      <LinkHabitForm
        habits={habits}
        onLink={(habitId) =>
          onUpdateHabit(habitId, { goalId: currentGoalId, milestoneId: milestoneId || undefined })
        }
        onClose={onClose}
      />
    </Modal>
  );
};

export default LinkHabitModal;
