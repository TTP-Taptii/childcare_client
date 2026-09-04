import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageShell from '../components/PageShell';

export default function Sitters() {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/sitters')
      .then((res) => setSitters(res.data.sitters))
      .catch((err) => setError(err.response?.data?.message || 'Could not load sitters.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Sitters" subtitle="Browse sitters available on the platform." wide>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {!loading && sitters.length === 0 && <p className="text-sm text-muted">No sitters yet.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sitters.map((s) => (
          <div key={s.sitter_id} className="rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5">
            <p className="font-display text-lg font-semibold text-ink">{s.name}</p>
            <p className="mt-1 text-xs text-muted">
              {s.experience_years ?? 0} yrs experience · {Number(s.hourly_rate).toFixed(2)}/hr
            </p>
            {s.bio && <p className="mt-3 text-sm text-ink">{s.bio}</p>}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
