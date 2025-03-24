
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PointsOverview() {
  const [data, setData] = useState([]);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: picksData } = await supabase
        .from("Picks")
        .select("user_name, player_id, role, event_id");

      const { data: playersData } = await supabase
        .from("Spelare")
        .select("id, name");

      const { data: eventsData } = await supabase
        .from("Events")
        .select("id, name, is_major");

      const playerMap = {};
      playersData?.forEach((p) => {
        playerMap[p.id] = p.name;
      });
      setPlayers(playerMap);

      const countMap = {};

      picksData?.forEach((pick) => {
        const key = pick.user_name;
        const isMajor = eventsData.find((e) => e.id === pick.event_id)?.is_major;

        if (!countMap[key]) {
          countMap[key] = { regular: {}, major: {} };
        }

        if (pick.role === "winner") {
          const playerName = playerMap[pick.player_id] || "Okänd spelare";
          if (isMajor) {
            countMap[key].major[playerName] = (countMap[key].major[playerName] || 0) + 1;
          } else {
            countMap[key].regular[playerName] = (countMap[key].regular[playerName] || 0) + 1;
          }
        }
      });

      setData(countMap);
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Statistik – Spelare valda som vinnare</h2>
      {Object.entries(data).map(([user, picks]) => (
        <div key={user} className="mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold mb-2">{user}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">🏅 Vald som vinnare (vanliga event)</h4>
              <ul className="list-disc list-inside">
                {Object.entries(picks.regular).map(([player, count]) => (
                  <li key={player}>{player}: {count} gånger</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🌟 Vald som vinnare (majors)</h4>
              <ul className="list-disc list-inside">
                {Object.entries(picks.major).map(([player, count]) => (
                  <li key={player}>{player}: {count} gånger</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
