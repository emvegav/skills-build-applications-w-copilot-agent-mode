import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Ranking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Leaderboard</h2>
    <p>Compare team point totals.</p>
    {leaderboard === null && error === null && <p role="status">Loading leaderboard...</p>}
    {error !== null && <p role="alert">Unable to load leaderboard: {error}</p>}
    {leaderboard?.length === 0 && <p>No leaderboard rankings yet.</p>}
    {leaderboard && leaderboard.length > 0 && <ol className="list-group list-group-numbered">
      {leaderboard.map((entry) => <li className="list-group-item" key={entry.rank}>
        <span className="fw-semibold">{entry.teamName}</span> - {entry.totalPoints} points
      </li>)}
    </ol>}
  </div></section>;
}
