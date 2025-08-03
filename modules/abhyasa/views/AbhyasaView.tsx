import React, { useState, useMemo, useCallback, useEffect } from 'react';
import * as Icons from '~/components/Icons';
import {
  Goal,
  Milestone,
  QuickWin,
  Habit,
  HabitLog,
  HabitLogStatus,
  AbhyasaSelection,
  QuickWinStatus,
  GoalStatus,
  MilestoneStatus,
  HabitStatus,
} from '~/modules/abhyasa/types';
import ResizablePanels from '~/components/common/ResizablePanels';
import AbhyasaSidebar from '../components/AbhyasaSidebar';
import HabitDashboard from '../components/HabitDashboard';
import HabitDetailView from '../components/HabitDetailView';
import GoalDetail from '../components/GoalDetail';
import MilestoneDetail from '../components/MilestoneDetail';
import AddHabitModal from '../components/AddHabitModal';
import AddGoalModal from '../components/AddGoalModal';
import AddMilestoneModal from '../components/AddMilestoneModal';
import AddQuickWinModal from '../components/AddQuickWinModal';
import GoalList from '../components/lists/GoalList';
import MilestoneList from '../components/lists/MilestoneList';
import QuickWinList from '../components/lists/QuickWinList';
import LinkMilestoneModal from '../components/LinkMilestoneModal';
import LinkHabitModal from '../components/LinkHabitModal';
import { Focus } from '~/modules/dainandini/types';
import HabitList, { HabitFilter } from '~/modules/abhyasa/components/lists/HabitList';
import { Log } from '~/modules/dainandini/types';
import LogEntryModal from '~/modules/dainandini/components/LogEntryModal';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { useAbhyasaStore } from '../abhyasaStore';
import useWindowSize from '~/hooks/useWindowSize';

