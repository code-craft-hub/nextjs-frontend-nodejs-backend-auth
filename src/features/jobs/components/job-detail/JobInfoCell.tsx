export function JobInfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
        {icon}
      </div>
      <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
