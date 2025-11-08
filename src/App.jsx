import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import ViewApplications from './pages/ViewApplications'

function App() {

  return (
    <>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/applications" element={<ViewApplications/>} />
      </Routes>
    </HashRouter>
    </>
  )
}

export default App
