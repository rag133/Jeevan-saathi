
import React from 'react';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { DailyPlan } from '../services/geminiService';
import * as Icons from '../../../components/Icons';

interface AiPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: DailyPlan | null;
    isLoading: boolean;
    error: string | null;
    onApplyPlan: (plan: DailyPlan) => void;
}

const AiPlannerModal: React.FC<AiPlannerModalProps> = ({ isOpen, onClose, plan, isLoading, error, onApplyPlan }) => {

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <LoadingSpinner />
                    <p className="mt-4 font-semibold">AI is planning your day...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-6 rounded-lg">
                    <p className="font-semibold">Oops! Something went wrong.</p>
                    <p className="text-sm text-center mt-2">{error}</p>
                </div>
            );
        }

        if (plan) {
            return (
                <div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                        <h3 className="font-semibold text-blue-800">Here's your suggested plan for today!</h3>
                        <p className="text-sm text-blue-700 mt-1">This schedule is designed to help you focus and be productive. You can save it as a log in your journal.</p>
                    </div>
                    <ul className="space-y-4">
                        {plan.plan.map((item, index) => (
                            <li key={item.taskId + index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-28 text-right font-mono text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded">
                                    {item.startTime} - {item.endTime}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{item.taskTitle}</p>
                                    {item.notes && <p className="text-xs text-gray-500 mt-1 italic">Note: {item.notes}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        return null; // Should not happen
    };

    return (
        <Modal title="AI Day Planner" onClose={onClose}>
            <div className="min-h-[20rem]">
                {renderContent()}
            </div>
            {!isLoading && !error && plan && (
                <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() => onApplyPlan(plan)}
                        className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Icons.CheckSquareIcon className="w-4 h-4"/>
                        Save Plan to Journal
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default AiPlannerModal;
