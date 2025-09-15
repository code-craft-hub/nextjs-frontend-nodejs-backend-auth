import { useConfettiStore } from "@/hooks/useConfetti-store";
import ReactConfetti from "react-confetti";
export default function ConfettiUI() {
  const confetti = useConfettiStore();
  if (!confetti.isOpen) return null;
  return (
    <ReactConfetti
      className="pointer-events-none z-[100]"
      numberOfPieces={500}
      recycle={false}
      onConfettiComplete={() => confetti.onClose()}
    />
  );
}