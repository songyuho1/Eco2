import { nanoid } from 'nanoid';
import type { 
  ReignsGameSession, 
  DecisionCard, 
  GameDecision, 
  ClimateData,
  CardEffects,
  GameMeters,
  MeterHistoryPoint,
  EducationalContent,
  FuturePrediction
} from '@shared/schema';

interface IReignsStorage {
  // Game session management
  createGameSession(playerName: string, companyName: string): Promise<ReignsGameSession>;
  getGameSession(sessionId: string): Promise<ReignsGameSession | undefined>;
  updateGameSession(sessionId: string, updates: Partial<ReignsGameSession>): Promise<ReignsGameSession>;
  
  // Card management
  getAllCards(): Promise<DecisionCard[]>;
  getAvailableCards(session: ReignsGameSession): Promise<DecisionCard[]>;
  getRandomCard(availableCards: DecisionCard[]): DecisionCard;
  
  // Decision tracking
  recordDecision(sessionId: string, cardId: string, decision: 'left' | 'right', metersBefore: GameMeters, metersAfter: GameMeters, year: number): Promise<GameDecision>;
  getSessionDecisions(sessionId: string): Promise<GameDecision[]>;
  
  // Educational data
  getClimateData(year?: number): Promise<ClimateData[]>;
  getFuturePredictions(): Promise<FuturePrediction[]>;
}

export class MemReignsStorage implements IReignsStorage {
  private sessions: Map<string, ReignsGameSession> = new Map();
  private decisions: Map<string, GameDecision> = new Map();
  private cards: DecisionCard[] = [];
  private climateData: ClimateData[] = [];

  constructor() {
    this.initializeCards();
    this.initializeClimateData();
  }

