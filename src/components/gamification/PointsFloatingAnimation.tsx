import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PointsFloatingAnimationProps {
  points: number;
  x?: number;
  y?: number;
  onComplete?: () => void;
}

export const PointsFloatingAnimation: React.FC<PointsFloatingAnimationProps> = ({
  points,
  x = 0,
  y = 0,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const color = points > 0 ? "text-green-500" : "text-red-500";
  const sign = points > 0 ? "+" : "";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: 1, y: -50, x: Math.random() * 20 - 10 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1 }}
          className={`fixed ${color} font-bold text-lg z-40 pointer-events-none`}
          style={{ left: x, top: y }}
        >
          {sign}{points} points
        </motion.div>
      )}
    </AnimatePresence>
  );
};