import { Router } from 'express';
import { nanoid } from 'nanoid';

// Simple ESG game routes with hardcoded scenarios
const router = Router();

// ESG Scenarios data (simplified version for backend)
const esgScenarios = [
  {
    id: "carbon_neutrality_2025",
    title: "탄소중립 목표 설정 압박",
    description: "투자자들과 정부가 2030년 탄소중립 목표를 요구하고 있습니다.",
    characterName: "이지환 투자담당자",
    characterRole: "ESG 펀드 매니저", 
    characterEmoji: "💼",
    leftOption: {
      title: "2030 탄소중립 선언",
      description: "공격적인 탄소중립 목표를 설정합니다.",
      effects: { environment: +15, economy: -10, social: +5, technology: +8 }
    },
    rightOption: {
      title: "점진적 전환 계획",
      description: "현실적인 2040년 목표로 설정합니다.",
      effects: { environment: +5, economy: +5, social: 0, technology: +3 }
    }
  },
  {
    id: "renewable_energy_investment",
    title: "재생에너지 투자 결정",
    description: "공장 전력을 재생에너지로 전환할지 결정해야 합니다.",
    characterName: "김기술 CTO",
    characterRole: "최고기술책임자",
    characterEmoji: "⚡",
    leftOption: {
      title: "재생에너지 100% 전환",
      description: "태양광과 풍력으로 모든 공장을 운영합니다.",
      effects: { environment: +20, economy: -15, social: +3, technology: +10 }
    },
    rightOption: {
      title: "기존 전력 유지",
      description: "현재 전력망을 계속 사용합니다.",
      effects: { environment: -5, economy: +10, social: -2, technology: -3 }
    }
  },
  {
    id: "employee_wellbeing_program", 
    title: "직원 복지 프로그램 확대",
    description: "코로나 이후 직원들의 정신건강과 워라밸 요구가 증가했습니다.",
    characterName: "박인사 CHO",
    characterRole: "최고인사책임자",
    characterEmoji: "👥",
    leftOption: {
      title: "포괄적 복지 확대",
      description: "정신건강 지원, 유연근무제를 전면 도입합니다.",
      effects: { environment: +2, economy: -8, social: +18, technology: +5 }
    },
    rightOption: {
      title: "현 수준 유지",
      description: "현재 복지 수준을 유지합니다.",
      effects: { environment: 0, economy: +5, social: -5, technology: 0 }
    }
  }
];

// In-memory storage for game sessions
const sessions = new Map();

// Create new game session
router.post('/sessions', (req, res) => {
  const { playerName, companyName, currentYear = 2025 } = req.body;
  
  const session = {
    id: nanoid(),
    playerName: playerName || 'CEO',
    companyName: companyName || 'GreenTech Corp',
    currentYear,
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
  
  sessions.set(session.id, session);
  res.json(session);
});

// Get game session
router.get('/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Get next scenario card  
router.get('/sessions/:id/next-card', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Get a random scenario
  const randomIndex = Math.floor(Math.random() * esgScenarios.length);
  const scenario = esgScenarios[randomIndex];
  
  res.json(scenario);
});

// Make decision
router.post('/sessions/:sessionId/decisions/:cardId', (req, res) => {
  const { sessionId, cardId } = req.params;
  const { decision } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const scenario = esgScenarios.find(s => s.id === cardId);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  
  // Apply effects based on decision
  const option = decision === 'left' ? scenario.leftOption : scenario.rightOption;
  const effects = option.effects;
  
  // Update meters
  session.environmentMeter += effects.environment;
  session.economyMeter += effects.economy;
  session.socialMeter += effects.social;
  session.technologyMeter += effects.technology;
  
  // Clamp values between 0 and 100
  session.environmentMeter = Math.max(0, Math.min(100, session.environmentMeter));
  session.economyMeter = Math.max(0, Math.min(100, session.economyMeter));
  session.socialMeter = Math.max(0, Math.min(100, session.socialMeter));
  session.technologyMeter = Math.max(0, Math.min(100, session.technologyMeter));
  
  // Update other session data
  session.cardsPlayed += 1;
  session.currentYear += 1;
  session.updatedAt = new Date();
  
  // Check for game over conditions
  let gameOver = false;
  let gameOverReason = null;
  
  if (session.environmentMeter <= 0) {
    gameOver = true;
    gameOverReason = "환경 붕괴로 사업 불가능";
    session.isGameOver = true;
    session.deathReason = gameOverReason;
  } else if (session.economyMeter <= 0) {
    gameOver = true;
    gameOverReason = "재정 파탄으로 파산";
    session.isGameOver = true;
    session.deathReason = gameOverReason;
  } else if (session.socialMeter <= 0) {
    gameOver = true;
    gameOverReason = "사회적 신뢰 상실로 CEO 사임";
    session.isGameOver = true;
    session.deathReason = gameOverReason;
  } else if (session.technologyMeter <= 0) {
    gameOver = true;
    gameOverReason = "기술 경쟁력 상실로 도태";
    session.isGameOver = true;
    session.deathReason = gameOverReason;
  } else if (session.currentYear >= 2075) {
    gameOver = true;
    gameOverReason = "2075년 생존 성공!";
    session.isGameOver = true;
    session.deathReason = "success";
  }
  
  // Save session
  sessions.set(sessionId, session);
  
  res.json({
    session,
    effects,
    gameOver,
    gameOverReason
  });
});

export default router;