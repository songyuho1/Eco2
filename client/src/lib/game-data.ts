// ESG Representatives and their characteristics
export const ESG_REPRESENTATIVES = {
  environment: {
    id: 'environment',
    name: '박그린',
    role: '환경부 장관',
    emoji: '🌿',
    image: '🧑‍🔬', // 환경 과학자 이미지
    description: '지구의 미래를 걱정하는 환경 전문가',
    color: 'text-green-600',
    background: 'from-green-700 to-green-900'
  },
  social: {
    id: 'social',
    name: '김소셜',
    role: '사회복지위원장',
    emoji: '👥',
    image: '👨‍👩‍👧‍👦', // 사회복지사 이미지
    description: '사회 정의와 평등을 추구하는 복지 전문가',
    color: 'text-blue-600',
    background: 'from-blue-700 to-blue-900'
  },
  governance: {
    id: 'governance',
    name: '이거번',
    role: '윤리경영위원장',
    emoji: '⚖️',
    image: '👨‍💼', // 경영자 이미지
    description: '투명하고 공정한 경영을 추구하는 전문가',
    color: 'text-purple-600',
    background: 'from-purple-700 to-purple-900'
  },
  money: {
    id: 'money',
    name: '최머니',
    role: '재무책임자',
    emoji: '💰',
    image: '🧑‍💼', // 금융전문가 이미지
    description: '재정 건전성과 수익성을 관리하는 전문가',
    color: 'text-yellow-600',
    background: 'from-yellow-700 to-yellow-900'
  }
};

// Game interfaces
export interface ESGScenario {
  id: string;
  title: string;
  description: string;
  representative: keyof typeof ESG_REPRESENTATIVES;
  category: 'environment' | 'social' | 'governance' | 'money';
  year: number;
  characterName?: string;
  characterRole?: string;
  characterEmoji?: string;
  
  leftOption: {
    text: string;
    effects: ScoreEffects;
    consequences?: string;
  };
  
  rightOption: {
    text: string;
    effects: ScoreEffects;
    consequences?: string;
  };
  
  educationalData?: {
    fact: string;
    source: string;
    realWorldExample?: string;
  };
}

interface ScoreEffects {
  environment: number;
  social: number;
  governance: number;
  money: number;
  technology?: number;
  economy?: number;
}