  async createGameSession(playerName: string, companyName: string): Promise<ReignsGameSession> {
    const session: ReignsGameSession = {
      id: nanoid(),
      playerName,
      companyName,
      environmentMeter: 50,
      economyMeter: 50,
      socialMeter: 50,
      technologyMeter: 50,
      currentYear: 2025,
      cardsPlayed: 0,
      isGameOver: false,
      deathReason: null,
      meterHistory: [{
        year: 2025,
        environment: 50,
        economy: 50,
        social: 50,
        technology: 50,
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getGameSession(sessionId: string): Promise<ReignsGameSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateGameSession(sessionId: string, updates: Partial<ReignsGameSession>): Promise<ReignsGameSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async getAllCards(): Promise<DecisionCard[]> {
    return this.cards;
  }

  async getAvailableCards(session: ReignsGameSession): Promise<DecisionCard[]> {
    return this.cards.filter(card => {
      // Check year constraints
      if (session.currentYear < card.minYear || session.currentYear > card.maxYear) {
        return false;
      }

      // Check if one-time card was already used
      if (card.isOneTime) {
        const sessionDecisions = Array.from(this.decisions.values()).filter(d => d.sessionId === session.id);
        if (sessionDecisions.some(d => d.cardId === card.id)) {
          return false;
        }
      }

      // Check meter requirements
      const required = card.requiredMeters as any;
      if (required) {
        if (required.environment?.min && session.environmentMeter < required.environment.min) return false;
        if (required.environment?.max && session.environmentMeter > required.environment.max) return false;
        if (required.economy?.min && session.economyMeter < required.economy.min) return false;
        if (required.economy?.max && session.economyMeter > required.economy.max) return false;
        if (required.social?.min && session.socialMeter < required.social.min) return false;
        if (required.social?.max && session.socialMeter > required.social.max) return false;
        if (required.technology?.min && session.technologyMeter < required.technology.min) return false;
        if (required.technology?.max && session.technologyMeter > required.technology.max) return false;
      }

      return true;
    });
  }

  getRandomCard(availableCards: DecisionCard[]): DecisionCard {
    if (availableCards.length === 0) {
      throw new Error('No available cards');
    }

    // Weighted random selection based on priority
    const totalWeight = availableCards.reduce((sum, card) => sum + card.priority, 0);
    let random = Math.random() * totalWeight;

    for (const card of availableCards) {
      random -= card.priority;
      if (random <= 0) {
        return card;
      }
    }

    return availableCards[availableCards.length - 1];
  }

  async recordDecision(
    sessionId: string, 
    cardId: string, 
    decision: 'left' | 'right', 
    metersBefore: GameMeters, 
    metersAfter: GameMeters, 
    year: number
  ): Promise<GameDecision> {
    const gameDecision: GameDecision = {
      id: nanoid(),
      sessionId,
      cardId,
      decision,
      year,
      metersBefore,
      metersAfter,
      createdAt: new Date(),
    };

    this.decisions.set(gameDecision.id, gameDecision);
    return gameDecision;
  }

  async getSessionDecisions(sessionId: string): Promise<GameDecision[]> {
    return Array.from(this.decisions.values()).filter(d => d.sessionId === sessionId);
  }

  async getClimateData(year?: number): Promise<ClimateData[]> {
    if (year) {
      return this.climateData.filter(data => data.year === year);
    }
    return this.climateData;
  }

  async getFuturePredictions(): Promise<FuturePrediction[]> {
    // Generate realistic future predictions based on current climate trends
    const predictions: FuturePrediction[] = [];
    const scenarios: ('optimistic' | 'realistic' | 'pessimistic')[] = ['optimistic', 'realistic', 'pessimistic'];
    
    for (let year = 2030; year <= 2100; year += 10) {
      for (const scenario of scenarios) {
        const baseTemp = (year - 2025) * 0.02; // Base warming trend
        const tempMultiplier = scenario === 'optimistic' ? 0.7 : scenario === 'realistic' ? 1.0 : 1.5;
        
        predictions.push({
          year,
          scenario,
          globalTemp: baseTemp * tempMultiplier,
          seaLevel: (year - 2025) * 0.4 * tempMultiplier,
          renewableEnergy: scenario === 'optimistic' ? Math.min(95, 30 + (year - 2025) * 2) : 
                          scenario === 'realistic' ? Math.min(80, 30 + (year - 2025) * 1.5) : 
                          Math.min(60, 30 + (year - 2025) * 1),
          co2Concentration: 420 + (year - 2025) * (scenario === 'optimistic' ? 0.5 : scenario === 'realistic' ? 1.2 : 2.0),
          economicImpact: -(year - 2025) * 0.1 * tempMultiplier,
          populationImpact: (year - 2025) * 50 * tempMultiplier,
        });
      }
    }
    
    return predictions;
  }

  private initializeCards() {
    this.cards = [
      // Early game cards (2025-2030)
      {
        id: 'energy_transition_2025',
        title: '에너지 전환 투자안',
        description: '정부에서 대대적인 재생에너지 전환을 위한 지원책을 발표했습니다. 우리 회사도 참여할까요?',
        characterName: '에너지부 장관',
        characterRole: '정부 관계자',
        characterEmoji: '⚡',
        minYear: 2025,
        maxYear: 2030,
        requiredMeters: {},
        leftOptionTitle: '전통 에너지 고수',
        leftOptionDescription: '검증된 기존 에너지원을 계속 사용하여 안정적인 수익을 확보합니다.',
        rightOptionTitle: '재생에너지 전환',
        rightOptionDescription: '태양광, 풍력 등 재생에너지에 대규모 투자하여 미래를 준비합니다.',
        leftEffects: { environment: -8, economy: +12, social: -3, technology: -2, yearProgress: 1 },
        rightEffects: { environment: +15, economy: -10, social: +5, technology: +8, yearProgress: 1 },
        category: 'energy',
        priority: 3,
        isOneTime: false,
        educationalData: {
          fact: '2023년 기준 전 세계 재생에너지 발전 비중은 30%를 넘어섰습니다.',
          source: 'IEA Global Energy Review 2023',
          futureProjection: { year: 2030, value: 42, unit: '%' }
        },
      },
      
      {
        id: 'carbon_tax_2026',
        title: '탄소세 도입 예고',
        description: '정부가 2027년부터 탄소세를 도입한다고 발표했습니다. 미리 준비하시겠습니까?',
        characterName: '재정부 차관',
        characterRole: '정부 관계자', 
        characterEmoji: '💰',
        minYear: 2026,
        maxYear: 2028,
        requiredMeters: {},
        leftOptionTitle: '대응 최소화',
        leftOptionDescription: '탄소세 부담을 최소화하되, 추가 규제 리스크를 감수합니다.',
        rightOptionTitle: '선제적 대응',
        rightOptionDescription: '탄소 중립 기술에 미리 투자하여 탄소세 부담을 줄입니다.',
        leftEffects: { environment: -10, economy: +8, social: -5, technology: -3, yearProgress: 1 },
        rightEffects: { environment: +12, economy: -8, social: +3, technology: +10, yearProgress: 1 },
        category: 'climate',
        priority: 2,
        isOneTime: true,
        educationalData: {
          fact: '탄소세를 도입한 국가들에서 평균 15-25%의 탄소 배출 감소 효과가 나타났습니다.',
          source: 'World Bank Carbon Pricing Dashboard 2023'
        },
      },

      {
        id: 'social_responsibility_2025',
        title: '사회적 책임 프로그램',
        description: '지역사회에서 우리 회사의 사회공헌 활동 확대를 요청하고 있습니다.',
        characterName: '지역사회 대표',
        characterRole: '시민단체 대표',
        characterEmoji: '🤝',
        minYear: 2025,
        maxYear: 2035,
        requiredMeters: {},
        leftOptionTitle: '최소한의 활동',
        leftOptionDescription: '법적 의무만 충족하는 수준의 사회공헌을 유지합니다.',
        rightOptionTitle: '적극적 참여',
        rightOptionDescription: '지역사회 발전을 위한 다양한 프로그램에 적극 투자합니다.',
        leftEffects: { environment: -2, economy: +5, social: -8, technology: 0, yearProgress: 1 },
        rightEffects: { environment: +3, economy: -12, social: +15, technology: +2, yearProgress: 1 },
        category: 'social',
        priority: 1,
        isOneTime: false,
        educationalData: {
          fact: 'ESG 투자 규모는 2023년 기준 전 세계 35조 달러를 넘어섰습니다.',
          source: 'Global Sustainable Investment Alliance 2023'
        },
      },

      // Mid-game crisis cards (2030-2050)
      {
        id: 'climate_crisis_2035',
        title: '극한 기후 사태',
        description: '연이은 폭염과 홍수로 인한 피해가 심각합니다. 긴급 대응이 필요합니다.',
        characterName: '기상청장',
        characterRole: '재난 관리 당국',
        characterEmoji: '🌪️',
        minYear: 2030,
        maxYear: 2040,
        requiredMeters: { environment: { max: 40 } },
        leftOptionTitle: '비용 절약',
        leftOptionDescription: '최소한의 대응만 하고 기존 사업에 집중합니다.',
        rightOptionTitle: '전면 대응',
        rightOptionDescription: '막대한 비용을 투입해서라도 기후 적응에 나섭니다.',
        leftEffects: { environment: -15, economy: +5, social: -10, technology: -5, yearProgress: 2 },
        rightEffects: { environment: +8, economy: -20, social: +12, technology: +5, yearProgress: 2 },
        category: 'crisis',
        priority: 5,
        isOneTime: false,
        educationalData: {
          fact: '2023년 글로벌 자연재해로 인한 경제적 손실은 900억 달러를 기록했습니다.',
          source: 'Munich Re Natural Catastrophe Report 2023'
        },
      },

      {
        id: 'ai_automation_2030',
        title: 'AI 자동화 혁명',
        description: '인공지능 기술이 급속히 발전하면서 많은 일자리가 자동화되고 있습니다.',
        characterName: 'AI 연구소장',
        characterRole: '기술 전문가',
        characterEmoji: '🤖',
        minYear: 2028,
        maxYear: 2045,
        requiredMeters: {},
        leftOptionTitle: '점진적 도입',
        leftOptionDescription: '기존 직원들을 고려하여 AI 도입을 천천히 진행합니다.',
        rightOptionTitle: '전면 자동화',
        rightOptionDescription: '경쟁력 확보를 위해 AI 자동화를 대폭 확대합니다.',
        leftEffects: { environment: +2, economy: -3, social: +8, technology: +5, yearProgress: 1 },
        rightEffects: { environment: -5, economy: +15, social: -12, technology: +20, yearProgress: 1 },
        category: 'technology',
        priority: 2,
        isOneTime: false,
        educationalData: {
          fact: 'AI로 인해 2030년까지 전체 일자리의 30%가 영향받을 것으로 예측됩니다.',
          source: 'McKinsey Global Institute Future of Work Report 2023'
        },
      },

      // Late game survival cards (2050-2070)
      {
        id: 'mars_migration_2055',
        title: '화성 이주 프로젝트',
        description: '지구 환경 악화로 인해 화성 이주 계획이 본격화되고 있습니다. 참여하시겠습니까?',
        characterName: '우주개발청장',
        characterRole: '우주 전문가',
        characterEmoji: '🚀',
        minYear: 2050,
        maxYear: 2070,
        requiredMeters: { environment: { max: 30 } },
        leftOptionTitle: '지구 고수',
        leftOptionDescription: '끝까지 지구에 남아서 환경 복원에 투자합니다.',
        rightOptionTitle: '화성 이주',
        rightOptionDescription: '새로운 행성에서 인류의 미래를 준비합니다.',
        leftEffects: { environment: +10, economy: -15, social: +5, technology: +8, yearProgress: 3 },
        rightEffects: { environment: -20, economy: +10, social: -15, technology: +25, yearProgress: 5 },
        category: 'crisis',
        priority: 4,
        isOneTime: true,
        educationalData: {
          fact: '현재 기술로 화성 이주에는 약 1조 달러의 비용이 소요될 것으로 추정됩니다.',
          source: 'NASA Mars Exploration Strategic Plan 2023'
        },
      },

      // Economic crisis cards
      {
        id: 'economic_recession_2032',
        title: '글로벌 경기 침체',
        description: '세계 경제가 심각한 침체에 빠졌습니다. 생존 전략이 필요합니다.',
        characterName: '경제연구원장',
        characterRole: '경제 전문가',
        characterEmoji: '📉',
        minYear: 2030,
        maxYear: 2040,
        requiredMeters: { economy: { max: 35 } },
        leftOptionTitle: '구조조정',
        leftOptionDescription: '직원과 사업부문을 대폭 축소하여 생존을 도모합니다.',
        rightOptionTitle: '투자 확대',
        rightOptionDescription: '위기를 기회로 삼아 미래 기술에 과감히 투자합니다.',
        leftEffects: { environment: -5, economy: +12, social: -15, technology: -8, yearProgress: 2 },
        rightEffects: { environment: +5, economy: -8, social: +3, technology: +15, yearProgress: 2 },
        category: 'crisis',
        priority: 4,
        isOneTime: false,
        educationalData: {
          fact: '기후 변화로 인한 경제적 손실은 2050년까지 전 세계 GDP의 10-15%에 달할 것으로 예측됩니다.',
          source: 'Stern Review on Economics of Climate Change 2023 Update'
        },
      }
    ];
  }

  private initializeClimateData() {
    // Real historical and projected climate data
    this.climateData = [
      { id: 'climate_2020', year: 2020, globalTempAnomaly: 102, co2Concentration: 414, seaLevelRise: 95, arcticIceExtent: 474, extremeEvents: 22, renewablePercent: 28, source: 'NASA/NOAA' },
      { id: 'climate_2021', year: 2021, globalTempAnomaly: 85, co2Concentration: 416, seaLevelRise: 97, arcticIceExtent: 467, extremeEvents: 29, renewablePercent: 30, source: 'NASA/NOAA' },
      { id: 'climate_2022', year: 2022, globalTempAnomaly: 89, co2Concentration: 418, seaLevelRise: 99, arcticIceExtent: 451, extremeEvents: 35, renewablePercent: 32, source: 'NASA/NOAA' },
      { id: 'climate_2023', year: 2023, globalTempAnomaly: 134, co2Concentration: 421, seaLevelRise: 101, arcticIceExtent: 442, extremeEvents: 41, renewablePercent: 34, source: 'NASA/NOAA' },
      { id: 'climate_2024', year: 2024, globalTempAnomaly: 139, co2Concentration: 424, seaLevelRise: 103, arcticIceExtent: 438, extremeEvents: 47, renewablePercent: 36, source: 'NASA/NOAA' },
    ];
  }

  // Game logic helpers
  checkGameOverConditions(session: ReignsGameSession): { isGameOver: boolean; reason?: string } {
    const { environmentMeter, economyMeter, socialMeter, technologyMeter } = session;

    // Check for meter hitting 0 or 100
    if (environmentMeter <= 0) {
      return { isGameOver: true, reason: '기후 붕괴로 인한 문명 종료: 지구 환경이 회복 불가능한 수준으로 악화되어 인류가 생존할 수 없게 되었습니다.' };
    }
    if (environmentMeter >= 100) {
      return { isGameOver: true, reason: '환경 극단주의로 인한 경제 마비: 지나친 환경 규제로 경제 활동이 완전히 중단되었습니다.' };
    }
    if (economyMeter <= 0) {
      return { isGameOver: true, reason: '경제 붕괴로 인한 사회 혼란: 회사와 경제 시스템이 완전히 붕괴하여 사회 질서가 무너졌습니다.' };
    }
    if (economyMeter >= 100) {
      return { isGameOver: true, reason: '무분별한 성장으로 인한 환경 파괴: 경제 성장만을 추구한 결과 환경이 돌이킬 수 없이 파괴되었습니다.' };
    }
    if (socialMeter <= 0) {
      return { isGameOver: true, reason: '사회 불안으로 인한 체제 붕괴: 심각한 사회 갈등과 불평등으로 사회 시스템이 붕괴되었습니다.' };
    }
    if (socialMeter >= 100) {
      return { isGameOver: true, reason: '과도한 복지 정책으로 인한 재정 파탄: 지나친 사회 복지로 국가 재정이 고갈되었습니다.' };
    }
    if (technologyMeter <= 0) {
      return { isGameOver: true, reason: '기술 경쟁력 상실로 인한 도태: 기술 혁신에 실패하여 글로벌 경쟁에서 완전히 도태되었습니다.' };
    }
    if (technologyMeter >= 100) {
      return { isGameOver: true, reason: '기술 독점으로 인한 대량 실업: 과도한 자동화로 인해 대부분의 인간 일자리가 사라져 사회가 혼란에 빠졌습니다.' };
    }

    // Check for successful survival (reached 2075)
    if (session.currentYear >= 2075) {
      return { isGameOver: true, reason: '생존 성공: 2075년까지 균형잡힌 ESG 경영으로 지속가능한 미래를 만들어냈습니다!' };
    }

    return { isGameOver: false };
  }

  applyCardEffects(session: ReignsGameSession, effects: CardEffects): ReignsGameSession {
    const newSession = { ...session };

    // Apply meter changes with bounds checking
    newSession.environmentMeter = Math.max(0, Math.min(100, newSession.environmentMeter + effects.environment));
    newSession.economyMeter = Math.max(0, Math.min(100, newSession.economyMeter + effects.economy));
    newSession.socialMeter = Math.max(0, Math.min(100, newSession.socialMeter + effects.social));
    newSession.technologyMeter = Math.max(0, Math.min(100, newSession.technologyMeter + effects.technology));

    // Advance time
    if (effects.yearProgress) {
      newSession.currentYear += effects.yearProgress;
    }

    newSession.cardsPlayed += 1;

    // Update meter history
    const currentHistory = Array.isArray(newSession.meterHistory) ? newSession.meterHistory : [];
    currentHistory.push({
      year: newSession.currentYear,
      environment: newSession.environmentMeter,
      economy: newSession.economyMeter,
      social: newSession.socialMeter,
      technology: newSession.technologyMeter,
    });
    newSession.meterHistory = currentHistory;

    return newSession;
  }
}

export default new MemReignsStorage();