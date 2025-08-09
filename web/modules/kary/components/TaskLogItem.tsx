import React from 'react';
import { Log, logTypeDetails } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';

interface TaskLogItemProps {
  log: Log;
}

const TaskLogItem: React.FC<TaskLogItemProps> = ({ log }) => {
  const logDetails = logTypeDetails[log.logType];
  const IconComponent = logDetails ? Icons[logDetails.icon] : Icons.Edit3Icon;

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    const logDay = new Date(d);
    logDay.setHours(0, 0, 0, 0);

    if (logDay.getTime() === today.getTime()) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (logDay.getTime() === yesterday.getTime()) {
      return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <li className="flex items-start gap-3 p-2.5 rounded-md bg-gray-50/70 border border-gray-200/80">
      <div className="pt-0.5">
        <IconComponent className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{log.title}</p>
        {log.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{log.description}</p>
        )}
      </div>
      <div className="text-xs text-gray-500 flex-shrink-0 pt-0.5">{formatDate(log.logDate)}</div>
    </li>
  );
};

export default TaskLogItem;
