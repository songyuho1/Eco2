import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Leaf, DollarSign } from "lucide-react";
import type { GameChoice } from "@shared/schema";

interface ChoiceButtonProps {
  choice: GameChoice;
  onSelect: () => void;
  disabled?: boolean;
}

export default function ChoiceButton({ choice, onSelect, disabled = false }: ChoiceButtonProps) {
  const isEnvironmental = choice.type === 'environment';
  
  const getButtonClasses = () => {
    if (isEnvironmental) {
      return `w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-300 group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    } else {
      return `w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 text-left transition-all duration-300 group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }
  };

  const getIconColor = () => {
    return isEnvironmental ? "text-green-600" : "text-blue-600";
  };

  const getTitleColor = () => {
    return isEnvironmental ? "text-green-800" : "text-blue-800";
  };

  const getDescriptionColor = () => {
    return isEnvironmental ? "text-green-700" : "text-blue-700";
  };

  return (
    <Button
      onClick={onSelect}
      disabled={disabled}
      variant="ghost"
      className={getButtonClasses()}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {isEnvironmental ? (
              <Leaf className={`${getIconColor()} text-xl mr-3`} />
            ) : (
              <DollarSign className={`${getIconColor()} text-xl mr-3`} />
            )}
            <h4 className={`text-lg font-semibold ${getTitleColor()}`}>{choice.title}</h4>
          </div>
          <p className={`${getDescriptionColor()} mb-3`}>{choice.description}</p>
          
          {/* Impact Preview */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center">
              {choice.environmentImpact > 0 ? (
                <ArrowUp className="text-green-500 mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="text-red-500 mr-1 h-3 w-3" />
              )}
              <span className={choice.environmentImpact > 0 ? "text-green-700" : "text-red-700"}>
                환경 {choice.environmentImpact > 0 ? '+' : ''}{choice.environmentImpact}
              </span>
            </div>
            <div className="flex items-center">
              {choice.economicImpact > 0 ? (
                <ArrowUp className="text-blue-500 mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="text-red-500 mr-1 h-3 w-3" />
              )}
              <span className={choice.economicImpact > 0 ? "text-blue-700" : "text-red-700"}>
                경제 {choice.economicImpact > 0 ? '+' : ''}{choice.economicImpact}
              </span>
            </div>
            <div className="flex items-center">
              {choice.carbonImpact > 0 ? (
                <ArrowUp className="text-red-500 mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="text-green-500 mr-1 h-3 w-3" />
              )}
              <span className={choice.carbonImpact > 0 ? "text-red-700" : "text-green-700"}>
                탄소 {choice.carbonImpact > 0 ? '+' : ''}{choice.carbonImpact}
              </span>
            </div>
          </div>
        </div>
        <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">
          {choice.emoji || (isEnvironmental ? '🌱' : '💰')}
        </div>
      </div>
    </Button>
  );
}
