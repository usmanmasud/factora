import React, { useEffect, useState, useCallback } from 'react';
import { sendAirtime, getAirtimeLogs, getWorkers } from '../api';
import Toast from '../components/Toast';

export default function Airtime() {
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({ distributorPhone: '', amount: '', currency: 'KES', reason: 'Sales report reward' });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [l, w] = await Promise.all([getAirtimeLogs(), getWorkers()]);
    setLogs(l.data);
    setWorkers(w.data.filter((w) => w.role === 'distributor'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendAirtime(form);
      setForm({ distributorPhone: '', amount: '', currency: 'KES', reason: 'Sales report reward' });
      load();
      setToast({ msg: 'Airtime sent successfully!' });
    } catch {
      setToast({ msg: 'Failed to send airtime', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="main">
      <div className="page-title">Airtime Rewards</div>

      <div className="card section">
        <div className="section-title">Reward Distributor with Airtime</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Distributor Phone</label>
              <select value={form.distributorPhone} onChange={(e) => setForm({ ...form, distributorPhone: e.target.value })} required>
                <option value="">Select distributor...</option>
                {workers.map((w) => (
                  <option key={w._id} value={w.phone}>{w.name} — {w.phone}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 50" required min="1" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
                <option value="TZS">TZS</option>
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            <button className="btn btn-success" type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send Airtime'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Airtime Log</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Distributor</th><th>Phone</th><th>Amount</th><th>Currency</th><th>Reason</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{l.distributorName}</td>
                  <td>{l.distributorPhone}</td>
                  <td>{l.amount}</td>
                  <td>{l.currency}</td>
                  <td>{l.reason}</td>
                  <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af' }}>No airtime sent yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
