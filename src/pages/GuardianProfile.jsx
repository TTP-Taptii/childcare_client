import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageShell from '../components/PageShell';

// ============================================================
// SECTION 1: GUARDIAN PROFILE — STARTS HERE
// ============================================================

const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function GuardianProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const id = user?.guardianId;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .get(`/guardians/${id}`)
      .then((res) => setForm(res.data.guardian))
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
      await api.put(`/guardians/${id}`, form);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell title="My Profile" subtitle="Update your contact details.">
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
            <label className="block text-sm font-medium text-ink">Contact number</label>
            <input className={inputClass} value={form.contact || ''} onChange={update('contact')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Address</label>
            <input className={inputClass} value={form.address || ''} onChange={update('address')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Wallet balance</label>
            <input className={inputClass} value={form.wallet_balance} disabled />
            <p className="mt-1 text-xs text-muted">Manage this from the Wallet page.</p>
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
// SECTION 1: GUARDIAN PROFILE — ENDS HERE
// ============================================================
