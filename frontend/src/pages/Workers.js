import React, { useEffect, useState, useCallback } from 'react';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../api';
import Toast from '../components/Toast';

const empty = { name: '', phone: '', role: 'technician' };
const ROLES = ['technician', 'supervisor', 'distributor', 'manager'];

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const res = await getWorkers();
    setWorkers(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateWorker(editId, form);
      } else {
        await createWorker(form);
      }
      setForm(empty);
      setEditId(null);
      load();
      setToast({ msg: editId ? 'Worker updated' : 'Worker added' });
    } catch {
      setToast({ msg: 'Error saving worker', type: 'error' });
    }
  };

  const handleEdit = (w) => {
    setEditId(w._id);
    setForm({ name: w.name, phone: w.phone, role: w.role });
  };

  const handleDelete = async (id) => {
    await deleteWorker(id);
    load();
    setToast({ msg: 'Worker removed' });
  };

  return (
    <div className="main">
      <div className="page-title">Workers & Distributors</div>

      <div className="card section">
        <div className="section-title">{editId ? 'Edit Worker' : 'Add Worker'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
            </div>
            <div className="form-group">
              <label>Phone (e.g. +254...)</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254700000000" required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit">{editId ? 'Update' : 'Add'}</button>
            {editId && <button className="btn" type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w._id}>
                  <td>{w.name}</td>
                  <td>{w.phone}</td>
                  <td><span className="badge badge-confirmed">{w.role}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(w)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(w._id)}>Remove</button>
                  </td>
                </tr>
              ))}
              {workers.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No workers added</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
