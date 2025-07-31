


import React from 'react';
import Modal from '../../../components/common/Modal';
import LinkMilestoneForm from './forms/LinkMilestoneForm';
import { Milestone } from '../types';

interface LinkMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void;
    milestones: Milestone[];
    currentGoalId: string;
}

const LinkMilestoneModal: React.FC<LinkMilestoneModalProps> = ({ isOpen, onClose, onUpdateMilestone, milestones, currentGoalId }) => {
    if (!isOpen) return null;
    return (
        <Modal title="Link Existing Milestones" onClose={onClose}>
            <LinkMilestoneForm
                milestones={milestones}
                onLink={(milestoneId) => onUpdateMilestone(milestoneId, { parentGoalId: currentGoalId })}
                onClose={onClose}
            />
        </Modal>
    );
};

export default LinkMilestoneModal;