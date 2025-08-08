import { useEffect, useState } from "react";

interface PolarBearProps {
  environmentScore: number;
  showAnimation?: boolean;
}

export default function PolarBear({ environmentScore, showAnimation = false }: PolarBearProps) {
  const [currentExpression, setCurrentExpression] = useState("");
  const [iceSize, setIceSize] = useState(100);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 환경 점수에 따라 북극곰 상태 결정
    if (environmentScore <= 10) {
      setCurrentExpression("😵"); // 죽음
      setIceSize(5);
      setMessage("북극곰이 위험해요!");
    } else if (environmentScore <= 25) {
      setCurrentExpression("😢"); // 매우 슬픔
      setIceSize(20);
      setMessage("얼음이 너무 작아요...");
    } else if (environmentScore <= 40) {
      setCurrentExpression("😟"); // 슬픔
      setIceSize(40);
      setMessage("얼음이 줄어들고 있어요");
    } else if (environmentScore <= 60) {
      setCurrentExpression("😐"); // 보통
      setIceSize(60);
      setMessage("북극곰이 지켜보고 있어요");
    } else if (environmentScore <= 75) {
      setCurrentExpression("🙂"); // 약간 기쁨
      setIceSize(80);
      setMessage("환경이 좋아지고 있어요");
    } else if (environmentScore <= 90) {
      setCurrentExpression("😊"); // 기쁨
      setIceSize(95);
      setMessage("북극곰이 행복해해요!");
    } else {
      setCurrentExpression("🤗"); // 매우 기쁨
      setIceSize(100);
      setMessage("완벽한 환경이에요!");
    }
  }, [environmentScore]);

  return (
    <div className="flex flex-col items-center">
      {/* Ice Platform */}
      <div className="relative mb-2">
        <div 
          className="bg-gradient-to-b from-blue-100 to-blue-300 rounded-full transition-all duration-1000"
          style={{ 
            width: `${Math.max(40, iceSize * 0.8)}px`, 
            height: `${Math.max(20, iceSize * 0.4)}px` 
          }}
        />
        
        {/* Polar Bear */}
        <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl transition-all duration-500 ${
          showAnimation ? 'animate-bounce' : ''
        }`}>
          🐻‍❄️
        </div>
        
        {/* Expression */}
        <div className="absolute -top-8 -right-2 text-lg">
          {currentExpression}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <div className="text-sm font-medium text-white mb-1">
          환경 지수: {environmentScore}/100
        </div>
        <div className="text-xs text-white/80 max-w-32 leading-tight">
          {message}
        </div>
      </div>
    </div>
  );
}