// 화면 고르기: 주소의 해시 하나로 정한다. 없으면 영상, #explore 면 explore. 뒤로·앞으로 가기도 그대로 된다.
// 화면을 바꿀 때마다 맨 위에서 연다: explore 에서 cd .. 로 돌아오면 영상의 1번 장면이다.
import { useEffect, useState } from 'react'
import { ExplorePage } from '@/pages/explore/ui/ExplorePage'
import { FilmPage } from '@/pages/film/ui/FilmPage'

type Route = 'film' | 'explore'

const current = (): Route => (window.location.hash === '#explore' ? 'explore' : 'film')

export const App = () => {
  const [route, setRoute] = useState(current)

  const show = (r: Route) => {
    // 두 화면이 한 문서의 스크롤을 같이 쓴다: 앞 화면의 위치를 들고 가지 않게
    window.scrollTo(0, 0)
    setRoute(r)
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

  return route === 'explore' ? <ExplorePage onBack={() => go('film')} /> : <FilmPage onExplore={() => go('explore')} />
}