// Core ESG Decision Scenarios based on real-world CEO challenges
export const esgScenarios: ESGScenario[] = [
  {
    id: "carbon_neutrality_2025",
    title: "탄소중립 목표 설정 압박",
    description: "2030년 탄소중립 목표를 요구받고 있습니다. 급진적 전환은 비용이 크지만, 늦으면 규제와 투자 철수 위험이 있습니다.",
    representative: "environment",
    category: "environment",
    year: 2025,
    leftOption: {
      text: "2030 탄소중립 선언",
      effects: { 
        environment: +15, 
        social: +5, 
        governance: +5, 
        money: -10, 
        economy: -10, 
        technology: +8 
      },
      consequences: "단기 비용 증가하지만 ESG 투자 유치와 브랜드 이미지 향상"
    },
    rightOption: {
      text: "점진적 전환 계획",
      effects: { 
        environment: +5, 
        social: 0, 
        governance: +2, 
        money: +5, 
        economy: +5, 
        technology: +3 
      },
      consequences: "안전한 선택이지만 ESG 투자 기회를 놓칠 수 있음"
    },
    educationalData: {
      fact: "ESG 투자 규모는 2025년 53조 달러로 전체 투자의 1/3을 차지",
      source: "Global Sustainable Investment Alliance 2024",
      realWorldExample: "마이크로소프트는 2030 탄소 네거티브 선언 후 주가 35% 상승"
    }
  },

  {
    id: "renewable_energy_investment",
    title: "재생에너지 투자 결정",
    description: "공장 전력을 재생에너지로 전환할지 결정해야 합니다. 초기 비용이 크지만 장기적으로 에너지 비용 절감과 ESG 점수 향상이 예상됩니다.",
    representative: "environment",
    characterName: "김기술 CTO",
    characterRole: "최고기술책임자",
    characterEmoji: "⚡",
    category: "environment",
    year: 2026,
    leftOption: {
      text: "재생에너지 100% 전환",
      effects: { 
        environment: +20, 
        social: +3, 
        governance: +5, 
        money: -15, 
        economy: -15, 
        technology: +10 
      },
      consequences: "높은 초기 투자 비용이지만 장기적 비용 절감과 탄소 저감"
    },
    rightOption: {
      text: "기존 전력 유지",
      effects: { 
        environment: -5, 
        social: -2, 
        governance: -3, 
        money: +10, 
        economy: +10, 
        technology: -3 
      },
      consequences: "단기 이익 보장이지만 미래 에너지 비용 상승 위험"
    },
    educationalData: {
      fact: "재생에너지 단가는 2020-2024년 70% 하락, 2025년부터 화석연료보다 저렴",
      source: "International Energy Agency 2024",
      realWorldExample: "구글은 2017년부터 재생에너지 100% 사용으로 연간 10억 달러 절약"
    }
  },

  {
    id: "employee_wellbeing_program",
    title: "직원 복지 프로그램 확대",
    representative: "social",
    description: "코로나 이후 직원들의 정신건강과 워라밸에 대한 요구가 증가했습니다. 복지 투자는 비용이지만 생산성과 이직률에 큰 영향을 줍니다.",
    characterName: "박인사 CHO",
    characterRole: "최고인사책임자",
    characterEmoji: "👥",
    category: "social",
    year: 2025,
    leftOption: {
      text: "포괄적 복지 확대",
      effects: { 
        environment: +2, 
        social: +18, 
        governance: +5, 
        money: -8, 
        economy: -8, 
        technology: +5 
      },
      consequences: "높은 복지 비용이지만 직원 만족도와 생산성 크게 향상"
    },
    rightOption: {
      text: "현 수준 유지",
      effects: { 
        environment: 0, 
        social: -5, 
        governance: -2, 
        money: +5, 
        economy: +5, 
        technology: 0 
      },
      consequences: "비용 절약이지만 인재 이탈과 생산성 저하 위험"
    },
    educationalData: {
      fact: "직원 웰빙 투자 1달러당 평균 4달러의 생산성 향상 효과",
      source: "WHO 2024 Workplace Mental Health Study",
      realWorldExample: "세일즈포스는 V2MOM 복지 프로그램으로 이직률 50% 감소"
    }
  },

  {
    id: "supply_chain_transparency",
    title: "공급망 투명성 개선",
    representative: "governance",
    description: "공급업체의 환경과 노동 기준을 강화하라는 요구가 있습니다. 엄격한 기준은 비용 증가를 가져오지만 브랜드 리스크를 줄일 수 있습니다.",
    characterName: "최공급 CPO",
    characterRole: "최고조달책임자",
    characterEmoji: "🔗",
    category: "governance",
    year: 2026,
    leftOption: {
      text: "엄격한 ESG 기준 적용",
      effects: { 
        environment: +12,
        social: +15,
        governance: +8,
        money: -12,
        economy: -12,
        technology: +3 
      },
      consequences: "공급 비용 상승하지만 브랜드 리스크 대폭 감소"
    },
    rightOption: {
      text: "기존 공급망 유지",
      effects: { 
        environment: -3,
        social: -8,
        governance: -5,
        money: +8,
        economy: +8,
        technology: 0
      },
      consequences: "비용 절약이지만 공급망 리스크와 평판 손상 위험"
    },
    educationalData: {
      fact: "글로벌 기업의 80%가 공급망 ESG 리스크로 인한 매출 손실 경험",
      source: "McKinsey ESG Supply Chain Report 2024",
      realWorldExample: "나이키는 공급망 투명성 강화로 노동 논란 해결 후 브랜드 가치 30% 상승"
    }
  },

  {
    id: "ai_automation_decision",
    title: "AI 자동화 도입 딜레마",
    representative: "social",
    description: "AI 도입으로 효율성은 크게 개선되지만 대량 해고가 불가피합니다. 기술 혁신과 사회적 책임 사이에서 선택해야 합니다.",
    characterName: "정혁신 CIO",
    characterRole: "최고정보책임자",
    characterEmoji: "🤖",
    category: "social",
    year: 2027,
    leftOption: {
      text: "AI 전면 도입 + 재교육",
      effects: { 
        environment: +5, 
        social: +5, 
        governance: +8,
        money: -10,
        economy: +8, 
        technology: +20 
      },
      consequences: "높은 재교육 비용이지만 혁신과 고용 모두 확보"
    },
    rightOption: {
      text: "제한적 AI 도입",
      effects: { 
        environment: 0, 
        social: +8, 
        governance: +2,
        money: +5,
        economy: -5, 
        technology: -8 
      },
      consequences: "고용 안정하지만 경쟁력 저하로 장기적 위험"
    },
    educationalData: {
      fact: "AI 도입 기업의 65%가 재교육 투자로 생산성 40% 향상과 고용 유지 동시 달성",
      source: "MIT Technology Review 2024",
      realWorldExample: "아마존은 7억 달러 재교육 투자로 10만 명 일자리 전환 성공"
    }
  },

  {
    id: "climate_crisis_adaptation",
    title: "기후변화 적응 투자",
    representative: "environment",
    description: "극한 기후 현상이 빈발하면서 시설 보강과 비즈니스 연속성 계획이 필요합니다. 막대한 투자가 필요하지만 미래 리스크 대응에 필수적입니다.",
    characterName: "한위기 CRO",
    characterRole: "최고리스크책임자",
    characterEmoji: "🌪️",
    category: "environment",
    year: 2028,
    leftOption: {
      text: "포괄적 기후 적응 투자",
      effects: { 
        environment: +10, 
        social: +8, 
        governance: +8, 
        money: -20, 
        economy: -20, 
        technology: +12 
      },
      consequences: "큰 초기 비용이지만 기후 리스크에 대한 강력한 보호막 확보"
    },
    rightOption: {
      text: "최소한 대응",
      effects: { 
        environment: -5, 
        social: -10, 
        governance: -5, 
        money: +5, 
        economy: +5, 
        technology: -5 
      },
      consequences: "비용 절약이지만 기후 재해 시 막대한 손실 위험"
    },
    educationalData: {
      fact: "기후 적응 투자 1달러당 평균 4-7달러의 손실 회피 효과",
      source: "UNEP Adaptation Gap Report 2024",
      realWorldExample: "네덜란드 기업들은 해수면 상승 대비 투자로 2023년 홍수 피해 90% 저감"
    }
  },

  {
    id: "circular_economy_transition",
    title: "순환경제 전환",
    representative: "environment",
    description: "제품 설계부터 폐기까지 순환경제 모델을 적용하라는 요구가 증가합니다. 전면 전환은 비용이 크지만 자원 효율성과 새로운 수익 모델을 창출할 수 있습니다.",
    characterName: "윤지속 CSO",
    characterRole: "최고지속가능책임자",
    characterEmoji: "♻️",
    category: "environment",
    year: 2029,
    leftOption: {
      text: "순환경제 전면 전환",
      effects: { 
        environment: +25, 
        social: +5, 
        governance: +10, 
        money: -10, 
        economy: -10, 
        technology: +15 
      },
      consequences: "전환 비용 크지만 장기적 자원 절약과 신규 수익원 창출"
    },
    rightOption: {
      text: "부분적 개선",
      effects: { 
        environment: +8, 
        social: +2, 
        governance: +2, 
        money: +2, 
        economy: +2, 
        technology: +3 
      },
      consequences: "안전한 선택이지만 미래 자원 가격 상승에 취약"
    },
    educationalData: {
      fact: "순환경제 전환으로 2030년까지 전 세계 4.5조 달러 경제효과 예상",
      source: "Ellen MacArthur Foundation 2024",
      realWorldExample: "인터페이스社는 순환경제로 탄소배출 96% 감소와 수익성 동시 달성"
    }
  },

  {
    id: "esg_reporting_standards",
    title: "ESG 공시 기준 대응",
    representative: "governance",
    description: "새로운 ESG 공시 기준이 도입되면서 상세한 데이터 수집과 보고가 필요합니다. 투명한 공시는 신뢰도를 높이지만 부담도 큽니다.",
    characterName: "서공시 CFO",
    characterRole: "최고재무책임자",  
    characterEmoji: "📊",
    category: "governance",
    year: 2025,
    leftOption: {
      text: "선제적 ESG 공시",
      effects: { 
        environment: +8, 
        social: +10, 
        governance: +15, 
        money: -5, 
        economy: -5, 
        technology: +5 
      },
      consequences: "공시 비용 증가하지만 투자자 신뢰와 ESG 등급 향상"
    },
    rightOption: {
      text: "최소 기준 준수",
      effects: { 
        environment: +2, 
        social: 0, 
        governance: +5, 
        money: +8, 
        economy: +8, 
        technology: +2 
      },
      consequences: "비용 절약이지만 ESG 투자 기회 제한과 투명성 의구심"
    },
    educationalData: {
      fact: "ESG 공시 우수 기업의 자본비용이 평균 0.4%p 낮고 주가 변동성 20% 감소",
      source: "Harvard Business Review ESG Study 2024",
      realWorldExample: "유니레버는 상세한 ESG 공시로 ESG 펀드 투자 200억 달러 유치"
    }
  }
];

