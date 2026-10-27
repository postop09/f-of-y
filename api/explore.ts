// POST /api/explore { q } → 탐색 결과 (ExploreResult). Vercel 함수이고, 개발 중엔 vite.config.ts의 플러그인이 같은 함수를 부른다.
// TYPESAFE_API_KEY로 Jev를 부르는 곳은 여기뿐이다. 키는 브라우저로 나가지 않는다.
// 응답에는 id와 확률만 담는다; 화면이 자기 이력서 데이터로 그린다.
import { buildJevRequest, cleanQuery, readJevResponse } from '../src/entities/resume/index.server.js'

const JEV_URL = 'https://api.typesafe.ai/v1/systemone'
const TIMEOUT = 8000

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

const callJev = (key: string, body: unknown) =>
  fetch(JEV_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  })

export async function POST(req: Request): Promise<Response> {
  const key = process.env.TYPESAFE_API_KEY
  if (!key) return json(503, { error: 'jev_not_configured' })
  let q: string | null = null
  try {
    q = cleanQuery(((await req.json()) as { q?: unknown } | null)?.q)
  } catch {
    // not JSON
  }
  if (!q) return json(400, { error: 'empty_question' })

  const body = buildJevRequest(q)
  try {
    let res = await callJev(key, body)
    // rate limited or overloaded: one short retry
    if (res.status === 429 || res.status === 529) {
      await new Promise((r) => setTimeout(r, 600))
      res = await callJev(key, body)
    }
    if (!res.ok) return json(502, { error: 'jev_failed', status: res.status })
    const out = readJevResponse(await res.json())
    return out ? json(200, out) : json(502, { error: 'jev_bad_response' })
  } catch {
    return json(502, { error: 'jev_unreachable' })
  }
}
