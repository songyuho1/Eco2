import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  Cpu
} from "lucide-react";

// ESG CEO 직업 선택 옵션 - 파일의 제목들을 반영
const INDUSTRIES = [
  { id: "technology", name: "기술", emoji: "💻", description: "혁신 기술 기업", icon: Cpu },
  { id: "manufacturing", name: "제조업", emoji: "🏭", description: "친환경 제조 기업", icon: Factory },
  { id: "energy", name: "에너지", emoji: "⚡", description: "신재생에너지 기업", icon: Zap },
  { id: "finance", name: "금융", emoji: "💰", description: "ESG 투자 금융기업", icon: Briefcase }
];

// 파일에서 가져온 시나리오 제목들과 선택지
const SCENARIOS = [
  {
    title: "탄소중립 목표 설정 압박",
    description: "투자자들과 정부가 2030년 탄소중립 목표를 요구하고 있습니다.",
    leftChoice: "2030 탄소중립 선언",
    rightChoice: "점진적 전환 계획"
  },
  {
    title: "재생에너지 투자 결정", 
    description: "공장 전력을 재생에너지로 전환할지 결정해야 합니다.",
    leftChoice: "재생에너지 100% 전환",
    rightChoice: "기존 전력 유지"
  },
  {
    title: "직원 복지 프로그램 확대",
    description: "코로나 이후 직원들의 정신건강과 워라밸 요구가 증가했습니다.",
    leftChoice: "포괄적 복지 확대",
    rightChoice: "현 수준 유지"
  },
  {
    title: "지역사회 공헌 활동",
    description: "지역사회를 위한 사회공헌 예산을 늘려달라는 요청이 있습니다.",
    leftChoice: "사회공헌 예산 확대",
    rightChoice: "기존 수준 유지"
  },
  {
    title: "공급망 ESG 관리",
    description: "협력사들의 ESG 수준을 관리하기 위한 시스템이 필요합니다.",
    leftChoice: "ESG 평가 시스템 도입",
    rightChoice: "기존 방식 유지"
  },
  {
    title: "친환경 제품 개발",
    description: "환경친화적인 신제품 개발에 대한 투자가 필요합니다.",
    leftChoice: "친환경 제품 개발",
    rightChoice: "기존 제품 유지"
  }
];

