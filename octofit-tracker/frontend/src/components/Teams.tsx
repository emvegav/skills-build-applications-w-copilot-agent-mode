import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Teams</h2>
    <p>Manage teams and members.</p>
    {teams === null && error === null && <p role="status">Loading teams...</p>}
    {error !== null && <p role="alert">Unable to load teams: {error}</p>}
    {teams?.length === 0 && <p>No teams yet.</p>}
    {teams && teams.length > 0 && <ul className="list-group">
      {teams.map((team, index) => <li className="list-group-item" key={`${team.name}-${index}`}>
        <h3 className="h5">{team.name}</h3>
        {team.mascot && <p>Mascot: {team.mascot}</p>}
        <p className="mb-0">{team.members.length} {team.members.length === 1 ? 'member' : 'members'}</p>
      </li>)}
    </ul>}
  </div></section>;
}
