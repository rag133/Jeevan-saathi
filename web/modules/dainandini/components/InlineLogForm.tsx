import React from 'react';
import { Focus, LogType } from '../types';
import QuickLogInput from './QuickLogInput';

interface InlineLogFormProps {
  onAddLog: (logData: {
    title: string;
    focusId: string;
    logType: LogType;
    logDate: Date;
    description?: string;
  }) => void;
  foci: Focus[];
  defaultFocusId?: string;
  defaultDate?: Date;
}

const InlineLogForm: React.FC<InlineLogFormProps> = ({ 
  onAddLog, 
  foci, 
  defaultFocusId, 
  defaultDate 
}) => {
  return (
    <div className="p-3 border-t border-gray-200">
      <QuickLogInput
        foci={foci}
        onAddLog={onAddLog}
        defaultFocusId={defaultFocusId}
        defaultDate={defaultDate}
        placeholder="Add a quick log..."
      />
    </div>
  );
};

export default InlineLogForm;
