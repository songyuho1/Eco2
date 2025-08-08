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
                        session.currentStoryIndex >= 6;
      
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-50 to-ice-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-earth-600 mx-auto mb-4"></div>
          <p className="text-earth-700 text-lg font-medium">스토리를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const currentStory = getCurrentStory();

  return (
    <div className="bg-gradient-to-br from-earth-50 to-ice-100 min-h-screen font-game">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="text-earth-600 text-2xl" />
              <h1 className="text-2xl font-bold text-earth-700">지구의 운명</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ESG 스토리 게임</span>
            </div>
            
            {/* Theme Selector - Only show when not in middle of game */}
            {(!session || session.currentStoryIndex === 0) && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">테마:</label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="w-40">
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
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStory && session ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Story Content */}
            <div className="lg:col-span-2">
              <StoryDisplay
                story={currentStory}
                onChoice={handleChoice}
                theme={selectedTheme}
                isLoading={addChoiceMutation.isPending || updateSessionMutation.isPending}
              />
            </div>
            
            {/* Right Sidebar - Status and History */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Progress and Status */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <ListTodo className="text-earth-600 mr-2 h-4 w-4" />
                  진행 상황
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">장:</span>
                    <span className="font-bold">{session.currentStoryIndex + 1} / {stories?.length}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-earth-500 to-earth-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((session.currentStoryIndex) / (stories?.length || 6)) * 100}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    <span>화성까지 예상: {calculateMarsYears()}년</span>
                  </div>
                </div>
              </Card>

              {/* Current Status */}
              <ScoreDashboard
                environmentScore={session.environmentScore}
                economicScore={session.economicScore}
                carbonEmissions={session.carbonEmissions}
              />
              
              {/* Polar Bear Status */}
              <PolarBear
                environmentScore={session.environmentScore}
                carbonEmissions={session.carbonEmissions}
              />

              {/* Previous Choices History */}
              {session.choices && session.choices.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <ChartLine className="text-earth-600 mr-2 h-4 w-4" />
                    이전 선택들
                  </h3>
                  
                  <div className="space-y-2">
                    {session.choices.slice(-3).map((sessionChoice, index) => (
                      <div key={sessionChoice.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium text-gray-700 mb-1">
                          {sessionChoice.choice.title}
                        </div>
                        <div className="flex gap-1">
                          {sessionChoice.environmentChange !== 0 && (
                            <span className={`px-1 py-0.5 rounded text-xs ${sessionChoice.environmentChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              환경 {sessionChoice.environmentChange > 0 ? '+' : ''}{sessionChoice.environmentChange}
                            </span>
                          )}
                          {sessionChoice.economicChange !== 0 && (
                            <span className={`px-1 py-0.5 rounded text-xs ${sessionChoice.economicChange > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                              경제 {sessionChoice.economicChange > 0 ? '+' : ''}{sessionChoice.economicChange}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">스토리를 선택해주세요</h2>
              <p className="text-gray-600">상단에서 테마를 선택하여 게임을 시작하세요.</p>
            </div>
          </Card>
        )}
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
