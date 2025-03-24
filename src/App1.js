
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayerPick from "./PlayerPick";
import PlayerPickOverview from "./PlayerPickOverview";
import PointsOverview from "./PointsOverview";
import Scoreboard from "./Scoreboard";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem", background: "#eee", display: "flex", gap: "1rem" }}>
        <Link to="/">Gör val</Link>
        <Link to="/oversikt">Översikt</Link>
        <Link to="/poangoversikt">Poängöversikt</Link>
        <Link to="/scoreboard">Poängställning</Link>
      </div>
      <Routes>
        <Route path="/" element={<PlayerPick />} />
        <Route path="/oversikt" element={<PlayerPickOverview />} />
        <Route path="/poangoversikt" element={<PointsOverview />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}

export default App;
