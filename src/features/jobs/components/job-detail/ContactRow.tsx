export function ContactRow({
  icon,
  label,
  value,
  bordered,
}: {
  icon: string;
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={`flex items-start ${bordered ? "border-t pt-4" : ""}`}>
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
        <img src={icon} className="w-5 h-5 text-blue-600" alt="" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
        <p className="text-sm text-gray-900 break-all">{value}</p>
      </div>
    </div>
  );
}
