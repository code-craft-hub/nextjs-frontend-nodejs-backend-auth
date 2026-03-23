import React from "react";

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

interface LabelProps {
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="sr-only"
      id={id}
    />
    <div
      className={`w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-0.5`}
      />
    </div>
  </label>
);

export const Label: React.FC<LabelProps> = ({ htmlFor, className = "", children }) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);
