import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "../../lib/useWindowSize";

interface ConfettiAnimationProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  duration = 3000,
  colors = ["#FFD700", "#C0C0C0", "#CD7F32", "#FF6347", "#4169E1", "#32CD32"],
  onComplete,
}) => {
  const { width, height } = useWindowSize();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsRunning(true);
      const timer = setTimeout(() => {
        setIsRunning(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete]);

  if (!isRunning) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <ReactConfetti
        width={width}
        height={height}
        colors={colors}
        numberOfPieces={200}
        recycle={false}
        gravity={0.2}
      />
    </div>
  );
};