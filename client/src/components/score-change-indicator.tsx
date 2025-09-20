import { motion, AnimatePresence } from "framer-motion";

interface ScoreChangeIndicatorProps {
  value: number;
  className?: string;
}

export function ScoreChangeIndicator({ value, className = "" }: ScoreChangeIndicatorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full ${className}`}
      >
        <span className={`text-lg font-bold ${value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {value > 0 ? '+' : ''}{value}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
