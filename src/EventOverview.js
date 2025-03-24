
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Byt till dina egna, förstås
const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function EventOverview() {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState({});
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Hämta alla events
      const { data: eventsData, error: eventsError } = await supabase
        .from("Events")
        .select("id, name, is_major")
        .order("id");

      // 2. Hämta alla spelare
      const { data: playersData, error: playersError } = await supabase
        .from("Spelare")
        .select("id, name");

      // 3. Hämta alla picks
      const { data: picksData, error: picksError } = await supabase
        .from("Picks")
        .select("user_name, event_id, role, player_id");

      if (eventsError || playersError || picksError) {
        setError("Något gick fel när data hämtades.");
        setLoading(false);
        return;
      }

      // Skapa en map: player_id -> player_name
      const playerMap = {};
      playersData.forEach((p) => {
        playerMap[p.id] = p.name;
      });

      setPlayers(playerMap);
      setEvents(eventsData);
      setPicks(picksData);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <div style={styles.container}>Laddar översikt...</div>;
  }

  if (error) {
    return <div style={styles.container}>{error}</div>;
  }

  // 🏗 Bygg en struktur: events -> [picks...]
  // Ex: eventPicksMap[event_id] -> [ { user_name, role, player_id }, ... ]
  const eventPicksMap = {};
  picks.forEach((pick) => {
    if (!eventPicksMap[pick.event_id]) {
      eventPicksMap[pick.event_id] = [];
    }
    eventPicksMap[pick.event_id].push(pick);
  });

  // Sortera events efter ID
  events.sort((a, b) => a.id - b.id);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Översikt – Picks per Event</h2>
      {events.map((ev) => {
        const thisEventPicks = eventPicksMap[ev.id] || [];
        // Group picks by user_name
        const userMap = {}; 
        thisEventPicks.forEach((pk) => {
          if (!userMap[pk.user_name]) {
            userMap[pk.user_name] = { winner: null, top5: [] };
          }
          if (pk.role === "winner") {
            userMap[pk.user_name].winner = pk.player_id;
          } else if (pk.role === "top5") {
            userMap[pk.user_name].top5.push(pk.player_id);
          }
        });

        // Hämta nycklar (alla användare) i bokstavsordning
        const usersSorted = Object.keys(userMap).sort();

        return (
          <div key={ev.id} style={styles.eventCard}>
            <div style={styles.eventHeader}>
              <h3 style={styles.eventName}>
                {ev.name} {ev.is_major ? " (Major)" : ""}
              </h3>
            </div>
            {usersSorted.length === 0 ? (
              <p style={{ marginLeft: "1rem" }}>
                Inga picks än för detta event.
              </p>
            ) : (
              usersSorted.map((uname) => {
                const data = userMap[uname];
                return (
                  <div key={uname} style={styles.userRow}>
                    <strong style={{ marginRight: "0.5rem" }}>{uname}</strong>
                    <span>
                      Vinnare:{" "}
                      {data.winner
                        ? players[data.winner]
                        : "(ingen vald)"}
                      {" | "}
                      Topp-5:{" "}
                      {data.top5.length > 0
                        ? data.top5.map((id) => players[id]).join(", ")
                        : "(inga valda)"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif"
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    textAlign: "center"
  },
  eventCard: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#f9f9f9"
  },
  eventHeader: {
    marginBottom: "0.5rem"
  },
  eventName: {
    margin: 0,
    fontSize: "1.2rem"
  },
  userRow: {
    marginLeft: "1rem",
    marginTop: "0.5rem"
  }
};
