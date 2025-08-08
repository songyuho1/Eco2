import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChoiceButton from "./choice-button";
import { Info } from "lucide-react";
import type { StoryWithChoices } from "@shared/schema";

interface StoryDisplayProps {
  story: StoryWithChoices;
  onChoice: (choiceId: string, storyId: string) => void;
  theme: string;
  isLoading?: boolean;
}

export default function StoryDisplay({ story, onChoice, theme, isLoading = false }: StoryDisplayProps) {
  const getThemeGradient = (theme: string) => {
    const gradients = {
      cute: "from-pink-50 to-blue-100",
      scary: "from-red-50 to-gray-100",
      realistic: "from-gray-50 to-gray-100",
      futuristic: "from-blue-50 to-purple-100",
      dramatic: "from-orange-50 to-red-100"
    };
    return gradients[theme as keyof typeof gradients] || "from-gray-50 to-gray-100";
  };

  return (
    <Card className="p-8 mb-6">
      {/* Story Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{story.title}</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{story.scenarioType}</Badge>
            <span className="text-sm text-gray-500">시나리오 {story.order + 1}</span>
          </div>
        </div>
      </div>
      
      {/* Story Content */}
      <div className="prose max-w-none mb-8">
        <div className={`bg-gradient-to-r ${getThemeGradient(theme)} rounded-lg p-6 mb-6`}>
          {story.imageUrl && (
            <img 
              src={story.imageUrl} 
              alt={story.title}
              className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
            />
          )}
          
          <p className="text-gray-700 leading-relaxed text-lg">
            {story.content}
          </p>
        </div>
      </div>
      
      {/* Choice Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">당신의 선택은?</h3>
        
        {story.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            onSelect={() => onChoice(choice.id, story.id)}
            disabled={isLoading}
          />
        ))}
      </div>
      
      {/* Additional Info */}
      {story.contextInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-earth-500">
          <div className="flex items-start">
            <Info className="text-earth-600 mt-1 mr-3 h-4 w-4" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">환경 정보</p>
              <p>{story.contextInfo}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
