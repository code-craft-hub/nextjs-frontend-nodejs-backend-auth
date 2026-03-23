import React, { useRef, useState } from "react";

interface ExcludedCompaniesInputProps {
  companies: string[];
  onChange: (updated: string[]) => Promise<void>;
}

export const ExcludedCompaniesInput: React.FC<ExcludedCompaniesInputProps> = ({
  companies,
  onChange,
}) => {
  const [companyInput, setCompanyInput] = useState("");
  const companyInputRef = useRef<HTMLInputElement>(null);

  const addCompany = async (name: string) => {
    const trimmed = name.trim().replace(/,$/, "");
    if (trimmed && !companies.includes(trimmed)) {
      await onChange([...companies, trimmed]);
    }
    setCompanyInput("");
  };

  const removeCompany = async (company: string) => {
    await onChange(companies.filter((c) => c !== company));
  };

  return (
    <div className="space-y-1.5">
      <p className="font-medium text-sm text-gray-800">Excluded companies</p>
      <p className="text-xs text-gray-500">Skip applications to these companies</p>

      {companies.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {companies.map((company) => (
            <span
              key={company}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1"
            >
              {company}
              <button
                onClick={() => removeCompany(company)}
                className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors leading-none"
                aria-label={`Remove ${company}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <input
          ref={companyInputRef}
          type="text"
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
          onKeyDown={async (e) => {
            if ((e.key === "Enter" || e.key === ",") && companyInput.trim()) {
              e.preventDefault();
              await addCompany(companyInput);
            }
          }}
          placeholder="Company name, then Enter"
          className="flex-1 border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => addCompany(companyInput)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};
