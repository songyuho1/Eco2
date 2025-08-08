import { type User, type InsertUser, type GameStory, type InsertGameStory, type GameChoice, type InsertGameChoice, type GameSession, type InsertGameSession, type GameSessionChoice, type InsertGameSessionChoice, type StoryWithChoices, type SessionWithChoices } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game Stories
  getStoriesByTheme(theme: string): Promise<StoryWithChoices[]>;
  createStory(story: InsertGameStory): Promise<GameStory>;
  
  // Game Choices
  createChoice(choice: InsertGameChoice): Promise<GameChoice>;
  
  // Game Sessions
  createSession(session: InsertGameSession): Promise<GameSession>;
  getSession(id: string): Promise<SessionWithChoices | undefined>;
  updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
  
  // Game Session Choices
  addSessionChoice(sessionChoice: InsertGameSessionChoice): Promise<GameSessionChoice>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stories: Map<string, GameStory>;
  private choices: Map<string, GameChoice>;
  private sessions: Map<string, GameSession>;
  private sessionChoices: Map<string, GameSessionChoice>;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.choices = new Map();
    this.sessions = new Map();
    this.sessionChoices = new Map();
    
    // Initialize with game data
    this.initializeGameData();
  }

  private initializeGameData() {
    // Sample stories for each theme
    const themes = ['cute', 'scary', 'realistic', 'futuristic', 'dramatic'];
    
    themes.forEach((theme, themeIndex) => {
      // Create 10 stories per theme
      for (let i = 0; i < 10; i++) {
        const storyId = randomUUID();
        const story: GameStory = {
          id: storyId,
          theme,
          title: this.getStoryTitle(theme, i),
          content: this.getStoryContent(theme, i),
          scenarioType: this.getScenarioType(i),
          imageUrl: this.getImageUrl(theme, i),
          contextInfo: this.getContextInfo(theme, i),
          order: i,
        };
        this.stories.set(storyId, story);
        
        // Create 2 choices per story
        const choice1Id = randomUUID();
        const choice2Id = randomUUID();
        
        const choice1: GameChoice = {
          id: choice1Id,
          storyId,
          title: this.getChoiceTitle(theme, i, 'environment'),
          description: this.getChoiceDescription(theme, i, 'environment'),
          type: 'environment',
          environmentImpact: Math.floor(Math.random() * 15) + 5, // 5-20
          economicImpact: -(Math.floor(Math.random() * 10) + 5), // -5 to -15
          carbonImpact: -(Math.floor(Math.random() * 20) + 10), // -10 to -30
          emoji: '🌱',
        };
        
        const choice2: GameChoice = {
          id: choice2Id,
          storyId,
          title: this.getChoiceTitle(theme, i, 'economic'),
          description: this.getChoiceDescription(theme, i, 'economic'),
          type: 'economic',
          environmentImpact: -(Math.floor(Math.random() * 15) + 5), // -5 to -20
          economicImpact: Math.floor(Math.random() * 15) + 5, // 5-20
          carbonImpact: Math.floor(Math.random() * 25) + 15, // 15-40
          emoji: '💰',
        };
        
        this.choices.set(choice1Id, choice1);
        this.choices.set(choice2Id, choice2);
      }
    });
  }

  private getStoryTitle(theme: string, index: number): string {
    const titles = {
      cute: [
        '🐱 사무실 에어컨 온도 설정',
        '🚗 출퇴근 교통수단 선택',
        '🏭 공장 가동률 결정',
        '🌳 도시 개발 vs 숲 보존',
        '☀️ 태양광 패널 설치',
        '🚰 물 사용량 관리',
        '📦 포장재 선택',
        '🥩 회사 식당 메뉴',
        '📱 전자기기 교체 주기',
        '🌡️ 난방 온도 설정'
      ],
      scary: [
        '💀 치명적인 에어컨 선택',
        '👻 공포의 출퇴근 길',
        '🔥 지옥 같은 공장 운영',
        '🌪️ 파괴적인 도시 개발',
        '⚡ 위험한 에너지 선택',
        '☠️ 독성 물질 처리',
        '🗑️ 치명적인 폐기물',
        '🦴 죽음의 식당 메뉴',
        '💻 저주받은 전자기기',
        '🌋 지옥불 난방'
      ],
      realistic: [
        '사무실 에어컨 온도 조절',
        '직원 출퇴근 정책',
        '제조업 생산량 조정',
        '신도시 개발 계획',
        '재생에너지 투자',
        '용수 사용 효율화',
        '친환경 포장재 도입',
        '구내식당 운영 방침',
        'IT 장비 교체 계획',
        '사무실 난방 정책'
      ],
      futuristic: [
        '🤖 AI 기후제어시스템',
        '🚁 개인용 드론 통근',
        '⚙️ 완전자동화 공장',
        '🏙️ 스마트시티 건설',
        '🌌 우주태양광 발전',
        '💧 나노필터 정수시스템',
        '📡 홀로그램 포장기술',
        '🧬 합성식품 생산',
        '🔮 양자컴퓨터 도입',
        '⚡ 플라즈마 난방시스템'
      ],
      dramatic: [
        '💔 운명을 가르는 에어컨',
        '⚔️ 생존을 건 출퇴근',
        '🎭 비극적인 공장 운명',
        '👑 제국의 도시 개발',
        '🔥 희망의 에너지 선택',
        '💎 생명수를 둘러싼 갈등',
        '📜 역사를 바꿀 포장재',
        '🍷 왕의 만찬 준비',
        '⚡ 전설의 기술 도입',
        '🏰 성의 난방 대작전'
      ]
    };
    return titles[theme as keyof typeof titles]?.[index] || `${theme} 시나리오 ${index + 1}`;
  }

  private getStoryContent(theme: string, index: number): string {
    const baseScenarios = [
      '무더운 여름날, 200명이 근무하는 사무실의 시설 관리자인 당신. 직원들이 에어컨 온도를 더 낮춰달라고 요청했습니다.',
      '회사의 재택근무 정책을 결정해야 하는 상황. 직원들의 출퇴근 방식이 환경에 미치는 영향을 고려해야 합니다.',
      '제조업체의 공장장인 당신. 생산량을 늘려달라는 본사의 압박과 환경 규제 사이에서 선택해야 합니다.',
      '시장으로서 새로운 주거 단지 개발을 승인할지, 기존 숲을 보존할지 결정해야 합니다.',
      'CEO로서 회사 건물에 태양광 패널 설치를 검토하고 있습니다. 초기 비용과 장기적 효과를 고려해야 합니다.',
      '호텔 관리자로서 물 사용량을 줄이는 정책 도입을 검토하고 있습니다.',
      '온라인 쇼핑몰 운영자로서 친환경 포장재 사용을 고려하고 있습니다.',
      '대기업 구내식당 운영 책임자로서 메뉴 구성을 결정해야 합니다.',
      'IT 부서장으로서 노후화된 컴퓨터 교체 시기를 결정해야 합니다.',
      '겨울철 사무실 난방 온도 설정을 담당하는 시설 관리자입니다.'
    ];

    const themeModifiers = {
      cute: (text: string) => `🌟 ${text} 모든 직원들이 당신의 현명한 결정을 기다리고 있어요! 🐻`,
      scary: (text: string) => `💀 ${text} 잘못된 선택은 파멸을 부를 수 있습니다... 👹`,
      realistic: (text: string) => `${text} 실제 기업에서 매일 일어나는 현실적인 상황입니다.`,
      futuristic: (text: string) => `🚀 2050년, ${text} 첨단 기술과 환경의 조화를 고려해야 합니다. 🤖`,
      dramatic: (text: string) => `⚔️ ${text} 이 선택이 인류의 운명을 좌우할 것입니다! 👑`
    };

    const baseText = baseScenarios[index] || '중요한 환경 관련 선택을 해야 하는 상황입니다.';
    return themeModifiers[theme as keyof typeof themeModifiers]?.(baseText) || baseText;
  }

  private getScenarioType(index: number): string {
    const types = [
      '사무실 관리', '교통 정책', '제조업', '도시 계획', '에너지',
      '수자원', '포장재', '식품', 'IT', '난방'
    ];
    return types[index] || '일반';
  }

  private getImageUrl(theme: string, index: number): string {
    // Using unsplash for realistic images
    const imageIds = [
      'photo-1497366216548-37526070297c', // office
      'photo-1449824913935-59a10b8d2000', // traffic
      'photo-1581094794329-c8112a89af12', // factory
      'photo-1449824913935-59a10b8d2000', // city
      'photo-1509391366360-2e959784a276', // solar
      'photo-1544552866-d3ed42536cfd', // water
      'photo-1558618666-fcd25c85cd64', // packaging
      'photo-1567620905732-2d1ec7ab7445', // food
      'photo-1488590528505-98d2b5aba04b', // technology
      'photo-1578662996442-48f60103fc96'  // heating
    ];
    return `https://images.unsplash.com/${imageIds[index]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`;
  }

  private getContextInfo(theme: string, index: number): string {
    const contexts = [
      '에어컨 온도를 1°C 낮출 때마다 전력 사용량이 약 10% 증가하며, 연간 약 0.5톤의 추가 CO₂ 배출이 발생합니다.',
      '재택근무는 1인당 연간 약 1.6톤의 CO₂ 절감 효과가 있지만, 생산성 저하 우려가 있습니다.',
      '공장 가동률 10% 감소는 연간 약 100톤의 CO₂ 절감이 가능하지만, 수익성에 영향을 미칩니다.',
      '1헥타르의 숲은 연간 약 3.7톤의 CO₂ 흡수 능력을 가지고 있습니다.',
      '태양광 패널은 25년간 사용 시 설치비용의 3-5배 절약 효과를 가져옵니다.',
      '물 사용량 20% 절감은 연간 약 0.8톤의 CO₂ 절감 효과가 있습니다.',
      '친환경 포장재는 기존 포장재 대비 40% 적은 탄소 배출량을 가집니다.',
      '육류 소비 감소는 개인당 연간 약 0.8톤의 CO₂ 절감 효과가 있습니다.',
      '에너지 효율적인 IT 장비는 전력 소비를 30% 절감할 수 있습니다.',
      '난방 온도 1°C 낮추면 에너지 사용량을 약 6% 절감할 수 있습니다.'
    ];
    return contexts[index] || '환경과 경제의 균형을 고려한 선택이 필요합니다.';
  }

  private getChoiceTitle(theme: string, index: number, type: 'environment' | 'economic'): string {
    const envTitles = [
      '온도 유지 (26°C)', '재택근무 확대', '생산량 감소', '숲 보존',
      '태양광 설치', '절수 정책 도입', '친환경 포장재', '채식 메뉴 확대',
      '에너지 효율 장비', '온도 낮춤 (18°C)'
    ];
    
    const ecoTitles = [
      '온도 낮춤 (22°C)', '출퇴근 유지', '생산량 증가', '개발 승인',
      '기존 전력 유지', '기존 정책 유지', '기존 포장재', '육류 메뉴 유지',
      '저가 장비 유지', '온도 높임 (22°C)'
    ];
    
    if (type === 'environment') {
      return envTitles[index] || '환경 친화적 선택';
    } else {
      return ecoTitles[index] || '경제적 선택';
    }
  }

  private getChoiceDescription(theme: string, index: number, type: 'environment' | 'economic'): string {
    const envDescs = [
      '적정 온도를 유지하여 에너지를 절약하고 환경을 보호합니다.',
      '재택근무를 확대하여 교통수단 사용을 줄입니다.',
      '생산량을 줄여 환경 부담을 감소시킵니다.',
      '기존 숲을 보존하여 생태계를 보호합니다.',
      '재생에너지를 도입하여 탄소 배출을 줄입니다.',
      '물 사용량을 줄여 수자원을 보호합니다.',
      '환경에 무해한 포장재를 사용합니다.',
      '채식 중심 메뉴로 탄소 발자국을 줄입니다.',
      '에너지 효율이 높은 장비를 도입합니다.',
      '적정 온도를 유지하여 에너지를 절약합니다.'
    ];
    
    const ecoDescs = [
      '직원들의 요청을 수용하여 시원한 환경을 제공합니다.',
      '출퇴근을 유지하여 업무 효율성을 높입니다.',
      '생산량을 늘려 수익성을 극대화합니다.',
      '새로운 주거단지를 개발하여 경제적 이익을 창출합니다.',
      '기존 전력을 사용하여 초기 비용을 절약합니다.',
      '기존 정책을 유지하여 운영비를 절약합니다.',
      '기존 포장재를 사용하여 비용을 절감합니다.',
      '육류 메뉴를 유지하여 직원 만족도를 높입니다.',
      '저가 장비를 사용하여 예산을 절약합니다.',
      '따뜻한 환경을 제공하여 직원 만족도를 높입니다.'
    ];
    
    if (type === 'environment') {
      return envDescs[index] || '환경을 보호하는 선택입니다.';
    } else {
      return ecoDescs[index] || '경제적 이익을 우선하는 선택입니다.';
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStoriesByTheme(theme: string): Promise<StoryWithChoices[]> {
    const stories = Array.from(this.stories.values())
      .filter(story => story.theme === theme)
      .sort((a, b) => a.order - b.order);
    
    return stories.map(story => ({
      ...story,
      choices: Array.from(this.choices.values()).filter(choice => choice.storyId === story.id)
    }));
  }

  async createStory(insertStory: InsertGameStory): Promise<GameStory> {
    const id = randomUUID();
    const story: GameStory = { ...insertStory, id };
    this.stories.set(id, story);
    return story;
  }

  async createChoice(insertChoice: InsertGameChoice): Promise<GameChoice> {
    const id = randomUUID();
    const choice: GameChoice = { ...insertChoice, id };
    this.choices.set(id, choice);
    return choice;
  }

  async createSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = { 
      ...insertSession, 
      id,
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<SessionWithChoices | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const choices = Array.from(this.sessionChoices.values())
      .filter(sc => sc.sessionId === id)
      .map(sc => ({
        ...sc,
        story: this.stories.get(sc.storyId)!,
        choice: this.choices.get(sc.choiceId)!
      }))
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    return {
      ...session,
      choices
    };
  }

  async updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async addSessionChoice(insertSessionChoice: InsertGameSessionChoice): Promise<GameSessionChoice> {
    const id = randomUUID();
    const sessionChoice: GameSessionChoice = { 
      ...insertSessionChoice, 
      id,
      createdAt: new Date()
    };
    this.sessionChoices.set(id, sessionChoice);
    return sessionChoice;
  }
}

export const storage = new MemStorage();
