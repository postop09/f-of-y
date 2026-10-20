// 이력서 데이터의 모양. 화면(entities/resume/ui)과 서버 함수(api/explore.ts)가 같이 쓴다.

export type CategoryId = 'ux' | 'ui' | 'ai' | 'arch' | 'ops' | 'team'

export type Category = {
  id: CategoryId
  label: string
  /** Jev에 넘기는 설명: 이 카테고리에 드는 질문이 어떤 것인가 */
  hint: string
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
  link?: string
}
