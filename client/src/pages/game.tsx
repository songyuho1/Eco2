import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, ChartLine, Snowflake, ListTodo } from "lucide-react";
import ScoreDashboard from "@/components/score-dashboard";
import StoryDisplay from "@/components/story-display";
import PolarBear from "@/components/polar-bear";
import GameOverModal from "@/components/game-over-modal";
import type { StoryWithChoices, GameSession, SessionWithChoices } from "@shared/schema";

const THEMES = [
  { value: "cute", label: "🐻 귀여운", emoji: "🐻" },
  { value: "scary", label: "👻 무서운", emoji: "👻" },
  { value: "realistic", label: "📊 현실적", emoji: "📊" },
  { value: "futuristic", label: "🚀 미래적", emoji: "🚀" },
  { value: "dramatic", label: "🎭 드라마틱", emoji: "🎭" }
];

export default function Game() {
  const [selectedTheme, setSelectedTheme] = useState("cute");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch stories for selected theme
  const { data: stories, isLoading: storiesLoading } = useQuery<StoryWithChoices[]>({
    queryKey: ["/api/stories", selectedTheme],
    enabled: !!selectedTheme,
  });

  // Fetch current session
  const { data: session, isLoading: sessionLoading } = useQuery<SessionWithChoices>({
    queryKey: ["/api/sessions", currentSessionId],
    enabled: !!currentSessionId,
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (theme: string) => {
      const response = await apiRequest("POST", "/api/sessions", {
        theme,
        environmentScore: 50,
        economicScore: 50,
        carbonEmissions: 400,
        currentStoryIndex: 0,
        isGameOver: false
      });
      return response.json();
    },
    onSuccess: (newSession: GameSession) => {
      setCurrentSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", newSession.id] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<GameSession> }) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", currentSessionId] });
    },
  });

  // Add choice mutation
  const addChoiceMutation = useMutation({
    mutationFn: async (choiceData: any) => {
      const response = await apiRequest("POST", `/api/sessions/${currentSessionId}/choices`, choiceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", currentSessionId] });
    },
  });

  // Start new game when theme changes
  useEffect(() => {
    if (selectedTheme) {
      createSessionMutation.mutate(selectedTheme);
    }
  }, [selectedTheme]);

  // Check for game over conditions
  useEffect(() => {
    if (session) {
      const isGameOver = session.environmentScore <= 0 || 
                        session.carbonEmissions >= 600 || 
                        session.currentStoryIndex >= 10;
      
      if (isGameOver && !session.isGameOver) {
        updateSessionMutation.mutate({
          sessionId: session.id,
          updates: { isGameOver: true }
        });
        setShowGameOver(true);
      }
    }
  }, [session]);

  const handleChoice = async (choiceId: string, storyId: string) => {
    if (!session || !stories) return;

    const story = stories.find(s => s.id === storyId);
    const choice = story?.choices.find(c => c.id === choiceId);
    
    if (!choice) return;

    // Calculate new scores
    const newEnvironmentScore = Math.max(0, Math.min(100, session.environmentScore + choice.environmentImpact));
    const newEconomicScore = Math.max(0, Math.min(100, session.economicScore + choice.economicImpact));
    const newCarbonEmissions = Math.max(350, session.carbonEmissions + choice.carbonImpact);
    const newStoryIndex = session.currentStoryIndex + 1;

    // Add choice to session
    await addChoiceMutation.mutateAsync({
      storyId,
      choiceId,
      environmentChange: choice.environmentImpact,
      economicChange: choice.economicImpact,
      carbonChange: choice.carbonImpact,
    });

    // Update session
    await updateSessionMutation.mutateAsync({
      sessionId: session.id,
      updates: {
        environmentScore: newEnvironmentScore,
        economicScore: newEconomicScore,
        carbonEmissions: newCarbonEmissions,
        currentStoryIndex: newStoryIndex,
      }
    });
  };

  const handleRestartGame = () => {
    setShowGameOver(false);
    setCurrentSessionId(null);
    createSessionMutation.mutate(selectedTheme);
  };

  const getCurrentStory = (): StoryWithChoices | undefined => {
    if (!stories || !session) return undefined;
    return stories[session.currentStoryIndex];
  };

  const calculateMarsYears = (): number => {
    if (!session) return 50;
    const envFactor = (100 - session.environmentScore) / 100;
    const carbonFactor = (session.carbonEmissions - 350) / 250;
    return Math.round(20 + (envFactor + carbonFactor) * 30);
  };

  const isLoading = storiesLoading || sessionLoading || createSessionMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  const currentStory = getCurrentStory();

  return (
    <div className="bg-gradient-to-br from-earth-50 to-ice-100 min-h-screen font-game">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="text-earth-600 text-2xl" />
              <h1 className="text-2xl font-bold text-earth-700">지구의 운명</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ESG 환경 게임</span>
            </div>
            
            {/* Theme Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">테마:</label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Stats */}
        <aside className="lg:col-span-1 space-y-4">
          
          {/* Score Dashboard */}
          {session && (
            <ScoreDashboard
              environmentScore={session.environmentScore}
              economicScore={session.economicScore}
              carbonEmissions={session.carbonEmissions}
            />
          )}
          
          {/* Polar Bear Status */}
          {session && (
            <PolarBear
              environmentScore={session.environmentScore}
              carbonEmissions={session.carbonEmissions}
            />
          )}
          
          {/* Progress Indicator */}
          {session && stories && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ListTodo className="text-earth-600 mr-2" />
                진행 상황
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">시나리오</span>
                  <span className="text-sm font-bold">{session.currentStoryIndex} / {stories.length}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-earth-500 to-earth-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(session.currentStoryIndex / stories.length) * 100}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  <span>화성까지 예상: {calculateMarsYears()}년</span>
                </div>
              </div>
            </Card>
          )}
        </aside>
        
        {/* Main Content Area */}
        <main className="lg:col-span-3">
          {currentStory && session ? (
            <>
              <StoryDisplay
                story={currentStory}
                onChoice={handleChoice}
                theme={selectedTheme}
                isLoading={addChoiceMutation.isPending || updateSessionMutation.isPending}
              />
              
              {/* Previous Choices History */}
              {session.choices && session.choices.length > 0 && (
                <Card className="p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ChartLine className="text-earth-600 mr-2" />
                    이전 선택들
                  </h3>
                  
                  <div className="space-y-3">
                    {session.choices.map((sessionChoice, index) => (
                      <div key={sessionChoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-earth-100 text-earth-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{sessionChoice.choice.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {sessionChoice.environmentChange > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              환경 +{sessionChoice.environmentChange}
                            </span>
                          )}
                          {sessionChoice.environmentChange < 0 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              환경 {sessionChoice.environmentChange}
                            </span>
                          )}
                          {sessionChoice.economicChange > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              경제 +{sessionChoice.economicChange}
                            </span>
                          )}
                          {sessionChoice.economicChange < 0 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              경제 {sessionChoice.economicChange}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600">게임을 시작하는 중...</p>
            </Card>
          )}
        </main>
      </div>

      {/* Game Over Modal */}
      {showGameOver && session && (
        <GameOverModal
          session={session}
          marsYears={calculateMarsYears()}
          onRestart={handleRestartGame}
          onClose={() => setShowGameOver(false)}
        />
      )}
    </div>
  );
}
