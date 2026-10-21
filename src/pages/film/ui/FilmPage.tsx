// 단일 페이지: 스크롤 스테이지가 곧 페이지다.
import { ScrollStage } from '@/widgets/scroll-stage/ui/ScrollStage'

type Props = {
  onExplore: () => void
}

export const FilmPage = ({ onExplore }: Props) => <ScrollStage onExplore={onExplore} />
