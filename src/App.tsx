import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LaunchList } from './pages/LaunchList';
import { LaunchDetails } from './pages/LaunchDetails';


function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<LaunchList />} />
        <Route path="/launch/:id" element={<LaunchDetails />} />
      </Routes>
    </Router>
  )
}

export default App
