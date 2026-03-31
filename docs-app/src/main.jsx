import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import App from './App.jsx'

/* Пустая строка после strip tail / = корень приложения; React Router ждёт '/' или подкаталог, не undefined */
const routerBasename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
