"use client";

import React, { KeyboardEventHandler } from "react";
import CreatableSelect from "react-select/creatable";

const components = {
  DropdownIndicator: null,
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

export const HomeClient = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [value, setValue] = React.useState<readonly Option[]>([]);

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "60px",
      borderRadius: "16px",
      border: "2px solid #e5e7eb",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "8px 12px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      "&:hover": {
        border: "2px solid #3b82f6",
        boxShadow:
          "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)",
      },
      "&:focus-within": {
        border: "2px solid #3b82f6",
        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#3b82f6",
      borderRadius: "12px",
      padding: "4px 8px",
      margin: "4px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "500",
      padding: "2px 6px",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#ffffff",
      borderRadius: "0 10px 10px 0",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#2563eb",
        color: "#ffffff",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: "#1f2937",
      fontSize: "16px",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "16px",
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#6b7280",
      padding: "8px",
      cursor: "pointer",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      "&:hover": {
        color: "#ef4444",
        backgroundColor: "#fee2e2",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Tags</h1>
          <p className="text-gray-600 mb-6">
            Type and press Enter or Tab to add items
          </p>
          <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={(newValue) => setValue(newValue)}
            onInputChange={(newValue) => setInputValue(newValue)}
            onKeyDown={handleKeyDown}
            placeholder="Type something and press enter..."
            value={value}
            styles={customStyles}
          />
          {value.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">
                {value.length} {value.length === 1 ? "tag" : "tags"} created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// import React from "react";

// import CreatableSelect from "react-select/creatable";

// export interface ColourOption {
//   readonly value: string;
//   readonly label: string;
//   readonly color: string;
//   readonly isFixed?: boolean;
//   readonly isDisabled?: boolean;
// }

// export const colourOptions: readonly ColourOption[] = [
//   { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
//   { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
//   { value: 'purple', label: 'Purple', color: '#5243AA' },
//   { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
//   { value: 'orange', label: 'Orange', color: '#FF8B00' },
//   { value: 'yellow', label: 'Yellow', color: '#FFC400' },
//   { value: 'green', label: 'Green', color: '#36B37E' },
//   { value: 'forest', label: 'Forest', color: '#00875A' },
//   { value: 'slate', label: 'Slate', color: '#253858' },
//   { value: 'silver', label: 'Silver', color: '#666666' },
// ];

// export interface FlavourOption {
//   readonly value: string;
//   readonly label: string;
//   readonly rating: string;
// }

// export const flavourOptions: readonly FlavourOption[] = [
//   { value: 'vanilla', label: 'Vanilla', rating: 'safe' },
//   { value: 'chocolate', label: 'Chocolate', rating: 'good' },
//   { value: 'strawberry', label: 'Strawberry', rating: 'wild' },
//   { value: 'salted-caramel', label: 'Salted Caramel', rating: 'crazy' },
// ];

// export interface StateOption {
//   readonly value: string;
//   readonly label: string;
// }

// export const stateOptions: readonly StateOption[] = [
//   { value: 'AL', label: 'Alabama' },
//   { value: 'AK', label: 'Alaska' },
//   { value: 'AS', label: 'American Samoa' },
//   { value: 'AZ', label: 'Arizona' },
//   { value: 'AR', label: 'Arkansas' },
//   { value: 'CA', label: 'California' },
//   { value: 'CO', label: 'Colorado' },
//   { value: 'CT', label: 'Connecticut' },
//   { value: 'DE', label: 'Delaware' },
//   { value: 'DC', label: 'District Of Columbia' },
//   { value: 'FM', label: 'Federated States Of Micronesia' },
//   { value: 'FL', label: 'Florida' },
//   { value: 'GA', label: 'Georgia' },
//   { value: 'GU', label: 'Guam' },
//   { value: 'HI', label: 'Hawaii' },
//   { value: 'ID', label: 'Idaho' },
//   { value: 'IL', label: 'Illinois' },
//   { value: 'IN', label: 'Indiana' },
//   { value: 'IA', label: 'Iowa' },
//   { value: 'KS', label: 'Kansas' },
//   { value: 'KY', label: 'Kentucky' },
//   { value: 'LA', label: 'Louisiana' },
//   { value: 'ME', label: 'Maine' },
//   { value: 'MH', label: 'Marshall Islands' },
//   { value: 'MD', label: 'Maryland' },
//   { value: 'MA', label: 'Massachusetts' },
//   { value: 'MI', label: 'Michigan' },
//   { value: 'MN', label: 'Minnesota' },
//   { value: 'MS', label: 'Mississippi' },
//   { value: 'MO', label: 'Missouri' },
//   { value: 'MT', label: 'Montana' },
//   { value: 'NE', label: 'Nebraska' },
//   { value: 'NV', label: 'Nevada' },
//   { value: 'NH', label: 'New Hampshire' },
//   { value: 'NJ', label: 'New Jersey' },
//   { value: 'NM', label: 'New Mexico' },
//   { value: 'NY', label: 'New York' },
//   { value: 'NC', label: 'North Carolina' },
//   { value: 'ND', label: 'North Dakota' },
//   { value: 'MP', label: 'Northern Mariana Islands' },
//   { value: 'OH', label: 'Ohio' },
//   { value: 'OK', label: 'Oklahoma' },
//   { value: 'OR', label: 'Oregon' },
//   { value: 'PW', label: 'Palau' },
//   { value: 'PA', label: 'Pennsylvania' },
//   { value: 'PR', label: 'Puerto Rico' },
//   { value: 'RI', label: 'Rhode Island' },
//   { value: 'SC', label: 'South Carolina' },
//   { value: 'SD', label: 'South Dakota' },
//   { value: 'TN', label: 'Tennessee' },
//   { value: 'TX', label: 'Texas' },
//   { value: 'UT', label: 'Utah' },
//   { value: 'VT', label: 'Vermont' },
//   { value: 'VI', label: 'Virgin Islands' },
//   { value: 'VA', label: 'Virginia' },
//   { value: 'WA', label: 'Washington' },
//   { value: 'WV', label: 'West Virginia' },
//   { value: 'WI', label: 'Wisconsin' },
//   { value: 'WY', label: 'Wyoming' },
// ];

// export const optionLength = [
//   { value: 1, label: 'general' },
//   {
//     value: 2,
//     label:
//       'Evil is the moment when I lack the strength to be true to the Good that compels me.',
//   },
//   {
//     value: 3,
//     label:
//       "It is now an easy matter to spell out the ethic of a truth: 'Do all that you can to persevere in that which exceeds your perseverance. Persevere in the interruption. Seize in your being that which has seized and broken you.",
//   },
// ];

// export const dogOptions = [
//   { id: 1, label: 'Chihuahua' },
//   { id: 2, label: 'Bulldog' },
//   { id: 3, label: 'Dachshund' },
//   { id: 4, label: 'Akita' },
// ];

// // let bigOptions = [];
// // for (let i = 0; i < 10000; i++) {
// // 	bigOptions = bigOptions.concat(colourOptions);
// // }

// export interface GroupedOption {
//   readonly label: string;
//   readonly options: readonly ColourOption[] | readonly FlavourOption[];
// }

// export const groupedOptions: readonly GroupedOption[] = [
//   {
//     label: 'Colours',
//     options: colourOptions,
//   },
//   {
//     label: 'Flavours',
//     options: flavourOptions,
//   },
// ];

// export const HomeClient = () => {
//   return (
//     <CreatableSelect isMulti options={colourOptions} />
//   );
// };

// import { useState } from "react";

// export const HomeClient = () => {
//   const [options, setOptions] = useState([
//     { value: "chocolate", label: "Chocolate" },
//     { value: "strawberry", label: "Strawberry" },
//     { value: "vanilla", label: "Vanilla" },
//   ]);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [inputValue, setInputValue] = useState("");
//   const [isOpen, setIsOpen] = useState(false);

//   const handleCreate = (inputValue) => {
//     const newOption = {
//       value: inputValue.toLowerCase().replace(/\s+/g, "-"),
//       label: inputValue,
//     };
//     setOptions([...options, newOption]);
//     setSelectedOption(newOption);
//     setInputValue("");
//     setIsOpen(false);
//   };

//   const filteredOptions = options.filter((option) =>
//     option.label.toLowerCase().includes(inputValue.toLowerCase())
//   );

//   const showCreateOption =
//     inputValue &&
//     !filteredOptions.some(
//       (option) => option.label.toLowerCase() === inputValue.toLowerCase()
//     );
//   return (
//     <div>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Creatable Select
//             </h1>
//             <p className="text-gray-600 mb-8">
//               Choose an existing option or create a new one
//             </p>

//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select or Create Flavor
//               </label>

//               <div className="relative">
//                 <input
//                   type="text"
//                   value={selectedOption ? selectedOption.label : inputValue}
//                   onChange={(e) => {
//                     setInputValue(e.target.value);
//                     setSelectedOption(null);
//                     setIsOpen(true);
//                   }}
//                   onFocus={() => setIsOpen(true)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && inputValue.trim()) {
//                       e.preventDefault();
//                       handleCreate(inputValue);
//                       setInputValue("");
//                       setIsOpen(false);
//                     }
//                   }}
//                   placeholder="Select or type to create..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
//                 />

//                 <button
//                   onClick={() => setIsOpen(!isOpen)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {isOpen && (
//                 <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
//                   {filteredOptions.length > 0 ? (
//                     filteredOptions.map((option) => (
//                       <div
//                         key={option.value}
//                         onClick={() => {
//                           setSelectedOption(option);
//                           setInputValue("");
//                           setIsOpen(false);
//                         }}
//                         className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition"
//                       >
//                         {option.label}
//                       </div>
//                     ))
//                   ) : inputValue && !showCreateOption ? (
//                     <div className="px-4 py-3 text-gray-500">
//                       No options found
//                     </div>
//                   ) : null}

//                   {showCreateOption && (
//                     <div
//                       onClick={() => handleCreate(inputValue)}
//                       className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition border-t border-indigo-100"
//                     >
//                       <span className="text-indigo-600 font-medium">
//                         Create "{inputValue}"
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {selectedOption && (
//               <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="text-sm text-green-800">
//                   <span className="font-semibold">Selected:</span>{" "}
//                   {selectedOption.label}
//                 </p>
//               </div>
//             )}

//             <div className="mt-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-3">
//                 Available Options ({options.length})
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {options.map((option) => (
//                   <span
//                     key={option.value}
//                     className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
//                   >
//                     {option.label}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// "use client";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { cn } from "@/lib/utils";
// import { memo } from "react";
// import { AIApply } from "../(dashboard)/dashboard-tabs/ai-apply-tab/AIApply";
// import { FindJob } from "../(dashboard)/dashboard-tabs/find-job-tab/FindJob";
// import { DashboardTab } from "@/types";
// import { TAB_ITEMS } from "../../(landing-page)/constants";
// import { AIJobCustomization } from "../(dashboard)/dashboard-tabs/ai-job-customization-tab/AIJobCustomization";
// import { TopGradient } from "@/components/shared/TopGradient";
// import { JobFilters } from "@/lib/types/jobs";

// export const HomeClient = memo(
//   ({
//     tab,
//     jobDescription,
//     filters,
//   }: {
//     tab: DashboardTab;
//     jobDescription: string;
//     filters: JobFilters;
//   }) => {
//     // w-[calc(100vw-500px)]

//     return (
//       <>
//         <TopGradient />
//         <div className="container">
//           <Tabs
//             defaultValue={tab ?? "ai-apply"}
//             className="gap-y-13 w-full p-4 sm:p-8"
//           >
//             <TabsList className="gap-3 justify-center bg-transparent flex flex-row w-full mt-24">
//               {TAB_ITEMS.map((item) => (
//                 <TabsTrigger
//                   key={item.value}
//                   className={cn(
//                     "data-[state=active]:bg-primary data-[state=active]:hover:shadow-sm data-[state=active]:shadow-md data-[state=active]:hover:bg-blue-400 data-[state=active]:text-white h-[3.4rem] xs5:max-w-[7.833rem] shadow-md hover:shadow-sm hover:cursor-pointer shadow-blue-200 flex-1 items-center justify-center xs5:gap-3 rounded-2xl border border-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-state=active]_img]:invert [&[data-state=active]_img]:brightness-200"
//                   )}
//                   value={item.value}
//                   // onClick={() => router.push(item.url)}
//                 >
//                   <img
//                     src={item.icon}
//                     alt={item.title}
//                     className="max-xs3:size-3.5"
//                     loading="lazy"
//                   />
//                   <span className="max-xs2:text-[0.7rem]">{item.title}</span>
//                 </TabsTrigger>
//               ))}
//             </TabsList>

//             <TabsContent value="ai-apply">
//               <AIApply jobDescription={jobDescription} filters={filters} />
//             </TabsContent>
//             <TabsContent value="tailor-cv">
//               <AIJobCustomization filters={filters} />
//             </TabsContent>
//             <TabsContent value="find-jobs">
//               <FindJob filters={filters} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </>
//     );
//   }
// );

// HomeClient.displayName = "HomeClient";
