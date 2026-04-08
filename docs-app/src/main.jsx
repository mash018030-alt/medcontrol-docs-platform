import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
/* Версии документации: отдельный файл, чтобы сбросы App.css не убирали стили переключателя */
import './styles/docsVersionSwitcher.css'
import App from './App.jsx'
import RootErrorBoundary from './RootErrorBoundary.jsx'

/* Корень: после strip пусто → basename не передаём (undefined), иначе RR7 нормализует и так. Подкаталог: /repo-name */
const stripped = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const routerBasename = stripped === '' ? undefined : stripped

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<p style="font-family:sans-serif;padding:1rem">Нет элемента #root в index.html</p>'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <BrowserRouter basename={routerBasename}>
          <App />
        </BrowserRouter>
      </RootErrorBoundary>
    </StrictMode>,
  )
}
