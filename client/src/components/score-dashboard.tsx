import { Card } from "@/components/ui/card";
import { ChartLine } from "lucide-react";

interface ScoreDashboardProps {
  environmentScore: number;
  economicScore: number;
  carbonEmissions: number;
}

export default function ScoreDashboard({ 
  environmentScore, 
  economicScore, 
  carbonEmissions 
}: ScoreDashboardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ChartLine className="text-earth-600 mr-2" />
        현재 상태
      </h3>
      
      {/* Environment Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-green-700">환경 점수</span>
          <span className="text-sm font-bold text-green-700">{environmentScore}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${environmentScore}%` }}
          />
        </div>
      </div>
      
      {/* Economic Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-700">경제 점수</span>
          <span className="text-sm font-bold text-blue-700">{economicScore}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${economicScore}%` }}
          />
        </div>
      </div>
      
      {/* Carbon Emissions */}
      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-700">탄소 배출량</span>
          <span className="text-lg font-bold text-red-700">{carbonEmissions}</span>
        </div>
        <p className="text-xs text-red-600 mt-1">ppm CO₂</p>
      </div>
    </Card>
  );
}
