import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelsProps {
  children: [ReactNode, ReactNode];
  initialLeftWidth?: number; // percentage
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children, initialLeftWidth = 60 }) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain the width between, for example, 20% and 80%
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftPanelWidth(newLeftWidth);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const [leftPanel, rightPanel] = children;

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden">
      <div
        className="h-full relative"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {leftPanel}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-2 h-full cursor-col-resize flex items-center justify-center bg-gray-200/50 hover:bg-blue-200 transition-colors"
      >
        <div className="w-0.5 h-10 bg-gray-400 rounded-full"></div>
      </div>
      <div
        className="h-full flex-1"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanels;
