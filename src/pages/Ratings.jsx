import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function Ratings() {
  const { user } = useAuth();
  const isGuardian = user?.role === 'guardian';

  const [bookings, setBookings] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [type, setType] = useState('sitter');
  const [score, setScore] = useState(5);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [lookupSitterId, setLookupSitterId] = useState('');
  const [average, setAverage] = useState(null);
  const [checkingAvg, setCheckingAvg] = useState(false);

  useEffect(() => {
    api.get('/sitters').then((res) => setSitters(res.data.sitters));
    if (isGuardian) {
      api.get('/bookings').then((res) =>
        setBookings(res.data.bookings.filter((b) => b.status === 'completed'))
      );
    }
  }, [isGuardian]);

  const selectedBooking = bookings.find((b) => b.booking_id === Number(bookingId));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!bookingId) {
      setError('Choose a completed booking to rate.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/ratings', {
        booking_id: Number(bookingId),
        sitter_id: type === 'sitter' ? selectedBooking?.sitter_id : undefined,
        score: Number(score),
        review,
        type,
      });
      setNotice('Thanks — your rating was submitted.');
      setBookingId('');
      setReview('');
      setScore(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your rating.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLookup(id) {
    setLookupSitterId(id);
    setAverage(null);
    if (!id) return;
    setCheckingAvg(true);
    try {
      const res = await api.get(`/ratings/sitter/${id}/average`);
      setAverage(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load that sitter\u2019s rating.');
    } finally {
      setCheckingAvg(false);
    }
  }

  return (
    <PageShell title="Ratings & Reviews" subtitle="Rate a completed session, or check a sitter's average." wide>
      <div className="grid gap-6 md:grid-cols-2">
        {isGuardian && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5"
          >
            <p className="text-sm font-semibold text-ink">Leave a rating</p>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

            <div>
              <label className="block text-sm font-medium text-ink">Completed booking</label>
              <select className={inputClass} value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
                <option value="">Select a booking</option>
                {bookings.map((b) => (
                  <option key={b.booking_id} value={b.booking_id}>
                    {b.child_name} · {new Date(b.room_date).toLocaleDateString()} · {b.sitter_name}
                  </option>
                ))}
              </select>
              {bookings.length === 0 && (
                <p className="mt-1 text-xs text-muted">No completed bookings to rate yet.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">What are you rating?</label>
              <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="sitter">Sitter</option>
                <option value="transport">Transport</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Score</label>
              <select className={inputClass} value={score} onChange={(e) => setScore(e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'star' : 'stars'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Review</label>
              <textarea
                rows={3}
                className={inputClass}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {saving ? 'Submitting…' : 'Submit rating'}
            </button>
          </form>
        )}

        <div className="rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <p className="mb-4 text-sm font-semibold text-ink">Check a sitter's average rating</p>
          <select className={inputClass} value={lookupSitterId} onChange={(e) => handleLookup(e.target.value)}>
            <option value="">Select a sitter</option>
            {sitters.map((s) => (
              <option key={s.sitter_id} value={s.sitter_id}>
                {s.name}
              </option>
            ))}
          </select>

          {checkingAvg && <p className="mt-4 text-sm text-muted">Loading…</p>}
          {average && !checkingAvg && (
            <div className="mt-4">
              <p className="font-display text-3xl font-semibold text-ink">
                {average.averageRating ?? '—'}
                <span className="text-base font-normal text-muted"> / 5</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                Based on {average.ratingCount} rating{average.ratingCount === 1 ? '' : 's'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
