import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

const STATUS_STYLE = {
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-harbor/10 text-harbor',
  cancelled: 'bg-red-50 text-red-600',
};

export default function Bookings() {
  const { user } = useAuth();
  const isGuardian = user?.role === 'guardian';

  const [bookings, setBookings] = useState([]);
  const [children, setChildren] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [childId, setChildId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fullRoom, setFullRoom] = useState(false);

  function loadBookings() {
    return api.get('/bookings').then((res) => setBookings(res.data.bookings));
  }

  useEffect(() => {
    const calls = [loadBookings()];
    if (isGuardian) {
      calls.push(api.get('/children').then((res) => setChildren(res.data.children)));
      calls.push(api.get('/rooms').then((res) => setRooms(res.data.rooms)));
    }
    Promise.all(calls)
      .catch((err) => setError(err.response?.data?.message || 'Could not load bookings.'))
      .finally(() => setLoading(false));
  }, [isGuardian]);

  async function handleBook(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setFullRoom(false);
    if (!childId || !roomId) {
      setError('Choose a child and a room.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/bookings', { child_id: Number(childId), room_id: Number(roomId) });
      setNotice('Seat booked.');
      setChildId('');
      setRoomId('');
      await loadBookings();
    } catch (err) {
      if (err.response?.status === 409) {
        setFullRoom(true);
      }
      setError(err.response?.data?.message || 'Could not book this seat.');
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinWaitlist() {
    setSaving(true);
    setError('');
    try {
      await api.post('/waitlist', { child_id: Number(childId), room_id: Number(roomId) });
      setNotice('Added to the waitlist — you can check your ranking on the Waitlist page.');
      setFullRoom(false);
      setChildId('');
      setRoomId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join the waitlist.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return;
    setError('');
    setNotice('');
    try {
      const res = await api.delete(`/bookings/${id}`);
      setNotice(
        res.data.seatPromoted
          ? 'Booking cancelled. Your open seat was automatically promoted to the top of the waitlist.'
          : 'Booking cancelled.'
      );
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this booking.');
    }
  }

  return (
    <PageShell
      title="Bookings"
      subtitle={
        isGuardian
          ? 'Book a seat for your child, or manage existing bookings.'
          : 'Bookings for your rooms.'
      }
      wide
    >
      <div className="grid gap-6 md:grid-cols-3">
        {isGuardian && (
          <form
            onSubmit={handleBook}
            className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
          >
            <p className="text-sm font-semibold text-ink">Book a seat</p>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

            <div>
              <label className="block text-sm font-medium text-ink">Child</label>
              <select className={inputClass} value={childId} onChange={(e) => setChildId(e.target.value)}>
                <option value="">Select a child</option>
                {children.map((c) => (
                  <option key={c.child_id} value={c.child_id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Room</label>
              <select className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">Select a room</option>
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {new Date(r.room_date).toLocaleDateString()} {r.start_time?.slice(0, 5)}–
                    {r.end_time?.slice(0, 5)} · {r.sitter_name} · {r.seats_left} left
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {saving ? 'Booking…' : 'Book seat'}
            </button>

            {fullRoom && (
              <button
                type="button"
                onClick={handleJoinWaitlist}
                disabled={saving}
                className="w-full rounded-lg border border-amber px-4 py-2.5 text-sm font-semibold text-amber transition hover:bg-amber/10 disabled:opacity-60"
              >
                Room's full — join the waitlist instead
              </button>
            )}
          </form>
        )}

        <div className={isGuardian ? 'md:col-span-2' : 'md:col-span-3'}>
          {!isGuardian && error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {!isGuardian && notice && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>
          )}
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && bookings.length === 0 && <p className="text-sm text-muted">No bookings yet.</p>}

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.booking_id}
                className="flex items-center justify-between rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5"
              >
                <div>
                  <p className="font-medium text-ink">
                    {b.child_name} · {new Date(b.room_date).toLocaleDateString()}{' '}
                    {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-muted">with {b.sitter_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[b.status] || ''}`}
                  >
                    {b.status}
                  </span>
                  {isGuardian && b.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(b.booking_id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
