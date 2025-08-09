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
  onAddQuickLog: (title: string) => void;
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
  onAddQuickLog,
  onToggleKaryTask,
  selectedLogId,
  onSelectLog,
}) => {
  const [showDescriptions, setShowDescriptions] = useState(true);
  const groupEntries = Array.from(groupedLogs.entries());

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Title and View Mode */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{viewName}</h2>
            
            {selection.type === 'today' && (
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-gray-100">
                <button
                  onClick={() => onSetTodayViewMode('focus')}
                  title="Group by Focus"
                  className={`p-1.5 rounded-md transition-all ${todayViewMode === 'focus' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Icons.SummaryIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSetTodayViewMode('timeline')}
                  title="Timeline View"
                  className={`p-1.5 rounded-md transition-all ${todayViewMode === 'timeline' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Icons.ListIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right side - Toggle and Add Button */}
          <div className="flex items-center gap-3">
            {/* Description Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Details</span>
              <button
                onClick={() => setShowDescriptions(!showDescriptions)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                  showDescriptions ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showDescriptions}
                title={showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    showDescriptions ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <button
              onClick={() => onAddLogClick(selection.type === 'focus' ? selection.id : undefined)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Icons.PlusIcon className="w-4 h-4" />
              <span>Add Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {selection.type === 'today' && todayViewMode === 'timeline' ? (
            // TIMELINE VIEW
            timelineLogs.length > 0 ? (
              <div className="space-y-3">
                {timelineLogs.map((log) => {
                  const focus = allFoci.find((f) => f.id === log.focusId);
                  return (
                    <LogItem
                      key={log.id}
                      log={log}
                      focus={focus}
                      isSelected={selectedLogId === log.id}
                      onSelect={onSelectLog}
                      onToggleKaryTask={onToggleKaryTask}
                      showDescription={showDescriptions}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.BookOpenIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs for today yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first log entry</p>
                <div className="text-xs text-gray-400">
                  <p>• Use the input below to add quick logs</p>
                  <p>• Organize with focus areas</p>
                  <p>• Track your daily reflections</p>
                </div>
              </div>
            )
          ) : // GROUPED VIEW
          groupEntries.length > 0 ? (
            <div className="space-y-6">
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
                        className="p-1 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
                        aria-label={`Add log for ${groupTitle}`}
                      >
                        <Icons.PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {logsInGroup.length > 0 ? (
                      <div className="space-y-3">
                        {logsInGroup.map((log) => (
                          <LogItem
                            key={log.id}
                            log={log}
                            isSelected={selectedLogId === log.id}
                            onSelect={onSelectLog}
                            onToggleKaryTask={onToggleKaryTask}
                            showDescription={showDescriptions}
                          />
                        ))}
                      </div>
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {selection.type === 'today' ? (
                  <Icons.TodayIcon className="w-8 h-8 text-gray-400" />
                ) : selection.type === 'calendar' ? (
                  <Icons.CalendarIcon className="w-8 h-8 text-gray-400" />
                ) : (
                  <Icons.TargetIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs for this view yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first log entry</p>
              <div className="text-xs text-gray-400">
                <p>• Use the input below to add quick logs</p>
                <p>• Organize with focus areas</p>
                <p>• Track your daily reflections</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel - Add Log Input */}
      <div className="border-t border-gray-200 p-3">
        <InlineLogForm onAddLog={onAddQuickLog} />
      </div>
    </div>
  );
};

export default LogList;
