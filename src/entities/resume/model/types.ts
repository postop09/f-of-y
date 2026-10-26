// 이력서 데이터의 모양. 화면(entities/resume/ui)과 서버 함수(api/explore.ts)가 같이 쓴다.

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
