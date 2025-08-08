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
    const theme = session.theme;
    const envScore = session.environmentScore;
    const carbonEmissions = session.carbonEmissions;
    
    // Theme-specific endings
    const themeEndings = {
      cute: {
        bad: "😢 작은 회사가 만든 큰 실수... 당신의 선택들이 모여 지구가 아파하고 있어요. 친구들과 함께 한 꿈이 지구를 떠나야 하는 현실이 되었습니다. 다시 한번 도전해서 지구를 구해주세요!",
        normal: "🌍 6번의 선택으로 이야기가 끝났지만, 지구는 여전히 위험해요. 더 많은 환경 친화적인 선택이 필요했답니다. 하지만 포기하지 마세요, 다시 도전할 수 있어요!"
      },
      scary: {
        bad: "💀 파멸의 종소리가 울립니다... 탐욕에 사로잡힌 인간들의 선택이 지구를 죽음으로 이끌었습니다. 어둠이 세상을 뒤덮고, 생명체들이 하나둘 사라져갑니다. 화성으로의 도피만이 유일한 선택입니다...",
        normal: "👻 공포의 시나리오가 현실이 되었습니다. 6개의 저주스러운 선택들이 지구의 운명을 바꿔놓았습니다. 아직 완전한 파멸은 아니지만, 어둠의 그림자가 짙어져가고 있습니다..."
      },
      realistic: {
        bad: "📊 비즈니스 리포트: 6개의 전략적 의사결정 결과, 환경 리스크가 임계점을 넘어섰습니다. ESG 지표 악화로 지속가능성이 위험 수준에 도달했으며, 인류의 화성 이주 계획 검토가 필요한 상황입니다.",
        normal: "💼 분기별 결산: 6번의 중요한 경영 판단을 마쳤으나, 환경과 경제의 균형점을 찾지 못했습니다. 추가적인 지속가능성 전략 수립이 시급한 상황입니다."
      },
      futuristic: {
        bad: "🚀 2050년 최종 보고서: 첨단 기술을 활용한 6번의 선택에도 불구하고 지구 복원에 실패했습니다. 화성 테라포밍 프로젝트 가동이 불가피한 상황입니다. 인류의 새로운 거주지를 찾아야 합니다.",
        normal: "🤖 AI 분석 결과: 6개의 미래 기술 도입 과정에서 환경과 기술의 균형점을 찾지 못했습니다. 추가적인 지구 재건 프로젝트가 필요합니다."
      },
      dramatic: {
        bad: "⚔️ 전설의 끝: 환경 수호자의 6번의 선택이 모두 끝났으나, 지구는 여전히 위험에 처해있습니다. 영웅의 여정이 실패로 끝나며, 인류는 새로운 행성을 찾아 떠나야 하는 운명을 맞이했습니다...",
        normal: "🎭 드라마의 막이 내렸습니다. 6번의 운명적인 선택을 마쳤지만, 완전한 승리를 거두지는 못했습니다. 이야기는 끝났지만 지구의 운명은 여전히 불확실합니다."
      }
    };
    
    const endings = themeEndings[theme as keyof typeof themeEndings] || themeEndings.realistic;
    
    if (envScore <= 20 || carbonEmissions >= 600) {
      return endings.bad;
    } else {
      return endings.normal;
    }
  };

  const getEncouragementMessage = () => {
    const theme = session.theme;
    const envScore = session.environmentScore;
    
    const encouragements = {
      cute: envScore <= 20 ? "😢 아쉽습니다! 하지만 포기하지 마세요!" : "🌟 잘했어요! 더 좋은 결과를 위해 다시 도전해보세요!",
      scary: envScore <= 20 ? "💀 파멸을 피하지 못했군요... 다시 도전해보세요!" : "👻 아직 완전한 구원은 아닙니다... 다시 시도해보세요!",
      realistic: envScore <= 20 ? "📊 전략 재검토가 필요합니다. 다시 도전해보세요!" : "💼 더 나은 ESG 성과를 위해 다시 시도해보세요!",
      futuristic: envScore <= 20 ? "🚀 지구 복원에 실패했습니다. 다시 도전해보세요!" : "🤖 더 나은 미래를 위해 다시 시도해보세요!",
      dramatic: envScore <= 20 ? "⚔️ 영웅의 여정이 실패했습니다! 다시 도전해보세요!" : "🎭 더 완벽한 승리를 위해 다시 시도해보세요!"
    };
    
    return encouragements[theme as keyof typeof encouragements] || encouragements.realistic;
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

        {/* Encouragement Message and Restart Button */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border border-green-200 mb-4">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-4">
              {getEncouragementMessage()}
            </p>
            <Button 
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              🔄 다시 도전하기
            </Button>
          </div>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleShare}
            variant="outline"
            className="px-6"
          >
            <Share className="mr-2 h-4 w-4" />
            결과 공유
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
