import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import MenuWithCart from './components/MenuWithCart';
import AboutPage from './components/AboutPage';
import OrderTracking from './components/OrderTracking';
import AdminSignin from './components/admin/AdminSignin';
import AdminLayout from './components/admin/AdminLayout';
import SalesReports from './components/admin/SalesReports';
import OrdersReports from './components/admin/OrdersReports';
import InventoryReports from './components/admin/InventoryReports';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/menu" element={<MenuWithCart />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/track/:token" element={<OrderTracking />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/signin" replace />} />
          <Route path="/admin/signin" element={<AdminSignin />} />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="sales" replace />} />
            <Route path="sales" element={<SalesReports />} />
            <Route path="orders" element={<OrdersReports />} />
            <Route path="inventory" element={<InventoryReports />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;