import React, { useState } from 'react';
import { Log, Focus, DainandiniSelection, GroupedLogs } from '~/modules/dainandini/types';
import LogItem from './LogItem';
import InlineLogForm from './InlineLogForm';
import * as Icons from '~/components/Icons';

// --- LogList Container ---
interface LogListProps {
  groupedLogs: GroupedLogs;
  timelineLogs: Log[];
  todayViewMode: 'focus' | 'timeline';
  onSetTodayViewMode: (mode: 'focus' | 'timeline') => void;
  viewName: string;
  allFoci: Focus[];
  selection: DainandiniSelection;
  onAddLogClick: (focusId?: string) => void;
  onAddQuickLog: (title: string) => void; // New prop for quick log
  onToggleKaryTask: (taskId: string) => void;
  selectedLogId: string | null;
  onSelectLog: (id: string) => void;
}

const LogList: React.FC<LogListProps> = ({
  groupedLogs,
  timelineLogs,
  todayViewMode,
  onSetTodayViewMode,
  viewName,
  allFoci,
  selection,
  onAddLogClick,
  onAddQuickLog, // New prop
  onToggleKaryTask,
  selectedLogId,
  onSelectLog,
}) => {
  const groupEntries = Array.from(groupedLogs.entries());

  return (
    <div className="w-full h-full flex flex-col">
      <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">{viewName}</h1>
          {selection.type === 'today' && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-gray-100 shadow-inner">
              <button
                onClick={() => onSetTodayViewMode('focus')}
                title="Group by Focus"
                className={`p-1.5 rounded-md transition-all ${todayViewMode === 'focus' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                <Icons.SummaryIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onSetTodayViewMode('timeline')}
                title="Timeline View"
                className={`p-1.5 rounded-md transition-all ${todayViewMode === 'timeline' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                <Icons.ListIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onAddLogClick(selection.type === 'focus' ? selection.id : undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Icons.PlusIcon className="w-5 h-5" />
          <span>Add Log</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {selection.type === 'today' && todayViewMode === 'timeline' ? (
          // TIMELINE VIEW
          timelineLogs.length > 0 ? (
            <ul className="space-y-3 pb-4">
              {timelineLogs.map((log) => {
                const focus = allFoci.find((f) => f.id === log.focusId);
                return (
                  <li key={log.id}>
                    <LogItem
                      log={log}
                      focus={focus}
                      isSelected={selectedLogId === log.id}
                      onSelect={onSelectLog}
                      onToggleKaryTask={onToggleKaryTask}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No logs for today yet. Start by adding one!</p>
            </div>
          )
        ) : // GROUPED VIEW
        groupEntries.length > 0 ? (
          <div className="space-y-6 pb-4">
            {groupEntries.map(([groupTitle, logsInGroup]) => {
              let focusForGroup: Focus | undefined;
              let IconComponent: React.FC<any> | null = null;

              if (selection.type === 'today') {
                focusForGroup = allFoci.find((f) => f.name === groupTitle);
                if (focusForGroup) {
                  IconComponent = Icons[focusForGroup.icon];
                }
              } else if (selection.type === 'focus') {
                focusForGroup = allFoci.find((f) => f.id === selection.id);
                if (focusForGroup) {
                  IconComponent = Icons[focusForGroup.icon];
                }
              }

              return (
                <div key={groupTitle} className="relative">
                  <div className="flex justify-between items-center sticky top-0 bg-white/95 py-2 backdrop-blur-sm z-10 border-b mb-3">
                    <h2 className="text-md font-semibold text-gray-600 flex items-center gap-2.5">
                      {IconComponent && focusForGroup && (
                        <IconComponent className={`w-5 h-5 text-${focusForGroup.color}`} />
                      )}
                      <span>{groupTitle}</span>
                    </h2>
                    <button
                      onClick={() => onAddLogClick(focusForGroup?.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                      aria-label={`Add log for ${groupTitle}`}
                    >
                      <Icons.PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {logsInGroup.length > 0 ? (
                    <ul className="space-y-3">
                      {logsInGroup.map((log) => (
                        <li key={log.id}>
                          <LogItem
                            log={log}
                            isSelected={selectedLogId === log.id}
                            onSelect={onSelectLog}
                            onToggleKaryTask={onToggleKaryTask}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-4">
                      No logs for this focus area today.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No logs for this view yet. Start by adding one!</p>
          </div>
        )}
      </div>
      <InlineLogForm onAddLog={onAddQuickLog} />
    </div>
  );
};

export default LogList;