export default function ESGCEOGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<typeof INDUSTRIES[0] | null>(null);
  const [ceoName, setCeoName] = useState("");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [scores, setScores] = useState({
    environment: 50,
    economy: 50, 
    social: 50,
    governance: 50
  });
  const [year, setYear] = useState(2025);
  const [gameOver, setGameOver] = useState(false);

  const handleStartGame = () => {
    if (selectedIndustry && ceoName.trim()) {
      setGameStarted(true);
    }
  };

  const handleDecision = (choice: 'left' | 'right') => {
    // 선택에 따른 ESG 점수 변화
    const effects = choice === 'left' 
      ? { environment: 10, economy: -5, social: 5, governance: 3 }
      : { environment: -3, economy: 8, social: -2, governance: -1 };
    
    setScores(prev => ({
      environment: Math.max(0, Math.min(100, prev.environment + effects.environment)),
      economy: Math.max(0, Math.min(100, prev.economy + effects.economy)),
      social: Math.max(0, Math.min(100, prev.social + effects.social)),
      governance: Math.max(0, Math.min(100, prev.governance + effects.governance))
    }));
    
    setCurrentScenario(prev => (prev + 1) % SCENARIOS.length);
    setYear(prev => prev + 1);
    
    // 게임오버 체크 - 점수가 0 이하가 되거나 2075년 도달
    const newScores = {
      environment: Math.max(0, Math.min(100, scores.environment + effects.environment)),
      economy: Math.max(0, Math.min(100, scores.economy + effects.economy)),
      social: Math.max(0, Math.min(100, scores.social + effects.social)),
      governance: Math.max(0, Math.min(100, scores.governance + effects.governance))
    };
    
    if (Object.values(newScores).some(score => score <= 0) || year >= 2075) {
      setTimeout(() => setGameOver(true), 1000);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setSelectedIndustry(null);
    setCeoName("");
    setCurrentScenario(0);
    setScores({ environment: 50, economy: 50, social: 50, governance: 50 });
    setYear(2025);
    setGameOver(false);
  };

  // 직업 선택 화면
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ESG CEO 시뮬레이션
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              "Don't Go Mars!" 
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              당신의 선택이 지구의 미래와 당신의 커리어를 결정합니다
            </p>
          </div>

          {/* CEO 이름 입력 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">CEO 이름을 입력하세요</CardTitle>
            </CardHeader>
            <CardContent>
              <Input 
                value={ceoName}
                onChange={(e) => setCeoName(e.target.value)}
                placeholder="CEO 이름"
                className="text-center text-lg"
              />
            </CardContent>
          </Card>

          {/* 직업 선택 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
              경영할 기업 유형을 선택하세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INDUSTRIES.map((industry) => {
                const Icon = industry.icon;
                return (
                  <Card 
                    key={industry.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedIndustry?.id === industry.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : ''
                    }`}
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {industry.description}
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
              disabled={!selectedIndustry || !ceoName.trim()}
              size="lg"
              className="px-12 py-3 text-lg"
            >
              게임 시작
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 게임오버 화면
  if (gameOver) {
    const failedScore = Object.entries(scores).find(([key, value]) => value <= 0);
    const gameOverReason = failedScore 
      ? `${failedScore[0] === 'environment' ? '환경' : failedScore[0] === 'economy' ? '경제' : failedScore[0] === 'social' ? '사회' : '지배구조'} 점수가 0이 되어 게임이 종료되었습니다.`
      : year >= 2075 
      ? "2075년까지 성공적으로 경영하셨습니다!"
      : "게임이 종료되었습니다.";

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-center text-3xl">게임 종료</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-lg">{gameOverReason}</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(scores).map(([key, value]) => {
                const icons = {
                  environment: Leaf,
                  economy: DollarSign,
                  social: Users,
                  governance: Building
                };
                const labels = {
                  environment: "환경",
                  economy: "경제", 
                  social: "사회",
                  governance: "지배구조"
                };
                const Icon = icons[key as keyof typeof icons];
                return (
                  <div key={key} className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">{labels[key as keyof typeof labels]}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              최종 연도: {year}
            </p>
            <Button onClick={resetGame} size="lg" className="px-8">
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 시작
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 게임 진행 화면
  const scenario = SCENARIOS[currentScenario];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 상단 정보 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ceoName} CEO - {selectedIndustry?.name} 기업
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {year}년 | 시나리오 {currentScenario + 1}/{SCENARIOS.length}
          </p>
        </div>

        {/* ESG 점수 대시보드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(scores).map(([key, value]) => {
            const icons = {
              environment: Leaf,
              economy: DollarSign,
              social: Users,
              governance: Building
            };
            const labels = {
              environment: "환경",
              economy: "경제",
              social: "사회", 
              governance: "지배구조"
            };
            const colors = {
              environment: "text-green-600",
              economy: "text-blue-600",
              social: "text-purple-600",
              governance: "text-orange-600"
            };
            const Icon = icons[key as keyof typeof icons];
            
            return (
              <Card key={key}>
                <CardContent className="p-4 text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${colors[key as keyof typeof colors]}`} />
                  <p className="text-sm font-medium">{labels[key as keyof typeof labels]}</p>
                  <p className="text-2xl font-bold mb-2">{value}</p>
                  <Progress value={value} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 시나리오 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{scenario.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{scenario.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleDecision('left')}
                variant="outline"
                className="h-auto py-4 px-6"
              >
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-green-600" />
                  <span className="text-left">{scenario.leftChoice}</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleDecision('right')}
                variant="outline"
                className="h-auto py-4 px-6"
              >
                <div className="flex items-center">
                  <TrendingDown className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-left">{scenario.rightChoice}</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 하단 정보 */}
        <div className="text-center">
          <Button onClick={resetGame} variant="ghost">
            <RotateCcw className="w-4 h-4 mr-2" />
            게임 재시작
          </Button>
        </div>
      </div>
    </div>
  );
}