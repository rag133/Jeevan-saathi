import React from 'react';
import { MagicWandIcon } from './Icons';

const Header: React.FC = () => {
    return (
        <header className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
                <MagicWandIcon className="w-8 h-8 text-indigo-400"/>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
                    AI Task Decomposer
                </h1>
            </div>
            <p className="text-lg text-slate-400">
                Turn big ideas into actionable checklists with the power of AI.
            </p>
        </header>
    );
};

export default Header;
