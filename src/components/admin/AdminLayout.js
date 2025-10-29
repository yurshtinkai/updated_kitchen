import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/signin');
  };

  const activeRoute = location.pathname;

  const isActive = (route) => activeRoute.includes(route);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (route) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-header">
          <div className="admin-logo-container">
            <img src="/logo.jpg" alt="CHOX Kitchen" className="admin-logo" />
          </div>
          <h2>Admin Panel</h2>
          <button className="mobile-close-btn" onClick={toggleMobileMenu}>✕</button>
        </div>
        <nav className="admin-nav">
          <button
            className={isActive('sales') ? 'active' : ''}
            onClick={() => handleNavClick('/admin/reports/sales')}
          >
            📊 Sales
          </button>
          <button
            className={isActive('orders') ? 'active' : ''}
            onClick={() => handleNavClick('/admin/reports/orders')}
          >
            📦 Orders
          </button>
          <button
            className={isActive('inventory') ? 'active' : ''}
            onClick={() => handleNavClick('/admin/reports/inventory')}
          >
            📋 Inventory
          </button>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>☰</button>
        <h2>Admin Panel</h2>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

