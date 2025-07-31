import React, { useState } from 'react';
import * as Icons from '../../../components/Icons';

interface InlineLogFormProps {
    onAddLog: (title: string) => void;
}

const InlineLogForm: React.FC<InlineLogFormProps> = ({ onAddLog }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddLog(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="relative">
                <Icons.PlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a quick log..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
            </div>
        </form>
    );
};

export default InlineLogForm;