const AbhyasaView: React.FC<{ isAppSidebarOpen: boolean }> = ({ isAppSidebarOpen }) => {
  const { width } = useWindowSize();
  const isMobile = width !== undefined && width < 768; // Define mobile breakpoint
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for AbhyasaSidebar visibility
  const [showDetail, setShowDetail] = useState(false); // State for mobile detail view
  const {
    goals,
    milestones,
    quickWins,
    habits,
    habitLogs,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addQuickWin,
    updateQuickWin,
    addHabit,
    updateHabit,
    deleteHabit,
    addHabitLog,
    updateHabitLog,
    deleteHabitLog,
  } = useAbhyasaStore();
  const { addLog, logs, foci } = useDainandiniStore();

  const [activeView, setActiveView] = useState<AbhyasaSelection['type']>('calendar');
  const [modal, setModal] = useState<any>(null);
  const [preselectedGoalIdForMilestone, setPreselectedGoalIdForMilestone] = useState<string | null>(
    null
  );
  const [preselectedGoalIdForHabit, setPreselectedGoalIdForHabit] = useState<string | null>(null);
  const [preselectedMilestoneIdForHabit, setPreselectedMilestoneIdForHabit] = useState<
    string | null
  >(null);
  const [logModalState, setLogModalState] = useState<{
    isOpen: boolean;
    context: { habit?: Habit; milestone?: Milestone; goal?: Goal };
  }>({ isOpen: false, context: {} });

  // State for Habits View
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitFilter, setHabitFilter] = useState<HabitFilter>('All');

  // State for Goals View
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState<any>('All');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // State for Milestones View
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [milestoneFilter, setMilestoneFilter] = useState<any>('All');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const filteredHabits = useMemo(() => {
    if (habitFilter === 'All') {
      return habits;
    }
    return habits.filter((h) => h.status === habitFilter);
  }, [habits, habitFilter]);

  useEffect(() => {
    if (activeView === 'goals' && !selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
    if (activeView === 'milestones' && !selectedMilestoneId && milestones.length > 0) {
      setSelectedMilestoneId(milestones[0].id);
    }
    if (
      (activeView === 'calendar' || activeView === 'all-habits') &&
      !selectedHabitId &&
      habits.length > 0
    ) {
      if (activeView === 'calendar') {
        const inProgressHabits = habits.filter((h) => h.status === HabitStatus.IN_PROGRESS);
        if (inProgressHabits.length > 0) setSelectedHabitId(inProgressHabits[0].id);
      } else {
        if (filteredHabits.length > 0) setSelectedHabitId(filteredHabits[0].id);
      }
    }
    if (
      activeView === 'all-habits' &&
      selectedHabitId &&
      !filteredHabits.some((h) => h.id === selectedHabitId)
    ) {
      setSelectedHabitId(filteredHabits.length > 0 ? filteredHabits[0].id : null);
    }
  }, [
    activeView,
    goals,
    milestones,
    habits,
    selectedGoalId,
    selectedMilestoneId,
    selectedHabitId,
    filteredHabits,
  ]);

  const selectedHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || null;
  }, [selectedHabitId, habits]);

  const selectedGoal = useMemo(() => {
    return goals.find((g) => g.id === selectedGoalId) || null;
  }, [selectedGoalId, goals]);

  const selectedMilestone = useMemo(() => {
    return milestones.find((m) => m.id === selectedMilestoneId) || null;
  }, [selectedMilestoneId, milestones]);

  const filteredGoals = useMemo(() => {
    if (goalFilter === 'All') {
      return goals.filter(
        (g) => g.status === GoalStatus.IN_PROGRESS || g.status === GoalStatus.NOT_STARTED
      );
    }
    return goals.filter((g) => g.status === goalFilter);
  }, [goals, goalFilter]);

  const filteredMilestones = useMemo(() => {
    if (milestoneFilter === 'All') {
      return milestones.filter(
        (m) => m.status === MilestoneStatus.IN_PROGRESS || m.status === MilestoneStatus.NOT_STARTED
      );
    }
    return milestones.filter((m) => m.status === milestoneFilter);
  }, [milestones, milestoneFilter]);

  const activeParentGoalId = useMemo(() => {
    if (activeView === 'goals' && selectedGoalId) {
      return selectedGoalId;
    }
    if (activeView === 'milestones' && selectedMilestone) {
      return selectedMilestone.parentGoalId;
    }
    if (preselectedMilestoneIdForHabit) {
      const m = milestones.find((m) => m.id === preselectedMilestoneIdForHabit);
      return m?.parentGoalId;
    }
    if (preselectedGoalIdForHabit) {
      return preselectedGoalIdForHabit;
    }
    return '';
  }, [
    activeView,
    selectedGoalId,
    selectedMilestone,
    milestones,
    preselectedMilestoneIdForHabit,
    preselectedGoalIdForHabit,
  ]);

  const handleOpenModal = (
    type: any,
    context?: { goalId?: string; habit?: Habit; milestone?: Milestone; goal?: Goal }
  ) => {
    if (type === 'habit') {
      let goalIdForHabit = context?.goalId || null;
      if (!goalIdForHabit && context?.milestone?.id) {
        const milestone = milestones.find((m) => m.id === context.milestone.id);
        goalIdForHabit = milestone?.parentGoalId || null;
      }
      setEditingHabit(context?.habit || null);
      setPreselectedGoalIdForHabit(goalIdForHabit);
      setPreselectedMilestoneIdForHabit(context?.milestone?.id || null);
      setModal('habit');
    } else if (type === 'milestone') {
      setEditingMilestone(context?.milestone || null);
      setPreselectedGoalIdForMilestone(context?.goalId || goals[0]?.id || null);
      setModal('milestone');
    } else if (type === 'link-habit' && context) {
      setPreselectedGoalIdForHabit(context.goalId || null);
      setPreselectedMilestoneIdForHabit(context.milestone?.id || null);
      setModal('link-habit');
    } else if (type === 'goal') {
      setEditingGoal(context?.goal || null);
      setModal('goal');
    } else {
      setModal(type);
    }
  };

  const handleCloseModal = () => {
    setModal(null);
    setEditingHabit(null);
    setEditingMilestone(null);
    setEditingGoal(null);
    setPreselectedGoalIdForMilestone(null);
    setPreselectedGoalIdForHabit(null);
    setPreselectedMilestoneIdForHabit(null);
  };

  const handleOpenLogModal = (context: { habit?: Habit; milestone?: Milestone; goal?: Goal }) => {
    console.log('Opening log modal with context:', context);
    setLogModalState({ isOpen: true, context });
  };

  const handleAddLog = (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => {
    console.log('Adding log with data:', logData);
    const { habit, milestone, goal } = logModalState.context;
    if (!habit && !milestone && !goal) return;

    const contextData: any = {};
    if (habit?.id) contextData.habitId = habit.id;
    if (milestone?.id) contextData.milestoneId = milestone.id;
    if (goal?.id) contextData.goalId = goal.id;

    addLog({ ...logData, ...contextData });
    setLogModalState({ isOpen: false, context: {} });
  };

  const handleDeleteHabitLog = (habitId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === dateString);
    if (existingLog) {
      deleteHabitLog(existingLog.id);
    }
  };

  const handleSkipHabitLog = (habitId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === dateString);
    if (existingLog) {
      // Update existing log to skipped
      updateHabitLog(existingLog.id, { status: HabitLogStatus.SKIPPED });
    } else {
      // Create new skip log
      addHabitLog({
        habitId,
        date: dateString,
        status: HabitLogStatus.SKIPPED,
      });
    }
  };

  const renderMainPanel = () => {
    switch (activeView) {
      case 'goals':
        return (
          <ResizablePanels initialLeftWidth={40}>
            <GoalList
              goals={filteredGoals}
              selectedGoalId={selectedGoalId}
              onSelectGoal={(id) => { setSelectedGoalId(id); if (isMobile) setShowDetail(true); }}
              activeFilter={goalFilter}
              onSetFilter={setGoalFilter}
              onAddGoalClick={() => handleOpenModal('goal')}
              onEditGoal={(goal) => handleOpenModal('goal', { goal })}
            />
            <GoalDetail
              goal={selectedGoal}
              allFoci={foci}
              allLogs={logs}
              milestones={milestones.filter((m) => m.parentGoalId === selectedGoal?.id)}
              habits={(habits || []).filter(
                (h) =>
                  h.goalId === selectedGoal?.id ||
                  (h.milestoneId &&
                    milestones.some(
                      (m) => m.id === h.milestoneId && m.parentGoalId === selectedGoal?.id
                    ))
              )}
              habitLogs={habitLogs}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
              onAddMilestone={() => handleOpenModal('milestone', { goalId: selectedGoal?.id })}
              onLinkMilestone={() => handleOpenModal('link-milestone')}
              onAddHabit={() => handleOpenModal('habit', { goalId: selectedGoal?.id })}
              onLinkHabit={() => handleOpenModal('link-habit', { goalId: selectedGoal?.id })}
              onAddHabitToMilestone={(milestoneId) =>
                handleOpenModal('habit', { milestone: { id: milestoneId } as Milestone })
              }
              onLinkHabitToMilestone={(milestoneId) =>
                handleOpenModal('link-habit', { milestone: { id: milestoneId } as Milestone })
              }
              onEditGoal={(goal) => handleOpenModal('goal', { goal })}
              onOpenLogModal={(goal) => handleOpenLogModal({ goal })}
            />
          </ResizablePanels>
        );
      case 'milestones':
        return (
          <ResizablePanels initialLeftWidth={40}>
            <MilestoneList
              milestones={filteredMilestones}
              goals={goals}
              selectedMilestoneId={selectedMilestoneId}
              onSelectMilestone={(id) => { setSelectedMilestoneId(id); if (isMobile) setShowDetail(true); }}
              activeFilter={milestoneFilter}
              onSetFilter={setMilestoneFilter}
              onAddMilestoneClick={() => handleOpenModal('milestone')}
              onEditMilestone={(milestone) => handleOpenModal('milestone', { milestone })}
            />
            <MilestoneDetail
              milestone={selectedMilestone}
              parentGoal={goals.find((g) => g.id === selectedMilestone?.parentGoalId)}
              habits={habits.filter((h) => h.milestoneId === selectedMilestoneId)}
              habitLogs={habitLogs}
              allFoci={foci}
              allLogs={logs}
              onUpdateMilestone={updateMilestone}
              onDeleteMilestone={deleteMilestone}
              onAddHabit={(milestoneId) =>
                handleOpenModal('habit', { milestone: { id: milestoneId } as Milestone })
              }
              onLinkHabit={(milestoneId) =>
                handleOpenModal('link-habit', { milestone: { id: milestoneId } as Milestone })
              }
              onOpenLogModal={(milestone) => handleOpenLogModal({ milestone })}
              onEditMilestone={(milestone) => handleOpenModal('milestone', { milestone })}
            />
          </ResizablePanels>
        );
      case 'quick-wins':
        return <QuickWinList quickWins={quickWins} onStatusChange={updateQuickWin} />;
      case 'all-habits':
        return (
          <ResizablePanels initialLeftWidth={45}>
            <HabitList
              habits={filteredHabits}
              selectedHabitId={selectedHabitId}
              onSelectHabit={(id) => { setSelectedHabitId(id); if (isMobile) setShowDetail(true); }}
              activeFilter={habitFilter}
              onSetFilter={setHabitFilter}
              onAddHabitClick={() => handleOpenModal('habit')}
            />
            <HabitDetailView
              habit={selectedHabit}
              onEditHabit={(habitToEdit) => handleOpenModal('habit', { habit: habitToEdit })}
              onUpdateHabit={updateHabit}
              onAddHabitLog={addHabitLog}
              onDeleteHabitLog={handleDeleteHabitLog}
              onSkipHabitLog={handleSkipHabitLog}
              selectedDate={selectedDate}
              allLogs={logs}
              habitLogs={habitLogs}
              onOpenLogModal={(habit) => handleOpenLogModal({ habit })}
              onBack={() => setShowDetail(false)}
            />
          </ResizablePanels>
        );
      case 'calendar':
      default:
        const inProgressHabits = habits.filter((h) => h.status === HabitStatus.IN_PROGRESS);
        return (
          <ResizablePanels initialLeftWidth={55}>
            <HabitDashboard
              habits={inProgressHabits}
              habitLogs={habitLogs}
              allFoci={foci}
              onAddHabitLog={addHabitLog}
              onDeleteHabitLog={handleDeleteHabitLog}
              onSkipHabitLog={handleSkipHabitLog}
              onSelectHabit={(id) => { setSelectedHabitId(id); if (isMobile) setShowDetail(true); }}
              selectedHabitId={selectedHabitId}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <HabitDetailView
              habit={selectedHabit}
              onEditHabit={(habitToEdit) => handleOpenModal('habit', { habit: habitToEdit })}
              onUpdateHabit={updateHabit}
              onAddHabitLog={addHabitLog}
              onDeleteHabitLog={handleDeleteHabitLog}
              onSkipHabitLog={handleSkipHabitLog}
              selectedDate={selectedDate}
              allLogs={logs}
              habitLogs={habitLogs}
              onOpenLogModal={(habit) => handleOpenLogModal({ habit })}
              onBack={() => setShowDetail(false)}
            />
          </ResizablePanels>
        );
    }
  };

  const handleSaveMilestone = (data: Omit<Milestone, 'id' | 'status'>, id?: string) => {
    if (id) {
      updateMilestone(id, data);
    } else {
      addMilestone({ ...data, status: MilestoneStatus.NOT_STARTED });
    }
    handleCloseModal();
  };

  const handleSaveGoal = (data: Omit<Goal, 'id' | 'startDate' | 'status'>, id?: string) => {
    if (id) {
      updateGoal(id, data);
    } else {
      addGoal({ ...data, status: GoalStatus.NOT_STARTED });
    }
    handleCloseModal();
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Abhyasa Sidebar"
        >
          <Icons.MenuIcon className="w-6 h-6" />
        </button>
      )}
      <AbhyasaSidebar
        onOpenModal={handleOpenModal}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (isMobile) setShowDetail(false); // Hide detail on sidebar item click
        }}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
      />
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <main className={`flex-1 flex min-w-0 bg-gray-50/80 ${isMobile && isAppSidebarOpen ? 'ml-20' : ''}`}> {/* Adjust main content margin */}
        {isMobile && showDetail ? (
          renderMainPanel() // Render detail view on mobile
        ) : isMobile && !showDetail ? (
          <div className="flex flex-col w-full h-full p-4">
            {/* Mobile view for lists */}
            {activeView === 'goals' && (
              <GoalList
                goals={filteredGoals}
                selectedGoalId={selectedGoalId}
                onSelectGoal={(id) => { setSelectedGoalId(id); setShowDetail(true); }}
                activeFilter={goalFilter}
                onSetFilter={setGoalFilter}
                onAddGoalClick={() => handleOpenModal('goal')}
                onEditGoal={(goal) => handleOpenModal('goal', { goal })}
              />
            )}
            {activeView === 'milestones' && (
              <MilestoneList
                milestones={filteredMilestones}
                goals={goals}
                selectedMilestoneId={selectedMilestoneId}
                onSelectMilestone={(id) => { setSelectedMilestoneId(id); setShowDetail(true); }}
                activeFilter={milestoneFilter}
                onSetFilter={setMilestoneFilter}
                onAddMilestoneClick={() => handleOpenModal('milestone')}
                onEditMilestone={(milestone) => handleOpenModal('milestone', { milestone })}
              />
            )}
            {activeView === 'quick-wins' && (
              <QuickWinList quickWins={quickWins} onStatusChange={updateQuickWin} />
            )}
            {(activeView === 'all-habits' || activeView === 'calendar') && (
              <HabitList
                habits={filteredHabits}
                selectedHabitId={selectedHabitId}
                onSelectHabit={(id) => { setSelectedHabitId(id); setShowDetail(true); }}
                activeFilter={habitFilter}
                onSetFilter={setHabitFilter}
                onAddHabitClick={() => handleOpenModal('habit')}
              />
            )}
          </div>
        ) : (
          renderMainPanel() // Render ResizablePanels on desktop
        )}
      </main>
      {modal === 'habit' && (
        <AddHabitModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={(habitData, id) => {
            if (id) updateHabit(id, habitData);
            else addHabit({ ...habitData, status: HabitStatus.YET_TO_START });
            handleCloseModal();
          }}
          onDelete={deleteHabit}
          initialHabit={editingHabit}
          goalId={preselectedGoalIdForHabit}
          milestoneId={preselectedMilestoneIdForHabit}
          allFoci={foci}
        />
      )}
      {modal === 'goal' && (
        <AddGoalModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveGoal}
          onDelete={deleteGoal}
          initialGoal={editingGoal}
          allFoci={foci}
        />
      )}
      {modal === 'milestone' && (
        <AddMilestoneModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveMilestone}
          onDelete={deleteMilestone}
          goals={goals}
          initialGoalId={preselectedGoalIdForMilestone}
          allFoci={foci}
          initialMilestone={editingMilestone}
        />
      )}
      {modal === 'quick-win' && (
        <AddQuickWinModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={(data) => {
            addQuickWin({ ...data, status: QuickWinStatus.PENDING });
            handleCloseModal();
          }}
        />
      )}
      {modal === 'link-milestone' && selectedGoal && (
        <LinkMilestoneModal
          isOpen={true}
          onClose={handleCloseModal}
          onUpdateMilestone={updateMilestone}
          milestones={milestones.filter((m) => !m.parentGoalId)}
          currentGoalId={selectedGoal.id}
        />
      )}
      {modal === 'link-habit' && (
        <LinkHabitModal
          isOpen={true}
          onClose={handleCloseModal}
          onUpdateHabit={updateHabit}
          habits={habits.filter((h) => !h.goalId)}
          currentGoalId={activeParentGoalId || ''}
          milestoneId={preselectedMilestoneIdForHabit}
        />
      )}
      {logModalState.isOpen && (
        <LogEntryModal
          isOpen={logModalState.isOpen}
          onClose={() => setLogModalState({ isOpen: false, context: {} })}
          onAddLog={handleAddLog}
          allFoci={foci}
          initialFocusId={
            logModalState.context.habit?.focusAreaId ||
            logModalState.context.milestone?.focusAreaId ||
            logModalState.context.goal?.focusAreaId ||
            'general'
          }
          initialDate={new Date()}
          initialTitle={
            logModalState.context.habit?.title ||
            logModalState.context.milestone?.title ||
            logModalState.context.goal?.title
          }
          initialDescription=""
        />
      )}
    </>
  );
};

export default AbhyasaView;
