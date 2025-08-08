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
      // Create 6 stories per theme for better story flow
      for (let i = 0; i < 6; i++) {
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
        '🌱 새로운 시작: 환경 친화적 회사 설립',
        '🏢 첫 번째 선택: 사무실 운영 방식',
        '🚗 두 번째 갈림길: 직원들의 출퇴근',
        '🏭 중간 시험: 생산 방식의 결정',
        '🌳 큰 결단: 확장 vs 보존',
        '🌍 최종 선택: 미래를 향한 길'
      ],
      scary: [
        '💀 파멸의 시작: 탐욕의 길',
        '🔥 첫 번째 재앙: 환경 파괴의 시작',
        '☠️ 두 번째 징조: 독성의 확산',
        '🌋 세 번째 경고: 자연의 분노',
        '👹 네 번째 심판: 돌이킬 수 없는 선택',
        '💀 최후의 심판: 지구의 종말'
      ],
      realistic: [
        'CEO의 첫 날: 환경 정책 수립',
        '분기별 검토: 지속가능성 vs 수익성',
        '주주총회 전: 중요한 투자 결정',
        '규제 대응: 환경법 강화에 대한 반응',
        '경쟁사 대응: 시장에서의 위치',
        '연말 결산: 미래 전략 수립'
      ],
      futuristic: [
        '🚀 2050년: 신기술 도입의 시대',
        '🤖 AI 시대: 자동화의 딜레마',
        '🌌 우주 진출: 새로운 에너지원',
        '🧬 생명공학: 지구 복원 프로젝트',
        '⚡ 에너지 혁명: 무한동력의 발견',
        '🌍 최후의 희망: 지구 재건 계획'
      ],
      dramatic: [
        '⚔️ 운명의 시작: 선택받은 지도자',
        '👑 첫 번째 시련: 왕국의 미래',
        '🔥 두 번째 갈등: 욕망과 의무',
        '💔 세 번째 배신: 동맹의 파열',
        '⚡ 네 번째 전투: 생존을 위한 싸움',
        '🌅 최후의 결전: 새로운 세상의 시작'
      ]
    };
    return titles[theme as keyof typeof titles]?.[index] || `${theme} 시나리오 ${index + 1}`;
  }

  private getStoryContent(theme: string, index: number): string {
    const storyContents = {
      cute: [
        '🌱 당신은 친구들과 함께 환경을 생각하는 작은 회사를 시작했습니다! 첫 사무실을 마련했는데, 어떤 방식으로 운영할까요? 모든 친구들이 당신의 결정을 기다리고 있어요.',
        '🏢 회사가 조금씩 커지고 있어요! 직원들이 출퇴근하는 방법에 대해 새로운 정책을 만들어야 해요. 환경도 생각하고 직원들도 행복하게 할 방법이 있을까요?',
        '🚗 이제 제품을 만들어야 할 시간이에요! 어떤 방식으로 생산할지 결정해야 합니다. 많이 만들면 돈은 많이 벌지만, 지구에게는 어떨까요?',
        '🏭 회사가 성장해서 새로운 공장을 지을 곳을 찾고 있어요. 아름다운 숲 근처에 좋은 땅이 있는데, 과연 어떻게 해야 할까요?',
        '🌳 드디어 큰 결단의 시간입니다! 회사를 더 크게 키울지, 아니면 지구를 지키는 것에 집중할지 선택해야 해요.',
        '🌍 마지막 선택의 순간이 왔어요. 지금까지의 모든 결정이 지구의 미래를 바꿀 것입니다. 당신은 어떤 길을 선택하시겠나요?'
      ],
      scary: [
        '💀 어둠이 내린 지구... 탐욕에 눈먼 인간들이 환경을 파괴하기 시작했습니다. 당신은 그 중 한 명의 CEO가 되어, 첫 번째 파멸적인 결정을 내려야 합니다.',
        '🔥 지구 곳곳에서 이상 기후가 시작되었습니다. 하지만 당신의 회사는 여전히 이익만을 추구하고 있습니다. 재앙의 징조가 보이는데도 계속 파괴할 것인가요?',
        '☠️ 독성 물질이 강과 바다를 오염시키기 시작했습니다. 물고기들이 죽어가고 있습니다. 그러나 사업은 계속되어야 합니다. 당신의 선택은?',
        '🌋 자연이 분노하고 있습니다. 화산이 폭발하고 태풍이 몰아칩니다. 그래도 당신은 여전히 돈만 생각하고 있습니다. 경고를 무시할 것인가요?',
        '👹 이제 되돌릴 수 없는 지경에 이르렀습니다. 지구는 죽어가고 있고, 인류는 멸망 직전입니다. 마지막 기회, 그래도 탐욕을 선택할 것인가요?',
        '💀 심판의 날이 왔습니다. 지구는 황폐해졌고, 생명체들이 사라지고 있습니다. 당신의 마지막 선택이 인류의 운명을 결정할 것입니다.'
      ],
      realistic: [
        '새로운 CEO로 취임한 첫 날입니다. 이사회에서 환경 정책 수립에 대한 압박이 거세지고 있습니다. 동시에 주주들은 단기 수익을 요구하고 있습니다.',
        '분기별 실적 검토 회의입니다. 환경 투자로 인한 비용 증가가 수익성에 영향을 미치고 있습니다. 지속가능성과 수익성 사이에서 균형점을 찾아야 합니다.',
        '주주총회를 앞두고 중요한 투자 결정을 해야 합니다. 친환경 기술에 대한 대규모 투자안이 상정되었지만, 단기적으로는 비용 부담이 클 것으로 예상됩니다.',
        '정부의 환경 규제가 강화되었습니다. 새로운 규제를 준수하려면 상당한 비용이 들지만, 위반 시 막대한 벌금과 평판 손상을 감수해야 합니다.',
        '경쟁사가 친환경 제품으로 시장 점유율을 확대하고 있습니다. 시장에서의 위치를 지키기 위해 어떤 전략을 선택해야 할까요?',
        '연말 결산과 함께 내년 전략을 수립해야 합니다. 지금까지의 모든 결정들이 회사의 미래와 환경에 어떤 영향을 미쳤는지 평가하고, 앞으로의 방향을 정해야 합니다.'
      ],
      futuristic: [
        '🚀 2050년, 기후 변화가 심각해진 지구. 당신은 신기술 도입을 담당하는 미래 연구소의 책임자입니다. 첫 번째 혁신적인 기술을 선택해야 합니다.',
        '🤖 AI와 로봇이 일상화된 시대입니다. 완전 자동화로 효율성을 극대화할지, 인간의 일자리를 보호하면서 환경을 생각할지 결정해야 합니다.',
        '🌌 우주 진출이 현실화되었습니다. 지구의 에너지 문제를 해결할 새로운 우주 에너지원을 발견했습니다. 하지만 개발 비용이 천문학적입니다.',
        '🧬 생명공학 기술로 지구 복원이 가능해졌습니다. 유전자 조작으로 오염을 정화하는 생물체를 만들 수 있지만, 생태계 교란의 위험이 있습니다.',
        '⚡ 무한 에너지 기술이 개발되었습니다! 이 기술로 지구의 모든 환경 문제를 해결할 수 있지만, 잘못 사용하면 더 큰 재앙을 부를 수 있습니다.',
        '🌍 마지막 희망의 순간입니다. 지구 재건 프로젝트의 총 책임자로서, 인류와 지구의 공존을 위한 최종 결정을 내려야 합니다.'
      ],
      dramatic: [
        '⚔️ 운명의 시작입니다. 당신은 환경의 수호자로 선택받았습니다. 거대한 기업 제국과 맞서 싸우며 지구를 구해야 합니다. 첫 전투가 시작됩니다!',
        '👑 첫 번째 시련을 맞았습니다. 강력한 적들이 당신의 왕국을 위협하고 있습니다. 백성들의 안전과 환경 보호 사이에서 선택해야 합니다.',
        '🔥 욕망과 의무 사이의 갈등입니다! 엄청난 부와 권력을 얻을 기회가 눈앞에 있지만, 그것은 지구를 희생해야만 얻을 수 있습니다.',
        '💔 믿었던 동맹이 배신했습니다! 함께 환경을 지키기로 약속했던 파트너들이 돈에 매수되어 등을 돌렸습니다. 홀로 싸워야 할 때입니다.',
        '⚡ 최후의 전투가 시작되었습니다! 지구의 운명을 걸고 마지막 결전을 벌여야 합니다. 승리할지, 패배할지는 당신의 선택에 달려있습니다.',
        '🌅 새로운 세상의 시작입니다. 모든 시련을 이겨낸 당신 앞에 두 개의 길이 놓여있습니다. 어떤 미래를 선택하여 새로운 전설을 쓸 것인가요?'
      ]
    };

    return storyContents[theme as keyof typeof storyContents]?.[index] || '중요한 환경 관련 선택을 해야 하는 상황입니다.';
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
    const choiceTitles = {
      cute: [
        { env: '친환경 사무실 만들기', eco: '편리한 사무실 운영' },
        { env: '대중교통 지원하기', eco: '편리한 출퇴근 제공' },
        { env: '친환경 제품 생산', eco: '많은 제품 빠르게 생산' },
        { env: '숲을 지키며 작은 공장', eco: '큰 공장으로 확장' },
        { env: '환경 보호에 집중', eco: '사업 확장에 집중' },
        { env: '지구를 구하는 길', eco: '성공하는 사업가의 길' }
      ],
      scary: [
        { env: '마지막 양심의 소리', eco: '파멸로 가는 탐욕' },
        { env: '경고를 받아들이기', eco: '경고를 무시하기' },
        { env: '독성 사용 중단', eco: '독성 사용 계속' },
        { env: '자연과 화해하기', eco: '자연을 정복하기' },
        { env: '마지막 구원의 기회', eco: '끝까지 탐욕 추구' },
        { env: '인류를 구원하기', eco: '자신만 살아남기' }
      ],
      realistic: [
        { env: '장기 환경 전략', eco: '단기 수익 극대화' },
        { env: '지속가능한 투자', eco: '즉시 수익 창출' },
        { env: '친환경 기술 투자', eco: '기존 기술 유지' },
        { env: '규제 준수하기', eco: '규제 최소화하기' },
        { env: '친환경 경영 전환', eco: '기존 전략 유지' },
        { env: 'ESG 경영 선택', eco: '수익 우선 경영' }
      ],
      futuristic: [
        { env: '친환경 신기술', eco: '효율성 극대화 기술' },
        { env: '인간-환경 조화 AI', eco: '완전 자동화 시스템' },
        { env: '지속가능한 우주 에너지', eco: '빠른 에너지 개발' },
        { env: '안전한 생명공학', eco: '급진적 생명공학' },
        { env: '안전한 무한 에너지', eco: '즉시 적용 무한 에너지' },
        { env: '생태계 복원 중심', eco: '인간 문명 우선' }
      ],
      dramatic: [
        { env: '환경 수호자의 길', eco: '기업 제국의 길' },
        { env: '백성과 환경 보호', eco: '왕국의 힘 추구' },
        { env: '의무를 선택하기', eco: '욕망에 굴복하기' },
        { env: '홀로서도 신념 지키기', eco: '배신자들과 합류' },
        { env: '지구를 위한 희생', eco: '개인의 승리 추구' },
        { env: '새로운 희망의 시대', eco: '과거 권력의 복귀' }
      ]
    };
    
    const themeChoices = choiceTitles[theme as keyof typeof choiceTitles] || choiceTitles.realistic;
    const choice = themeChoices[index];
    
    if (type === 'environment') {
      return choice?.env || '환경 친화적 선택';
    } else {
      return choice?.eco || '경제적 선택';
    }
  }

  private getChoiceDescription(theme: string, index: number, type: 'environment' | 'economic'): string {
    const choiceDescriptions = {
      cute: [
        { env: '에너지 절약형 시설로 지구를 생각하는 사무실을 만듭니다!', eco: '직원들이 편안하게 일할 수 있는 환경을 만듭니다!' },
        { env: '대중교통비를 지원하여 직원들도 환경도 생각합니다!', eco: '주차장과 편의시설로 직원들의 편의를 제공합니다!' },
        { env: '품질 좋은 친환경 제품을 만들어 지구를 지킵니다!', eco: '많은 제품을 빠르게 생산하여 수익을 늘립니다!' },
        { env: '작더라도 숲과 함께하는 지속가능한 공장을 만듭니다!', eco: '큰 공장으로 생산량을 늘려 성장합니다!' },
        { env: '환경을 최우선으로 생각하는 회사가 됩니다!', eco: '성공적인 사업 확장으로 더 큰 회사가 됩니다!' },
        { env: '지구를 구하는 영웅이 되는 길을 선택합니다!', eco: '성공한 기업가로서의 명성을 얻는 길을 선택합니다!' }
      ],
      scary: [
        { env: '마지막 남은 양심으로 환경을 생각합니다...', eco: '탐욕에 사로잡혀 파멸의 길로 갑니다...' },
        { env: '자연의 경고를 겸허히 받아들입니다...', eco: '경고를 무시하고 파괴를 계속합니다...' },
        { env: '독성 물질 사용을 중단하여 마지막 희망을 남깁니다...', eco: '독성 물질을 계속 사용하여 파멸을 앞당깁니다...' },
        { env: '자연과 화해하여 공생의 길을 찾습니다...', eco: '자연을 완전히 정복하려 합니다...' },
        { env: '마지막 구원의 기회를 잡습니다...', eco: '끝까지 탐욕을 버리지 않습니다...' },
        { env: '인류 전체를 구원하려 노력합니다...', eco: '오직 자신만의 생존을 위해 행동합니다...' }
      ],
      realistic: [
        { env: '장기적인 환경 전략으로 지속가능한 성장을 추구합니다.', eco: '단기 수익 극대화로 즉각적인 성과를 얻습니다.' },
        { env: '환경 투자로 미래 리스크를 줄입니다.', eco: '기존 방식으로 즉시 수익을 창출합니다.' },
        { env: '친환경 기술에 투자하여 경쟁 우위를 확보합니다.', eco: '기존 기술로 비용을 절감합니다.' },
        { env: '환경 규제를 준수하여 리스크를 관리합니다.', eco: '규제 준수를 최소화하여 비용을 절약합니다.' },
        { env: '친환경 경영으로 브랜드 가치를 높입니다.', eco: '기존 전략으로 안정적인 수익을 유지합니다.' },
        { env: 'ESG 경영으로 지속가능한 미래를 만듭니다.', eco: '수익 우선 경영으로 주주 가치를 극대화합니다.' }
      ],
      futuristic: [
        { env: '친환경 신기술로 지구와 미래를 모두 구합니다.', eco: '효율성 극대화로 즉시 결과를 얻습니다.' },
        { env: '인간과 환경이 조화로운 AI 시스템을 구축합니다.', eco: '완전 자동화로 최대 효율성을 달성합니다.' },
        { env: '지속가능한 우주 에너지로 안전한 미래를 만듭니다.', eco: '빠른 에너지 개발로 당장의 문제를 해결합니다.' },
        { env: '안전한 생명공학으로 생태계를 보호합니다.', eco: '급진적 생명공학으로 즉각적인 효과를 얻습니다.' },
        { env: '안전하게 검증된 무한 에너지를 사용합니다.', eco: '즉시 무한 에너지를 적용하여 문제를 해결합니다.' },
        { env: '생태계 복원을 중심으로 진정한 재건을 시작합니다.', eco: '인간 문명의 발전을 우선으로 미래를 설계합니다.' }
      ],
      dramatic: [
        { env: '환경 수호자로서 숭고한 사명을 다합니다!', eco: '기업 제국의 힘으로 세상을 지배합니다!' },
        { env: '백성들과 환경을 모두 지키는 현명한 왕이 됩니다!', eco: '왕국의 절대적 힘을 추구하는 정복자가 됩니다!' },
        { env: '어려워도 올바른 의무를 선택합니다!', eco: '달콤한 유혹에 굴복하여 욕망을 채웁니다!' },
        { env: '홀로서도 끝까지 신념을 지킵니다!', eco: '배신자들과 합류하여 안전한 길을 선택합니다!' },
        { env: '지구를 위해 모든 것을 희생합니다!', eco: '개인의 승리와 영광만을 추구합니다!' },
        { env: '새로운 희망의 시대를 열어갑니다!', eco: '과거의 권력과 영화를 되찾습니다!' }
      ]
    };
    
    const themeDescs = choiceDescriptions[theme as keyof typeof choiceDescriptions] || choiceDescriptions.realistic;
    const desc = themeDescs[index];
    
    if (type === 'environment') {
      return desc?.env || '환경을 보호하는 선택입니다.';
    } else {
      return desc?.eco || '경제적 이익을 우선하는 선택입니다.';
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
