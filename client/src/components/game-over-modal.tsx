import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, RotateCcw, Share } from "lucide-react";
import type { SessionWithChoices } from "@shared/schema";

interface GameOverModalProps {
  session: SessionWithChoices;
  marsYears: number;
  onRestart: () => void;
  onClose: () => void;
}

export default function GameOverModal({ session, marsYears, onRestart, onClose }: GameOverModalProps) {
  const getFinalComment = () => {
    if (session.environmentScore <= 20) {
      return "당신의 선택들로 인해 지구의 환경은 회복 불가능한 상태에 도달했습니다. 탄소 농도가 위험 수준을 넘어서면서 기후 변화가 가속화되었고, 인류는 화성으로의 이주를 준비해야 하는 상황에 이르렀습니다.";
    } else if (session.carbonEmissions >= 600) {
      return "대기 중 탄소 농도가 600ppm을 넘어서면서 지구의 기후 시스템이 붕괴되었습니다. 극심한 기후 변화로 인해 지구는 더 이상 인간이 살기 어려운 행성이 되었습니다.";
    } else {
      return "10개의 중요한 환경 선택을 마쳤지만, 누적된 환경 파괴로 인해 지구의 미래는 여전히 불확실합니다. 더 많은 환경 친화적 선택이 필요했습니다.";
    }
  };

  const handleShare = () => {
    const text = `ESG 환경 게임 결과:\n환경 점수: ${session.environmentScore}/100\n탄소 농도: ${session.carbonEmissions}ppm\n화성 이주까지: ${marsYears}년\n\n지구를 구하기 위해 더 나은 선택을 해보세요!`;
    
    if (navigator.share) {
      navigator.share({
        title: '지구의 운명 - ESG 환경 게임',
        text: text,
        url: window.location.href
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      // You could add a toast notification here
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Mars landscape" 
                className="w-full h-48 object-cover rounded-lg mb-6" 
              />
              
              <h2 className="text-3xl font-bold text-red-600 mb-4">게임 종료</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">화성 이주 계획 발동</h3>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="bg-red-50 p-4 border border-red-200">
            <h4 className="font-semibold text-red-700 mb-2">최종 환경 점수</h4>
            <div className="text-3xl font-bold text-red-600">{session.environmentScore}</div>
            <p className="text-sm text-red-600 mt-1">
              {session.environmentScore <= 20 ? "위험 수준" : session.environmentScore <= 50 ? "주의 수준" : "보통 수준"}
            </p>
          </Card>
          <Card className="bg-orange-50 p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-700 mb-2">최종 탄소 농도</h4>
            <div className="text-3xl font-bold text-orange-600">{session.carbonEmissions}</div>
            <p className="text-sm text-orange-600 mt-1">ppm CO₂</p>
          </Card>
        </div>
        
        <Card className="bg-gray-100 p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">결과 분석</h4>
          <p className="text-gray-700 leading-relaxed">
            {getFinalComment()}
          </p>
        </Card>
        
        <Card className="bg-blue-50 p-4 border border-blue-200 mb-6">
          <div className="flex items-center justify-center space-x-4">
            <Rocket className="text-blue-600 text-2xl" />
            <div>
              <p className="font-semibold text-blue-800">화성 이주까지 예상 시간</p>
              <p className="text-2xl font-bold text-blue-600">{marsYears}년</p>
            </div>
          </div>
        </Card>
        
        <div className="flex space-x-4">
          <Button 
            onClick={onRestart}
            className="flex-1 bg-earth-600 hover:bg-earth-700 text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            다시 시작
          </Button>
          <Button 
            onClick={handleShare}
            variant="outline"
            className="flex-1"
          >
            <Share className="mr-2 h-4 w-4" />
            결과 공유
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