// Game balance parameters based on data analysis
export const GAME_BALANCE = {
  // Starting values (E=50, S=50, G=50, M=50 as per planning document)
  STARTING_VALUES: {
    environment: 50,
    economy: 50, 
    social: 50,
    technology: 50
  },
  
  // Game over conditions (0 or 100 in any meter)
  GAME_OVER_THRESHOLD: {
    MIN: 0,
    MAX: 100
  },
  
  // Random event probabilities based on meter levels
  RANDOM_EVENT_PROBABILITY: {
    ESG_HIGH: 0.15, // 15% chance of positive random event when ESG is high
    ESG_LOW: 0.20,  // 20% chance of negative random event when ESG is low
    BALANCED: 0.10  // 10% base chance of random events
  },
  
  // Year progression
  YEAR_PROGRESSION: 1, // Each decision advances 1 year
  TARGET_YEAR: 2075,   // Survive until 2075
  
  // Meter interaction effects (based on real ESG data correlations)
  INTERACTION_EFFECTS: {
    ENVIRONMENT_ECONOMY: -0.3, // Strong negative correlation
    ENVIRONMENT_SOCIAL: 0.2,   // Positive correlation
    SOCIAL_ECONOMY: -0.1,      // Slight negative correlation
    TECHNOLOGY_ALL: 0.1        // Technology generally helps all areas
  }
};

