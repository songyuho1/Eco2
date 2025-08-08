import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Leaf, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import type { StoryWithChoices } from "@shared/schema";

interface StoryDisplayProps {
  story: StoryWithChoices;
  onChoice: (choiceId: string, storyId: string) => void;
  theme: string;
  isLoading?: boolean;
}

export default function StoryDisplay({ story, onChoice, theme, isLoading = false }: StoryDisplayProps) {
  const getThemeStyle = (theme: string) => {
    const styles = {
      cute: {
        gradient: "from-pink-50 via-blue-50 to-green-50",
        border: "border-pink-200",
        accent: "text-pink-700"
      },
      scary: {
        gradient: "from-red-50 via-gray-50 to-black",
        border: "border-red-300",
        accent: "text-red-700"
      },
      realistic: {
        gradient: "from-gray-50 to-blue-50",
        border: "border-gray-300",
        accent: "text-gray-700"
      },
      futuristic: {
        gradient: "from-blue-50 via-purple-50 to-cyan-50",
        border: "border-blue-300",
        accent: "text-blue-700"
      },
      dramatic: {
        gradient: "from-orange-50 via-red-50 to-yellow-50",
        border: "border-orange-300",
        accent: "text-orange-700"
      }
    };
    return styles[theme as keyof typeof styles] || styles.realistic;
  };

  const themeStyle = getThemeStyle(theme);

  return (
    <div className="space-y-6">
      {/* Story Title */}
      <div className="text-center">
        <Badge variant="outline" className="mb-3">
          {story.scenarioType} - 제{story.order + 1}장
        </Badge>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
      </div>

      {/* Story Content Card */}
      <Card className={`p-6 bg-gradient-to-br ${themeStyle.gradient} ${themeStyle.border} border`}>
        {story.imageUrl && (
          <div className="mb-6">
            <img 
              src={story.imageUrl} 
              alt={story.title}
              className="w-full h-56 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-800 leading-relaxed text-lg font-medium">
            {story.content}
          </p>
        </div>
      </Card>

      {/* Environment Context */}
      {story.contextInfo && (
        <Card className="p-4 bg-blue-50 border-blue-200 border">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-600 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">환경 정보</h4>
              <p className="text-blue-700 text-sm leading-relaxed">{story.contextInfo}</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Choice Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          당신의 선택은 무엇입니까?
        </h3>
        
        <div className="space-y-4">
          {story.choices.map((choice, index) => {
            const isEnvironmental = choice.type === 'environment';
            
            return (
              <Button
                key={choice.id}
                onClick={() => onChoice(choice.id, story.id)}
                disabled={isLoading}
                variant="outline"
                className={`w-full h-auto p-6 text-left transition-all duration-300 hover:shadow-lg ${
                  isEnvironmental 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${isEnvironmental ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isEnvironmental ? (
                          <Leaf className={`h-4 w-4 ${isEnvironmental ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <DollarSign className={`h-4 w-4 ${isEnvironmental ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {String.fromCharCode(65 + index)}. {choice.title}
                      </span>
                    </div>
                    <div className="text-2xl opacity-60">
                      {choice.emoji || (isEnvironmental ? '🌱' : '💰')}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 pl-11">
                    {choice.description}
                  </p>
                  
                  {/* Impact Preview */}
                  <div className="grid grid-cols-3 gap-3 text-sm pl-11">
                    <div className="flex items-center space-x-1">
                      {choice.environmentImpact > 0 ? (
                        <ArrowUp className="text-green-500 h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-red-500 h-3 w-3" />
                      )}
                      <span className={choice.environmentImpact > 0 ? "text-green-700" : "text-red-700"}>
                        환경 {choice.environmentImpact > 0 ? '+' : ''}{choice.environmentImpact}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {choice.economicImpact > 0 ? (
                        <ArrowUp className="text-blue-500 h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-red-500 h-3 w-3" />
                      )}
                      <span className={choice.economicImpact > 0 ? "text-blue-700" : "text-red-700"}>
                        경제 {choice.economicImpact > 0 ? '+' : ''}{choice.economicImpact}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {choice.carbonImpact > 0 ? (
                        <ArrowUp className="text-red-500 h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-green-500 h-3 w-3" />
                      )}
                      <span className={choice.carbonImpact > 0 ? "text-red-700" : "text-green-700"}>
                        탄소 {choice.carbonImpact > 0 ? '+' : ''}{choice.carbonImpact}ppm
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
