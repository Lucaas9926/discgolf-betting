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
      const { data: picksData } = await supabase
        .from("Picks")
        .select("user_name, event_id, player_id, role")
        .order("event_id");

      const { data: playersData } = await supabase
        .from("Spelare")
        .select("id, name");

      const { data: eventsData } = await supabase
        .from("Events")
        .select("id, name");

      const playerMap = {};
      playersData.forEach((p) => (playerMap[p.id] = p.name));

      const eventMap = {};
      eventsData.forEach((e) => (eventMap[e.id] = e.name));

      setPlayers(playerMap);
      setEvents(eventMap);
      setPicks(picksData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Laddar översikt...</div>;

  const groupedByEventAndUser = {};
  picks.forEach((pick) => {
    const key = `event${pick.event_id}-${pick.user_name}`;
    if (!groupedByEventAndUser[key]) groupedByEventAndUser[key] = [];
    groupedByEventAndUser[key].push({
      name: players[pick.player_id],
      role: pick.role,
    });
  });

  const sortedKeys = Object.keys(groupedByEventAndUser).sort((a, b) => {
    const eventA = parseInt(a.match(/event(\d+)/)[1]);
    const eventB = parseInt(b.match(/event(\d+)/)[1]);
    return eventB - eventA; // Störst (senaste) först
  });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Översikt: Spelarval per användare och event</h2>
      {sortedKeys.map((key) => {
        const [_, user] = key.split("-");
        const eventId = parseInt(key.match(/event(\d+)/)[1]);

        const picksForEvent = groupedByEventAndUser[key];
        const winner = picksForEvent.find(pick => pick.role === "winner");
        const top5 = picksForEvent.filter(pick => pick.role === "top5");

        const sortedPicks = [winner, ...top5]; // Place winner first, then top 5

        return (
          <div key={key} className="mb-4 p-3 border rounded-lg shadow">
            <strong>{events[eventId] || `Event ${eventId}`}</strong> – {user}
            <ul className="list-disc list-inside mt-1">
              {sortedPicks.map((pick, index) => (
                <li key={index}>
                  {pick ? (
                    <>
                      {pick.role === "winner" ? "⭐" : ""} {pick.name} {pick.role === "winner" ? "(Vinnare)" : ""}
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
