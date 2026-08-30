import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageShell from '../components/PageShell';

const TIERS = ['daily', 'weekly', 'monthly'];
const emptyForm = { name: '', age: '', allergies: '', medical_conditions: '', tier: 'daily' };
const inputClass =
  'mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none';

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get('/children').then((res) => setChildren(res.data.children));
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.response?.data?.message || 'Could not load children.'))
      .finally(() => setLoading(false));
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startEdit(child) {
    setEditingId(child.child_id);
    setForm({
      name: child.name,
      age: child.age ?? '',
      allergies: child.allergies || '',
      medical_conditions: child.medical_conditions || '',
      tier: child.tier,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, age: form.age === '' ? null : Number(form.age) };
      if (editingId) {
        await api.put(`/children/${editingId}`, payload);
      } else {
        await api.post('/children', payload);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save child profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this child profile?')) return;
    try {
      await api.delete(`/children/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete child profile.');
    }
  }

  return (
    <PageShell title="My Children" subtitle="Add and manage your children's profiles." wide>
      <div className="grid gap-6 md:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1"
        >
          <p className="text-sm font-semibold text-ink">{editingId ? 'Edit child' : 'Add a child'}</p>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-ink">Name</label>
            <input required className={inputClass} value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Age</label>
            <input type="number" min="0" className={inputClass} value={form.age} onChange={update('age')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Allergies</label>
            <input className={inputClass} value={form.allergies} onChange={update('allergies')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Medical conditions</label>
            <input
              className={inputClass}
              value={form.medical_conditions}
              onChange={update('medical_conditions')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Tier</label>
            <select className={inputClass} value={form.tier} onChange={update('tier')}>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add child'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink hover:border-harbor/40"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="md:col-span-2">
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && children.length === 0 && (
            <p className="text-sm text-muted">You haven't added any children yet.</p>
          )}
          <div className="space-y-3">
            {children.map((c) => (
              <div
                key={c.child_id}
                className="flex items-center justify-between rounded-xl2 bg-surface p-5 shadow-sm ring-1 ring-black/5"
              >
                <div>
                  <p className="font-medium text-ink">
                    {c.name} <span className="text-xs font-normal text-muted">· {c.tier}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {c.age != null ? `${c.age} yrs old` : 'Age not set'}
                    {c.allergies ? ` · Allergies: ${c.allergies}` : ''}
                    {c.medical_conditions ? ` · ${c.medical_conditions}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink hover:border-harbor/40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.child_id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
