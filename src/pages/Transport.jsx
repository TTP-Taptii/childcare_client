import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

const STATUS_STYLE = {
  pending: 'bg-amber/10 text-amber',
  ongoing: 'bg-harbor/10 text-harbor',
  done: 'bg-green-50 text-green-700',
};

export default function Transport() {
  const { user } = useAuth();
  const isGuardian = user?.role === 'guardian';
  const canRunTrips = user?.role === 'sitter' || user?.role === 'admin';

  const [transport, setTransport] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [newDriver, setNewDriver] = useState({ name: '', license_no: '', car_info: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function loadTransport() {
    return api.get('/transport').then((res) => setTransport(res.data.transport));
  }

  useEffect(() => {
    const calls = [loadTransport(), api.get('/transport/drivers').then((res) => setDrivers(res.data.drivers))];
    if (isGuardian) {
      calls.push(api.get('/bookings').then((res) => setBookings(res.data.bookings)));
    }
    Promise.all(calls)
      .catch((err) => setError(err.response?.data?.message || 'Could not load transport data.'))
      .finally(() => setLoading(false));
  }, [isGuardian]);

  const bookedIds = new Set(transport.map((t) => t.booking_id));
  const eligibleBookings = bookings.filter(
    (b) => (b.status === 'confirmed' || b.status === 'completed') && !bookedIds.has(b.booking_id)
  );
  const availableDrivers = drivers.filter((d) => d.availability_status === 'available');

  async function handleBookTransport(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!bookingId || !driverId) {
      setError('Choose a booking and a driver.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/transport', {
        booking_id: Number(bookingId),
        driver_id: Number(driverId),
        drop_address: dropAddress,
      });
      setNotice('Transport booked.');
      setBookingId('');
      setDriverId('');
      setDropAddress('');
      await Promise.all([loadTransport(), api.get('/transport/drivers').then((res) => setDrivers(res.data.drivers))]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book transport.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(id) {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/transport/${id}/start`);
      await loadTransport();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the trip.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleEnd(id) {
    setBusyId(id);
    setError('');
    try {
      const res = await api.patch(`/transport/${id}/end`);
      alert(`Trip complete — charged ${res.data.fare}.`);
      await Promise.all([loadTransport(), api.get('/transport/drivers').then((r) => setDrivers(r.data.drivers))]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not end the trip.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddDriver(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/transport/drivers', newDriver);
      setNewDriver({ name: '', license_no: '', car_info: '' });
      const res = await api.get('/transport/drivers');
      setDrivers(res.data.drivers);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add driver.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="Transport" subtitle="Rides tied to bookings, and driver trip logs." wide>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

      <div className="grid gap-6 md:grid-cols-3">
        {isGuardian && (
          <form
            onSubmit={handleBookTransport}
            className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
          >
            <p className="text-sm font-semibold text-ink">Book a ride</p>
            <div>
              <label className="block text-sm font-medium text-ink">Booking</label>
              <select className={inputClass} value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
                <option value="">Select a booking</option>
                {eligibleBookings.map((b) => (
                  <option key={b.booking_id} value={b.booking_id}>
                    {b.child_name} · {new Date(b.room_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Driver</label>
              <select className={inputClass} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="">Select a driver</option>
                {availableDrivers.map((d) => (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.name} · {d.car_info}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Drop address</label>
              <input
                className={inputClass}
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {saving ? 'Booking…' : 'Book ride'}
            </button>
          </form>
        )}

        {user?.role === 'admin' && (
          <form
            onSubmit={handleAddDriver}
            className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
          >
            <p className="text-sm font-semibold text-ink">Add a driver</p>
            <div>
              <label className="block text-sm font-medium text-ink">Name</label>
              <input
                required
                className={inputClass}
                value={newDriver.name}
                onChange={(e) => setNewDriver((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">License no.</label>
              <input
                className={inputClass}
                value={newDriver.license_no}
                onChange={(e) => setNewDriver((f) => ({ ...f, license_no: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Car info</label>
              <input
                className={inputClass}
                value={newDriver.car_info}
                onChange={(e) => setNewDriver((f) => ({ ...f, car_info: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink hover:border-harbor/40 disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Add driver'}
            </button>
          </form>
        )}

        <div
          className={
            isGuardian || user?.role === 'admin' ? 'md:col-span-2' : 'md:col-span-3'
          }
        >
          <p className="mb-3 text-sm font-semibold text-ink">
            {isGuardian ? 'My rides' : 'Rides'}
          </p>
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && transport.length === 0 && <p className="text-sm text-muted">No rides yet.</p>}

          <div className="space-y-3">
            {transport.map((t) => (
              <div
                key={t.transport_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5"
              >
                <div>
                  <p className="font-medium text-ink">
                    {t.child_name} → {t.drop_address || 'No address set'}
                  </p>
                  <p className="mt-1 text-xs text-muted">Driver: {t.driver_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[t.status] || ''}`}
                  >
                    {t.status}
                  </span>
                  {canRunTrips && t.status === 'pending' && (
                    <button
                      onClick={() => handleStart(t.transport_id)}
                      disabled={busyId === t.transport_id}
                      className="rounded-lg bg-harbor px-3 py-1.5 text-xs font-semibold text-white hover:bg-harbor-dark disabled:opacity-60"
                    >
                      Start trip
                    </button>
                  )}
                  {canRunTrips && t.status === 'ongoing' && (
                    <button
                      onClick={() => handleEnd(t.transport_id)}
                      disabled={busyId === t.transport_id}
                      className="rounded-lg border border-amber px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-60"
                    >
                      End trip
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
