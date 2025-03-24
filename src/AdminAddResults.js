
// Adminsida – lägg in resultat (position & poäng) för spelare i event

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zektckgebpruapookdby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Rja2dlYnBydWFwb29rZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjIzMjMsImV4cCI6MjA1ODMzODMyM30._U-wG30hnVrLWOeLt2YYd0BeqDF2qTYXBbQGhgIIf7w";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminAddResults() {
  const [players, setPlayers] = useState([]);
  const [eventNumber, setEventNumber] = useState(1);
  const [results, setResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from("Spelare").select("id, name").order("name");
      if (!error) {
        setPlayers(data);
        setResults(data.map((player) => ({
          player_id: player.id,
          position: '',
          points: ''
        })));
      }
    };
    fetchPlayers();
  }, []);

  const updateResult = (index, field, value) => {
    const updated = [...results];
    updated[index][field] = value;
    setResults(updated);
  };

  const submitResults = async () => {
    const inserts = results
      .filter(r => r.points !== '' && r.position !== '')
      .map(r => ({
        event_number: eventNumber,
        player_id: r.player_id,
        position: parseInt(r.position),
        points: parseInt(r.points)
      }));

    const { error } = await supabase.from("results").insert(inserts);
    if (!error) setSubmitted(true);
  };

  if (submitted) return <div className="p-4 text-green-600">Resultat sparade för event {eventNumber} ✅</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin – Lägg in resultat för Event {eventNumber}</h2>
      <label className="block mb-4">
        Eventnummer:
        <input
          type="number"
          value={eventNumber}
          onChange={(e) => setEventNumber(parseInt(e.target.value))}
          className="ml-2 border px-2 py-1"
        />
      </label>
      <table className="w-full text-left mb-4">
        <thead>
          <tr>
            <th>Spelare</th>
            <th>Position</th>
            <th>Poäng</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>
                <input
                  type="number"
                  value={results[index]?.position}
                  onChange={(e) => updateResult(index, 'position', e.target.value)}
                  className="border px-1 py-0.5 w-16"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={results[index]?.points}
                  onChange={(e) => updateResult(index, 'points', e.target.value)}
                  className="border px-1 py-0.5 w-16"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={submitResults} className="bg-green-600 text-white px-4 py-2 rounded">
        Spara resultat
      </button>
    </div>
  );
}
