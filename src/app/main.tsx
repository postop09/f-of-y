import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/index.css'
import { FilmPage } from '@/pages/film/ui/FilmPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FilmPage />
  </StrictMode>,
)
