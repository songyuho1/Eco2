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
import PolarBear from "@/components/polar-bear";
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

  const getGameOverDetails = (session: ReignsGameSession) => {
    const endYear = session.currentYear;
    
    if (session.environmentMeter <= 0) {
      return {
        title: "🌍 지구 환경 완전 붕괴!",
        subtitle: "화성 이주 불가피한 상황",
        consequences: [
          "🌊 해수면 7미터 상승으로 해안 도시 80% 침수",
          "🔥 평균기온 4.5°C 상승으로 생존 불가능 지역 확산", 
          "☠️ 오존층 완전 파괴로 자외선 피해 극심",
          "🏜️ 사막화 진행으로 농업지역 85% 소실",
          "🐻‍❄️ 북극 빙하 완전 소실로 생태계 붕괴"
        ],
        finalMessage: "지구가 더 이상 인류 생존이 불가능해져 화성 이주 계획을 시작해야 합니다!",
        color: "from-red-500 to-orange-500"
      };
    } else if (session.economyMeter <= 0) {
      return {
        title: "💸 글로벌 경제 시스템 완전 붕괴!",
        subtitle: "문명 사회의 종말",
        consequences: [
          "📉 세계 GDP 95% 급락으로 경제 활동 정지",
          "🏭 모든 제조업과 서비스업 완전 중단",
          "💼 전 세계 실업률 90% 돌파",
          "🍞 기본 생필품 생산 및 유통 시스템 마비",
          "💰 화폐 시스템 붕괴로 물물교환 사회 복귀"
        ],
        finalMessage: "극단적 환경 정책으로 경제가 붕괴하여 원시 사회로 역행하게 되었습니다!",
        color: "from-purple-500 to-pink-500"
      };
    } else if (session.socialMeter <= 0) {
      return {
        title: "👥 사회 질서 완전 붕괴!",
        subtitle: "인류 분열과 내전 상태",
        consequences: [
          "⚔️ 계층 간 대규모 내전 및 폭동 발발",
          "🏃‍♂️ 전 세계 10억 명 이상 난민 발생",
          "🚫 정부 기능 완전 마비, 무정부 상태",
          "🔥 주요 도시들 폭동과 약탈로 파괴",
          "🏕️ 인류가 소규모 부족 단위로 분열"
        ],
        finalMessage: "사회적 갈등이 극에 달해 현대 문명이 완전히 붕괴되었습니다!",
        color: "from-gray-600 to-gray-800"
      };
    } else if (session.technologyMeter <= 0) {
      return {
        title: "🔧 기술 문명 완전 퇴보!",
        subtitle: "19세기 수준으로 문명 후퇴",
        consequences: [
          "💡 전력 공급 시스템 완전 중단",
          "📱 모든 통신망과 인터넷 서비스 두절",
          "🏥 현대 의료 시스템 완전 마비",
          "🚗 모든 현대 교통수단 사용 불가",
          "🏭 산업 기반 시설 전면 가동 중단"
        ],
        finalMessage: "기술 발전을 거부한 결과 현대 문명을 유지할 수 없게 되었습니다!",
        color: "from-brown-500 to-yellow-600"
      };
    } else if (session.environmentMeter >= 100) {
      return {
        title: "🌱 극단적 환경주의로 경제 붕괴!",
        subtitle: "과도한 환경 보호의 역설",
        consequences: [
          "🏭 모든 제조업체 강제 폐쇄",
          "✈️ 항공 및 자동차 사용 전면 금지",
          "🔌 전력 사용량 90% 강제 삭감",
          "🍎 산업적 농업 금지로 식량 부족 심각",
          "❄️ 난방 사용 제한으로 동사자 급증"
        ],
        finalMessage: "극단적 환경 보호로 인해 인간 생활이 불가능해졌습니다!",
        color: "from-green-600 to-emerald-700"
      };
    } else if (session.economyMeter >= 100) {
      return {
        title: "💰 무분별한 개발로 지구 황폐화!",
        subtitle: "화성 이주 프로젝트 시작",
        consequences: [
          "🏭 탄소 배출량 850ppm 돌파로 기후 임계점 초과",
          "☁️ 초미세먼지로 대기가 독가스 상태",
          "🐠 바다 산성화로 해양 생물 99% 멸종",
          "🌳 열대우림 완전 소실로 산소 생산 중단",
          "☢️ 산업 폐기물로 토양과 지하수 완전 오염"
        ],
        finalMessage: "환경을 무시한 개발로 지구가 생존 불가능해져 화성으로 떠나야 합니다!",
        color: "from-red-600 to-black"
      };
    } else if (session.socialMeter >= 100) {
      return {
        title: "👨‍👩‍👧‍👦 과도한 복지로 국가 파산!",
        subtitle: "재정 시스템 완전 붕괴",
        consequences: [
          "💸 국가 부채 GDP 대비 800% 돌파",
          "🏦 모든 은행과 금융기관 파산",
          "💰 하이퍼인플레이션으로 화폐 가치 0",
          "🍞 공공 서비스 제공 완전 불가능",
          "🏛️ 정부 기능 정지로 사회 무너짐"
        ],
        finalMessage: "무분별한 복지 정책으로 국가 재정이 완전히 파산했습니다!",
        color: "from-blue-600 to-indigo-700"
      };
    } else {
      return {
        title: "🚀 급진적 기술로 인간성 상실!",
        subtitle: "기술이 인간을 지배하는 세상",
        consequences: [
          "🤖 AI가 인간 일자리 95% 완전 대체",
          "⚡ 기술 격차로 인한 극심한 계층 분화",
          "🧠 인간-기계 융합으로 정체성 혼란",
          "🌐 사이버 범죄와 해킹이 일상화",
          "👁️ 완전 감시 사회로 자유 완전 상실"
        ],
        finalMessage: "급진적 기술 발전으로 인간다운 삶이 불가능해졌습니다!",
        color: "from-cyan-500 to-blue-600"
      };
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 -right-20 w-60 h-60 bg-purple-400/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header with Meters - Mobile Game Style */}
      <div className="max-w-4xl mx-auto mb-6 relative z-10">
        <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="text-white">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {safeSession.companyName}
              </h1>
              <p className="text-white/90 text-lg font-medium">
                🎯 {safeSession.playerName} • 📅 {safeSession.currentYear}년
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/30 text-lg px-4 py-2 font-bold shadow-lg">
                🃏 카드 {safeSession.cardsPlayed}
              </Badge>
              <div className="text-white/70 text-sm mt-1">
                🏆 목표: 2075년 생존
              </div>
            </div>
          </div>

          {/* Four Meters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'environment', label: '환경', value: safeSession.environmentMeter },
              { key: 'economy', label: '경제', value: safeSession.economyMeter },
              { key: 'social', label: '사회', value: safeSession.socialMeter },
              { key: 'technology', label: '기술', value: safeSession.technologyMeter },
            ].map((meter) => (
              <div key={meter.key} className="bg-white/20 rounded-lg p-3 relative">
                <div className="flex items-center gap-2 mb-2">
                  {getMeterIcon(meter.key)}
                  <span className="text-white font-medium">{meter.label}</span>
                  {lastEffects && showEffects && (
                    <div className="flex items-center gap-1 animate-pulse">
                      {getEffectIcon(lastEffects[meter.key as keyof GameEffects])}
                      <span className={`text-sm font-bold animate-bounce ${
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
                
                {/* Score change animation */}
                {lastEffects && showEffects && lastEffects[meter.key as keyof GameEffects] !== 0 && (
                  <div className={`absolute -top-2 right-0 text-2xl font-bold animate-bounce ${
                    lastEffects[meter.key as keyof GameEffects] > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastEffects[meter.key as keyof GameEffects] > 0 ? '↗️' : '↘️'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Polar Bear Status */}
          <div className="mt-4 flex justify-center">
            <PolarBear 
              environmentScore={safeSession.environmentMeter} 
              showAnimation={showEffects && lastEffects?.environment !== 0}
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal - Mobile Game Style */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto bg-white shadow-2xl">
            {(() => {
              const gameOverDetails = getGameOverDetails(safeSession);
              return (
                <div>
                  {/* Header with gradient background */}
                  <div className={`bg-gradient-to-r ${gameOverDetails.color} text-white p-6 rounded-t-lg`}>
                    <div className="text-center">
                      <div className="text-6xl mb-3">💥</div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{gameOverDetails.title}</h2>
                      <p className="text-white/90 text-lg">{gameOverDetails.subtitle}</p>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-red-600">{safeSession.currentYear}</div>
                        <div className="text-xs text-gray-600">종료 연도</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">{safeSession.cardsPlayed}</div>
                        <div className="text-xs text-gray-600">처리 카드</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-purple-600">{2075 - safeSession.currentYear}</div>
                        <div className="text-xs text-gray-600">생존 실패</div>
                      </div>
                    </div>

                    {/* Environmental Consequences */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                      <h3 className="text-lg font-bold text-red-800 mb-3">🚨 심각한 결과들</h3>
                      <div className="space-y-2">
                        {gameOverDetails.consequences.map((consequence, index) => (
                          <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                            <span className="font-medium">•</span>
                            <span>{consequence}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Message */}
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="text-yellow-800 font-medium leading-relaxed">
                          {gameOverDetails.finalMessage}
                        </p>
                      </div>
                    </div>

                    {/* Encouragement & Retry */}
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-4">
                        <p className="text-lg font-medium text-gray-800 mb-4">
                          🌱 ESG 균형 관리는 어려운 도전입니다!<br/>
                          지구를 구하기 위해 다시 도전해보세요!
                        </p>
                      </div>
                      
                      <Button 
                        onClick={resetGame}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 text-xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 rounded-full"
                      >
                        🚀 지구를 다시 구해보기
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* Main Card Interface - Mobile Game Style */}
      <div className="max-w-2xl mx-auto relative">
        {/* Swipe Hint Animation */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm font-medium animate-pulse">
          ← 스와이프하여 결정하세요 →
        </div>

        <Card className={`bg-white shadow-2xl transition-all duration-300 transform hover:scale-105 ${
          swipeDirection === 'left' ? '-rotate-12 -translate-x-32 scale-95 opacity-70' : 
          swipeDirection === 'right' ? 'rotate-12 translate-x-32 scale-95 opacity-70' : 'hover:shadow-3xl'
        } rounded-xl border-2 border-white/20`}>
          
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

          {/* Decision Options - Mobile Game Style */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Choice - Reject/Conservative */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Button
                  onClick={() => handleSwipe('left')}
                  disabled={makeDecisionMutation.isPending}
                  className="relative w-full h-auto p-5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-col items-start transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl rounded-xl border-2 border-white/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-bold">← 거절/보수적</span>
                  </div>
                  <div className="text-left w-full">
                    <div className="font-semibold mb-1">{currentCard.leftOptionTitle}</div>
                    <div className="text-xs text-red-100 mb-2">{currentCard.leftOptionDescription}</div>
                    
                    {/* Score Preview */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {currentCard.leftEffects && typeof currentCard.leftEffects === 'object' && (
                        <>
                          {(currentCard.leftEffects as any).environment !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.leftEffects as any).environment > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Leaf className="w-3 h-3" />
                              <span>{(currentCard.leftEffects as any).environment > 0 ? '+' : ''}{(currentCard.leftEffects as any).environment}</span>
                            </div>
                          )}
                          {(currentCard.leftEffects as any).economy !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.leftEffects as any).economy > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <DollarSign className="w-3 h-3" />
                              <span>{(currentCard.leftEffects as any).economy > 0 ? '+' : ''}{(currentCard.leftEffects as any).economy}</span>
                            </div>
                          )}
                          {(currentCard.leftEffects as any).social !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.leftEffects as any).social > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Users className="w-3 h-3" />
                              <span>{(currentCard.leftEffects as any).social > 0 ? '+' : ''}{(currentCard.leftEffects as any).social}</span>
                            </div>
                          )}
                          {(currentCard.leftEffects as any).technology !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.leftEffects as any).technology > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Cpu className="w-3 h-3" />
                              <span>{(currentCard.leftEffects as any).technology > 0 ? '+' : ''}{(currentCard.leftEffects as any).technology}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Button>
              </div>

              {/* Right Choice - Accept/Progressive */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Button
                  onClick={() => handleSwipe('right')}
                  disabled={makeDecisionMutation.isPending}
                  className="relative w-full h-auto p-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex-col items-start transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl rounded-xl border-2 border-white/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">수락/진보적 →</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div className="text-left w-full">
                    <div className="font-semibold mb-1">{currentCard.rightOptionTitle}</div>
                    <div className="text-xs text-green-100 mb-2">{currentCard.rightOptionDescription}</div>
                    
                    {/* Score Preview */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {currentCard.rightEffects && typeof currentCard.rightEffects === 'object' && (
                        <>
                          {(currentCard.rightEffects as any).environment !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.rightEffects as any).environment > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Leaf className="w-3 h-3" />
                              <span>{(currentCard.rightEffects as any).environment > 0 ? '+' : ''}{(currentCard.rightEffects as any).environment}</span>
                            </div>
                          )}
                          {(currentCard.rightEffects as any).economy !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.rightEffects as any).economy > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <DollarSign className="w-3 h-3" />
                              <span>{(currentCard.rightEffects as any).economy > 0 ? '+' : ''}{(currentCard.rightEffects as any).economy}</span>
                            </div>
                          )}
                          {(currentCard.rightEffects as any).social !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.rightEffects as any).social > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Users className="w-3 h-3" />
                              <span>{(currentCard.rightEffects as any).social > 0 ? '+' : ''}{(currentCard.rightEffects as any).social}</span>
                            </div>
                          )}
                          {(currentCard.rightEffects as any).technology !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              (currentCard.rightEffects as any).technology > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              <Cpu className="w-3 h-3" />
                              <span>{(currentCard.rightEffects as any).technology > 0 ? '+' : ''}{(currentCard.rightEffects as any).technology}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Button>
              </div>
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