import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Article from './components/Article'
import NewsArticle from './components/NewsArticle'
import NewsHubPage from './components/news/NewsHubPage'
import DocsDashboardPage from './components/dashboard/DocsDashboardPage'
import SearchPage from './components/search/SearchPage'
import SectionPdfBundlePage from './components/SectionPdfBundlePage'
import './App.css'

export default function App() {
  return (
    <Routes>
      {/* pathless layout: оборачивает все страницы; catch-all * надёжнее :segment/* для RR 7 */}
      <Route element={<Layout />}>
        <Route index element={<DocsDashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="section-pdf-bundle" element={<SectionPdfBundlePage />} />
        <Route path="news" element={<NewsHubPage />} />
        <Route path="news/*" element={<NewsArticle />} />
        <Route path="*" element={<Article />} />
      </Route>
    </Routes>
  )
}
