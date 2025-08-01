import React from 'react';
import Modal from '../../../components/common/Modal';
import AddQuickWinForm from './forms/AddQuickWinForm';
import { QuickWin } from '../types';

interface AddQuickWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<QuickWin, 'id' | 'createdAt' | 'status'>) => void;
}

const AddQuickWinModal: React.FC<AddQuickWinModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;
  return (
    <Modal title="Add a Quick Win" onClose={onClose}>
      <AddQuickWinForm onSave={onSave} />
    </Modal>
  );
};
export default AddQuickWinModal;
