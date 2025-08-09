import React from 'react';
import { Log, ChecklistItem, LogType, Focus } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';
import Checkbox from '~/components/common/Checkbox';
import { marked } from 'marked';

// Configure marked for better rendering (same as WysiwygMarkdownEditor)
marked.setOptions({
  breaks: true,
  gfm: true,
});

// --- Display Components ---
const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Icons.StarIcon
        key={star}
        className={`w-4 h-4 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const ChecklistDisplay: React.FC<{
  items?: ChecklistItem[];
}> = ({ items = [] }) => {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- LogItem ---
interface LogItemProps {
  log: Log;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleKaryTask?: (taskId: string) => void;
  focus?: Focus;
  showDescription?: boolean;
}

const LogItem: React.FC<LogItemProps> = ({
  log,
  isSelected,
  onSelect,
  onToggleKaryTask,
  focus,
  showDescription = true,
}) => {
  // Remove local state since we're using prop now
  // const [showDescription, setShowDescription] = useState(false);

  // Auto-show description when item is selected
  React.useEffect(() => {
    if (isSelected && !showDescription) {
      // Don't auto-show if descriptions are globally hidden
      return;
    }
  }, [isSelected, showDescription]);

  const handleItemClick = () => {
    if (!isSelected) {
      onSelect(log.id);
    }
  };

  // Get focus color for the tag
  const getFocusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[color] || colorMap['gray'];
  };

  const focusColorClasses = focus ? getFocusColor(focus.color) : getFocusColor('gray');

  // Determine which icon to show based on log type
  const getLogIcon = () => {
    if (log.taskId) {
      // Task - show checked checkbox icon
      return (
        <div className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5">
          <Icons.CheckSquareIcon className="w-5 h-5" />
        </div>
      );
    } else if (log.habitId) {
      // Habit - show Abhyasa module symbol (target/bullseye icon)
      return (
        <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">
          <Icons.TargetIcon className="w-5 h-5" />
        </div>
      );
    } else {
      // Journal/General log - show Dainandini module symbol (pencil icon)
      return (
        <div className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">
          <Icons.Edit3Icon className="w-5 h-5" />
        </div>
      );
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`group relative p-4 bg-white rounded-lg cursor-pointer transition-all duration-200 border border-gray-200 ${
        isSelected 
          ? 'bg-white border-indigo-300 shadow-md' 
          : 'hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        {/* Left side - Icon and Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Dynamic Log Icon */}
          {getLogIcon()}
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {log.title}
            </h3>
          </div>
        </div>
        
        {/* Right side - Time only */}
        <div className="text-sm text-gray-500 flex-shrink-0">
          {log.logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Content Section */}
      <div className="ml-8 space-y-3">
        {/* Focus Area - only show if there's a focus */}
        {focus && (
          <div className="flex items-center gap-2">
            {/* Focus Name Tag */}
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${focusColorClasses}`}>
              {focus.name}
            </span>
          </div>
        )}

        {/* Description */}
        {log.description && showDescription && (
          <div className="space-y-2">
            <div 
              className="text-sm text-gray-900 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: marked.parse(log.description) 
              }}
            />
          </div>
        )}

        {/* Rating Display */}
        {log.logType === LogType.RATING && log.rating && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Rating:</span>
            <StarRatingDisplay rating={log.rating} />
          </div>
        )}

        {/* Checklist */}
        {log.logType === LogType.CHECKLIST && log.checklist && log.checklist.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icons.CheckSquareIcon className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Checklist</span>
            </div>
            <ChecklistDisplay items={log.checklist} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogItem;
