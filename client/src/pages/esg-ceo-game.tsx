import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreChangeIndicator } from "@/components/score-change-indicator";
import { 
  Leaf, 
  DollarSign, 
  Users, 
  Building,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Factory,
  Zap,
  Briefcase,
  UserCheck,
  ShoppingCart,
  Crown,
  AlertTriangle,
  Rocket,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// 플레이어 역할 선택 옵션
const PLAYER_ROLES = [
  { 
    id: "citizen", 
    name: "시민", 
    emoji: "👤", 
    description: "환경을 생각하는 일반 시민",
    icon: UserCheck,
    color: "text-green-600"
  },
  { 
    id: "executive", 
    name: "경영자", 
    emoji: "👔", 
    description: "회사를 이끄는 CEO",
    icon: Briefcase,
    color: "text-blue-600"
  },
  { 
    id: "merchant", 
    name: "상인", 
    emoji: "🏪", 
    description: "사업을 운영하는 상인",
    icon: ShoppingCart,
    color: "text-purple-600"
  },
  { 
    id: "public_servant", 
    name: "공무원", 
    emoji: "👨‍💼", 
    description: "정부에서 일하는 공직자",
    icon: Users,
    color: "text-orange-600"
  }
];

// 게임 시나리오 카드들 (Reigns 스타일)
const GAME_SCENARIOS = [
  {
    id: "carbon_tax",
    type: "npc",
    npc_name: "환경 장관",
    npc_emoji: "🌿",
    text: "새로운 탄소세 도입을 추진하고 있습니다. 지지하시겠습니까?",
    option_left: {
      text: "탄소세 찬성",
      effects: { environment: 10, social: 5, governance: 3, money: -8 }
    },
    option_right: {
      text: "탄소세 반대", 
      effects: { environment: -5, social: -3, governance: -2, money: 8 }
    }
  },
  {
    id: "renewable_energy",
    type: "event",
    npc_name: "재무 담당자",
    npc_emoji: "⚡",
    text: "재생에너지 투자를 늘리자는 제안이 있습니다. 어떻게 하시겠습니까?",
    option_left: {
      text: "재생에너지 투자",
      effects: { environment: 15, social: 3, governance: 2, money: -10 }
    },
    option_right: {
      text: "기존 에너지 유지",
      effects: { environment: -3, social: -1, governance: 1, money: 5 }
    }
  },
  {
    id: "worker_welfare",
    type: "npc", 
    npc_name: "노동조합 대표",
    npc_emoji: "👥",
    text: "직원 복지를 개선해달라는 요구가 있습니다. 받아들이시겠습니까?",
    option_left: {
      text: "복지 개선",
      effects: { environment: 0, social: 12, governance: 5, money: -7 }
    },
    option_right: {
      text: "현상 유지",
      effects: { environment: 0, social: -8, governance: -3, money: 3 }
    }
  },
  {
    id: "pollution_incident",
    type: "event",
    npc_name: "언론 기자", 
    npc_emoji: "📺",
    text: "공장에서 오염 물질이 유출되었습니다. 어떻게 대응하시겠습니까?",
    option_left: {
      text: "즉시 공개 사과",
      effects: { environment: 5, social: 8, governance: 10, money: -15 }
    },
    option_right: {
      text: "조용히 처리",
      effects: { environment: -10, social: -12, governance: -15, money: 5 }
    }
  },
  {
    id: "green_product",
    type: "npc",
    npc_name: "제품 개발팀장",
    npc_emoji: "🔬", 
    text: "친환경 제품 개발에 예산을 투입하자는 제안입니다. 승인하시겠습니까?",
    option_left: {
      text: "친환경 제품 개발",
      effects: { environment: 12, social: 6, governance: 4, money: -12 }
    },
    option_right: {
      text: "기존 제품 유지",
      effects: { environment: -2, social: -1, governance: 0, money: 4 }
    }
  },
  {
    id: "carbon_reduction",
    type: "event",
    npc_name: "국제기구 대표",
    npc_emoji: "🌍",
    text: "탄소 배출량을 30% 줄이라는 국제 압박이 있습니다. 따르시겠습니까?",
    option_left: {
      text: "탄소 감축 실행",
      effects: { environment: 20, social: 4, governance: 8, money: -18 }
    },
    option_right: {
      text: "점진적 감축",
      effects: { environment: 5, social: 0, governance: -3, money: -2 }
    }
  }
];

// 환경 데이터 계산 함수 (실제 과학 데이터 기반)
const calculateEnvironmentalImpact = (environmentScore: number, years: number) => {
  // 환경 점수에 따른 영향도 계산 (100점이면 최소 영향, 0점이면 최대 영향)
  const impactMultiplier = (100 - environmentScore) / 100;
  const baseMultiplier = 0.2 + (impactMultiplier * 0.8); // 최소 20% ~ 최대 100% 영향
  
  return {
    // CO2 배출량 증가 - IPCC 데이터 기반
    // 기본: 연간 1.1% 증가 (2024 기준)
    // 최악: 연간 4.2% 증가 (극단적 시나리오)
    carbonIncrease: Math.round(years * (1.1 + (3.1 * impactMultiplier))),
    
    // 해수면 상승 - NOAA 데이터 기반
    // 기본: 연간 3.4mm (2024 측정치)
    // 최악: 연간 6.4mm (극단적 시나리오)
    seaLevelRise: Math.round((years * (3.4 + (3.0 * impactMultiplier))) * 10) / 10,
    
    // 지구 평균 온도 - IPCC AR6 보고서 기반
    // 기본: 연간 0.1°C (현재 추세)
    // 최악: 연간 0.2°C (극단적 시나리오)
    temperatureIncrease: Math.round((years * (0.1 + (0.1 * impactMultiplier))) * 10) / 10,
    
    // CO2 농도 - Mauna Loa 관측소 데이터 기반
    // 기본: 연간 2.4ppm 증가 (2024 측정치)
    // 최악: 연간 5.0ppm 증가 (극단적 시나리오)
    co2Level: Math.round(422.5 + (years * (2.4 + (2.6 * baseMultiplier)))),
  };
};

// 엔딩 시나리오들
interface EndingScenario {
  title: string;
  description: string;
  ending: string;
  color: string;
  icon?: string;
  icons?: string[];
  bgEffect?: string;
}

const ENDING_SCENARIOS: Record<string, EndingScenario> = {
  success_2077: {
    title: "2077년까지 생존 성공!",
    description: "축하드려요! 지구를 잘 지키셨네요!",
    ending: "화성으로 안 이주해도 될 것 같아요!",
    color: "from-green-400 to-blue-500",
    icon: "🐸",
    bgEffect: "particles-success"
  },
  extreme_environment: {
    title: "극단적 환경주의",
    description: "과도한 환경 규제로 경제와 사회가 마비되었습니다.",
    ending: "완벽한 자연은 남았지만, 인간 사회는 붕괴되었습니다.",
    color: "from-green-700 to-green-900",
    icon: "🌲",
    icons: ["🌲", "🌿", "🍃"],
    bgEffect: "particles-nature"
  },
  game_over: {
    title: "지구 포기 선언 - 화성 이주 프로젝트 가동",
    description: "기후 변화로 지구가 더 이상 거주 불가능해졌습니다.",
    ending: "SpaceX의 Starship 프로그램이 마지막 희망이 되었습니다. 2026년 화성 식민지 1차 미션에 탑승합니다.",
    color: "from-red-950 to-red-900",
    icon: "🚀",
    icons: ["🚀", "🔴"]
  },
  social_0: {
    title: "사회적 신뢰 붕괴",
    description: "시민들의 신뢰를 완전히 잃어 더 이상 활동할 수 없게 되었습니다.",
    ending: "모든 사회적 관계가 단절되었습니다. 고립된 삶을 살아가야 합니다.",
    color: "from-gray-500 to-gray-700"
  },
  social_100: {
    title: "복지 과잉의 역설",
    description: "무제한 복지로 사회 생산성이 완전히 멈췄습니다.",
    ending: "모두가 만족했지만, 아무도 일하지 않는 사회가 되었습니다.",
    color: "from-blue-700 to-blue-900"
  },
  governance_0: {
    title: "부패와 윤리적 파산",
    description: "거버넌스가 무너져 모든 신뢰성을 잃었습니다.",
    ending: "수갑을 차고 법정으로 향하는 길... 모든 것을 잃었습니다.",
    color: "from-red-600 to-red-800"
  },
  governance_100: {
    title: "과도한 통제의 함정",
    description: "완벽한 규제로 모든 혁신과 창의성이 사라졌습니다.",
    ending: "부패는 없지만, 생명력도 없는 조직이 되었습니다.",
    color: "from-purple-700 to-purple-900"
  },
  money_0: {
    title: "경제적 파산",
    description: "재정이 완전히 고갈되어 더 이상 운영할 수 없습니다.",
    ending: "빈 사무실에 혼자 남겨졌습니다. 모든 것이 끝났습니다.",
    color: "from-gray-600 to-black"
  },
  money_100: {
    title: "탐욕의 종착역",
    description: "무한한 이익 추구로 다른 모든 가치를 파괴했습니다.",
    ending: "금고는 가득하지만, 세상은 폐허가 되었습니다.",
    color: "from-yellow-700 to-yellow-900"
  },
  success: {
    title: "균형잡힌 성공",
    description: "모든 지표를 균형있게 유지하며 지속 가능한 미래를 만들었습니다!",
    ending: "지구는 푸르게 빛나고, 모든 사람들이 행복한 미래를 만들어냈습니다.",
    color: "from-green-400 to-blue-500"
  }
};

export default function ESGCEOGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof PLAYER_ROLES[0] | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [year, setYear] = useState(2025);
  const [scores, setScores] = useState({
    environment: 50,  // E: 환경
    social: 50,       // S: 사회  
    governance: 50,   // G: 지배구조
    money: 50         // M: 재정
  });
  const [prevScores, setPrevScores] = useState(scores);
  const [gameOver, setGameOver] = useState(false);
  const [endingType, setEndingType] = useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [lastChoice, setLastChoice] = useState<'left' | 'right' | null>(null);

  const handleStartGame = () => {
    if (selectedRole && playerName.trim()) {
      setGameStarted(true);
    }
  };

  const handleDecision = (choice: 'left' | 'right') => {
    const scenario = GAME_SCENARIOS[currentScenario];
    const effects = choice === 'left' ? scenario.option_left.effects : scenario.option_right.effects;
    
    // 현재 점수를 이전 점수로 저장
    setPrevScores(scores);
    
    // 점수 업데이트
    const newScores = {
      environment: Math.max(0, Math.min(100, scores.environment + effects.environment)),
      social: Math.max(0, Math.min(100, scores.social + effects.social)),
      governance: Math.max(0, Math.min(100, scores.governance + effects.governance)),
      money: Math.max(0, Math.min(100, scores.money + effects.money))
    };

    setScores(newScores);
    setLastChoice(choice);
    setShowEffect(true);

    // 효과 표시 후 다음 턴으로
    setTimeout(() => {
      setShowEffect(false);
      setCurrentScenario(prev => (prev + 1) % GAME_SCENARIOS.length);
      setYear(prev => prev + 1);
      
      // 게임오버 체크
      if (year >= 2077) {
        // 2077년까지 생존 성공
        setEndingType('success_2077');
        setTimeout(() => setGameOver(true), 500);
      } else if (newScores.environment === 100) {
        // 환경 100점 특별 엔딩
        setEndingType('extreme_environment');
        setTimeout(() => setGameOver(true), 500);
      } else if (
        [newScores.environment, newScores.social, newScores.governance, newScores.money].some(
          (score) => score <= 0 || score >= 100
        )
      ) {
        // 기본 게임오버
        setEndingType('game_over');
        setTimeout(() => setGameOver(true), 500);
      }
    }, 3000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setSelectedRole(null);
    setPlayerName("");
    setCurrentScenario(0);
    setYear(2025);
    setScores({ environment: 50, social: 50, governance: 50, money: 50 });
    setGameOver(false);
    setEndingType(null);
    setShowEffect(false);
    setLastChoice(null);
  };

  // 역할 선택 화면
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* 타이틀 */}
          <div className="text-center mb-12">
            <div className="relative">
              <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Don't Go Mars!
              </h1>
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-4xl">🌍</div>
                <div className="text-2xl text-red-400">VS</div>
                <div className="text-4xl">🔴</div>
              </div>
            </div>
            <p className="text-xl text-blue-200 mb-4">
              당신의 선택이 지구의 미래와 당신의 커리어를 결정합니다
            </p>
            <p className="text-lg text-green-300">
              환경(E) • 사회(S) • 지배구조(G) • 재정(M)을 균형있게 유지하세요
            </p>
          </div>

          {/* 이름 입력 */}
          <Card className="mb-8 bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-white text-xl">이름을 입력하세요</CardTitle>
            </CardHeader>
            <CardContent>
              <Input 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="플레이어 이름"
                className="text-center text-lg bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </CardContent>
          </Card>

          {/* 역할 선택 */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-center mb-8 text-white">
              당신의 역할을 선택하세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLAYER_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <Card 
                    key={role.id}
                    className={`cursor-pointer transition-all hover:shadow-2xl hover:scale-105 bg-white/10 backdrop-blur border-2 ${
                      selectedRole?.id === role.id 
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-yellow-400/50' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <CardContent className="p-8 text-center">
                      <Icon className={`w-16 h-16 mx-auto mb-6 ${role.color}`} />
                      <div className="text-4xl mb-4">{role.emoji}</div>
                      <h3 className="text-2xl font-bold mb-3 text-white">{role.name}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="text-center">
            <Button 
              onClick={handleStartGame}
              disabled={!selectedRole || !playerName.trim()}
              size="lg"
              className="px-16 py-4 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-xl"
            >
              <Rocket className="w-6 h-6 mr-3" />
              게임 시작
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 게임오버 화면
  if (gameOver && endingType) {
    const ending = ENDING_SCENARIOS[endingType as keyof typeof ENDING_SCENARIOS] || ENDING_SCENARIOS.success;
    const yearsPlayed = year - 2025;
    const environmentalData = calculateEnvironmentalImpact(scores.environment, yearsPlayed);
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${ending.color} p-4 flex items-center justify-center`}>
        <Card className="max-w-4xl w-full bg-black/80 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-4xl text-white mb-4">
              {ending.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8">
            <div className="text-center mb-8">
              {endingType === 'game_over' ? (
                <div className="flex justify-center items-center gap-8 mb-6">
                  <div className="text-6xl">🚀</div>
                  <div className="text-6xl">🔴</div>
                </div>
              ) : (
                <div className="text-8xl mb-6 animate-bounce">
                  {ending.icon}
                </div>
              )}
              
              <div className="mb-4 text-2xl text-white font-bold">
                {ending.title}
              </div>
              
              <div className={`text-xl ${
                endingType === 'game_over' 
                  ? 'text-red-300' 
                  : 'text-green-300'
              } leading-relaxed mb-4`}>
                {ending.description}
              </div>
              
              <div className={`text-lg ${
                endingType === 'game_over'
                  ? 'text-yellow-300'
                  : 'text-blue-200'
              } italic leading-relaxed`}>
                "{ending.ending}"
              </div>
            </div>

            {/* 환경 데이터 영향 분석 */}
            {yearsPlayed > 0 && (
              <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🌡️ 실제 환경 데이터 기반 영향 분석</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-white/90">
                  <div className="bg-red-500/20 p-3 rounded border border-red-400/30">
                    <p className="font-semibold">탄소 배출량 증가</p>
                    <p className="text-lg text-red-300">+{environmentalData.carbonIncrease}%</p>
                    <p className="text-xs text-red-200 mt-1">
                      (2024년 기준 연간 0.8% → 최악 4.2%)
                    </p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded border border-blue-400/30">
                    <p className="font-semibold">해수면 상승</p>
                    <p className="text-lg text-blue-300">+{environmentalData.seaLevelRise}cm</p>
                    <p className="text-xs text-blue-200 mt-1">
                      (현재 3.4mm/년 → 최악 6.4mm/년)
                    </p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded border border-orange-400/30">
                    <p className="font-semibold">지구 평균 온도</p>
                    <p className="text-lg text-orange-300">+{environmentalData.temperatureIncrease}°C</p>
                    <p className="text-xs text-orange-200 mt-1">
                      (2024년 1.6°C → 한계점 2.0°C)
                    </p>
                  </div>
                  <div className="bg-gray-500/20 p-3 rounded border border-gray-400/30">
                    <p className="font-semibold">CO₂ 농도</p>
                    <p className="text-lg text-gray-300">{environmentalData.co2Level}ppm</p>
                    <p className="text-xs text-gray-200 mt-1">
                      (2024년 422.5ppm → 위험 450ppm)
                    </p>
                  </div>
                </div>
                
                {/* 화성 이주 관련 메시지 */}
                {endingType?.includes('environment_0') && (
                  <div className="mt-4 p-4 bg-red-500/30 rounded border border-red-400 text-center">
                    <h4 className="font-bold text-red-200 mb-2">🚀 화성 이주 프로젝트 활성화</h4>
                    <p className="text-sm text-red-100">
                      SpaceX 2026년 화성 미션 준비 완료. 지구 복구 불가능 판정.
                      <br />화성 테라포밍 완료까지 500년 소요 예정.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 최종 점수 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
              {Object.entries(scores).map(([key, value]) => {
                const icons = {
                  environment: { icon: Leaf, label: "환경", color: "text-green-400" },
                  social: { icon: Users, label: "사회", color: "text-blue-400" },
                  governance: { icon: Building, label: "지배구조", color: "text-purple-400" },
                  money: { icon: DollarSign, label: "재정", color: "text-yellow-400" }
                };
                const { icon: Icon, label, color } = icons[key as keyof typeof icons];
                
                return (
                  <div key={key} className="text-center bg-white/10 p-4 rounded-lg">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}/100</p>
                  </div>
                );
              })}
            </div>

            <div className="text-white/70">
              <p>최종 연도: {year}</p>
              <p>생존 기간: {yearsPlayed}년</p>
            </div>

            <Button onClick={resetGame} size="lg" className="px-12 py-3 text-lg bg-white/20 hover:bg-white/30 text-white border-white/40">
              <RotateCcw className="w-5 h-5 mr-3" />
              다시 시작
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 게임 진행 화면 (Reigns 스타일)
  const scenario = GAME_SCENARIOS[currentScenario];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 상단 HUD */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">
              {playerName} ({selectedRole?.name})
            </h1>
            <p className="text-lg text-blue-200">
              {year}년 • 턴 {currentScenario + 1}
            </p>
          </div>

          {/* 4개 지표 HUD */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {Object.entries(scores).map(([key, value]) => {
              const configs = {
                environment: { icon: Leaf, label: "환경", color: "text-green-400", bg: "bg-green-500" },
                social: { icon: Users, label: "사회", color: "text-blue-400", bg: "bg-blue-500" },
                governance: { icon: Building, label: "지배구조", color: "text-purple-400", bg: "bg-purple-500" },
                money: { icon: DollarSign, label: "재정", color: "text-yellow-400", bg: "bg-yellow-500" }
              };
              const config = configs[key as keyof typeof configs];
              const Icon = config.icon;
              
              // 위험 신호 계산
              const isDangerous = value <= 15 || value >= 85;
              const isCritical = value <= 5 || value >= 95;
              
              return (
                <div key={key} className={`relative backdrop-blur rounded-lg p-3 text-center border-2 transition-all ${
                  isCritical 
                    ? 'bg-red-500/30 border-red-400 animate-pulse' 
                    : isDangerous 
                    ? 'bg-yellow-500/20 border-yellow-400'
                    : 'bg-white/10 border-white/20'
                }`}>
                  {/* 점수 변화 애니메이션 */}
                  <AnimatePresence>
                    {showEffect && (value - prevScores[key as keyof typeof scores] !== 0) && (
                      <ScoreChangeIndicator 
                        value={value - prevScores[key as keyof typeof scores]}
                        className={config.color}
                      />
                    )}
                  </AnimatePresence>

                  <Icon className={`w-6 h-6 mx-auto mb-1 ${config.color}`} />
                  <p className="text-xs text-white/80">{config.label}</p>
                  <motion.p 
                    className="text-lg font-bold text-white"
                    initial={false}
                    animate={{ scale: showEffect ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {value}<span className="text-sm opacity-60">/100</span>
                  </motion.p>
                  
                  {/* 위험 상태 표시 */}
                  {isCritical && (
                    <p className="text-xs text-red-300 font-bold">
                      {value <= 5 ? '위험!' : '과도!'}
                    </p>
                  )}
                  {isDangerous && !isCritical && (
                    <p className="text-xs text-yellow-300 font-bold">주의</p>
                  )}
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-500' : isDangerous ? 'bg-yellow-500' : config.bg
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 중앙 카드 (Reigns 스타일) */}
        <div className="relative">
          <Card className="bg-white/95 backdrop-blur border-2 border-white/30 shadow-2xl min-h-[400px] flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">{scenario.npc_emoji}</div>
              <CardTitle className="text-xl text-gray-800">
                {scenario.npc_name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col justify-center px-8">
              <p className="text-lg text-gray-700 text-center leading-relaxed mb-8">
                {scenario.text}
              </p>

              {/* 효과 표시 */}
              {showEffect && lastChoice && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-blue-800 font-semibold">
                    선택 결과가 반영되었습니다!
                  </p>
                </div>
              )}

              {/* 선택 버튼들 */}
              {!showEffect && (
                <div className="space-y-4">
                  <Button 
                    onClick={() => handleDecision('left')}
                    className="w-full h-auto py-6 px-6 bg-green-500 hover:bg-green-600 text-white border-0"
                    disabled={showEffect}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        <span className="text-center font-bold">{scenario.option_left.text}</span>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleDecision('right')}
                    className="w-full h-auto py-6 px-6 bg-red-500 hover:bg-red-600 text-white border-0"
                    disabled={showEffect}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-center">
                        <span className="text-center font-bold">{scenario.option_right.text}</span>
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-6">
          <Button 
            onClick={resetGame} 
            variant="ghost" 
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            게임 재시작
          </Button>
        </div>
      </div>
    </div>
  );
}