import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function Availability() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: 'Mon', start_time: '09:00', end_time: '13:00' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get(`/availability/${user.sitterId}`).then((res) => setSlots(res.data.availability));
  }

  useEffect(() => {
    if (!user?.sitterId) {
      setLoading(false);
      return;
    }
    load()
      .catch((err) => setError(err.response?.data?.message || 'Could not load availability.'))
      .finally(() => setLoading(false));
  }, [user?.sitterId]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/availability', form);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save availability.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/availability/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove slot.');
    }
  }

  return (
    <PageShell title="My Availability" subtitle="Set the weekly hours you're open for rooms." wide>
      <div className="grid gap-6 md:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
        >
          <p className="text-sm font-semibold text-ink">Add a slot</p>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-ink">Day</label>
            <select className={inputClass} value={form.day_of_week} onChange={update('day_of_week')}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add slot'}
          </button>
        </form>

        <div className="md:col-span-2">
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && slots.length === 0 && (
            <p className="text-sm text-muted">No availability set yet — add your first slot.</p>
          )}
          <div className="space-y-3">
            {slots.map((s) => (
              <div
                key={s.availability_id}
                className="flex items-center justify-between rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5"
              >
                <p className="text-sm text-ink">
                  <span className="font-medium">{s.day_of_week}</span> · {s.start_time?.slice(0, 5)} –{' '}
                  {s.end_time?.slice(0, 5)}
                </p>
                <button
                  onClick={() => handleDelete(s.availability_id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
