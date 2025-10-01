export default function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.83333 9.16631V5.83297C4.83229 4.79968 5.21523 3.80286 5.90781 3.03603C6.60039 2.2692 7.55319 1.78706 8.58125 1.68321C9.60932 1.57937 10.6393 1.86123 11.4712 2.47407C12.3032 3.08691 12.8777 3.98701 13.0833 4.99964M3.16667 9.16631H14.8333C15.7538 9.16631 16.5 9.9125 16.5 10.833V16.6663C16.5 17.5868 15.7538 18.333 14.8333 18.333H3.16667C2.24619 18.333 1.5 17.5868 1.5 16.6663V10.833C1.5 9.9125 2.24619 9.16631 3.16667 9.16631Z"
        stroke="currentColor"
        className="transition-colors duration-200"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
