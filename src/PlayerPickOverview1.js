
// Översiktssida – visar endast spelarval per användare och event, utan poängberäkningar

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlayerPickOverview() {
  const [picks, setPicks] = useState([]);
  const [players, setPlayers] = useState({});
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: picksData } = await supabase.from("Picks").select("user_name, event_id, player_id, role");
      const { data: playersData } = await supabase.from("Spelare").select("id, name");
      const { data: eventsData } = await supabase.from("Events").select("id, name");

      const playerMap = {};
      playersData?.forEach((p) => (playerMap[p.id] = p.name));

      const eventMap = {};
      eventsData?.forEach((e) => (eventMap[e.id] = e.name));

      setPlayers(playerMap);
      setEvents(eventMap);
      setPicks(picksData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Laddar val...</div>;

  const grouped = {};
  picks.forEach((pick) => {
    const key = `${pick.user_name}-event${pick.event_id}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ name: players[pick.player_id], role: pick.role });
  });

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Spelarval per användare och event</h2>
      {sortedKeys.map((key) => {
        const [user, eventId] = key.split("-event");
        const eventName = events[eventId] || `Event ${eventId}`;
        return (
          <div key={key} className="mb-4 p-3 border rounded-lg shadow">
            <strong>{user}</strong> – {eventName}
            <ul className="list-disc list-inside mt-2">
              {grouped[key].map((item, index) => (
                <li key={index}>
                  {item.name} {item.role === "winner" ? "(Vinnare)" : "(Top-5)"}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
