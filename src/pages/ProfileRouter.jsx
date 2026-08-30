import { useAuth } from '../context/AuthContext';
import GuardianProfile from './GuardianProfile';
// import SitterProfile from './SitterProfile';
import PageShell from '../components/PageShell';

// Shared infrastructure, not owned by either person — just picks which
// profile page to render for the /profile route based on role.
export default function ProfileRouter() {
  const { user } = useAuth();

  if (user?.role === 'sitter') return <SitterProfile />;
  if (user?.role === 'guardian') return <GuardianProfile />;

  return (
    <PageShell title="My Profile" subtitle="Admin accounts don't have a guardian/sitter profile.">
      <div className="rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-ink">
          You're signed in as <span className="font-medium">{user?.name}</span> ({user?.email}).
        </p>
      </div>
    </PageShell>
  );
}
