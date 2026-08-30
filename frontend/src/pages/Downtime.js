import React, { useEffect, useState, useCallback } from 'react';
import { getDowntime, logDowntime, resolveDowntime, getWorkers, callWorker } from '../api';
import Toast from '../components/Toast';

export default function Downtime() {
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({ machine: '', reason: '' });
  const [toast, setToast] = useState(null);
  const [calling, setCalling] = useState(null);

  const load = useCallback(async () => {
    const [d, w] = await Promise.all([getDowntime(), getWorkers()]);
    setLogs(d.data);
    setWorkers(w.data.filter((w) => w.role === 'technician' || w.role === 'supervisor'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!form.machine || !form.reason) return;
    await logDowntime(form);
    setForm({ machine: '', reason: '' });
    notify('Downtime logged & supervisors notified via SMS');
    load();
  };

  const handleResolve = async (id) => {
    await resolveDowntime(id);
    notify('Marked as resolved');
    load();
  };

  const handleCall = async (workerId, workerName) => {
    setCalling(workerId);
    try {
      await callWorker({ workerId, message: 'You have a new task assigned from Factora. Please check your SMS.' });
      notify(`Calling ${workerName}...`);
    } catch {
      notify('Call failed', 'error');
    }
    setCalling(null);
  };

  return (
    <div className="main">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div className="page-title">Downtime & Field Dispatch</div>

      <div className="chart-row" style={{ alignItems: 'flex-start' }}>
        {/* Log Downtime */}
        <div className="card" style={{ flex: 1 }}>
          <div className="section-title">Log Downtime / Defect</div>
          <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Machine / Line name" value={form.machine}
              onChange={(e) => setForm({ ...form, machine: e.target.value })} />
            <input className="input" placeholder="Reason / defect description" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button className="btn" type="submit">Log & Alert Supervisors</button>
          </form>
        </div>

        {/* Dispatch Voice Call */}
        <div className="card" style={{ flex: 1 }}>
          <div className="section-title">Dispatch Worker (Voice Call)</div>
          {workers.length === 0 && <p style={{ color: '#9ca3af', fontSize: 13 }}>No technicians/supervisors found.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workers.map((w) => (
              <div key={w._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>📞 {w.name} <span style={{ color: '#9ca3af', fontSize: 12 }}>({w.role})</span></span>
                <button className="btn" style={{ padding: '4px 12px', fontSize: 12 }}
                  disabled={calling === w._id}
                  onClick={() => handleCall(w._id, w.name)}>
                  {calling === w._id ? 'Calling...' : 'Call'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Downtime Log Table */}
      <div className="card">
        <div className="section-title">Downtime Log</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                <th>Reason</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{l.machine}</td>
                  <td>{l.reason}</td>
                  <td>{l.reportedBy || '—'}</td>
                  <td><span className={`badge badge-${l.status === 'open' ? 'pending' : 'delivered'}`}>{l.status}</span></td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>
                    {l.status === 'open' && (
                      <button className="btn" style={{ padding: '3px 10px', fontSize: 12 }}
                        onClick={() => handleResolve(l._id)}>Resolve</button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>No downtime logged</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
