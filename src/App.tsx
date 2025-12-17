import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'))
const Procedures = lazy(() => import('./pages/Procedures/Procedures'))
const ProcedureDetail = lazy(() => import('./pages/ProcedureDetail/ProcedureDetail'))
const About = lazy(() => import('./pages/About/About'))
const Reviews = lazy(() => import('./pages/Reviews/Reviews'))
const Contacts = lazy(() => import('./pages/Contacts/Contacts'))

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <div>Загрузка...</div>
  </div>
)

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/procedures" element={<Procedures />} />
          <Route path="/procedures/:id" element={<ProcedureDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App

