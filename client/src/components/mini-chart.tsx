import { useEffect, useState } from "react";

interface MiniChartProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  showChange?: number;
  color?: string;
}

export default function MiniChart({ value, label, icon, showChange = 0, color = "blue" }: MiniChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green": return "bg-green-500";
      case "blue": return "bg-blue-500";
      case "purple": return "bg-purple-500";
      case "orange": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getDangerColor = (val: number) => {
    if (val <= 20 || val >= 85) return "bg-red-500";
    if (val <= 40 || val >= 75) return "bg-yellow-500";
    return getColorClasses(color);
  };

  return (
    <div className="bg-white/20 rounded-lg p-3 relative backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-white font-medium text-sm">{label}</span>
        {showChange !== 0 && (
          <div className={`text-xs font-bold animate-pulse ${
            showChange > 0 ? 'text-green-300' : 'text-red-300'
          }`}>
            {showChange > 0 ? '+' : ''}{showChange}
          </div>
        )}
      </div>
      
      {/* Mini Chart */}
      <div className="h-8 bg-gray-200/20 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${getDangerColor(value)}`}
          style={{ width: `${Math.max(2, animatedValue)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-white/80">
        <span>{value}/100</span>
        {(value <= 20 || value >= 85) && (
          <span className="text-red-300 font-bold animate-pulse">위험!</span>
        )}
      </div>

      {/* Change indicator */}
      {showChange !== 0 && (
        <div className={`absolute -top-1 -right-1 text-lg animate-bounce ${
          showChange > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {showChange > 0 ? '📈' : '📉'}
        </div>
      )}
    </div>
  );
}