import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './common-components/Header';
import SidePanel from './common-components/SidePanel';
import Dashboard from './components/Dashboard';
import InvoiceManagement from './components/InvoiceManagement';
import OrderManagement from './components/OrderManagement';

import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <div className="app-container">
        <SidePanel />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoice-management" element={<InvoiceManagement />} />
            <Route path="/order-management" element={<OrderManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
