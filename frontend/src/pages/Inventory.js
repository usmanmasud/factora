import React, { useEffect, useState, useCallback } from 'react';
import { getInventory, upsertInventory, updateInventoryQty, deleteInventory } from '../api';
import Toast from '../components/Toast';

const empty = { product: '', quantity: '', unit: 'units', reorderLevel: '50' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const res = await getInventory();
    setItems(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg, type = 'info') => setToast({ msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateInventoryQty(editId, Number(form.quantity));
      } else {
        await upsertInventory({ ...form, quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel) });
      }
      setForm(empty);
      setEditId(null);
      load();
      notify(editId ? 'Quantity updated' : 'Item saved');
    } catch {
      notify('Error saving item', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ product: item.product, quantity: item.quantity, unit: item.unit, reorderLevel: item.reorderLevel });
  };

  const handleDelete = async (id) => {
    await deleteInventory(id);
    load();
    notify('Item deleted');
  };

  return (
    <div className="main">
      <div className="page-title">Inventory</div>

      <div className="card section">
        <div className="section-title">{editId ? 'Update Quantity' : 'Add / Update Product'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product</label>
              <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="e.g. Steel Rods" required disabled={!!editId} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0" required min="0" />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="units" disabled={!!editId} />
            </div>
            <div className="form-group">
              <label>Reorder Level</label>
              <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                placeholder="50" disabled={!!editId} />
            </div>
            <button className="btn btn-primary" type="submit">{editId ? 'Update' : 'Save'}</button>
            {editId && <button className="btn" type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Quantity</th><th>Unit</th><th>Reorder Level</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <span className={`badge badge-${item.quantity <= item.reorderLevel ? 'low' : 'ok'}`}>
                      {item.quantity <= item.reorderLevel ? 'Low' : 'OK'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(item)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>No items</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
