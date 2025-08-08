import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  DollarSign, 
  Users, 
  Cpu,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import type { ReignsGameSession, DecisionCard } from "@shared/schema";

interface GameEffects {
  environment: number;
  economy: number;
  social: number;
  technology: number;
}

interface DecisionResponse {
  session: ReignsGameSession;
  effects: GameEffects;
  gameOver: boolean;
  gameOverReason?: string;
}

export default function ReignsGame() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<DecisionCard | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [lastEffects, setLastEffects] = useState<GameEffects | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const queryClient = useQueryClient();

  // Create game session
  const createSessionMutation = useMutation({
    mutationFn: async (): Promise<ReignsGameSession> => {
      const response = await fetch('/api/reigns/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: "CEO", companyName: "GreenCorp" })
      });
      return response.json();
    },
    onSuccess: (session: ReignsGameSession) => {
      setSessionId(session.id);
    }
  });

  // Get current session
  const { data: session, refetch: refetchSession } = useQuery<ReignsGameSession>({
    queryKey: ['/api/reigns/sessions', sessionId],
    enabled: !!sessionId,
    refetchInterval: false,
  });

  // Get next card
  const { data: nextCard, refetch: refetchCard } = useQuery<DecisionCard>({
    queryKey: ['/api/reigns/sessions', sessionId, 'next-card'],
    enabled: !!sessionId && !showGameOver,
    refetchInterval: false,
  });

  // Set current card when we get next card
  useEffect(() => {
    if (nextCard) {
      setCurrentCard(nextCard);
    }
  }, [nextCard]);

  // Make decision
  const makeDecisionMutation = useMutation({
    mutationFn: async ({ decision }: { decision: 'left' | 'right' }): Promise<DecisionResponse> => {
      if (!sessionId || !currentCard) throw new Error('No session or card');
      
      const response = await fetch(`/api/reigns/sessions/${sessionId}/decisions/${currentCard.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      return response.json();
    },
    onSuccess: (response: DecisionResponse) => {
      setLastEffects(response.effects);
      setShowEffects(true);
      
      if (response.gameOver) {
        setShowGameOver(true);
        setGameOverReason(response.gameOverReason || "게임이 종료되었습니다.");
      }
      
      // Update session data
      queryClient.setQueryData(['/api/reigns/sessions', sessionId], response.session);
      
      // Get next card after a delay
      setTimeout(() => {
        setShowEffects(false);
        if (!response.gameOver) {
          refetchCard();
        }
      }, 2000);
    }
  });

  // Initialize game
  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate();
    }
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (makeDecisionMutation.isPending || !currentCard) return;
    
    setSwipeDirection(direction);
    
    setTimeout(() => {
      makeDecisionMutation.mutate({ decision: direction });
      setSwipeDirection(null);
    }, 300);
  };

  const resetGame = () => {
    setSessionId(null);
    setCurrentCard(null);
    setShowEffects(false);
    setLastEffects(null);
    setShowGameOver(false);
    setGameOverReason("");
    createSessionMutation.mutate();
  };

  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'environment': return <Leaf className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'technology': return <Cpu className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMeterColor = (value: number) => {
    if (value <= 20) return "bg-red-500";
    if (value <= 40) return "bg-orange-500";
    if (value >= 80) return "bg-yellow-500";
    if (value >= 90) return "bg-red-500";
    return "bg-green-500";
  };

  const getEffectIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (createSessionMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">ESG 리더십 게임</h2>
          <p>게임을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">로딩 중...</h2>
          <Button onClick={resetGame} variant="outline">다시 시작</Button>
        </div>
      </div>
    );
  }

  // Ensure session is defined for rendering
  const safeSession = session as ReignsGameSession;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-green-900 p-4">
      {/* Header with Meters */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <h1 className="text-2xl font-bold">{safeSession.companyName}</h1>
              <p className="text-white/80">{safeSession.playerName} • {safeSession.currentYear}년</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              카드 {safeSession.cardsPlayed}개 처리
            </Badge>
          </div>

          {/* Four Meters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'environment', label: '환경', value: safeSession.environmentMeter },
              { key: 'economy', label: '경제', value: safeSession.economyMeter },
              { key: 'social', label: '사회', value: safeSession.socialMeter },
              { key: 'technology', label: '기술', value: safeSession.technologyMeter },
            ].map((meter) => (
              <div key={meter.key} className="bg-white/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getMeterIcon(meter.key)}
                  <span className="text-white font-medium">{meter.label}</span>
                  {lastEffects && showEffects && (
                    <div className="flex items-center gap-1">
                      {getEffectIcon(lastEffects[meter.key as keyof GameEffects])}
                      <span className={`text-sm font-bold ${
                        lastEffects[meter.key as keyof GameEffects] > 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {lastEffects[meter.key as keyof GameEffects] > 0 ? '+' : ''}
                        {lastEffects[meter.key as keyof GameEffects]}
                      </span>
                    </div>
                  )}
                </div>
                <Progress 
                  value={meter.value} 
                  className={`h-3 ${getMeterColor(meter.value)}`}
                />
                <div className="text-white/80 text-sm mt-1">{meter.value}/100</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-6 bg-white">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-3xl font-bold mb-4">게임 종료!</h2>
              <p className="text-lg mb-6 text-gray-700">{gameOverReason}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{safeSession.currentYear}</div>
                  <div className="text-sm text-gray-600">도달 연도</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{safeSession.cardsPlayed}</div>
                  <div className="text-sm text-gray-600">처리한 결정</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <p className="text-lg font-medium text-gray-800 mb-4">
                  🌱 ESG는 균형이 핵심입니다! 다시 도전해보세요!
                </p>
                <Button 
                  onClick={resetGame}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                >
                  🔄 다시 도전하기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Card Interface */}
      <div className="max-w-2xl mx-auto">
        <Card className={`bg-white shadow-2xl transition-transform duration-300 ${
          swipeDirection === 'left' ? '-rotate-12 -translate-x-32' : 
          swipeDirection === 'right' ? 'rotate-12 translate-x-32' : ''
        }`}>
          
          {/* Character Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentCard.characterEmoji}</div>
              <div>
                <h3 className="text-lg font-bold">{currentCard.characterName}</h3>
                <p className="text-blue-100 text-sm">{currentCard.characterRole}</p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentCard.title}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{currentCard.description}</p>

            {/* Educational Data */}
            {currentCard.educationalData && typeof currentCard.educationalData === 'object' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">실제 데이터</span>
                </div>
                <p className="text-blue-700 text-sm">
                  {String((currentCard.educationalData as any).fact || '')}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  출처: {String((currentCard.educationalData as any).source || '')}
                </p>
              </div>
            )}
          </div>

          {/* Decision Options */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Choice */}
              <Button
                onClick={() => handleSwipe('left')}
                disabled={makeDecisionMutation.isPending}
                className="h-auto p-4 bg-red-500 hover:bg-red-600 text-white flex-col items-start transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-bold">← 거절/보수적</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold mb-1">{currentCard.leftOptionTitle}</div>
                  <div className="text-xs text-red-100">{currentCard.leftOptionDescription}</div>
                </div>
              </Button>

              {/* Right Choice */}
              <Button
                onClick={() => handleSwipe('right')}
                disabled={makeDecisionMutation.isPending}
                className="h-auto p-4 bg-green-500 hover:bg-green-600 text-white flex-col items-start transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">수락/진보적 →</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold mb-1">{currentCard.rightOptionTitle}</div>
                  <div className="text-xs text-green-100">{currentCard.rightOptionDescription}</div>
                </div>
              </Button>
            </div>

            <div className="text-center mt-4 text-gray-500 text-sm">
              💡 왼쪽으로 스와이프하여 거절 | 오른쪽으로 스와이프하여 수락
            </div>
          </div>
        </Card>

        {/* Warning Signs for Critical Meters */}
        {[
          { key: 'environment', label: '환경 위기', value: safeSession.environmentMeter },
          { key: 'economy', label: '경제 위기', value: safeSession.economyMeter },
          { key: 'social', label: '사회 불안', value: safeSession.socialMeter },
          { key: 'technology', label: '기술 격차', value: safeSession.technologyMeter },
        ].some(meter => meter.value <= 25 || meter.value >= 85) && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">⚠️ 위험 경고</span>
              </div>
              <div className="text-red-700 text-sm">
                {[
                  { key: 'environment', label: '환경 지표', value: safeSession.environmentMeter },
                  { key: 'economy', label: '경제 지표', value: safeSession.economyMeter },
                  { key: 'social', label: '사회 지표', value: safeSession.socialMeter },
                  { key: 'technology', label: '기술 지표', value: safeSession.technologyMeter },
                ].filter(meter => meter.value <= 25 || meter.value >= 85)
                .map(meter => (
                  <div key={meter.key}>
                    • {meter.label}가 {meter.value <= 25 ? '매우 낮습니다' : '매우 높습니다'} ({meter.value}/100)
                  </div>
                ))}
                <div className="mt-2 font-medium">균형잡힌 선택이 필요합니다!</div>
              </div>
            </div>
          </Card>
        )}

        {/* Footer with Year Progress */}
        <div className="text-center mt-6 text-white/80">
          <Globe className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">
            지구의 운명을 결정하는 중... • 목표: 2075년까지 생존 
          </p>
        </div>
      </div>
    </div>
  );
}