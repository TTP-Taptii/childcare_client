import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

// ============================================================
// SECTION 4 (self-service half): SITTER PROFILE — STARTS HERE
// The browse-all-sitters half of Section 4 lives in Sitters.jsx.
// ============================================================

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function SitterProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const id = user?.sitterId;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .get(`/sitters/${id}`)
      .then((res) => setForm(res.data.sitter))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.put(`/sitters/${id}`, form);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="My Profile" subtitle="Update how families see you.">
      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && form && (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

          <div>
            <label className="block text-sm font-medium text-ink">Name</label>
            <input className={inputClass} value={form.name || ''} onChange={update('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Bio</label>
            <textarea rows={3} className={inputClass} value={form.bio || ''} onChange={update('bio')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink">Years of experience</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.experience_years ?? ''}
                onChange={update('experience_years')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Hourly rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.hourly_rate ?? ''}
                onChange={update('hourly_rate')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </PageShell>
  );
}

// ============================================================
// SECTION 4 (self-service half): SITTER PROFILE — ENDS HERE
// ============================================================
