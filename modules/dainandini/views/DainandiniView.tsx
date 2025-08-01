import React, { useState, useMemo, useCallback } from 'react';
import { Focus, Log, DainandiniSelection, GroupedLogs, LogTemplate, LogType } from '../types';
import DainandiniSidebar from '../components/DainandiniSidebar';
import LogList from '../components/LogList';
import CalendarView from '../components/CalendarView';
import Modal from '~/components/common/Modal';
import AddFocusForm from '../components/forms/AddTabForm';
import ResizablePanels from '~/components/common/ResizablePanels';
import LogDetail from '../components/LogDetail';
import TemplateDetail from '../components/TemplateDetail';
import TemplateSelectionModal from '../components/TemplateSelectionModal';
import LogEntryModal from '../components/LogEntryModal';
import { useDainandiniStore } from '../dainandiniStore';

const DainandiniView: React.FC = () => {
  const {
    logs,
    logTemplates,
    foci,
    addLog,
    updateLog,
    deleteLog,
    addLogTemplate,
    updateLogTemplate,
    deleteLogTemplate,
    addFocus,
    updateFocus,
    deleteFocus,
  } = useDainandiniStore();

  const [selection, setSelection] = useState<DainandiniSelection>({ type: 'today' });
  const [modal, setModal] = useState<'add-focus' | 'select-template' | null>(null);
  const [editingFocus, setEditingFocus] = useState<Focus | null>(null);
  const [logEntryModalState, setLogEntryModalState] = useState<{
    isOpen: boolean;
    template: LogTemplate | null;
    initialFocusId?: string;
  }>({ isOpen: false, template: null });
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [todayViewMode, setTodayViewMode] = useState<'focus' | 'timeline'>('focus');
  const [calendarViewMode, setCalendarViewMode] = useState<'focus' | 'timeline'>('focus');
  const [contextualFocusId, setContextualFocusId] = useState<string | null>(null);

  const isSameDay = useCallback((d1: Date | null | undefined, d2: Date | null | undefined) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }, []);

  const handleAddQuickLog = (title: string) => {
    const newLog: Partial<Omit<Log, 'id' | 'createdAt'>> = {
      title,
      logType: LogType.TEXT,
      focusId: 'general', // Default to 'general' focus area
      logDate: new Date(),
      description: '',
    };
    addLog(newLog as Omit<Log, 'id' | 'createdAt'>);
  };

  const groupedLogs = useMemo((): GroupedLogs => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
    const today = new Date();
    const groups = new Map<string, Log[]>();

    if (selection.type === 'today') {
      foci.forEach((focus) => {
        groups.set(focus.name, []);
      });

      const todayLogs = sortedLogs.filter((log) => {
        const logDateForCheck = log.taskId && log.completed ? log.taskCompletionDate : log.logDate;
        return isSameDay(logDateForCheck, today);
      });

      todayLogs.forEach((log) => {
        const focus = foci.find((f) => f.id === log.focusId);
        const groupName = focus ? focus.name : 'Uncategorized';
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)!.push(log);
      });

      const uncategorizedLogs = groups.get('Uncategorized');
      if (uncategorizedLogs && uncategorizedLogs.length === 0) {
        groups.delete('Uncategorized');
      }
    } else if (selection.type === 'focus') {
      let focusLogs: Log[];
      if (selection.id === 'kary') {
        focusLogs = sortedLogs.filter((log) => !!log.taskId);
      } else {
        focusLogs = sortedLogs.filter((log) => log.focusId === selection.id);
      }

      focusLogs.forEach((log) => {
        const groupName = new Date(log.logDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)!.push(log);
      });
    }
    return groups;
  }, [logs, selection, foci, isSameDay]);

  const todayLogsForTimeline = useMemo(() => {
    if (selection.type !== 'today') return [];

    const today = new Date();
    return [...logs]
      .filter((log) => {
        const logDateForCheck = log.taskId && log.completed ? log.taskCompletionDate : log.logDate;
        return isSameDay(logDateForCheck, today);
      })
      .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  }, [logs, selection, isSameDay]);

  const calendarLogs = useMemo(() => {
    if (selection.type === 'calendar' && selection.date) {
      const selectedDate = new Date(selection.date);
      return logs
        .filter((log) => isSameDay(new Date(log.logDate), selectedDate))
        .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
    }
    return [];
  }, [logs, selection, isSameDay]);

  const handleSaveFocus = async (focusData: Omit<Focus, 'id'>, focusId?: string) => {
    if (focusId) {
      await updateFocus(focusId, focusData);
    } else {
      await addFocus(focusData);
    }
    setModal(null);
    setEditingFocus(null);
  };

  const handleDeleteFocus = async (focusId: string) => {
    if (selection.type === 'focus' && selection.id === focusId) {
      setSelection({ type: 'today' });
    }
    await deleteFocus(focusId);
    setModal(null);
    setEditingFocus(null);
  };

  const handleOpenEditFocusModal = (focusId: string) => {
    const focusToEdit = foci.find((f) => f.id === focusId);
    if (focusToEdit) {
      setEditingFocus(focusToEdit);
      setModal('add-focus');
    }
  };

  const handleOpenAddFocusModal = () => {
    setEditingFocus(null);
    setModal('add-focus');
  };

  const handleOpenTemplateSelection = useCallback(
    (focusIdFromClick?: string) => {
      const contextId = focusIdFromClick || (selection.type === 'focus' ? selection.id : null);
      setContextualFocusId(contextId);

      if (contextId) {
        const currentFocus = foci.find((f) => f.id === contextId);
        if (currentFocus?.defaultTemplateId) {
          if (currentFocus.defaultTemplateId === 'BLANK') {
            setLogEntryModalState({ isOpen: true, template: null, initialFocusId: contextId });
            return;
          }
          const template = logTemplates.find((t) => t.id === currentFocus.defaultTemplateId);
          if (template) {
            setLogEntryModalState({ isOpen: true, template, initialFocusId: contextId });
            return;
          }
        }
      }
      setModal('select-template');
    },
    [selection, foci, logTemplates]
  );

  const handleTemplateSelected = (template: LogTemplate | null) => {
    setModal(null);
    setLogEntryModalState({
      isOpen: true,
      template,
      initialFocusId: contextualFocusId || undefined,
    });
    setContextualFocusId(null);
  };

  const handleCreateTemplate = () => {
    setSelection({ type: 'template', id: 'new' });
  };

  const handleSaveTemplate = (templateData: Omit<LogTemplate, 'id'>) => {
    addLogTemplate(templateData);
    setSelection({ type: 'template', id: 'new' });
  };

  const handleTemplateDetailSave = (
    templateData: Omit<LogTemplate, 'id'> | Partial<LogTemplate>,
    templateId?: string
  ) => {
    if (templateId) {
      updateLogTemplate(templateId, templateData as Partial<LogTemplate>);
    } else {
      handleSaveTemplate(templateData as Omit<LogTemplate, 'id'>);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteLogTemplate(templateId);
    setSelection({ type: 'today' });
  };

  const currentViewName = useMemo(() => {
    if (selection.type === 'today') return "Today's Journal";
    if (selection.type === 'calendar') {
      if (selection.date) {
        return new Date(selection.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return 'Calendar';
    }
    if (selection.type === 'focus') {
      return foci.find((t) => t.id === selection.id)?.name || '';
    }
    if (selection.type === 'template') {
      if (selection.id === 'new') return 'Create New Template';
      const template = logTemplates.find((t) => t.id === selection.id);
      return template ? `Editing: ${template.name}` : 'Template';
    }
  }, [selection, foci, logTemplates]);

  const selectedLog = useMemo(() => {
    return logs.find((log) => log.id === selectedLogId) || null;
  }, [logs, selectedLogId]);

  const selectedTemplate = useMemo(() => {
    if (selection.type === 'template' && selection.id !== 'new') {
      return logTemplates.find((t) => t.id === selection.id) || null;
    }
    return null;
  }, [selection, logTemplates]);

  const handleSelectLog = useCallback((logId: string) => {
    setSelection((prev) => {
      if (prev.type === 'template') return { type: 'today' };
      return prev;
    });
    setSelectedLogId(logId);
  }, []);

  const handleDeleteAndReselect = (logId: string) => {
    const logsInView =
      selection.type === 'calendar' ? calendarLogs : Array.from(groupedLogs.values()).flat();
    const currentIndex = logsInView.findIndex((l) => l.id === logId);

    deleteLog(logId);

    if (logsInView.length > 1) {
      if (currentIndex > 0) {
        setSelectedLogId(logsInView[currentIndex - 1].id);
      } else {
        setSelectedLogId(logsInView[currentIndex + 1].id);
      }
    } else {
      setSelectedLogId(null);
    }
  };

  const renderRightPanel = () => {
    if (selection.type === 'template') {
      return (
        <TemplateDetail
          key={selection.id}
          template={selection.id === 'new' ? null : selectedTemplate}
          foci={foci}
          onSave={handleTemplateDetailSave}
          onDelete={handleDeleteTemplate}
        />
      );
    }
    return (
      <LogDetail
        log={selectedLog}
        foci={foci}
        onUpdateLog={updateLog}
        onDeleteLog={handleDeleteAndReselect}
      />
    );
  };

  return (
    <>
      <DainandiniSidebar
        foci={foci}
        templates={logTemplates}
        selection={selection}
        onSelect={(sel) => {
          const newSelection =
            sel.type === 'calendar' && !sel.date ? { ...sel, date: new Date().toISOString() } : sel;

          setSelection(newSelection);

          if (newSelection.type !== 'template') {
          } else {
            setSelectedLogId(null);
          }
        }}
        onOpenModal={handleOpenAddFocusModal}
        onCreateTemplate={handleCreateTemplate}
        onEditFocus={handleOpenEditFocusModal}
        onReorderFoci={() => {}}
      />
      <main className="flex-1 flex min-w-0">
        <ResizablePanels initialLeftWidth={50}>
          <div className="h-full w-full bg-white/80">
            {selection.type === 'calendar' ? (
              <CalendarView
                allFoci={foci}
                logs={logs}
                selectedDate={selection.date ? new Date(selection.date) : null}
                onDateSelect={(date) => {
                  setSelection({ type: 'calendar', date: date.toISOString() });
                  setSelectedLogId(null);
                }}
                filteredLogs={calendarLogs}
                onToggleKaryTask={() => {}}
                selectedLogId={selectedLogId}
                onSelectLog={handleSelectLog}
                onAddLogClick={handleOpenTemplateSelection}
                calendarViewMode={calendarViewMode}
                onSetCalendarViewMode={setCalendarViewMode}
              />
            ) : (
              <LogList
                groupedLogs={groupedLogs}
                timelineLogs={todayLogsForTimeline}
                todayViewMode={todayViewMode}
                onSetTodayViewMode={setTodayViewMode}
                viewName={currentViewName || 'Journal'}
                allFoci={foci}
                selection={selection}
                onAddLogClick={handleOpenTemplateSelection}
                onAddQuickLog={handleAddQuickLog}
                onToggleKaryTask={() => {}}
                selectedLogId={selectedLogId}
                onSelectLog={handleSelectLog}
              />
            )}
          </div>
          {renderRightPanel()}
        </ResizablePanels>
      </main>
      {modal === 'add-focus' && (
        <Modal
          title={editingFocus ? 'Edit Focus Area' : 'Create New Focus'}
          onClose={() => {
            setModal(null);
            setEditingFocus(null);
          }}
        >
          <AddFocusForm
            initialData={editingFocus}
            onSave={handleSaveFocus}
            onDelete={handleDeleteFocus}
            allFoci={foci}
          />
        </Modal>
      )}
      {modal === 'select-template' && (
        <TemplateSelectionModal
          isOpen={true}
          templates={logTemplates}
          onSelect={handleTemplateSelected}
          onClose={() => setModal(null)}
        />
      )}
      {logEntryModalState.isOpen && (
        <LogEntryModal
          isOpen={true}
          onClose={() => setLogEntryModalState({ isOpen: false, template: null })}
          onAddLog={addLog}
          allFoci={foci}
          template={logEntryModalState.template}
          initialFocusId={logEntryModalState.initialFocusId}
        />
      )}
    </>
  );
};

export default DainandiniView;