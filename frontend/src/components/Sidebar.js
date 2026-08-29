import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/orders', label: 'Orders', icon: '🛒' },
  { to: '/workers', label: 'Workers', icon: '👷' },
  { to: '/alerts', label: 'SMS Alerts', icon: '📱' },
  { to: '/airtime', label: 'Airtime', icon: '💳' },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">FACTO<span>RA</span></div>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Africa's Talking · Sandbox</div>
    </div>
  );
}
