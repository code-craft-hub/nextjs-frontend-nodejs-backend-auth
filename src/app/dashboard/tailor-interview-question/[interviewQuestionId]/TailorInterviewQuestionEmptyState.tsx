import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, HelpCircle } from "lucide-react";
import React from "react";

const TailorInterviewQuestionEmptyState = ({index}:{index:number}) => {
  return (
    <div>
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="p-8">
          {/* Question Section */}
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide w-full">
                Question {index + 1}
              </div>
              <Skeleton className="w-full h-12" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* Answer Section */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                Answer {index + 1}
              </div>
              <div className="grid grid-cols-1 gap-4 my-4">
               <Skeleton className="w-full h-12" />
               <Skeleton className="w-full h-12" />
               <Skeleton className="w-full h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorInterviewQuestionEmptyState;
