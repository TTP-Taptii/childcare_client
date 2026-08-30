import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavHeader from '../components/NavHeader';

const QUICK_LINKS = {
  guardian: [
    { to: '/profile', label: 'My Profile', desc: 'Update your contact details.' },
    { to: '/wallet', label: 'Wallet', desc: 'Deposit funds and view history.' },
    { to: '/children', label: 'My Children', desc: 'Add and manage child profiles.' },
    { to: '/sitters', label: 'Sitters', desc: 'Browse available sitters.' },
    { to: '/rooms', label: 'Rooms', desc: 'See live room availability.' },
    { to: '/bookings', label: 'Bookings', desc: 'Book a seat or cancel one.' },
    { to: '/waitlist', label: 'Waitlist', desc: 'See the priority-score ranking.' },
    { to: '/transport', label: 'Transport', desc: 'Book a ride for a session.' },
    { to: '/ratings', label: 'Ratings', desc: 'Rate a completed session.' },
  ],
  sitter: [
    { to: '/profile', label: 'My Profile', desc: 'Update your bio and rate.' },
    { to: '/availability', label: 'My Availability', desc: 'Set your weekly hours.' },
    { to: '/rooms', label: 'Rooms', desc: 'Create rooms and see availability.' },
    { to: '/bookings', label: 'Bookings', desc: 'See bookings in your rooms.' },
    { to: '/attendance', label: 'Attendance & Fare', desc: 'Log check-in/out and charge fares.' },
    { to: '/transport', label: 'Transport', desc: 'Start and end trips.' },
  ],
  admin: [
    { to: '/sitters', label: 'Sitters', desc: 'Browse all sitters.' },
    { to: '/rooms', label: 'Rooms', desc: 'See all rooms platform-wide.' },
    { to: '/bookings', label: 'Bookings', desc: 'See every booking.' },
    { to: '/transport', label: 'Transport', desc: 'Manage drivers and trips.' },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const links = QUICK_LINKS[user?.role] || [];

  return (
    <div className="min-h-screen bg-canvas">
      <NavHeader />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-amber">
          {user?.role}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-ink">
          Welcome, {user?.name}
        </h1>
        <p className="mt-3 text-muted">Here's where you can get started.</p>

        <div className="mt-8 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 font-medium text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">User ID</dt>
              <dd className="mt-1 font-medium text-ink">{user?.userId}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-harbor/40"
            >
              <p className="font-display text-lg font-semibold text-ink">{l.label}</p>
              <p className="mt-1 text-sm text-muted">{l.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
