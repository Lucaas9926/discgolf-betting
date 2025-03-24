
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlayerPick() {
  const [players, setPlayers] = useState([]);
  const [eventId, setEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [winner, setWinner] = useState({});
  const [top5, setTop5] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchEvents();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase.from("Spelare").select("id, name").order("name", { ascending: true });
    if (data) setPlayers(data);
    else console.error("Fel vid hämtning av spelare:", error);
  }

  async function fetchEvents() {
    const { data, error } = await supabase.from("Events").select("id, name").order("id", { ascending: true });
    if (data) setEvents(data);
    else console.error("Fel vid hämtning av events:", error);
  }

  function togglePick(playerId, role) {
    if (role === "winner") {
      setWinner((prev) => ({
        player_id: playerId,
        outside15: prev.player_id === playerId ? !prev.outside15 : false,
      }));
    } else {
      setTop5((prev) => {
        const exists = prev.find((p) => p.player_id === playerId);
        if (exists) return prev.filter((p) => p.player_id !== playerId);
        if (prev.length < 4) return [...prev, { player_id: playerId, outside15: false }];
        return prev;
      });
    }
  }

  function toggleOutside15(playerId, role) {
    if (role === "winner") {
      setWinner((prev) => ({ ...prev, outside15: !prev.outside15 }));
    } else {
      setTop5((prev) =>
        prev.map((p) =>
          p.player_id === playerId ? { ...p, outside15: !p.outside15 } : p
        )
      );
    }
  }

  async function submitPicks() {
    console.log('📤 Försöker spara picks...');
    if (!selectedUser || !eventId) return;

    if (!winner.player_id || top5.length !== 4) {
      alert("Du måste välja 1 vinnare och exakt 4 top-5 spelare innan du kan bekräfta.");
      return;
    }

    const inserts = [];

    inserts.push({
      user_name: selectedUser,
      event_id: eventId,
      player_id: winner.player_id,
      role: "winner",
      outside15: winner.outside15,
    });

    top5.forEach((t) => {
      inserts.push({
        user_name: selectedUser,
        event_id: eventId,
        player_id: t.player_id,
        role: "top5",
        outside15: t.outside15,
      });
    });

    console.log("Inserts:", inserts);
    const { error } = await supabase.from("Picks").insert(inserts);
    console.log("Supabase svar:", error);
    if (error) {
      console.error("Fel vid insättning:", error);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <h2>Gör dina val</h2>

      <div style={{ marginBottom: "1rem" }}>
<p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>Om listan är tom, kontrollera att spelare hämtats korrekt.</p>
        <label>Välj person:</label><br />
        {["Lucas", "Erik", "Hampus", "Fredrik"].map((u) => (
          <button key={u} onClick={() => setSelectedUser(u)} style={{ marginRight: "0.5rem", padding: "0.5rem" }}>
            {u}
          </button>
        ))}
      </div>

      {selectedUser && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label>Välj event:</label><br />
            <select onChange={(e) => setEventId(parseInt(e.target.value))} value={eventId || ""}>
              <option value="">-- Välj event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <input type="text" placeholder="Sök spelare..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} />
          </div>

          <div>
            {players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <div key={p.id} style={{ marginBottom: "0.3rem", padding: "0.3rem", borderBottom: "1px solid #ccc" }}>
                {p.name}
                <button onClick={() => togglePick(p.id, "winner")} style={{ marginLeft: "1rem" }}>Välj vinnare</button>
                <button onClick={() => togglePick(p.id, "top5")} style={{ marginLeft: "0.5rem" }}>Välj topp-5</button>
                {(winner.player_id === p.id || top5.find(t => t.player_id === p.id)) && (
                  <button onClick={() => toggleOutside15(p.id, winner.player_id === p.id ? "winner" : "top5")} style={{ marginLeft: "0.5rem" }}>
                    {((winner.player_id === p.id && winner.outside15) || (top5.find(t => t.player_id === p.id)?.outside15)) ? "Ta bort utanför top 15" : "Markera utanför top 15"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
<p>🔍 Antal spelare laddade: {players.length}</p>
            <h4>Dina aktiva val:</h4>
            <p>Vinnare: {players.find(p => p.id === winner.player_id)?.name} {winner.outside15 ? "(Utanför topp 15)" : ""}</p>
            <p>Topp-5:</p>
            <ul>
              {top5.map((t, idx) => (
                <li key={idx}>
                  {players.find(p => p.id === t.player_id)?.name} {t.outside15 ? "(Utanför topp 15)" : ""}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={submitPicks} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Bekräfta mina val
          </button>
          {submitted && <p style={{ color: "green" }}>Valen sparades!</p>}
        </>
      )}
    </div>
  );
}
