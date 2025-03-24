import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase-konfiguration
const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlayerPick() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState({ player_id: null, outside15: false });
  const [top5, setTop5] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayers();
    fetchEvents();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase.from("Spelare").select("id, name").order("name", { ascending: true });
    if (error) {
      setError("Kunde inte hämta spelare.");
    } else {
      setPlayers(data || []);
    }
  }

  async function fetchEvents() {
    const { data, error } = await supabase.from("Events").select("id, name").order("id", { ascending: true });
    if (error) {
      setError("Kunde inte hämta event.");
    } else {
      setEvents(data || []);
    }
  }

  function inTop5(playerId) {
    return top5.some((t) => t.player_id === playerId);
  }

  function selectWinner(id) {
    if (winner.player_id === id) {
      setWinner({ player_id: null, outside15: false });
    } else {
      setTop5((prev) => prev.filter((t) => t.player_id !== id));
      setWinner({ player_id: id, outside15: false });
    }
  }

  function toggleTop5(id) {
    if (inTop5(id)) {
      setTop5((prev) => prev.filter((t) => t.player_id !== id));
    } else if (top5.length < 4 && id !== winner.player_id) {
      setTop5((prev) => [...prev, { player_id: id, outside15: false }]);
    }
  }

  function toggleOutside15TopList(playerId, role) {
    if (role === "winner") {
      setWinner((prev) => ({ ...prev, outside15: !prev.outside15 }));
    } else {
      setTop5((prev) =>
        prev.map((p) =>
          p.player_id === playerId
            ? { ...p, outside15: !p.outside15 }
            : p
        )
      );
    }
  }

  async function submitPicks() {
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

    const { error } = await supabase.from("Picks").insert(inserts);
    if (error) {
      alert("⚠️ Fel vid insättning: " + error.message);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: "2rem" }}>
        <h3>Tack {selectedUser}, dina picks för event {eventId} har sparats!</h3>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div style={styles.container}>
        <h2>Välj din användare</h2>
        {["Lucas", "Erik", "Hampus", "Fredrik"].map((u) => (
          <button key={u} onClick={() => setSelectedUser(u)} style={{ marginRight: "1rem" }}>{u}</button>
        ))}
      </div>
    );
  }

  if (!eventId) {
    return (
      <div style={styles.container}>
        <h2>Välj event</h2>
        <select onChange={(e) => setEventId(parseInt(e.target.value))} defaultValue="" style={{ padding: "0.5rem", fontSize: "1rem" }}>
          <option value="" disabled>-- Välj ett event --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Hej {selectedUser}, välj 1 vinnare + 4 topp5 för event {eventId}</h2>

      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f0f0", border: "1px solid #ccc" }}>
        <h3>Dina val:</h3>
        <p><strong>Vinnare:</strong> {winner.player_id ? (
          <>
            {players.find((p) => p.id === winner.player_id)?.name}
            <label style={{ marginLeft: "10px" }}>
              <input
                type="checkbox"
                checked={winner.outside15}
                onChange={() => toggleOutside15TopList(winner.player_id, "winner")}
              /> Utanför topp 15
            </label>
          </>
        ) : "(ingen vald)"}</p>

        <p><strong>Topp-5:</strong></p>
        <ul>
          {top5.map((t, i) => (
            <li key={i}>
              {players.find((p) => p.id === t.player_id)?.name}
              <label style={{ marginLeft: "10px" }}>
                <input
                  type="checkbox"
                  checked={t.outside15}
                  onChange={() => toggleOutside15TopList(t.player_id, "top5")}
                /> Utanför topp 15
              </label>
            </li>
          ))}
        </ul>
        <button onClick={submitPicks} style={{ padding: "0.5rem 1rem" }}>Bekräfta mina val</button>
      </div>

      <input type="text" placeholder="Sök spelare..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }} />

      {players.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
        const isWinner = winner.player_id === p.id;
        const top5Entry = top5.find((t) => t.player_id === p.id);
        return (
          <div key={p.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "0.5rem", paddingBottom: "0.5rem" }}>
            <strong>{p.name}</strong> {isWinner && "🏆"} {top5Entry && "⭐"}<br />
            <button onClick={() => selectWinner(p.id)} style={{ marginRight: "0.5rem" }}>{isWinner ? "Avmarkera Vinnare" : "Välj Vinnare"}</button>
            <button onClick={() => toggleTop5(p.id)} style={{ marginRight: "0.5rem" }} disabled={isWinner}>{top5Entry ? "Ta bort Top5" : "Välj Top5"}</button>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
  },
};
