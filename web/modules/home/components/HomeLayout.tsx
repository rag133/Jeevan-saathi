import React from 'react';

interface HomeLayoutProps {
  children: React.ReactNode;
  isMobile: boolean;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children, isMobile }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {children}
        </div>
      </div>
    );
  }

  // Desktop layout: Quick Actions (left) | Calendar (middle) | Details (right)
  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel - Quick Actions (25%) */}
      <div className="w-1/4 min-w-0 border-r border-gray-200 bg-white">
        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {React.Children.toArray(children)[0]}
        </div>
      </div>

      {/* Middle Panel - Calendar (35%) */}
      <div className="w-2/5 min-w-0 border-r border-gray-200 bg-white">
        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {React.Children.toArray(children)[1]}
        </div>
      </div>

      {/* Right Panel - Details (40%) */}
      <div className="w-2/5 min-w-0 bg-white">
        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {React.Children.toArray(children)[2]}
        </div>
      </div>
    </div>
  );
};

export default HomeLayout; 