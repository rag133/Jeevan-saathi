import React from 'react';
import * as Icons from '../../../../components/Icons';

const availableIcons: (keyof typeof Icons)[] = [
  'TargetIcon',
  'BookOpenIcon',
  'HeartIcon',
  'StarIcon',
  'FlagIcon',
  'SunriseIcon',
  'CheckSquareIcon',
  'RepeatIcon',
  'SmileIcon',
  'BuildingIcon',
  'CalendarIcon',
  'ListIcon',
];

interface IconPickerProps {
  selectedIcon: keyof typeof Icons;
  onSelectIcon: (icon: keyof typeof Icons) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
      <div className="grid grid-cols-6 gap-2">
        {availableIcons.map((iconName) => {
          const IconComponent = Icons[iconName];
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                selectedIcon === iconName
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={`Select ${iconName} icon`}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
