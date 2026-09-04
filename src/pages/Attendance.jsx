import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageShell from '../components/PageShell';

export default function Attendance() {
  const [bookings, setBookings] = useState([]);
  const [attendance, setAttendance] = useState({}); // booking_id -> log or null
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/bookings');
    const confirmedOrCompleted = res.data.bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    );
    setBookings(confirmedOrCompleted);

    const entries = await Promise.all(
      confirmedOrCompleted.map((b) =>
        api
          .get(`/attendance/${b.booking_id}`)
          .then((r) => [b.booking_id, r.data.attendance])
          .catch(() => [b.booking_id, null])
      )
    );
    setAttendance(Object.fromEntries(entries));
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.response?.data?.message || 'Could not load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckIn(bookingId) {
    setBusyId(bookingId);
    setError('');
    try {
      await api.post('/attendance/checkin', { booking_id: bookingId });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not check in.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCheckOut(bookingId) {
    setBusyId(bookingId);
    setError('');
    try {
      await api.post('/attendance/checkout', { booking_id: bookingId });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not check out.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCharge(bookingId) {
    setBusyId(bookingId);
    setError('');
    try {
      const res = await api.post(`/fare/${bookingId}/charge`);
      alert(`Charged ${res.data.fare} for ${res.data.hoursUsed} hours.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not charge the fare.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell
      title="Attendance & Fare"
      subtitle="Log drop-off and pickup times, then charge the wallet for actual hours used."
      wide
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {!loading && bookings.length === 0 && <p className="text-sm text-muted">No bookings to log yet.</p>}

      <div className="space-y-3">
        {bookings.map((b) => {
          const log = attendance[b.booking_id];
          const busy = busyId === b.booking_id;
          return (
            <div key={b.booking_id} className="rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {b.child_name} · {new Date(b.room_date).toLocaleDateString()}{' '}
                    {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {log?.check_in ? `In: ${new Date(log.check_in).toLocaleTimeString()}` : 'Not checked in'}
                    {log?.check_out ? ` · Out: ${new Date(log.check_out).toLocaleTimeString()}` : ''}
                    {b.status === 'completed' ? ' · Fare charged ✓' : ''}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!log && (
                    <button
                      onClick={() => handleCheckIn(b.booking_id)}
                      disabled={busy}
                      className="rounded-lg bg-harbor px-3 py-1.5 text-xs font-semibold text-white hover:bg-harbor-dark disabled:opacity-60"
                    >
                      Check in
                    </button>
                  )}
                  {log && !log.check_out && (
                    <button
                      onClick={() => handleCheckOut(b.booking_id)}
                      disabled={busy}
                      className="rounded-lg bg-harbor px-3 py-1.5 text-xs font-semibold text-white hover:bg-harbor-dark disabled:opacity-60"
                    >
                      Check out
                    </button>
                  )}
                  {log?.check_out && b.status !== 'completed' && (
                    <button
                      onClick={() => handleCharge(b.booking_id)}
                      disabled={busy}
                      className="rounded-lg border border-amber px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-60"
                    >
                      Charge fare
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
