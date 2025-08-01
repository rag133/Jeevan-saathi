import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  id,
  ariaLabel,
  disabled = false,
}) => (
  <button
    id={id}
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={(e) => {
      if (disabled) return;
      e.stopPropagation();
      onChange();
    }}
    disabled={disabled}
    className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
      checked
        ? 'bg-blue-600 border-blue-600'
        : 'bg-transparent border-gray-400 hover:border-blue-500'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    {checked && (
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </button>
);

export default Checkbox;
