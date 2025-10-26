"use client";

import { customStyles } from "@/lib/utils/constants";
import React, { KeyboardEventHandler } from "react";
import CreatableSelect from "react-select/creatable";

const components = {
  DropdownIndicator: null,
};

export interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

interface SelectCreatableProps {
  value?: readonly Option[];
  onChange?: (value: readonly Option[]) => void;
  placeholder?: string;
}

export const SelectCreatable = ({
  value = [],
  onChange,
  placeholder,
}: SelectCreatableProps) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        if (onChange) {
          onChange([...value, createOption(inputValue)]);
        }
        setInputValue("");
        event.preventDefault();
    }
  };

  return (
    <CreatableSelect
      components={components}
      inputValue={inputValue}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={(newValue) => onChange?.(newValue || [])}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? "Type something and press enter..."}
      value={value}
      styles={customStyles}
    />
  );
};

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-3xl">
//         <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Tags</h1>
//           <p className="text-gray-600 mb-6">
//             Type and press Enter or Tab to add items
//           </p>
//           <CreatableSelect
//             components={components}
//             inputValue={inputValue}
//             isClearable
//             isMulti
//             menuIsOpen={false}
//             onChange={(newValue) => setValue(newValue)}
//             onInputChange={(newValue) => setInputValue(newValue)}
//             onKeyDown={handleKeyDown}
//             placeholder="Type something and press enter..."
//             value={value}
//             styles={customStyles}
//           />
//           {value.length > 0 && (
//             <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
//               <p className="text-sm text-blue-800 font-medium">
//                 {value.length} {value.length === 1 ? "tag" : "tags"} created
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
