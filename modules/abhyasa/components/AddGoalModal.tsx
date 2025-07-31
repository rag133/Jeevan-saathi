


import React from 'react';
import Modal from '../../../components/common/Modal';
import AddGoalForm from './forms/AddGoalForm';
import { Goal } from '../types';
import { Focus } from '../../dainandini/types';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Goal, 'id' | 'startDate' | 'status'>, id?: string) => void;
    onDelete: (id: string) => void;
    initialGoal: Goal | null;
    allFoci: Focus[];
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, onDelete, initialGoal, allFoci }) => {
    if (!isOpen) return null;
    return (
        <Modal title={initialGoal ? 'Edit Goal' : 'Create New Goal'} onClose={onClose}>
            <AddGoalForm 
                onSave={onSave} 
                onDelete={onDelete} 
                initialGoal={initialGoal} 
                allFoci={allFoci} 
            />
        </Modal>
    );
};
export default AddGoalModal;