// Real-world game over scenarios based on planning document
export const GAME_OVER_SCENARIOS = {
  ENVIRONMENT_COLLAPSE: {
    title: "🌍 환경 붕괴로 CEO 사임",
    subtitle: "기후 재앙으로 사업 불가능",
    outcome: "mars_exile",
    consequences: [
      "탄소 배출 한계 초과로 글로벌 규제 강화",
      "기후 재해로 주요 시설 90% 가동 중단", 
      "환경 단체 보이콧으로 매출 70% 급감",
      "ESG 투자 철수로 자본 조달 불가능",
      "정부 탄소세 부과로 운영비 300% 증가"
    ]
  },
  
  ECONOMY_COLLAPSE: {
    title: "💸 재정 파탄으로 파산",
    subtitle: "과도한 ESG 투자로 경영 악화",
    outcome: "bankruptcy", 
    consequences: [
      "급진적 친환경 전환으로 매출 급감",
      "ESG 투자 비용이 수익의 150% 초과",
      "주가 90% 폭락으로 시가총액 붕괴",
      "은행 대출 중단으로 현금흐름 악화",
      "경쟁사 대비 가격 경쟁력 완전 상실"
    ]
  },
  
  SOCIAL_COLLAPSE: {
    title: "👥 사회적 신뢰 상실",
    subtitle: "노동 갈등과 사회적 반발",
    outcome: "fired",
    consequences: [
      "대규모 파업으로 생산라인 전면 중단",
      "소비자 불매운동으로 브랜드 가치 폭락", 
      "직원 대량 이직으로 핵심 인재 유출",
      "언론 공격으로 CEO 개인 신뢰도 붕괴",
      "이사회 결의로 CEO 해임 및 교체"
    ]
  },
  
  TECHNOLOGY_COLLAPSE: {
    title: "🔧 기술 경쟁력 상실",
    subtitle: "혁신 거부로 시장에서 도태",
    outcome: "fired",
    consequences: [
      "AI 도입 거부로 생산성 50% 저하",
      "디지털 전환 실패로 고객 이탈 가속",
      "경쟁사 대비 3세대 뒤진 기술력",
      "젊은 인재들의 구시대 기업 인식",
      "주주들의 경영진 교체 요구"
    ]
  },
  
  SUCCESS: {
    title: "🏆 2075년 생존 성공!",
    subtitle: "지속가능한 경영으로 미래 확보",
    outcome: "success",
    consequences: [
      "균형잡힌 ESG 경영으로 글로벌 인정",
      "50년간 안정적 성장과 사회적 가치 창출",
      "차세대 경영자들의 롤모델로 평가",
      "지구 환경 보존에 기여하며 사업 성장",
      "Don't Go Mars 프로젝트의 성공 사례"
    ]
  }
};