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
        <Route path="mistakes/:id" element={<MistakeDetailPage />} />
        <Route path="generate" element={<GeneratePage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App