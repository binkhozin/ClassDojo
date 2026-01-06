import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";
import { ConfettiAnimation } from "./ConfettiAnimation";

interface LevelUpAnimationProps {
  achievementName: string;
  level?: number;
  onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  achievementName,
  level,
  onComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
      setIsVisible(false);
      onComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <ConfettiAnimation trigger={showConfetti} duration={3000} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
      >
        <div className="mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Award className="h-16 w-16 text-yellow-500 mx-auto" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Achievement Unlocked! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {achievementName}
        </p>
        {level && (
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full px-4 py-2 inline-flex items-center">
            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="font-semibold text-blue-600 dark:text-blue-400">Level {level}</span>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowConfetti(false);
            setIsVisible(false);
            onComplete?.();
          }}
          className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
};