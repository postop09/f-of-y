// 이력서 데이터와 탐색 결과의 모양. 화면(ui/)과 서버 함수(api/explore.ts → index.server.ts)가 같이 쓴다.

export type CategoryId = 'ux' | 'ui' | 'ai' | 'arch' | 'ops' | 'team'

export type Category = {
  id: CategoryId
  label: string
  /** Jev에 넘기는 설명: 이 카테고리에 드는 질문이 어떤 것인가 */
  hint: string
}

/** 카드 썸네일과 라이트박스에 보이는 이미지. 파일은 회사별 폴더 public/work/<회사>/ 에 둔다 */
export type ResumeImage = {
  /** public 기준 경로 (예: '/work/successmode/trans1.png'). 서버 함수도 이 파일을 읽으므로 import 하지 않고 문자열로 둔다 */
  src: string
  alt: string
  /** 썸네일 아래·라이트박스에 'fig.N 캡션'으로 */
  caption?: string
  /** 원본 크기: 불러오기 전에 자리를 잡아 두고 썸네일 비율로도 쓴다 */
  w: number
  h: number
}

export type ResumeItem = {
  id: string
  company: string
  period: string
  title: string
  /** 한 줄 요약. Jev가 항목을 고를 때 읽는다 */
  summary: string
  problem: readonly string[]
  solution: readonly string[]
  impl: readonly string[]
  result: readonly string[]
  categories: readonly CategoryId[]
  /** 로컬 매칭용 단어 (소문자) */
  keywords: readonly string[]
  /** 설명 문서 (Notion 등) */
  link?: string
  /** 실제로 돌아가는 서비스 주소 */
  site?: string
  /** 제품 화면·구조도. 없으면 카드는 글만 */
  images?: readonly ResumeImage[]
}

export type ExploreSource = 'jev' | 'local'
/** 항목 하나와 질문의 일치 확률 */
export type ExploreHit = { id: string; p: number }
/** 질문 하나의 탐색 결과. Jev(api/jev)와 키워드 매칭(localMatch)이 같은 모양을 돌려준다 */
export type ExploreResult = {
  source: ExploreSource
  /** jev가 답했을 때 실제 모델 버전 */
  model?: string
  category: CategoryId
  categories: Record<CategoryId, number>
  /** 확률 순, 많아야 TOP개 (lib/rank) */
  items: ExploreHit[]
  /** 이 질문이 이력서(경력·역량)에 대한 것일 확률 */
  aboutResume: number
}
