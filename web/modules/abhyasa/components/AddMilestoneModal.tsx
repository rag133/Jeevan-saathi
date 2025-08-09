import React from 'react';
import Modal from '~/components/common/Modal';
import AddMilestoneForm from './forms/AddMilestoneForm';
import { Goal, Milestone } from '~/modules/abhyasa/types';
import { Focus } from '~/modules/dainandini/types';

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Milestone, 'id' | 'status'>, id?: string) => void;
  onDelete: (id: string) => void;
  goals: Goal[];
  initialGoalId?: string | null;
  allFoci: Focus[];
  initialMilestone: Milestone | null;
}

const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  goals,
  initialGoalId,
  allFoci,
  initialMilestone,
}) => {
  if (!isOpen) return null;

  return (
    <Modal title={initialMilestone ? 'Edit Milestone' : 'Create New Milestone'} onClose={onClose}>
      <AddMilestoneForm
        onSave={onSave}
        onDelete={onDelete}
        goals={goals}
        initialGoalId={initialGoalId}
        allFoci={allFoci}
        initialMilestone={initialMilestone}
      />
    </Modal>
  );
};
export default AddMilestoneModal;
