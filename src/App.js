
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayerPick from "./PlayerPick";
import PlayerPickOverview from "./PlayerPickOverview";
import Scoreboard from "./Scoreboard";
import PointsOverview from "./PointsOverview";

function App() {
  return (
    <Router>
      <div className="App" style={{ padding: "1rem" }}>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>Gör val</Link>
          <Link to="/oversikt" style={{ marginRight: "1rem" }}>Översikt</Link>
          <Link to="/scoreboard" style={{ marginRight: "1rem" }}>Poängställning</Link>
          <Link to="/vinnare">Vinnare</Link>
        </nav>
        <Routes>
          <Route path="/" element={<PlayerPick />} />
          <Route path="/oversikt" element={<PlayerPickOverview />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/vinnare" element={<PointsOverview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
