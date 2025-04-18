
// Översiktssida – visar alla användares val per event, sorterade med vinnaren först

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PlayerPickOverview() {
  const [picks, setPicks] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: picksData } = await supabase.from("Picks").select("user_name, event_id, player_id, role").order("event_id");
      const { data: playersData } = await supabase.from("Spelare").select("id, name");

      const playerMap = {};
      playersData?.forEach((p) => (playerMap[p.id] = p.name));

      setPlayers(playerMap);
      setPicks(picksData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Laddar val...</div>;

  const groupedByUserAndEvent = {};
  picks.forEach((pick) => {
    const key = `${pick.user_name}-event${pick.event_id}`;
    if (!groupedByUserAndEvent[key]) groupedByUserAndEvent[key] = [];
    groupedByUserAndEvent[key].push({ ...pick, name: players[pick.player_id] });
  });

  const sortedKeys = Object.keys(groupedByUserAndEvent).sort((a, b) => {
    const aEvent = parseInt(a.split("-event")[1]);
    const bEvent = parseInt(b.split("-event")[1]);
    return bEvent - aEvent;
  });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Översikt: Spelarval per användare och event</h2>
      {sortedKeys.map((key) => {
        const [user, event] = key.split("-event");
        const picks = groupedByUserAndEvent[key];
        const winner = picks.find(p => p.role === "winner");
        const top5 = picks.filter(p => p.role === "top5");

        return (
          <div key={key} className="mb-4 p-3 border rounded-lg shadow">
            <strong>{user}</strong> – Event {event}
            <ul className="list-disc list-inside mt-2">
              {winner && (
                <li key={winner.player_id}>⭐ {winner.name} (Vinnare)</li>
              )}
              {top5.map((pick) => (
                <li key={pick.player_id}>{pick.name}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
