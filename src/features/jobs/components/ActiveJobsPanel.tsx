import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const jobs = [
  { id: 1, status: "Applied", auto: true },
  { id: 2, status: "Queued", auto: true },
  { id: 3, status: "Applied", auto: false },
  { id: 4, status: "Queued", auto: false },
  { id: 5, status: "Processing", auto: true },
  { id: 6, status: "Attention", auto: false },
  { id: 7, status: "Applied", auto: false },
  { id: 8, status: "Queued", auto: true },
  { id: 9, status: "Applied", auto: false },
  { id: 10, status: "Applied", auto: false },
];

const statusStyles: Record<string, string> = {
  Applied: "bg-green-100 text-green-700",
  Queued: "bg-gray-200 text-gray-600",
  Processing: "bg-yellow-100 text-yellow-700",
  Attention: "bg-red-100 text-red-600",
};

const StatusBadge = ({ status }: { status: string }) => {
  const labelMap: Record<string, string> = {
    Applied: "Applied",
    Queued: "Queued",
    Processing: "Processing...",
    Attention: "Attention needed",
  };

  return (
    <Badge className={`rounded-full px-4 py-1 text-sm font-medium ${statusStyles[status]}`}>
      {labelMap[status]}
    </Badge>
  );
};

const AutoApplyBadge = () => (
  <div className="flex items-center gap-1 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">
    <span>⚡</span>
    Auto-apply
  </div>
);

const JobItem = ({ job }: { job: (typeof jobs)[0] }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-yellow-400 font-bold">
          a
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">UX Designer @Amazon</span>
            {job.auto && <AutoApplyBadge />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={job.status} />
        <button className="text-gray-400 hover:text-black">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default function ActiveJobsPanel() {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active(12)</h2>
            <span className="text-sm text-gray-500">13% completion</span>
          </div>

          <div>
            {jobs.map((job) => (
              <JobItem key={job.id} job={job} />
            ))}
          </div>

          <Button className="w-full mt-4 rounded-xl bg-gray-200 text-black hover:bg-gray-300">
            see all approvals
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
