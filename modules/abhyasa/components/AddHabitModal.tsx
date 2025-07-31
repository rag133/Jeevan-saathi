


import React from 'react';
import Modal from '../../../components/common/Modal';
import { AddHabitForm } from './forms/AddHabitForm';
import { Habit } from '../types';
import { Focus } from '../../dainandini/types';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, id?: string) => void;
    onDelete: (id: string) => void;
    initialHabit: Habit | null;
    goalId?: string | null;
    milestoneId?: string | null;
    allFoci: Focus[];
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onSave, onDelete, initialHabit, goalId, milestoneId, allFoci }) => {
    if (!isOpen) return null;
    
    return (
        <Modal title={initialHabit ? 'Edit Habit' : 'Create New Habit'} onClose={onClose}>
            <AddHabitForm
                onSave={onSave}
                onClose={onClose}
                onDelete={onDelete}
                initialHabit={initialHabit}
                goalId={goalId}
                milestoneId={milestoneId}
                allFoci={allFoci}
            />
        </Modal>
    );
};

export default AddHabitModal;