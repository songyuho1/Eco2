import { Card } from "@/components/ui/card";
import { Snowflake } from "lucide-react";
import type { PolarBearState } from "@shared/schema";

interface PolarBearProps {
  environmentScore: number;
  carbonEmissions: number;
}

export default function PolarBear({ environmentScore, carbonEmissions }: PolarBearProps) {
  const getPolarBearState = (): PolarBearState => {
    if (environmentScore >= 80) {
      return {
        expression: "🐻‍❄️",
        status: "행복함",
        iceSize: 90,
        message: "북극곰이 안전하게 지내고 있어요!"
      };
    } else if (environmentScore >= 60) {
      return {
        expression: "😐",
        status: "보통",
        iceSize: 70,
        message: "북극곰이 조금 걱정하고 있어요."
      };
    } else if (environmentScore >= 40) {
      return {
        expression: "😟",
        status: "걱정됨",
        iceSize: 50,
        message: "얼음이 조금씩 녹고 있어요..."
      };
    } else if (environmentScore >= 20) {
      return {
        expression: "😰",
        status: "위험함",
        iceSize: 30,
        message: "얼음이 많이 녹아서 위험해요!"
      };
    } else {
      return {
        expression: "😢",
        status: "매우 위험",
        iceSize: 15,
        message: "북극곰이 물에 빠질 위험이 있어요..."
      };
    }
  };

  const bearState = getPolarBearState();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Snowflake className="text-ice-400 mr-2" />
        북극곰 상태
      </h3>
      
      {/* Polar Bear Visual */}
      <div className="relative bg-gradient-to-b from-ice-300 to-ice-500 rounded-lg p-4 mb-4 h-32 overflow-hidden">
        {/* Ice Platform */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-t-full opacity-80 transition-all duration-1000"
          style={{ 
            width: `${bearState.iceSize}%`, 
            height: `${Math.max(20, bearState.iceSize / 3)}%`
          }}
        />
        
        {/* Polar Bear */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl mb-1">{bearState.expression}</div>
          <div className="text-xs text-white font-medium">{bearState.status}</div>
        </div>
        
        {/* Water Effect */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-blue-400 opacity-60"></div>
        
        {/* Floating Ice Pieces */}
        {bearState.iceSize < 60 && (
          <>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-white rounded-full opacity-70"></div>
            <div className="absolute bottom-3 right-3 w-2 h-2 bg-white rounded-full opacity-50"></div>
          </>
        )}
      </div>
      
      <div className="text-sm text-gray-600 text-center">
        <p>"{bearState.message}"</p>
      </div>
    </Card>
  );
}
