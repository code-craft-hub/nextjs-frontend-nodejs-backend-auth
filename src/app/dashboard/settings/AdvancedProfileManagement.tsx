"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface ConfigurationItem {
  id: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const configurationData: ConfigurationItem[] = [
  {
    id: 'tailored-documents',
    title: 'Always Attach Tailored Documents',
    description: 'Attach customized CV and cover letter to all applications',
    defaultChecked: false
  },
  {
    id: 'master-cv',
    title: 'Use Master CV for All Applications',
    description: 'Override tailoring and use original CV for all applications',
    defaultChecked: false
  },
  {
    id: 'pause-uncommon',
    title: 'Pause on Uncommon Questions',
    description: 'AI Asks for input eht encountering rare or complex questions',
    defaultChecked: false
  },
  {
    id: 'auto-answer',
    title: 'Auto-Answer Rare Questions',
    description: 'AI automatically provides best effort answers for uncommon questions',
    defaultChecked: false
  }
];

const ConfigurationToggle: React.FC<{ 
  item: ConfigurationItem; 
  isChecked: boolean; 
  onChange: (id: string) => void;
}> = ({ item, isChecked, onChange }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        <h3 className="text-md font-medium text-gray-900 mb-1">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm">
          {item.description}
        </p>
      </div>
      
      <div className="ml-6">
        <button
          onClick={() => onChange(item.id)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isChecked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={isChecked}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isChecked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export const AdvancedProfileManagement: React.FC = () => {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    configurationData.reduce((acc, item) => {
      acc[item.id] = item.defaultChecked;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggleChange = (id: string) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div 
      className="flex flex-col items-start font-inter gap-5"
    >
      <div className="w-full bg-white p-4 ">
        <h1 className="text-md font-medium mb-2">
          Advanced AI-Apply Configurations
        </h1>
        <p className="text-gray-600">
          Fine-tune AI behavior and decision making for job applications
        </p>
      </div>

      {/* Configuration Items */}
      <div className="w-full flex flex-col gap-5">
        {/* First two items in a section */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          <ConfigurationToggle
            item={configurationData[0]}
            isChecked={toggleStates[configurationData[0].id]}
            onChange={handleToggleChange}
          />
          <div className=" border-gray-100"></div>
          <ConfigurationToggle
            item={configurationData[1]}
            isChecked={toggleStates[configurationData[1].id]}
            onChange={handleToggleChange}
          />
        </div>

        {/* Control Over AI Decisions Section */}
        <div className="w-full">
          
          <div className="bg-white rounded-lg p-6 space-y-6">
          <h2 className="text-md font-medium text-gray-900 mb-4">
            Control Over AI Decisions
          </h2>
            <ConfigurationToggle
              item={configurationData[2]}
              isChecked={toggleStates[configurationData[2].id]}
              onChange={handleToggleChange}
            />
            <div className=" border-gray-100"></div>
            <ConfigurationToggle
              item={configurationData[3]}
              isChecked={toggleStates[configurationData[3].id]}
              onChange={handleToggleChange}
            />
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="w-full flex justify-end mt-auto">
        <Button className="rounded-lg font-medium transition-colors">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

