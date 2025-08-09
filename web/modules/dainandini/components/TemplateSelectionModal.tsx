import React from 'react';
import { LogTemplate } from '~/modules/dainandini/types';
import Modal from '~/components/Modal';
import * as Icons from '~/components/Icons';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: LogTemplate[];
  onSelect: (template: LogTemplate | null) => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <Modal title="Select a Template" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blank Log Option */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors"
        >
          <Icons.PlusIcon className="w-8 h-8 mb-2" />
          <span className="font-semibold">Blank Log</span>
        </button>

        {/* Template Options */}
        {templates.map((template) => {
          const IconComponent = Icons[template.icon] || Icons.ListIcon;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-gray-700 transition-all"
            >
              <IconComponent className="w-8 h-8 mb-2 text-gray-500" />
              <span className="font-semibold">{template.name}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default TemplateSelectionModal;
