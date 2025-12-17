import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import MistakesPage from './pages/MistakesPage'
import MistakeDetailPage from './pages/MistakeDetailPage'
import GeneratePage from './pages/GeneratePage'
import StatsPage from './pages/StatsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="mistakes" element={<MistakesPage />} />
        <Route path="mistakes/new" element={<MistakeDetailPage />} />
        <Route path="mistakes/:id" element={<MistakeDetailPage />} />
        {/* TODO: 实现导入错题页面，目前占位避免404 */}
        <Route path="mistakes/import" element={<MistakesPage />} />
        <Route path="generate" element={<GeneratePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App