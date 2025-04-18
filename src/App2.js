
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage'; // Startsidan
import OtherPage from './OtherPage'; // En annan sida
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Lägg till klassen home-page bara när du är på startsidan */}
        <div className={window.location.pathname === '/' ? 'home-page' : ''}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/other-page" element={<OtherPage />} />
            {/* Lägg till fler sidor här */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
