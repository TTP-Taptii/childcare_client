import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const emptyForm = { room_date: '', start_time: '09:00', end_time: '13:00', max_seats: 4, age_range: '' };
const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get('/rooms').then((res) => setRooms(res.data.rooms));
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.response?.data?.message || 'Could not load rooms.'))
      .finally(() => setLoading(false));
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/rooms', { ...form, max_seats: Number(form.max_seats) });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create room.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Rooms" subtitle="Live room availability across the platform." wide>
      <div className="grid gap-6 md:grid-cols-3">
        {user?.role === 'sitter' && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
          >
            <p className="text-sm font-semibold text-ink">Create a room</p>
            <p className="text-xs text-muted">
              Must fall inside a slot you've already added under My Availability.
            </p>
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

            <div>
              <label className="block text-sm font-medium text-ink">Date</label>
              <input
                type="date"
                required
                className={inputClass}
                value={form.room_date}
                onChange={update('room_date')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink">Start</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.start_time}
                  onChange={update('start_time')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">End</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.end_time}
                  onChange={update('end_time')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Max seats</label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.max_seats}
                onChange={update('max_seats')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Age range</label>
              <input
                className={inputClass}
                placeholder="e.g. 2-5"
                value={form.age_range}
                onChange={update('age_range')}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create room'}
            </button>
          </form>
        )}

        <div className={user?.role === 'sitter' ? 'md:col-span-2' : 'md:col-span-3'}>
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && rooms.length === 0 && <p className="text-sm text-muted">No rooms yet.</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((r) => (
              <div key={r.room_id} className="rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">
                      {new Date(r.room_date).toLocaleDateString()} · {r.start_time?.slice(0, 5)}–
                      {r.end_time?.slice(0, 5)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      with {r.sitter_name} · {Number(r.hourly_rate).toFixed(2)}/hr
                      {r.age_range ? ` · ages ${r.age_range}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.seats_left > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {r.seats_left > 0 ? `${r.seats_left} seats left` : 'Full'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
