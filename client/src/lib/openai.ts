import { OpenAI } from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용하기 위한 설정
});

// 대표자별 프롬프트 템플릿
const REPRESENTATIVE_PROMPTS = {
  environment: `환경부 장관의 입장에서 환경 정책과 지속가능성에 관한 질문을 생성해주세요.
  - 탄소 배출, 재생 에너지, 환경 보호, 기후 변화 등의 주제
  - 각 선택지는 환경 점수에 큰 영향을 주어야 함
  - 다른 분야(사회,지배구조,재정)에도 약간의 영향이 있어야 함`,
  
  social: `노동조합 대표의 입장에서 사회 정의와 노동권에 관한 질문을 생성해주세요.
  - 근로 조건, 임금, 복지, 노사관계 등의 주제
  - 각 선택지는 사회 점수에 큰 영향을 주어야 함
  - 다른 분야(환경,지배구조,재정)에도 약간의 영향이 있어야 함`,
  
  governance: `윤리위원장의 입장에서 기업 윤리와 지배구조에 관한 질문을 생성해주세요.
  - 투명성, 책임경영, 부패방지, 의사결정 등의 주제
  - 각 선택지는 지배구조 점수에 큰 영향을 주어야 함
  - 다른 분야(환경,사회,재정)에도 약간의 영향이 있어야 함`,
  
  money: `재무이사의 입장에서 재정과 투자에 관한 질문을 생성해주세요.
  - 예산 배분, 투자 결정, 비용 절감, 수익성 등의 주제
  - 각 선택지는 재정 점수에 큰 영향을 주어야 함
  - 다른 분야(환경,사회,지배구조)에도 약간의 영향이 있어야 함`
};

// OpenAI API를 사용하여 시나리오 생성
export async function generateScenarios(representative: keyof typeof REPRESENTATIVE_PROMPTS, count: number = 13) {
  try {
    const prompt = REPRESENTATIVE_PROMPTS[representative];
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `ESG 경영 시뮬레이션 게임을 위한 시나리오를 생성합니다.
            각 시나리오는 다음 형식을 따라야 합니다:
            {
              "id": "unique_id",
              "type": "E/S/G/M",
              "representative": "environment/social/governance/money",
              "npc_name": "NPC 이름",
              "npc_emoji": "이모지",
              "text": "질문 내용",
              "option_left": {
                "text": "첫 번째 선택지",
                "effects": {
                  "environment": -10~20,
                  "social": -10~20,
                  "governance": -10~20,
                  "money": -10~20
                }
              },
              "option_right": {
                "text": "두 번째 선택지",
                "effects": {
                  "environment": -10~20,
                  "social": -10~20,
                  "governance": -10~20,
                  "money": -10~20
                }
              }
            }
            
            주요 점수는 -15~20 사이,
            부가 점수는 -5~10 사이로 설정하세요.`
        },
        {
          role: "user",
          content: `${prompt}\n${count}개의 시나리오를 JSON 배열 형식으로 생성해주세요.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2500
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    // JSON 파싱
    const scenarios = JSON.parse(content);
    return Array.isArray(scenarios) ? scenarios : [scenarios];

  } catch (error) {
    console.error('Error generating scenarios:', error);
    return [];
  }
}

// 모든 대표자의 시나리오 생성
export async function generateAllScenarios() {
  const representatives = Object.keys(REPRESENTATIVE_PROMPTS) as Array<keyof typeof REPRESENTATIVE_PROMPTS>;
  const allScenarios = [];
  
  for (const rep of representatives) {
    const scenarios = await generateScenarios(rep);
    allScenarios.push(...scenarios);
  }
  
  return shuffleArray(allScenarios);
}

// 배열을 무작위로 섞는 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
