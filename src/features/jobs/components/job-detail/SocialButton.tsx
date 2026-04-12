export function SocialButton({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <button
      className={`flex items-center justify-center w-10 h-10 rounded ${color}`}
    >
      {children}
    </button>
  );
}
