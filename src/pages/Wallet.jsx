import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageShell from '../components/PageShell';

export default function Wallet() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState('');

  function loadHistory() {
    return api.get('/wallet/history').then((res) => {
      setTransactions(res.data.transactions);
      if (res.data.transactions[0]) setBalance(res.data.transactions[0].current_balance);
    });
  }

  useEffect(() => {
    loadHistory()
      .catch((err) => setError(err.response?.data?.message || 'Could not load wallet history.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeposit(e) {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setDepositing(true);
    try {
      const res = await api.post('/wallet/deposit', { amount: Number(amount) });
      setBalance(res.data.walletBalance);
      setAmount('');
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed.');
    } finally {
      setDepositing(false);
    }
  }

  return (
    <PageShell title="Wallet" subtitle="Add funds and review your transaction history." wide>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-1">
          <p className="text-sm text-muted">Current balance</p>
          <p className="font-display mt-1 text-3xl font-semibold text-ink">
            {balance !== null ? Number(balance).toFixed(2) : '—'}
          </p>

          <form onSubmit={handleDeposit} className="mt-6 space-y-3">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-ink">Amount to deposit</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-harbor focus:outline-none"
                placeholder="e.g. 1000"
              />
            </div>
            <button
              type="submit"
              disabled={depositing}
              className="w-full rounded-lg bg-harbor px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-harbor-dark disabled:opacity-60"
            >
              {depositing ? 'Depositing…' : 'Deposit'}
            </button>
          </form>
        </div>

        <div className="rounded-xl2 bg-surface p-6 shadow-sm ring-1 ring-black/5 md:col-span-2">
          <p className="mb-4 text-sm font-semibold text-ink">Transaction history</p>
          {loading && <p className="text-sm text-muted">Loading…</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-muted">No transactions yet.</p>
          )}
          {!loading && transactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-muted">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 font-medium">Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.transaction_id} className="border-b border-black/5">
                      <td className="py-2 pr-4 text-muted">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 capitalize text-ink">{t.type}</td>
                      <td
                        className={`py-2 pr-4 font-medium ${
                          t.type === 'deduction' ? 'text-red-600' : 'text-green-700'
                        }`}
                      >
                        {t.type === 'deduction' ? '-' : '+'}
                        {Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-2 text-muted">{t.booking_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
