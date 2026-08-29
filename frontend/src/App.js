import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Workers from './pages/Workers';
import Alerts from './pages/Alerts';
import Airtime from './pages/Airtime';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/airtime" element={<Airtime />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
