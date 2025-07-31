
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Goal, Milestone, QuickWin, Habit, HabitLog, AbhyasaSelection, QuickWinStatus, GoalStatus, MilestoneStatus, HabitStatus } from '../types';
import ResizablePanels from '../../../components/common/ResizablePanels';
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
import { Focus } from '../../dainandini/types';
import HabitList, { HabitFilter } from '../components/lists/HabitList';
import { Log } from '../../dainandini/types';
import LogEntryModal from '../../dainandini/components/LogEntryModal';


interface AbhyasaViewProps {
    goals: Goal[];
    milestones: Milestone[];
    quickWins: QuickWin[];
    habits: Habit[];
    habitLogs: HabitLog[];
    allFoci: Focus[];
    allLogs: Log[];
    onAddLog: (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => void;
    onAddGoal: (data: Omit<Goal, 'id' | 'startDate'>) => void;
    onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
    onDeleteGoal: (id: string) => void;
    onAddMilestone: (data: Omit<Milestone, 'id'>) => void;
    onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void;
    onDeleteMilestone: (id: string) => void;
    onAddQuickWin: (data: Omit<QuickWin, 'id' | 'createdAt'>) => void;
    onUpdateQuickWinStatus: (id: string, status: QuickWinStatus) => void;
    onAddHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
    onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
    onDeleteHabit: (id: string) => void;
    onAddHabitLog: (logData: Omit<HabitLog, 'id'>) => void;
    onDeleteHabitLog: (habitId: string, date: Date) => void;
}

type AbhyasaModalType = 'goal' | 'milestone' | 'habit' | 'quick-win' | 'link-milestone' | 'link-habit' | null;
type GoalFilter = GoalStatus | 'All';
type MilestoneFilter = MilestoneStatus | 'All';


const AbhyasaView: React.FC<AbhyasaViewProps> = (props) => {
    const {
        goals, milestones, quickWins, habits: rawHabits, habitLogs, allFoci, allLogs, onAddLog,
        onAddGoal, onUpdateGoal, onDeleteGoal, onAddMilestone, onUpdateMilestone, onDeleteMilestone, onAddQuickWin, onUpdateQuickWinStatus,
        onAddHabit, onUpdateHabit, onDeleteHabit, onAddHabitLog, onDeleteHabitLog
    } = props;

    const habits = useMemo(() => rawHabits || [], [rawHabits]);
    
    const [activeView, setActiveView] = useState<AbhyasaSelection['type']>('calendar');
    const [modal, setModal] = useState<AbhyasaModalType>(null);
    const [preselectedGoalIdForMilestone, setPreselectedGoalIdForMilestone] = useState<string | null>(null);
    const [preselectedGoalIdForHabit, setPreselectedGoalIdForHabit] = useState<string | null>(null);
    const [preselectedMilestoneIdForHabit, setPreselectedMilestoneIdForHabit] = useState<string | null>(null);
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean; context: { habit?: Habit; milestone?: Milestone, goal?: Goal } }>({ isOpen: false, context: {} });


    // State for Habits View
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [habitFilter, setHabitFilter] = useState<HabitFilter>('All');
    
    // State for Goals View
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [goalFilter, setGoalFilter] = useState<GoalFilter>('All');
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    
    // State for Milestones View
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('All');
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    const filteredHabits = useMemo(() => {
        if (habitFilter === 'All') {
            return habits;
        }
        return habits.filter(h => h.status === habitFilter);
    }, [habits, habitFilter]);

