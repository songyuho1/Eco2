import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MiniChart from "@/components/mini-chart";
import { 
  Leaf, 
  DollarSign, 
  Users, 
  Cpu,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Globe,
  Building,
  Factory,
  Zap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { esgScenarios, GAME_BALANCE, GAME_OVER_SCENARIOS } from "@/lib/game-data";
import type { ReignsGameSession } from "@shared/schema";

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

// Industry selection options
const INDUSTRIES = [
  { id: "technology", name: "기술", emoji: "💻", description: "혁신적인 기술 기업" },
  { id: "manufacturing", name: "제조업", emoji: "🏭", description: "전통적인 제조 기업" },
  { id: "energy", name: "에너지", emoji: "⚡", description: "에너지 인프라 기업" },
  { id: "finance", name: "금융", emoji: "💰", description: "금융 서비스 기업" }
];

export default function ESGCEOGame() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [lastEffects, setLastEffects] = useState<GameEffects | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [cardTransition, setCardTransition] = useState<'enter' | 'exit' | null>(null);
  
  // Industry selection
  const [showIndustrySelection, setShowIndustrySelection] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<typeof INDUSTRIES[0] | null>(null);
  const [ceoName, setCeoName] = useState("");

  const queryClient = useQueryClient();

  // Create new game session
  const createSessionMutation = useMutation({
    mutationFn: async (industry: string) => {
      return await apiRequest("/api/reigns/sessions", {
        method: "POST",
        body: JSON.stringify({
          playerName: ceoName || "CEO",
          companyName: `${selectedIndustry?.name} Corp`,
          currentYear: 2025,
          environmentMeter: GAME_BALANCE.STARTING_VALUES.environment,
          economyMeter: GAME_BALANCE.STARTING_VALUES.economy,
          socialMeter: GAME_BALANCE.STARTING_VALUES.social,
          technologyMeter: GAME_BALANCE.STARTING_VALUES.technology,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (session: any) => {
      setSessionId(session.id);
      setShowIndustrySelection(false);
    }
  });

  // Get current session data
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['/api/reigns/sessions', sessionId],
    enabled: !!sessionId && !showGameOver,
  });

  // Get next scenario card
  const { data: nextScenario, refetch: refetchScenario } = useQuery({
    queryKey: ['/api/reigns/sessions', sessionId, 'next-card'],
    enabled: !!sessionId && !showGameOver,
    refetchInterval: false,
  });

  // Make decision mutation
  const makeDecisionMutation = useMutation({
    mutationFn: async ({ decision }: { decision: 'left' | 'right' }): Promise<DecisionResponse> => {
      return await apiRequest(`/api/reigns/sessions/${sessionId}/decisions/${currentScenario?.id}`, {
        method: "POST",
        body: JSON.stringify({ decision }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (response: DecisionResponse) => {
      setLastEffects(response.effects);
      setShowEffects(true);
      
      if (response.gameOver) {
        setTimeout(() => {
          setShowGameOver(true);
        }, 2500);
      }
      
      queryClient.setQueryData(['/api/reigns/sessions', sessionId], response.session);
      
      setTimeout(() => {
        setShowEffects(false);
        if (!response.gameOver) {
          refetchScenario();
        }
      }, 2500);
    }
  });

  // Set current scenario when we get next scenario
  useEffect(() => {
    if (nextScenario) {
      setCurrentScenario(nextScenario);
      setCardTransition('enter');
      setTimeout(() => {
        setCardTransition(null);
      }, 300);
    }
  }, [nextScenario]);

  // Auto-create session when industry is selected
  useEffect(() => {
    if (selectedIndustry && ceoName && !showIndustrySelection) {
      createSessionMutation.mutate(selectedIndustry.id);
    }
  }, [selectedIndustry, ceoName, showIndustrySelection]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (makeDecisionMutation.isPending || !currentScenario) return;
    
    setSwipeDirection(direction);
    
    setTimeout(() => {
      makeDecisionMutation.mutate({ decision: direction });
      setSwipeDirection(null);
    }, 300);
  };

  const handleRestart = () => {
    setSessionId(null);
    setCurrentScenario(null);
    setShowEffects(false);
    setLastEffects(null);
    setShowGameOver(false);
    setShowIndustrySelection(true);
    setSelectedIndustry(null);
    setCeoName("");
  };

  const safeSession = session || {
    id: '',
    playerName: ceoName || 'CEO',
    companyName: `${selectedIndustry?.name || '기술'} Corp`,
    currentYear: 2025,
    cardsPlayed: 0,
    environmentMeter: 50,
    economyMeter: 50,
    socialMeter: 50,
    technologyMeter: 50,
    isGameOver: false,
    deathReason: null,
    meterHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const getGameOverDetails = (session: any) => {
    if (session.environmentMeter <= 0) return GAME_OVER_SCENARIOS.ENVIRONMENT_COLLAPSE;
    if (session.economyMeter <= 0) return GAME_OVER_SCENARIOS.ECONOMY_COLLAPSE;
    if (session.socialMeter <= 0) return GAME_OVER_SCENARIOS.SOCIAL_COLLAPSE;
    if (session.technologyMeter <= 0) return GAME_OVER_SCENARIOS.TECHNOLOGY_COLLAPSE;
    if (session.currentYear >= GAME_BALANCE.TARGET_YEAR) return GAME_OVER_SCENARIOS.SUCCESS;
    return GAME_OVER_SCENARIOS.ENVIRONMENT_COLLAPSE;
  };

  // Industry Selection Screen
  if (showIndustrySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 p-4 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 -right-20 w-60 h-60 bg-purple-400/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400/10 rounded-full animate-pulse delay-500"></div>
        </div>

        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h1 className="text-3xl font-bold mb-2">ESG CEO 시뮬레이션</h1>
            <p className="text-blue-100 text-lg font-medium">Don't Go Mars!</p>
            <p className="text-blue-200 text-sm mt-2">당신의 선택이 지구의 미래와 당신의 커리어를 결정합니다</p>
          </div>

          <div className="p-6 space-y-6">
            {/* CEO Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEO 이름</label>
              <input
                type="text"
                value={ceoName}
                onChange={(e) => setCeoName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">산업 분야 선택</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INDUSTRIES.map((industry) => (
                  <Card 
                    key={industry.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${
                      selectedIndustry?.id === industry.id 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{industry.emoji}</div>
                      <h3 className="font-bold text-lg text-gray-800">{industry.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{industry.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded">
              <h3 className="font-bold text-orange-800 mb-2">🎯 게임 규칙</h3>
              <div className="text-sm text-orange-700 space-y-1">
                <p>• 환경(E), 사회(S), 지배구조(G), 재정(M) 4개 지표를 균형있게 유지하세요</p>
                <p>• 어떤 지표든 0점 또는 100점에 도달하면 게임 오버</p>
                <p>• 목표: 2075년까지 생존하며 지속가능한 경영 달성</p>
                <p>• 실제 ESG 데이터와 기후 과학을 기반으로 한 시뮬레이션</p>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              onClick={() => {
                if (selectedIndustry && ceoName.trim()) {
                  setShowIndustrySelection(false);
                }
              }}
              disabled={!selectedIndustry || !ceoName.trim() || createSessionMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {createSessionMutation.isPending ? '게임 준비 중...' : '🚀 CEO 시작하기'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!currentScenario && !showGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-xl font-medium">시나리오 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 -right-20 w-60 h-60 bg-purple-400/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header with Dashboard - CEO Style */}
      <div className="max-w-6xl mx-auto mb-6 relative z-10">
        <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="text-white flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                🏢 {safeSession.companyName}
              </h1>
              <p className="text-white/90 text-lg font-medium">
                {selectedIndustry?.emoji} CEO {safeSession.playerName} • 📅 {safeSession.currentYear}년
              </p>
            </div>
            
            <div className="text-right flex-1">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/30 text-lg px-4 py-2 font-bold shadow-lg">
                📋 결정 {safeSession.cardsPlayed}회
              </Badge>
              <div className="text-white/70 text-sm mt-1">
                🏆 목표: {GAME_BALANCE.TARGET_YEAR}년까지 생존
              </div>
            </div>
          </div>

          {/* ESG + Money Metrics - Mini Charts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniChart 
              value={safeSession.environmentMeter}
              label="환경 (E)"
              icon={<Leaf className="w-4 h-4 text-green-400" />}
              showChange={showEffects ? lastEffects?.environment || 0 : 0}
              color="green"
            />
            <MiniChart 
              value={safeSession.socialMeter}
              label="사회 (S)"
              icon={<Users className="w-4 h-4 text-blue-400" />}
              showChange={showEffects ? lastEffects?.social || 0 : 0}
              color="blue"
            />
            <MiniChart 
              value={safeSession.technologyMeter}
              label="지배구조 (G)"
              icon={<Cpu className="w-4 h-4 text-purple-400" />}
              showChange={showEffects ? lastEffects?.technology || 0 : 0}
              color="purple"
            />
            <MiniChart 
              value={safeSession.economyMeter}
              label="재정 (M)"
              icon={<DollarSign className="w-4 h-4 text-orange-400" />}
              showChange={showEffects ? lastEffects?.economy || 0 : 0}
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto bg-white shadow-2xl">
            {(() => {
              const gameOverDetails = getGameOverDetails(safeSession);
              return (
                <div>
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-lg">
                    <div className="text-center">
                      <div className="text-6xl mb-3">
                        {gameOverDetails.outcome === 'success' ? '🏆' : '💥'}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{gameOverDetails.title}</h2>
                      <p className="text-white/90 text-lg">{gameOverDetails.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-red-600">{safeSession.currentYear}</div>
                        <div className="text-xs text-gray-600">종료 연도</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">{safeSession.cardsPlayed}</div>
                        <div className="text-xs text-gray-600">총 결정</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-purple-600">
                          {gameOverDetails.outcome === 'success' ? '성공' : '실패'}
                        </div>
                        <div className="text-xs text-gray-600">최종 결과</div>
                      </div>
                    </div>

                    <div className={`${
                      gameOverDetails.outcome === 'success' 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : 'bg-red-50 border-l-4 border-red-500'
                    } p-4 mb-6`}>
                      <h3 className={`text-lg font-bold mb-3 ${
                        gameOverDetails.outcome === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {gameOverDetails.outcome === 'success' ? '🎉 성과' : '🚨 결과'}
                      </h3>
                      <div className="space-y-2">
                        {gameOverDetails.consequences.map((consequence: string, index: number) => (
                          <div key={index} className={`text-sm flex items-start gap-2 ${
                            gameOverDetails.outcome === 'success' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            <span className="font-medium">•</span>
                            <span>{consequence}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleRestart}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg font-bold hover:from-blue-700 hover:to-purple-700"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      새 게임 시작
                    </Button>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* Main Decision Card */}
      {currentScenario && !showGameOver && (
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Swipe instruction */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm font-medium animate-pulse">
            ← 스와이프하여 결정하세요 →
          </div>

          <Card className={`bg-white shadow-2xl transition-all duration-500 transform hover:scale-105 ${
            cardTransition === 'exit' ? 'scale-75 opacity-0 -translate-y-10' :
            cardTransition === 'enter' ? 'scale-110 opacity-90' :
            swipeDirection === 'left' ? '-rotate-12 -translate-x-40 scale-90 opacity-60' : 
            swipeDirection === 'right' ? 'rotate-12 translate-x-40 scale-90 opacity-60' : 'hover:shadow-3xl'
          } rounded-xl border-2 border-white/20`}>
            
            {/* Character Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{currentScenario.characterEmoji}</div>
                <div>
                  <h3 className="font-bold text-lg">{currentScenario.characterName}</h3>
                  <p className="text-blue-100 text-sm">{currentScenario.characterRole}</p>
                </div>
              </div>
            </div>

            {/* Scenario Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentScenario.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{currentScenario.description}</p>

              {/* Educational Data */}
              {currentScenario.educationalData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 text-lg">📊</div>
                    <div>
                      <p className="text-blue-800 font-medium text-sm mb-1">{currentScenario.educationalData.fact}</p>
                      <p className="text-blue-600 text-xs">출처: {currentScenario.educationalData.source}</p>
                      {currentScenario.educationalData.realWorldExample && (
                        <p className="text-blue-700 text-xs mt-2 italic">
                          💡 {currentScenario.educationalData.realWorldExample}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Option */}
                <Button
                  onClick={() => handleSwipe('left')}
                  disabled={makeDecisionMutation.isPending}
                  className="h-auto p-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex flex-col items-start gap-2 border-2 border-transparent hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 w-full">
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-left">{currentScenario.leftOption?.title}</span>
                  </div>
                  <p className="text-sm text-left text-white/90 leading-relaxed">
                    {currentScenario.leftOption?.description}
                  </p>
                  {currentScenario.leftOption?.consequences && (
                    <p className="text-xs text-green-100 italic text-left mt-1">
                      💡 {currentScenario.leftOption.consequences}
                    </p>
                  )}
                </Button>

                {/* Right Option */}
                <Button
                  onClick={() => handleSwipe('right')}
                  disabled={makeDecisionMutation.isPending}
                  className="h-auto p-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex flex-col items-start gap-2 border-2 border-transparent hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-bold text-left flex-1">{currentScenario.rightOption?.title}</span>
                    <ChevronRight className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-left text-white/90 leading-relaxed">
                    {currentScenario.rightOption?.description}
                  </p>
                  {currentScenario.rightOption?.consequences && (
                    <p className="text-xs text-orange-100 italic text-left mt-1">
                      💡 {currentScenario.rightOption.consequences}
                    </p>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Effects Display */}
          {showEffects && lastEffects && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
              <div className="bg-black/80 text-white p-8 rounded-xl text-center animate-pulse backdrop-blur-md">
                <div className="text-4xl mb-4">
                  {Object.values(lastEffects).some(v => v > 0) ? '📈' : '📉'}
                </div>
                <h3 className="text-2xl font-bold mb-4">결정 결과</h3>
                <div className="grid grid-cols-2 gap-4 text-lg">
                  {lastEffects.environment !== 0 && (
                    <div className={`flex items-center gap-2 ${lastEffects.environment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <Leaf className="w-5 h-5" />
                      <span>환경: {lastEffects.environment > 0 ? '+' : ''}{lastEffects.environment}</span>
                    </div>
                  )}
                  {lastEffects.social !== 0 && (
                    <div className={`flex items-center gap-2 ${lastEffects.social > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <Users className="w-5 h-5" />
                      <span>사회: {lastEffects.social > 0 ? '+' : ''}{lastEffects.social}</span>
                    </div>
                  )}
                  {lastEffects.technology !== 0 && (
                    <div className={`flex items-center gap-2 ${lastEffects.technology > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <Cpu className="w-5 h-5" />
                      <span>지배구조: {lastEffects.technology > 0 ? '+' : ''}{lastEffects.technology}</span>
                    </div>
                  )}
                  {lastEffects.economy !== 0 && (
                    <div className={`flex items-center gap-2 ${lastEffects.economy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <DollarSign className="w-5 h-5" />
                      <span>재정: {lastEffects.economy > 0 ? '+' : ''}{lastEffects.economy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}