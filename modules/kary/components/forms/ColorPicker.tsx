import React from 'react';

const colors = [
  'gray-500',
  'red-500',
  'orange-500',
  'yellow-500',
  'green-500',
  'teal-500',
  'blue-500',
  'indigo-500',
  'purple-500',
  'pink-500',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelectColor(color)}
            className={`w-8 h-8 rounded-full bg-${color} transition-transform transform hover:scale-110 ${
              selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
