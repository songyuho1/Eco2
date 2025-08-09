// ESG CEO Game Data - Based on the planning document
export interface ESGScenario {
  id: string;
  title: string;
  description: string;
  characterName: string;
  characterRole: string;
  characterEmoji: string;
  category: 'climate' | 'energy' | 'social' | 'governance' | 'crisis';
  year: number;
  
  leftOption: {
    title: string;
    description: string;
    effects: {
      environment: number;
      economy: number;
      social: number;
      technology: number;
    };
    consequences?: string;
  };
  
  rightOption: {
    title: string;
    description: string;
    effects: {
      environment: number;
      economy: number;
      social: number;
      technology: number;
    };
    consequences?: string;
  };
  
  educationalData?: {
    fact: string;
    source: string;
    realWorldExample?: string;
  };
}

// Core ESG Decision Scenarios based on real-world CEO challenges
export const esgScenarios: ESGScenario[] = [
  {
    id: "carbon_neutrality_2025",
    title: "탄소중립 목표 설정 압박",
    description: "투자자들과 정부가 2030년 탄소중립 목표를 요구하고 있습니다. 급진적 전환은 비용이 크지만, 늦으면 규제와 투자 철수 위험이 있습니다.",
    characterName: "이지환 투자담당자",
    characterRole: "ESG 펀드 매니저",
    characterEmoji: "💼",
    category: "climate",
    year: 2025,
    leftOption: {
      title: "2030 탄소중립 선언",
      description: "공격적인 탄소중립 목표를 설정하고 재생에너지 전환을 시작합니다.",
      effects: { environment: +15, economy: -10, social: +5, technology: +8 },
      consequences: "단기 비용 증가하지만 ESG 투자 유치와 브랜드 이미지 향상"
    },
    rightOption: {
      title: "점진적 전환 계획",
      description: "현실적인 2040년 목표로 설정하여 안정적인 전환을 추진합니다.",
      effects: { environment: +5, economy: +5, social: 0, technology: +3 },
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
    characterName: "김기술 CTO",
    characterRole: "최고기술책임자",
    characterEmoji: "⚡",
    category: "energy",
    year: 2026,
    leftOption: {
      title: "재생에너지 100% 전환",
      description: "태양광과 풍력 발전으로 모든 공장을 운영합니다.",
      effects: { environment: +20, economy: -15, social: +3, technology: +10 },
      consequences: "높은 초기 투자 비용이지만 장기적 비용 절감과 탄소 저감"
    },
    rightOption: {
      title: "기존 전력 유지",
      description: "현재 전력망을 계속 사용하며 점진적 전환을 검토합니다.",
      effects: { environment: -5, economy: +10, social: -2, technology: -3 },
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
    description: "코로나 이후 직원들의 정신건강과 워라밸에 대한 요구가 증가했습니다. 복지 투자는 비용이지만 생산성과 이직률에 큰 영향을 줍니다.",
    characterName: "박인사 CHO",
    characterRole: "최고인사책임자",
    characterEmoji: "👥",
    category: "social",
    year: 2025,
    leftOption: {
      title: "포괄적 복지 확대",
      description: "정신건강 지원, 육아 지원, 유연근무제를 전면 도입합니다.",
      effects: { environment: +2, economy: -8, social: +18, technology: +5 },
      consequences: "높은 복지 비용이지만 직원 만족도와 생산성 크게 향상"
    },
    rightOption: {
      title: "현 수준 유지",
      description: "현재 복지 수준을 유지하며 필수적인 부분만 개선합니다.",
      effects: { environment: 0, economy: +5, social: -5, technology: 0 },
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
    description: "공급업체의 환경과 노동 기준을 강화하라는 요구가 있습니다. 엄격한 기준은 비용 증가를 가져오지만 브랜드 리스크를 줄일 수 있습니다.",
    characterName: "최공급 CPO",
    characterRole: "최고조달책임자",
    characterEmoji: "🔗",
    category: "governance",
    year: 2026,
    leftOption: {
      title: "엄격한 ESG 기준 적용",
      description: "모든 공급업체에 환경·노동 기준을 적용하고 정기 감사를 실시합니다.",
      effects: { environment: +12, economy: -12, social: +15, technology: +3 },
      consequences: "공급 비용 상승하지만 브랜드 리스크 대폭 감소"
    },
    rightOption: {
      title: "기존 공급망 유지",
      description: "현재 공급업체와의 관계를 유지하며 점진적 개선만 추진합니다.",
      effects: { environment: -3, economy: +8, social: -8, technology: 0 },
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
    description: "AI 도입으로 효율성은 크게 개선되지만 대량 해고가 불가피합니다. 기술 혁신과 사회적 책임 사이에서 선택해야 합니다.",
    characterName: "정혁신 CIO",
    characterRole: "최고정보책임자",
    characterEmoji: "🤖",
    category: "social",
    year: 2027,
    leftOption: {
      title: "AI 전면 도입 + 재교육",
      description: "AI를 도입하되 직원 재교육 프로그램으로 일자리 전환을 지원합니다.",
      effects: { environment: +5, economy: +8, social: +5, technology: +20 },
      consequences: "높은 재교육 비용이지만 혁신과 고용 모두 확보"
    },
    rightOption: {
      title: "제한적 AI 도입",
      description: "고용 유지를 위해 AI 도입을 최소화하고 인력 중심 운영을 계속합니다.",
      effects: { environment: 0, economy: -5, social: +8, technology: -8 },
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
    description: "극한 기후 현상이 빈발하면서 시설 보강과 비즈니스 연속성 계획이 필요합니다. 막대한 투자가 필요하지만 미래 리스크 대응에 필수적입니다.",
    characterName: "한위기 CRO",
    characterRole: "최고리스크책임자",
    characterEmoji: "🌪️",
    category: "crisis",
    year: 2028,
    leftOption: {
      title: "포괄적 기후 적응 투자",
      description: "인프라 강화, 보험 확대, 대체 운영 계획을 포함한 종합 대책을 마련합니다.",
      effects: { environment: +10, economy: -20, social: +8, technology: +12 },
      consequences: "큰 초기 비용이지만 기후 리스크에 대한 강력한 보호막 확보"
    },
    rightOption: {
      title: "최소한 대응",
      description: "필수적인 보험만 추가하고 사후 대응 방식을 유지합니다.",
      effects: { environment: -5, economy: +5, social: -10, technology: -5 },
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
    description: "제품 설계부터 폐기까지 순환경제 모델을 적용하라는 요구가 증가합니다. 전면 전환은 비용이 크지만 자원 효율성과 새로운 수익 모델을 창출할 수 있습니다.",
    characterName: "윤지속 CSO",
    characterRole: "최고지속가능책임자",
    characterEmoji: "♻️",
    category: "climate",
    year: 2029,
    leftOption: {
      title: "순환경제 전면 전환",
      description: "제품 재설계, 재활용 시스템, 서비스형 비즈니스 모델을 도입합니다.",
      effects: { environment: +25, economy: -10, social: +5, technology: +15 },
      consequences: "전환 비용 크지만 장기적 자원 절약과 신규 수익원 창출"
    },
    rightOption: {
      title: "부분적 개선",
      description: "포장재 개선과 재활용률 향상 등 점진적 변화만 추진합니다.",
      effects: { environment: +8, economy: +2, social: +2, technology: +3 },
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
    description: "새로운 ESG 공시 기준이 도입되면서 상세한 데이터 수집과 보고가 필요합니다. 투명한 공시는 신뢰도를 높이지만 부담도 큽니다.",
    characterName: "서공시 CFO",
    characterRole: "최고재무책임자",  
    characterEmoji: "📊",
    category: "governance",
    year: 2025,
    leftOption: {
      title: "선제적 ESG 공시",
      description: "법정 기준을 초과하는 투명하고 상세한 ESG 데이터를 공개합니다.",
      effects: { environment: +8, economy: -5, social: +10, technology: +5 },
      consequences: "공시 비용 증가하지만 투자자 신뢰와 ESG 등급 향상"
    },
    rightOption: {
      title: "최소 기준 준수",
      description: "법적 요구사항만 충족하는 수준에서 ESG 정보를 공개합니다.",
      effects: { environment: +2, economy: +8, social: 0, technology: +2 },
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