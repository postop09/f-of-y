// 질문 하나 → 탐색 결과. /api/explore(Jev)를 먼저 부르고, 서버가 없거나 실패하면 키워드 매칭으로 대신 답한다.
import { type ExploreResult, cleanQuery, isExploreResult } from '@/entities/resume/lib/jev'
import { localMatch } from '@/entities/resume/lib/localMatch'
import { ITEM } from '@/entities/resume/model/resume'

/** 서버 결과에서 모르는 항목은 버린다 (데이터가 서버보다 먼저 바뀐 배포 사이) */
const known = (r: ExploreResult): ExploreResult => ({ ...r, items: r.items.filter((it) => it.id in ITEM) })

export const ask = async (query: string, signal?: AbortSignal): Promise<ExploreResult> => {
  const q = cleanQuery(query) ?? ''
  try {
    const res = await fetch('/api/explore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q }), signal })
    if (res.ok) {
      const body: unknown = await res.json()
      if (isExploreResult(body)) return known(body)
    }
  } catch (err) {
    if (signal?.aborted) throw err
    // no server (file:// export) or offline: fall through
  }
  return localMatch(q)
}
