import React, { useEffect, useState, useCallback } from 'react';
import { sendSMS, getAlerts, getWorkers } from '../api';
import Toast from '../components/Toast';

const TYPES = ['downtime', 'restock', 'task', 'general'];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({ type: 'general', message: '', recipientPhones: [] });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [a, w] = await Promise.all([getAlerts(), getWorkers()]);
    setAlerts(a.data);
    setWorkers(w.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendSMS(form);
      setForm({ type: 'general', message: '', recipientPhones: [] });
      load();
      setToast({ msg: 'SMS alert sent successfully!' });
    } catch {
      setToast({ msg: 'Failed to send SMS', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const togglePhone = (phone) => {
    setForm((f) => ({
      ...f,
      recipientPhones: f.recipientPhones.includes(phone)
        ? f.recipientPhones.filter((p) => p !== phone)
        : [...f.recipientPhones, phone],
    }));
  };

  return (
    <div className="main">
      <div className="page-title">SMS Alerts</div>

      <div className="card section">
        <div className="section-title">Send Alert via SMS</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Alert Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Message</label>
              <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Enter alert message..." required style={{ width: '100%' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Recipients (leave unchecked to send to all active workers)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {workers.map((w) => (
                <label key={w._id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.recipientPhones.includes(w.phone)}
                    onChange={() => togglePhone(w.phone)} />
                  {w.name} ({w.phone})
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send SMS Alert'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Alert History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Type</th><th>Message</th><th>Recipients</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a._id}>
                  <td><span className="badge badge-confirmed">{a.type}</span></td>
                  <td>{a.message}</td>
                  <td>{a.recipients.length} recipient(s)</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {alerts.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>No alerts sent yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
