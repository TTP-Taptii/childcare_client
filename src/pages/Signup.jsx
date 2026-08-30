import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const ROLES = [
  { value: 'guardian', label: 'Guardian' },
  { value: 'sitter', label: 'Sitter' },
  { value: 'admin', label: 'Admin' },
];

const initialForm = {
  role: 'guardian',
  name: '',
  email: '',
  password: '',
  contact: '',
  address: '',
  bio: '',
  experience_years: '',
  hourly_rate: '',
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        role: form.role,
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.role === 'guardian' && {
          contact: form.contact,
          address: form.address,
        }),
        ...(form.role === 'sitter' && {
          bio: form.bio,
          experience_years: form.experience_years ? Number(form.experience_years) : 0,
          hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : 0,
        }),
      };
      await signup(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create an account"
      subtitle="Pick the role that matches who you are."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <span className="block text-sm font-medium text-ink">I am a…</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.role === r.value
                    ? 'border-harbor bg-harbor text-white'
                    : 'border-black/10 text-ink hover:border-harbor/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={update('name')}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        {form.role === 'guardian' && (
          <>
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-ink">
                Contact number
              </label>
              <input
                id="contact"
                value={form.contact}
                onChange={update('contact')}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-ink">
                Address
              </label>
              <input
                id="address"
                value={form.address}
                onChange={update('address')}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                placeholder="House, Road, Area"
              />
            </div>
          </>
        )}

        {form.role === 'sitter' && (
          <>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-ink">
                Short bio
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={update('bio')}
                rows={3}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                placeholder="A few lines about your experience"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-ink">
                  Years of experience
                </label>
                <input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={update('experience_years')}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="hourly_rate" className="block text-sm font-medium text-ink">
                  Hourly rate
                </label>
                <input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={update('hourly_rate')}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-harbor hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
