import React, { useEffect, useState, useCallback } from 'react';
import { getInsights } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#1a56db', '#93c5fd', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const res = await getInsights();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) return <div className="main"><p>Loading...</p></div>;

  const { summary, lowStockItems, recentOrders, ordersByStatus } = data;

  return (
    <div className="main">
      <div className="page-title">Dashboard</div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{summary.totalOrders}</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{summary.pendingOrders}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{summary.deliveredOrders}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{summary.lowStockCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SMS Alerts Sent</div>
          <div className="stat-value">{summary.totalAlerts}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Airtime Sent</div>
          <div className="stat-value">{summary.totalAirtimeSent}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Open Downtime</div>
          <div className="stat-value">{summary.openDowntime}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Downtime Events</div>
          <div className="stat-value">{summary.totalDowntime}</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="section-title">Orders by Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Low Stock Items</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lowStockItems} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="product" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#1a56db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.recentDowntime?.length > 0 && (
        <div className="card">
          <div className="section-title">Recent Downtime</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Machine</th><th>Reason</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {data.recentDowntime.map((d) => (
                  <tr key={d._id}>
                    <td>{d.machine}</td>
                    <td>{d.reason}</td>
                    <td><span className={`badge badge-${d.status === 'open' ? 'pending' : 'delivered'}`}>{d.status}</span></td>
                    <td>{new Date(d.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Recent Orders</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Distributor</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.distributorPhone}</td>
                  <td>{o.items.map((i) => `${i.product} x${i.quantity}`).join(', ')}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