    useEffect(() => {
        if (activeView === 'goals' && !selectedGoalId && goals.length > 0) {
            setSelectedGoalId(goals[0].id);
        }
        if (activeView === 'milestones' && !selectedMilestoneId && milestones.length > 0) {
            setSelectedMilestoneId(milestones[0].id);
        }
        if ((activeView === 'calendar' || activeView === 'all-habits') && !selectedHabitId && habits.length > 0) {
            if (activeView === 'calendar') {
                 const inProgressHabits = habits.filter(h => h.status === HabitStatus.IN_PROGRESS);
                 if (inProgressHabits.length > 0) setSelectedHabitId(inProgressHabits[0].id);
            } else {
                 if (filteredHabits.length > 0) setSelectedHabitId(filteredHabits[0].id);
            }
        }
        if (activeView === 'all-habits' && selectedHabitId && !filteredHabits.some(h => h.id === selectedHabitId)) {
            setSelectedHabitId(filteredHabits.length > 0 ? filteredHabits[0].id : null);
        }
    }, [activeView, goals, milestones, habits, selectedGoalId, selectedMilestoneId, selectedHabitId, filteredHabits]);

    const selectedHabit = useMemo(() => {
        return habits.find(h => h.id === selectedHabitId) || null;
    }, [selectedHabitId, habits]);

    const selectedGoal = useMemo(() => {
        return goals.find(g => g.id === selectedGoalId) || null;
    }, [selectedGoalId, goals]);

    const selectedMilestone = useMemo(() => {
        return milestones.find(m => m.id === selectedMilestoneId) || null;
    }, [selectedMilestoneId, milestones]);

    const filteredGoals = useMemo(() => {
        if (goalFilter === 'All') {
            return goals.filter(g => g.status === GoalStatus.IN_PROGRESS || g.status === GoalStatus.NOT_STARTED);
        }
        return goals.filter(g => g.status === goalFilter);
    }, [goals, goalFilter]);

