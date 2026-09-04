import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function Waitlist() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/rooms')
      .then((res) => setRooms(res.data.rooms))
      .catch((err) => setError(err.response?.data?.message || 'Could not load rooms.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheck(id) {
    setRoomId(id);
    setError('');
    if (!id) {
      setEntries([]);
      return;
    }
    setChecking(true);
    try {
      const res = await api.get(`/waitlist/${id}`);
      setEntries(res.data.waitlist);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the waitlist for this room.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <PageShell
      title="Waitlist"
      subtitle="See how the priority-score ranking works for a full room — highest score gets promoted first when a seat opens up."
      wide
    >
      <div className="max-w-sm">
        <label className="block text-sm font-medium text-ink">Room</label>
        {loading ? (
          <p className="mt-1 text-sm text-muted">Loading rooms…</p>
        ) : (
          <select className={inputClass} value={roomId} onChange={(e) => handleCheck(e.target.value)}>
            <option value="">Select a room</option>
            {rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>
                {new Date(r.room_date).toLocaleDateString()} {r.start_time?.slice(0, 5)}–
                {r.end_time?.slice(0, 5)} · {r.sitter_name} {r.seats_left <= 0 ? '(full)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {roomId && !checking && (
        <div className="mt-6">
          {entries.length === 0 ? (
            <p className="text-sm text-muted">No one is waitlisted for this room.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl2 bg-surface shadow-sm ring-1 ring-black/5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-muted">
                    <th className="px-5 py-3 font-medium">Rank</th>
                    <th className="px-5 py-3 font-medium">Child</th>
                    <th className="px-5 py-3 font-medium">Tier</th>
                    <th className="px-5 py-3 font-medium">Requested</th>
                    <th className="px-5 py-3 font-medium">Priority score</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.waitlist_id} className="border-b border-black/5">
                      <td className="px-5 py-3 font-semibold text-ink">
                        {i === 0 ? '★ 1' : `#${i + 1}`}
                      </td>
                      <td className="px-5 py-3 text-ink">{e.child_name}</td>
                      <td className="px-5 py-3 capitalize text-muted">{e.tier}</td>
                      <td className="px-5 py-3 text-muted">
                        {new Date(e.requested_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-medium text-harbor">{Number(e.priority_score).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
