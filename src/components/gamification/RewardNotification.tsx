import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Gift } from "lucide-react";
import { Button } from "../ui/button";

interface RewardNotificationProps {
  rewardName: string;
  pointsDeducted: number;
  newPoints: number;
  onClose: () => void;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  rewardName,
  pointsDeducted,
  newPoints,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
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
        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
          <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-green-600 dark:text-green-400">Reward Redeemed!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            You redeemed <strong>{rewardName}</strong> for <strong>{pointsDeducted} points</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            New balance: <strong>{newPoints} points</strong>
          </p>
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