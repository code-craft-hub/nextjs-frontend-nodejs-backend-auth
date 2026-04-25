export function ContactRow({
  icon,
  label,
  value,
  bordered,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  bordered?: boolean;
  href?: string;
}) {
  return (
    <div className={`flex items-start ${bordered ? "border-t pt-4" : ""}`}>
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
        <img src={icon} className="w-5 h-5 text-blue-600" alt="" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
        {href && value !== "N/A" ? (
          <a
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}
