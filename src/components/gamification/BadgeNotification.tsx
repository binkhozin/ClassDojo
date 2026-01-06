import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Award } from "lucide-react";
import { Button } from "../ui/button";

interface BadgeNotificationProps {
  badgeName: string;
  badgeIcon?: string;
  onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badgeName,
  badgeIcon,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm z-50 border"
    >
      <div className="flex items-start gap-3">
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
          <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">New Badge Earned! 🎉</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Congratulations! You earned the <strong>{badgeName}</strong> badge!
          </p>
          {badgeIcon && (
            <div className="text-2xl mt-2">{badgeIcon}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};