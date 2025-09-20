import { useState, useEffect } from 'react';
import { generateAllScenarios } from '@/lib/openai';
import { GameScenario } from '@/types/game';

export function useGameScenarios() {
  const [scenarios, setScenarios] = useState<GameScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadScenarios() {
      try {
        setIsLoading(true);
        setError(null);
        
        const generatedScenarios = await generateAllScenarios();
        
        if (isMounted) {
          setScenarios(generatedScenarios);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading scenarios:', err);
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
          setIsLoading(false);
        }
      }
    }
    
    loadScenarios();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return { scenarios, isLoading, error };
}
