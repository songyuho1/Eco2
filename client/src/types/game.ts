import { LucideIcon } from 'lucide-react';

// 점수 상태 인터페이스
export interface ScoreState {
  environment: number;
  social: number;
  governance: number;
  money: number;
}

// 선택 상태 인터페이스
export interface ChoiceState {
  text: string;
  effects: ScoreState;
}

// 게임 시나리오 인터페이스
export interface GameScenario {
  id: string;
  type: 'E' | 'S' | 'G' | 'M';
  representative: 'environment' | 'social' | 'governance' | 'money';
  text: string;
  npc_name?: string;
  npc_emoji?: string;
  option_left: ChoiceState;
  option_right: ChoiceState;
}

// 대표자 인터페이스
export interface Representative {
  id: 'environment' | 'social' | 'governance' | 'money';
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  type: 'E' | 'S' | 'G' | 'M';
  baseEffectRange: {
    primary: { min: number; max: number };
    secondary: { min: number; max: number };
  };
}

// 플레이어 역할 인터페이스
export interface PlayerRole {
  id: string;
  name: string;
  emoji: string;
  description: string;
  icon: LucideIcon;
  color: string;
  effects?: {
    [key: string]: {
      bonus: number;
      penalty: number;
    };
  };
}

// 초기 점수 상태
export const INITIAL_SCORE: ScoreState = {
  environment: 50,
  social: 50,
  governance: 50,
  money: 50
};
