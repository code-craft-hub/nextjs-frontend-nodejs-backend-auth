"use client";

import { customStyles } from "@/lib/utils/constants";
import { KeyboardEventHandler, useState } from "react";
import CreatableSelect from "react-select/creatable";

const components = {
  DropdownIndicator: null,
};

export interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label: label?.toLocaleLowerCase(),
  value: label?.toLocaleLowerCase(),
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
  const [inputValue, setInputValue] = useState("");
  const [lastKeyWasSpace, setLastKeyWasSpace] = useState(false);

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;

    // Handle double space
    if (event.key === " ") {
      if (lastKeyWasSpace) {
        // Second space detected
        if (onChange) {
          onChange([...value, createOption(inputValue)]);
        }
        setInputValue("");
        setLastKeyWasSpace(false);
        event.preventDefault();
        return;
      } else {
        // First space
        setLastKeyWasSpace(true);
        return;
      }
    } else {
      // Reset if any other key is pressed
      setLastKeyWasSpace(false);
    }

    switch (event.key) {
      case "Enter":
      case "Tab":
        if (onChange) {
          onChange([...value, createOption(inputValue)]);
        }
        setInputValue("");
        event.preventDefault();
        break;
      case ",":
        if (onChange) {
          onChange([...value, createOption(inputValue)]);
        }
        setInputValue("");
        event.preventDefault();
        break;
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
