import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home/Home'
import Procedures from './pages/Procedures/Procedures'
import ProcedureDetail from './pages/ProcedureDetail/ProcedureDetail'
import About from './pages/About/About'
import Reviews from './pages/Reviews/Reviews'
import Contacts from './pages/Contacts/Contacts'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/procedures" element={<Procedures />} />
        <Route path="/procedures/:id" element={<ProcedureDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />
      </Routes>
    </Layout>
  )
}

export default App

