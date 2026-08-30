import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = {
  guardian: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/children', label: 'My Children' },
    { to: '/sitters', label: 'Sitters' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/waitlist', label: 'Waitlist' },
    { to: '/transport', label: 'Transport' },
    { to: '/ratings', label: 'Ratings' },
  ],
  sitter: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
    { to: '/availability', label: 'My Availability' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/attendance', label: 'Attendance & Fare' },
    { to: '/transport', label: 'Transport' },
    { to: '/ratings', label: 'Ratings' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sitters', label: 'Sitters' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/transport', label: 'Transport' },
  ],
};

export default function NavHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = LINKS[user?.role] || [];

  return (
    <header className="border-b border-black/5 bg-surface px-6 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="font-display text-lg font-semibold text-ink">
          Childcare Platform
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-harbor text-white' : 'text-muted hover:text-harbor'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-harbor/40"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
