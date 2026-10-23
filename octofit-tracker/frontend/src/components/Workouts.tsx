import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { title: string; reason: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then((data) => setSuggestions(data.suggestions))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Workout suggestions</h2>
    <p>Recommend workouts from activity patterns.</p>
    {suggestions === null && error === null && <p role="status">Loading workout suggestions...</p>}
    {error !== null && <p role="alert">Unable to load workout suggestions: {error}</p>}
    {suggestions?.length === 0 && <p>No workout suggestions yet.</p>}
    {suggestions && suggestions.length > 0 && <ul className="list-group">
      {suggestions.map((suggestion, index) => <li className="list-group-item" key={`${suggestion.title}-${index}`}>
        <h3 className="h5">{suggestion.title}</h3>
        <p className="mb-0">{suggestion.reason}</p>
      </li>)}
    </ul>}
  </div></section>;
}
