// Game constants and utility functions

export const THEMES = {
  cute: {
    name: '귀여운',
    emoji: '🐻',
    description: '귀여운 캐릭터들과 함께하는 환경 모험'
  },
  scary: {
    name: '무서운',
    emoji: '👻',
    description: '환경 파괴의 공포스러운 결과를 체험'
  },
  realistic: {
    name: '현실적',
    emoji: '📊',
    description: '실제 기업과 개인이 직면하는 환경 선택'
  },
  futuristic: {
    name: '미래적',
    emoji: '🚀',
    description: '2050년 미래 사회의 환경 기술과 선택'
  },
  dramatic: {
    name: '드라마틱',
    emoji: '🎭',
    description: '운명적인 선택과 극적인 환경 스토리'
  }
} as const;

export const GAME_CONSTANTS = {
  INITIAL_ENVIRONMENT_SCORE: 50,
  INITIAL_ECONOMIC_SCORE: 50,
  INITIAL_CARBON_EMISSIONS: 400,
  MAX_CARBON_EMISSIONS: 600,
  MIN_ENVIRONMENT_SCORE: 0,
  TOTAL_SCENARIOS: 10,
  BASE_MARS_YEARS: 20,
  MAX_MARS_YEARS: 50
} as const;

export const POLAR_BEAR_STATES = {
  HAPPY: { expression: '🐻‍❄️', threshold: 80 },
  NEUTRAL: { expression: '😐', threshold: 60 },
  WORRIED: { expression: '😟', threshold: 40 },
  SCARED: { expression: '😰', threshold: 20 },
  DYING: { expression: '😢', threshold: 0 }
} as const;

export function calculateMarsYears(environmentScore: number, carbonEmissions: number): number {
  const envFactor = (100 - environmentScore) / 100;
  const carbonFactor = (carbonEmissions - 350) / 250;
  return Math.round(GAME_CONSTANTS.BASE_MARS_YEARS + (envFactor + carbonFactor) * 30);
}

export function getPolarBearState(environmentScore: number) {
  if (environmentScore >= POLAR_BEAR_STATES.HAPPY.threshold) {
    return { expression: POLAR_BEAR_STATES.HAPPY.expression, status: '행복함', message: '북극곰이 안전하게 지내고 있어요!' };
  } else if (environmentScore >= POLAR_BEAR_STATES.NEUTRAL.threshold) {
    return { expression: POLAR_BEAR_STATES.NEUTRAL.expression, status: '보통', message: '북극곰이 조금 걱정하고 있어요.' };
  } else if (environmentScore >= POLAR_BEAR_STATES.WORRIED.threshold) {
    return { expression: POLAR_BEAR_STATES.WORRIED.expression, status: '걱정됨', message: '얼음이 조금씩 녹고 있어요...' };
  } else if (environmentScore >= POLAR_BEAR_STATES.SCARED.threshold) {
    return { expression: POLAR_BEAR_STATES.SCARED.expression, status: '위험함', message: '얼음이 많이 녹아서 위험해요!' };
  } else {
    return { expression: POLAR_BEAR_STATES.DYING.expression, status: '매우 위험', message: '북극곰이 물에 빠질 위험이 있어요...' };
  }
}

export function isGameOver(session: { environmentScore: number; carbonEmissions: number; currentStoryIndex: number }): boolean {
  return session.environmentScore <= 0 || 
         session.carbonEmissions >= GAME_CONSTANTS.MAX_CARBON_EMISSIONS || 
         session.currentStoryIndex >= GAME_CONSTANTS.TOTAL_SCENARIOS;
}
