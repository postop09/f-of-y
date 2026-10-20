// 화면 고르기: 주소의 해시 하나로 정한다. 없으면 영상, #explore 면 explore. 뒤로·앞으로 가기도 그대로 된다.
import { useEffect, useState } from 'react'
import { ExplorePage } from '@/pages/explore/ui/ExplorePage'
import { FilmPage } from '@/pages/film/ui/FilmPage'

type Route = 'film' | 'explore'

const current = (): Route => (window.location.hash === '#explore' ? 'explore' : 'film')

export const App = () => {
  const [route, setRoute] = useState(current)
  /** explore를 한 번 다녀왔다: 영상으로 돌아오면 처음이 아니라 마지막 프레임(live)에서 연다 */
  const [visited, setVisited] = useState(() => current() === 'explore')

  const show = (r: Route) => {
    setRoute(r)
    if (r === 'explore') setVisited(true)
  }
  const go = (r: Route) => {
    window.history.pushState(null, '', r === 'explore' ? '#explore' : window.location.pathname + window.location.search)
    show(r)
  }

  useEffect(() => {
    const onPop = () => show(current())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return route === 'explore' ? <ExplorePage onBack={() => go('film')} /> : <FilmPage startAtEnd={visited} onExplore={() => go('explore')} />
}
