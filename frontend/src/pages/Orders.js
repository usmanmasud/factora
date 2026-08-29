import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../api';
import Toast from '../components/Toast';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const res = await getOrders();
    setOrders(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      load();
      setToast({ msg: `Order updated to ${status}. SMS sent to distributor.` });
    } catch {
      setToast({ msg: 'Failed to update order', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    await deleteOrder(id);
    load();
    setToast({ msg: 'Order deleted' });
  };

  return (
    <div className="main">
      <div className="page-title">Orders</div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Phone</th><th>Items</th><th>Channel</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.distributorPhone}</td>
                  <td>{o.items.map((i) => `${i.product} x${i.quantity}`).join(', ')}</td>
                  <td>{o.channel}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatus(o._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12 }}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(o._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af' }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
