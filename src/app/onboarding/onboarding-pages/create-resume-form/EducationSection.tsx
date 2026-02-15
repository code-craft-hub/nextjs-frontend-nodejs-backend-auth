"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Trash2, PlusCircle, GraduationCap } from "lucide-react";

type EducationEntry = {
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
};

type EducationFormValues = {
  educations: EducationEntry[];
};

export default function EducationSection() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationFormValues>({
    defaultValues: {
      educations: [
        {
          degree: "",
          institution: "",
          startYear: "2015",
          endYear: "2019",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educations",
  });

  const onSubmit = (data: EducationFormValues) => {
    console.log(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-green-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Education
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your academic background and relevant certifications.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">
                Education #{index + 1}
              </h3>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                  aria-label={`Remove education ${index + 1}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {fields.length === 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                  aria-label={`Remove education ${index + 1}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Degree / Certification */}
            <div className="mb-4">
              <label
                htmlFor={`degree-${index}`}
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Degree / Certification{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id={`degree-${index}`}
                type="text"
                placeholder="e.g. ,Bachelor of Science in Computer Science"
                {...register(`educations.${index}.degree`, {
                  required: "Degree is required",
                })}
                className={`w-full h-12 px-4 text-sm text-gray-700 placeholder-gray-400 bg-white border rounded-xl outline-none transition-colors
                  ${
                    errors.educations?.[index]?.degree
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  }`}
              />
              {errors.educations?.[index]?.degree && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.educations[index]?.degree?.message}
                </p>
              )}
            </div>

            {/* Institution */}
            <div className="mb-5">
              <label
                htmlFor={`institution-${index}`}
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                id={`institution-${index}`}
                type="text"
                placeholder="e.g., Stanford University"
                {...register(`educations.${index}.institution`, {
                  required: "Institution is required",
                })}
                className={`w-full h-12 px-4 text-sm text-gray-700 placeholder-gray-400 bg-white border rounded-xl outline-none transition-colors
                  ${
                    errors.educations?.[index]?.institution
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  }`}
              />
              {errors.educations?.[index]?.institution && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.educations[index]?.institution?.message}
                </p>
              )}
            </div>

            {/* Start Year / End Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`startYear-${index}`}
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Start Year
                </label>
                <input
                  id={`startYear-${index}`}
                  type="text"
                  placeholder="2015"
                  {...register(`educations.${index}.startYear`, {
                    pattern: {
                      value: /^\d{4}$/,
                      message: "Enter a valid year",
                    },
                  })}
                  className={`w-full h-12 px-4 text-sm text-gray-700 placeholder-gray-400 bg-white border rounded-xl outline-none transition-colors
                    ${
                      errors.educations?.[index]?.startYear
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    }`}
                />
                {errors.educations?.[index]?.startYear && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.educations[index]?.startYear?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`endYear-${index}`}
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  End Year
                </label>
                <input
                  id={`endYear-${index}`}
                  type="text"
                  placeholder="2019"
                  {...register(`educations.${index}.endYear`, {
                    pattern: {
                      value: /^\d{4}$/,
                      message: "Enter a valid year",
                    },
                  })}
                  className={`w-full h-12 px-4 text-sm text-gray-700 placeholder-gray-400 bg-white border rounded-xl outline-none transition-colors
                    ${
                      errors.educations?.[index]?.endYear
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    }`}
                />
                {errors.educations?.[index]?.endYear && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.educations[index]?.endYear?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Role Button */}
        <button
          type="button"
          onClick={() =>
            append({
              degree: "",
              institution: "",
              startYear: "",
              endYear: "",
            })
          }
          className="w-full h-14 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-400 rounded-2xl text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <PlusCircle className="w-5 h-5" />
          Add Another Role
        </button>
      </form>
    </div>
  );
}