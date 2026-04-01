import SearchBar from './SearchBar'
import DocsDashboardGrid from './DocsDashboardGrid'

export default function DocsDashboardPage() {
  return (
    <div className="docs-dashboard docs-dashboard--home">
      <h1 className="docs-dashboard-page-title">Документация</h1>
      <SearchBar />
      <DocsDashboardGrid />
    </div>
  )
}