    const filteredMilestones = useMemo(() => {
        if (milestoneFilter === 'All') {
            return milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS || m.status === MilestoneStatus.NOT_STARTED);
        }
        return milestones.filter(m => m.status === milestoneFilter);
    }, [milestones, milestoneFilter]);
    
    const activeParentGoalId = useMemo(() => {
        if (activeView === 'goals' && selectedGoalId) {
            return selectedGoalId;
        }
        if (activeView === 'milestones' && selectedMilestone) {
            return selectedMilestone.parentGoalId;
        }
        if (preselectedMilestoneIdForHabit) {
            const m = milestones.find(m => m.id === preselectedMilestoneIdForHabit);
            return m?.parentGoalId;
        }
        if (preselectedGoalIdForHabit) {
            return preselectedGoalIdForHabit;
        }
        return '';
    }, [activeView, selectedGoalId, selectedMilestone, milestones, preselectedMilestoneIdForHabit, preselectedGoalIdForHabit]);


    const handleOpenModal = (type: AbhyasaModalType, context?: { goalId?: string; habit?: Habit; milestone?: Milestone; goal?: Goal; }) => {
        if (type === 'habit') {
            let goalIdForHabit = context?.goalId || null;
            if (!goalIdForHabit && context?.milestone?.id) {
                const milestone = milestones.find(m => m.id === context.milestone.id);
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
        setLogModalState({ isOpen: true, context });
    };

    const handleAddLog = (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => {
 const { habit, milestone, goal } = logModalState.context;
        if (!habit && !milestone && !goal) return;

        let contextData: Partial<Log> = {};
        if (habit) contextData.habitId = habit.id;
        else if (milestone) contextData.milestoneId = milestone.id;
        else if (goal) contextData.goalId = goal.id;
        
        onAddLog({ ...logData, ...contextData });
        setLogModalState({ isOpen: false, context: {} });
    };
    
    const renderMainPanel = () => {
        switch (activeView) {
            case 'goals':
                return (
                     <ResizablePanels initialLeftWidth={40}>
                        <GoalList
                            goals={filteredGoals}
                            selectedGoalId={selectedGoalId}
                            onSelectGoal={setSelectedGoalId}
                            activeFilter={goalFilter}
                            onSetFilter={setGoalFilter}
                            onAddGoalClick={() => handleOpenModal('goal')}
                            onEditGoal={(goal) => handleOpenModal('goal', { goal })}
                        />
                        <GoalDetail
                            goal={selectedGoal}
                            allFoci={allFoci}
                            allLogs={allLogs}
                            milestones={milestones.filter(m => m.parentGoalId === selectedGoal?.id)}
                            habits={(habits || []).filter(h => h.goalId === selectedGoal?.id || (h.milestoneId && milestones.some(m => m.id === h.milestoneId && m.parentGoalId === selectedGoal?.id)))}
                            habitLogs={habitLogs}
                            onUpdateGoal={onUpdateGoal}
                            onDeleteGoal={onDeleteGoal}
                            onAddMilestone={() => handleOpenModal('milestone', { goalId: selectedGoal?.id })}
                            onLinkMilestone={() => handleOpenModal('link-milestone')}
                            onAddHabit={() => handleOpenModal('habit', { goalId: selectedGoal?.id })}
                            onLinkHabit={() => handleOpenModal('link-habit', { goalId: selectedGoal?.id })}
                            onAddHabitToMilestone={(milestoneId) => handleOpenModal('habit', { milestone: {id: milestoneId} as Milestone })}
                            onLinkHabitToMilestone={(milestoneId) => handleOpenModal('link-habit', { milestone: {id: milestoneId} as Milestone })}
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
                            onSelectMilestone={setSelectedMilestoneId}
                            activeFilter={milestoneFilter}
                            onSetFilter={setMilestoneFilter}
                            onAddMilestoneClick={() => handleOpenModal('milestone')}
                            onEditMilestone={(milestone) => handleOpenModal('milestone', { milestone })}
                        />
                         <MilestoneDetail
                            milestone={selectedMilestone}
                            parentGoal={goals.find(g => g.id === selectedMilestone?.parentGoalId)}
                            habits={habits.filter(h => h.milestoneId === selectedMilestoneId)}
                            habitLogs={habitLogs}
                            allFoci={allFoci}
                            allLogs={allLogs}
                            onUpdateMilestone={onUpdateMilestone}
                            onDeleteMilestone={onDeleteMilestone}
                            onAddHabit={(milestoneId) => handleOpenModal('habit', { milestone: { id: milestoneId } as Milestone })}
                            onLinkHabit={(milestoneId) => handleOpenModal('link-habit', { milestone: { id: milestoneId } as Milestone })}
                            onOpenLogModal={(milestone) => handleOpenLogModal({ milestone })}
                            onEditMilestone={(milestone) => handleOpenModal('milestone', { milestone })}
                        />
                    </ResizablePanels>
                );
            case 'quick-wins':
                return <QuickWinList quickWins={quickWins} onStatusChange={onUpdateQuickWinStatus} />;
             case 'all-habits':
                return (
                    <ResizablePanels initialLeftWidth={45}>
                        <HabitList
                            habits={filteredHabits}
                            selectedHabitId={selectedHabitId}
                            onSelectHabit={setSelectedHabitId}
                            activeFilter={habitFilter}
                            onSetFilter={setHabitFilter}
                            onAddHabitClick={() => handleOpenModal('habit')}
                        />
                        <HabitDetailView
                            habit={selectedHabit}
                            onEditHabit={(habitToEdit) => handleOpenModal('habit', { habit: habitToEdit })}
                            onUpdateHabit={onUpdateHabit}
                            onAddHabitLog={onAddHabitLog}
                            onDeleteHabitLog={onDeleteHabitLog}
                            selectedDate={selectedDate}
                            allLogs={allLogs}
                            onOpenLogModal={(habit) => handleOpenLogModal({ habit })}
                        />
                    </ResizablePanels>
                );
            case 'calendar':
            default:
                const inProgressHabits = habits.filter(h => h.status === HabitStatus.IN_PROGRESS);
                return (
                    <ResizablePanels initialLeftWidth={55}>
                        <HabitDashboard
                            habits={inProgressHabits}
                            habitLogs={habitLogs}
                            allFoci={allFoci}
                            onAddHabitLog={onAddHabitLog}
                            onDeleteHabitLog={onDeleteHabitLog}
                            onSelectHabit={setSelectedHabitId}
                            selectedHabitId={selectedHabitId}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                        <HabitDetailView
                            habit={selectedHabit}
                            onEditHabit={(habitToEdit) => handleOpenModal('habit', { habit: habitToEdit })}
                            onUpdateHabit={onUpdateHabit}
                            onAddHabitLog={onAddHabitLog}
                            onDeleteHabitLog={onDeleteHabitLog}
                            selectedDate={selectedDate}
                            allLogs={allLogs}
                            onOpenLogModal={(habit) => handleOpenLogModal({ habit })}
                        />
                    </ResizablePanels>
                );
        }
    };

    const handleSaveMilestone = (data: Omit<Milestone, 'id' | 'status'>, id?: string) => {
        if (id) {
            onUpdateMilestone(id, data);
        } else {
            onAddMilestone({ ...data, status: MilestoneStatus.NOT_STARTED });
        }
        handleCloseModal();
    };
    
    const handleSaveGoal = (data: Omit<Goal, 'id' | 'startDate' | 'status'>, id?: string) => {
        if (id) {
            onUpdateGoal(id, data);
        } else {
            onAddGoal({ ...data, status: GoalStatus.NOT_STARTED });
        }
        handleCloseModal();
    };

    return (
        <>
            <AbhyasaSidebar
                onOpenModal={handleOpenModal}
                activeView={activeView}
                onSelectView={(view) => setActiveView(view)}
            />
            <main className="flex-1 flex min-w-0 bg-gray-50/80">
                {renderMainPanel()}
            </main>
            {modal === 'habit' && (
                <AddHabitModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={(habitData, id) => {
                        if (id) onUpdateHabit(id, habitData);
                        else onAddHabit(habitData);
                        handleCloseModal();
                    }}
                    onDelete={onDeleteHabit}
                    initialHabit={editingHabit}
                    goalId={preselectedGoalIdForHabit}
                    milestoneId={preselectedMilestoneIdForHabit}
                    allFoci={allFoci}
                />
            )}
            {modal === 'goal' && (
                <AddGoalModal 
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleSaveGoal}
                    onDelete={onDeleteGoal}
                    initialGoal={editingGoal}
                    allFoci={allFoci}
                />
            )}
            {modal === 'milestone' && (
                <AddMilestoneModal 
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleSaveMilestone}
                    onDelete={onDeleteMilestone}
                    goals={goals}
                    initialGoalId={preselectedGoalIdForMilestone}
                    allFoci={allFoci}
                    initialMilestone={editingMilestone}
                />
            )}
            {modal === 'quick-win' && (
                <AddQuickWinModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={(data) => { onAddQuickWin({ ...data, status: QuickWinStatus.PENDING }); handleCloseModal(); }}
                />
            )}
             {modal === 'link-milestone' && selectedGoal && (
                <LinkMilestoneModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onUpdateMilestone={onUpdateMilestone}
                    milestones={milestones.filter(m => !m.parentGoalId)}
                    currentGoalId={selectedGoal.id}
                />
            )}
             {modal === 'link-habit' && (
                <LinkHabitModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onUpdateHabit={onUpdateHabit}
                    habits={habits.filter(h => !h.goalId)}
                    currentGoalId={activeParentGoalId || ''}
                    milestoneId={preselectedMilestoneIdForHabit}
                />
            )}
            {logModalState.isOpen && (
                <LogEntryModal
                    isOpen={logModalState.isOpen}
                    onClose={() => setLogModalState({ isOpen: false, context: {} })}
                    onAddLog={handleAddLog}
                    allFoci={allFoci}
                    initialFocusId={logModalState.context.habit?.focusAreaId || logModalState.context.milestone?.focusAreaId || logModalState.context.goal?.focusAreaId || 'general'}
                    initialDate={new Date()}
                    initialTitle={logModalState.context.habit?.title || logModalState.context.milestone?.title || logModalState.context.goal?.title}
                    initialDescription=""
                />
            )}
        </>
    );
};

export default AbhyasaView;