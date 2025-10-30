import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const OrdersReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    orderId: '',
    customerName: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: '', quantity: 1 }],
  });
  const [products, setProducts] = useState([]);
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: '' });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        ...(filters.orderId && { orderId: filters.orderId }),
        ...(filters.customerName && { customerName: filters.customerName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`http://localhost:3001/api/admin/reports/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/signin';
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const applyFilters = () => {
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Order marked as ${newStatus}!`);
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const openCancelModal = (orderId) => {
    setCancelModal({ open: true, orderId, reason: '' });
  };

  const submitCancellation = async () => {
    if (!cancelModal.orderId) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${cancelModal.orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled', cancellationReason: cancelModal.reason })
      });

      if (response.ok) {
        setCancelModal({ open: false, orderId: null, reason: '' });
        fetchOrders();
      } else {
        alert('Failed to cancel order');
      }
    } catch (err) {
      alert('Error cancelling order');
    }
  };

  const markProcessing = (orderId) => handleUpdateStatus(orderId, 'processing');
  const markOutForDelivery = (orderId) => handleUpdateStatus(orderId, 'out_for_delivery');
  const markCompleted = (orderId) => handleUpdateStatus(orderId, 'completed');

  const isSlaBreached = (order) => {
    try {
      if (order.status !== 'pending') return false;
      const created = new Date(order.orderDate || order.createdAt);
      const diffMs = Date.now() - created.getTime();
      const diffMin = diffMs / 60000;
      return diffMin >= 30;
    } catch {
      return false;
    }
  };

  const printInvoice = (order) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = (order.Items || []).map((it, idx) =>
      `<tr><td>${idx + 1}</td><td>${it.productName}</td><td>${it.quantity}</td><td>$${parseFloat(it.price).toFixed(2)}</td><td>$${parseFloat(it.subtotal).toFixed(2)}</td></tr>`
    ).join('');
    win.document.write(`
      <html><head><title>Invoice #${order.id}</title>
      <style>
        body{font-family:Arial;padding:24px;color:#111}
        h1{margin:0 0 8px}
        .muted{color:#666}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        tfoot td{font-weight:bold}
      </style></head><body>
      <h1>Invoice #${order.id}</h1>
      <div class="muted">${new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
      <div style="margin-top:10px">
        <div><strong>Customer:</strong> ${order.customerName}</div>
        ${order.customerEmail ? `<div><strong>Email:</strong> ${order.customerEmail}</div>` : ''}
        ${order.customerPhone ? `<div><strong>Phone:</strong> ${order.customerPhone}</div>` : ''}
        ${order.deliveryAddress ? `<div><strong>Address:</strong> ${order.deliveryAddress}</div>` : ''}
      </div>
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot><tr><td colspan="4">Total</td><td>$${parseFloat(order.totalAmount).toFixed(2)}</td></tr></tfoot>
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const resendEmail = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/resend-confirmation`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Confirmation email resent');
      } else {
        alert('Resend not available yet on server');
      }
    } catch (e) {
      alert('Resend failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1 }],
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.some(item => !item.productId || item.quantity <= 0)) {
      alert('Please fill in all product selections and valid quantities');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchOrders();
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          items: [{ productId: '', quantity: 1 }],
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create order');
      }
    } catch (err) {
      alert('Error creating order: ' + err.message);
    }
  };

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <h1>Orders Reports</h1>
        <button onClick={() => setShowModal(true)} className="add-button">
          + Add Order
        </button>
      </div>

      <div className="orders-filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Order ID"
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Customer Name"
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-date-group">
            <label>START DATE</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-date-group">
            <label>END DATE</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <button onClick={applyFilters} className="apply-filters-btn">Apply Filters</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-scroll-container orders-table-container">
            <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer Info</th>
                <th>Delivery Address</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>{order.customerName}</strong>
                      {order.customerEmail && (
                        <div style={{ color: '#666' }}>📧 {order.customerEmail}</div>
                      )}
                      {order.customerPhone && (
                        <div style={{ color: '#666' }}>📞 {order.customerPhone}</div>
                      )}
                      {order.specialInstructions && (
                        <div style={{ color: '#d97706', fontSize: '0.85rem', marginTop: '4px' }}>
                          💬 Note: {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {order.deliveryAddress ? (
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        📍 {order.deliveryAddress}
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontSize: '0.85rem' }}>Not provided</div>
                    )}
                  </td>
                  <td>
                    {order.Items?.map((item, idx) => (
                      <div key={item.id} style={{ fontSize: '0.9rem' }}>
                        {idx + 1}. {item.productName} x {item.quantity} (${parseFloat(item.subtotal).toFixed(2)})
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#059669' }}>
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      backgroundColor: order.status === 'completed' ? '#d1fae5' : 
                                       order.status === 'pending' ? '#fef3c7' : 
                                       order.status === 'processing' ? '#dbeafe' : 
                                       order.status === 'out_for_delivery' ? '#cffafe' : '#fee2e2',
                      color: order.status === 'completed' ? '#065f46' : 
                             order.status === 'pending' ? '#92400e' : 
                             order.status === 'processing' ? '#1e3a8a' : 
                             order.status === 'out_for_delivery' ? '#155e75' : '#991b1b',
                      fontSize: '0.85rem',
                      textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className={`order-actions ${isSlaBreached(order) ? 'sla-breached' : ''}`}>
                      {order.status === 'pending' && (
                        <button onClick={() => markProcessing(order.id)} className="edit-btn">Start Processing</button>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => markOutForDelivery(order.id)} className="edit-btn">Out for delivery</button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button onClick={() => markCompleted(order.id)} className="add-btn">Mark Completed</button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button onClick={() => openCancelModal(order.id)} className="delete-btn">Cancel</button>
                      )}
                      <button onClick={() => printInvoice(order)} className="add-btn" style={{ background: '#374151' }}>Print Invoice</button>
                      {order.customerEmail && (
                        <button onClick={() => resendEmail(order.id)} className="edit-btn">Resend Email</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards">
            {orders.map((order) => (
              <div key={order.id} className="mobile-card">
                <div className="mobile-card-header">
                  <h3 className="mobile-card-title">Order #{order.id}</h3>
                  <span className={`mobile-card-status ${
                    order.status === 'completed' ? 'completed' : 
                    order.status === 'pending' ? 'pending' : 
                    order.status === 'processing' ? 'processing' : 
                    order.status === 'out_for_delivery' ? 'out_for_delivery' : 'cancelled'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Date</span>
                    <span className="mobile-card-value">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Customer</span>
                    <span className="mobile-card-value">{order.customerName}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Email</span>
                      <span className="mobile-card-value">{order.customerEmail}</span>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Phone</span>
                      <span className="mobile-card-value">{order.customerPhone}</span>
                    </div>
                  )}
                  {order.deliveryAddress && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Delivery</span>
                      <span className="mobile-card-value" style={{ fontSize: '12px' }}>{order.deliveryAddress}</span>
                    </div>
                  )}
                  {order.specialInstructions && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Note</span>
                      <span className="mobile-card-value" style={{ fontSize: '12px', textAlign: 'right', color: '#d97706' }}>{order.specialInstructions}</span>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Total</span>
                    <span className="mobile-card-value" style={{ color: '#059669', fontWeight: '800' }}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              <div className={`mobile-card-actions ${isSlaBreached(order) ? 'sla-breached' : ''}`}>
                {order.status === 'pending' && (
                  <button onClick={() => markProcessing(order.id)} className="edit-btn">Start</button>
                )}
                {order.status === 'processing' && (
                  <button onClick={() => markOutForDelivery(order.id)} className="edit-btn">Out</button>
                )}
                {order.status === 'out_for_delivery' && (
                  <button onClick={() => markCompleted(order.id)} className="add-btn">Complete</button>
                )}
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button onClick={() => openCancelModal(order.id)} className="delete-btn">Cancel</button>
                )}
                <button onClick={() => printInvoice(order)} className="add-btn" style={{ background: '#374151' }}>Invoice</button>
                {order.customerEmail && (
                  <button onClick={() => resendEmail(order.id)} className="edit-btn">Resend</button>
                )}
              </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Order</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
              
              <button type="button" onClick={handleAddItem}>Add Product</button>
              
              {formData.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(i, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(i, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
              ))}
              
              <button type="submit">Create Order</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

  {cancelModal.open && (
    <div className="modal" onClick={() => setCancelModal({ open: false, orderId: null, reason: '' })}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Cancel Order</h2>
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select value={cancelModal.reason} onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}>
              <option value="">Select a reason</option>
              <option value="customer_request">Customer request</option>
              <option value="payment_issue">Payment issue</option>
              <option value="inventory_shortage">Inventory shortage</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="modal-buttons form-actions">
          <button type="button" onClick={() => setCancelModal({ open: false, orderId: null, reason: '' })}>Close</button>
          <button type="button" onClick={submitCancellation} disabled={!cancelModal.reason}>Confirm Cancel</button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default OrdersReports;

