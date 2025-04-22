
// Scoreboard.js – visar poäng per event + totalställning
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Scoreboard() {
  const [scores, setScores] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const { data: eventsData } = await supabase.from("Events").select("id, name, is_major");
      const { data: resultsData } = await supabase.from("results").select("event_id, player_id, position");
      const { data: picksData } = await supabase.from("Picks").select("user_name, event_id, player_id, role, outside15");

      if (!eventsData || !resultsData || !picksData) return;

      const scoreMap = {};
      const eventMap = {};
      eventsData.forEach((e) => (eventMap[e.id] = { name: e.name, is_major: e.is_major }));

      picksData.forEach((pick) => {
        const event = pick.event_id;
        const user = pick.user_name;
        const role = pick.role;
        const isMajor = eventMap[event]?.is_major;
        const result = resultsData.find((r) => r.event_id === event && r.player_id === pick.player_id);
        const pos = result?.position;

        if (!scoreMap[user]) scoreMap[user] = {};
        if (!scoreMap[user][event]) scoreMap[user][event] = 0;

        let point = 0;
        if (role === "winner") {
          if (pos === 1) {
            point = 5;
          } else if (pos && pos <= 5) {
            point = 1;
          }
        } else if (role === "top5" && pos && pos <= 5) {
          point = 1;
        }

        if (point > 0) {
          if (pick.outside15) point *= 2;
          if (isMajor) point *= 2;
          scoreMap[user][event] += point;
        }
      });

      setEvents(eventsData);
      setScores(scoreMap);
      setLoading(false);
    };

    fetchScores();
  }, []);

  if (loading) return <div className="p-4">Laddar poängställning...</div>;

  const users = Object.keys(scores);
  const eventIds = [...new Set(events.map((e) => e.id))].sort((a, b) => a - b);

  const totalPoints = users.map((user) => ({
    user,
    total: eventIds.reduce((acc, eid) => acc + (scores[user]?.[eid] || 0), 0),
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 Totalställning</h2>
      <ul className="mb-6">
        {totalPoints.map((u, i) => (
          <li key={u.user} className="mb-1">
            {i + 1}. <strong>{u.user}</strong> – {u.total} poäng
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold mb-2">Poäng per event</h3>
      <div className="space-y-4">
        {eventIds.map((eid) => {
          const event = events.find((e) => e.id === eid);
          return (
            <div key={eid} className="border p-3 rounded-xl shadow bg-gray-50">
              <h4 className="font-semibold">{event?.name}</h4>
              <ul className="pl-4 list-disc">
                {users.map((u) => (
                  <li key={u}>
                    {u}: {scores[u]?.[eid] || 0} poäng
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
