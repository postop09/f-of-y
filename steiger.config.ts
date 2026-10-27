// FSD 구조 검사 (npm run fsd). 규칙 목록: https://github.com/feature-sliced/steiger
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // 작은 프로젝트: 페이지 하나가 피처 하나·엔티티 하나를 쓰는 게 설계다.
      // features/explore-resume ← pages/explore 만, entities/scene ← pages/film 만이라 항상 걸린다 (pages 는 면제).
      'fsd/insignificant-slice': 'off',
    },
  },
])
