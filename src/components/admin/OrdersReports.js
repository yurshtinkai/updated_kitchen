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
  const [receiptModal, setReceiptModal] = useState({ open: false, imageUrl: null, loading: false, error: null });

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
            <label htmlFor="order-id-filter" style={{ display: 'none' }}>Order ID Filter</label>
            <input
              id="order-id-filter"
              name="orderId"
              type="text"
              placeholder="Order ID"
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
              title="Filter by Order ID"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="customer-name-filter" style={{ display: 'none' }}>Customer Name Filter</label>
            <input
              id="customer-name-filter"
              name="customerName"
              type="text"
              placeholder="Customer Name"
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              title="Filter by Customer Name"
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-date-group">
            <label htmlFor="start-date-filter">START DATE</label>
            <input
              id="start-date-filter"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              title="Select start date for filter"
            />
          </div>
          <div className="filter-date-group">
            <label htmlFor="end-date-filter">END DATE</label>
            <input
              id="end-date-filter"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              title="Select end date for filter"
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
                                       order.status === 'preparing' ? '#fef3c7' : 
                                       order.status === 'on_the_way' ? '#dbeafe' : 
                                       order.status === 'delivered' ? '#cffafe' :
                                       order.status === 'pending' ? '#fef3c7' : 
                                       order.status === 'processing' ? '#dbeafe' : '#fee2e2',
                      color: order.status === 'completed' ? '#065f46' : 
                             order.status === 'preparing' ? '#92400e' : 
                             order.status === 'on_the_way' ? '#1e3a8a' : 
                             order.status === 'delivered' ? '#155e75' :
                             order.status === 'pending' ? '#92400e' : 
                             order.status === 'processing' ? '#1e3a8a' : '#991b1b',
                      fontSize: '0.85rem',
                      textTransform: 'capitalize'
                    }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="edit-btn"
                          style={{ fontSize: '0.85rem' }}
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'on_the_way')}
                          className="edit-btn"
                          style={{ fontSize: '0.85rem' }}
                        >
                          Mark On the Way
                        </button>
                      )}
                      {order.status === 'on_the_way' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="add-btn"
                          style={{ fontSize: '0.85rem' }}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="add-btn"
                          style={{ fontSize: '0.85rem' }}
                        >
                          Complete Order
                        </button>
                      )}
                      {order.receiptImage && (
                        <button
                          onClick={() => {
                            const imageUrl = `http://localhost:3001${order.receiptImage}`;
                            setReceiptModal({ open: true, imageUrl, loading: true, error: null });
                          }}
                          className="edit-btn"
                          style={{ fontSize: '0.85rem', width: '100%' }}
                        >
                          View Receipt
                        </button>
                      )}
                      {order.trackingToken && (
                        <a
                          href={`/track/${order.trackingToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="edit-btn"
                          style={{ fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}
                        >
                          View Tracking
                        </a>
                      )}
                      <button 
                        onClick={() => handleDelete(order.id)} 
                        className="delete-btn"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
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
                    order.status === 'processing' ? 'processing' : 'cancelled'
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
                <div className="mobile-card-actions">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="edit-btn"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'on_the_way')}
                      className="edit-btn"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Mark On the Way
                    </button>
                  )}
                  {order.status === 'on_the_way' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="edit-btn"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      className="edit-btn"
                      style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', fontSize: '0.85rem' }}
                    >
                      Complete Order
                    </button>
                  )}
                  {order.receiptImage && (
                    <button
                      onClick={() => {
                        const imageUrl = `http://localhost:3001${order.receiptImage}`;
                        setReceiptModal({ open: true, imageUrl, loading: true, error: null });
                      }}
                      className="edit-btn"
                      style={{ fontSize: '0.85rem' }}
                    >
                      View Receipt
                    </button>
                  )}
                  {order.trackingToken && (
                    <a
                      href={`/track/${order.trackingToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="edit-btn"
                      style={{ fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}
                    >
                      View Tracking
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="delete-btn"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Delete
                  </button>
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
              <label htmlFor="modal-customer-name">Customer Name</label>
              <input
                id="modal-customer-name"
                name="customerName"
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                title="Enter customer name"
              />
              <label htmlFor="modal-customer-email">Email</label>
              <input
                id="modal-customer-email"
                name="customerEmail"
                type="email"
                placeholder="Email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                title="Enter customer email"
              />
              <label htmlFor="modal-customer-phone">Phone</label>
              <input
                id="modal-customer-phone"
                name="customerPhone"
                type="tel"
                placeholder="Phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                title="Enter customer phone"
              />
              
              <button type="button" onClick={handleAddItem}>Add Product</button>
              
              {formData.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <label htmlFor={`product-select-${i}`} style={{ display: 'none' }}>Product {i + 1}</label>
                  <select
                    id={`product-select-${i}`}
                    name={`productId-${i}`}
                    value={item.productId}
                    onChange={(e) => handleItemChange(i, 'productId', e.target.value)}
                    required
                    title={`Select product for item ${i + 1}`}
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <label htmlFor={`quantity-input-${i}`} style={{ display: 'none' }}>Quantity {i + 1}</label>
                  <input
                    id={`quantity-input-${i}`}
                    name={`quantity-${i}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(i, 'quantity', parseInt(e.target.value))}
                    required
                    title={`Enter quantity for item ${i + 1}`}
                  />
                </div>
              ))}
              
              <button type="submit">Create Order</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt View Modal - Professional Design */}
      {receiptModal.open && receiptModal.imageUrl && (
        <div className="modal receipt-modal-overlay" onClick={() => setReceiptModal({ open: false, imageUrl: null, loading: false, error: null })}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="receipt-modal-header">
              <div className="receipt-modal-title-section">
                <div className="receipt-icon">🧾</div>
                <div>
                  <h2 className="receipt-modal-title">Downpayment Receipt</h2>
                  <p className="receipt-modal-subtitle">Customer Payment Confirmation</p>
                </div>
              </div>
              <button
                className="receipt-modal-close"
                onClick={() => setReceiptModal({ open: false, imageUrl: null, loading: false, error: null })}
                aria-label="Close receipt modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="receipt-modal-body">
              {receiptModal.loading && !receiptModal.error && (
                <div className="receipt-loading-container">
                  <div className="receipt-loading-spinner"></div>
                  <p className="receipt-loading-text">Loading receipt image...</p>
                  <p className="receipt-loading-subtext">Please wait while we fetch the document</p>
                </div>
              )}
              
              {receiptModal.error && (
                <div className="receipt-error-container">
                  <div className="receipt-error-icon">⚠️</div>
                  <h3 className="receipt-error-title">Failed to Load Receipt</h3>
                  <p className="receipt-error-message">
                    The receipt image could not be loaded from the server.
                  </p>
                  <div className="receipt-error-details">
                    <p className="receipt-error-url-label">Requested URL:</p>
                    <code className="receipt-error-url">{receiptModal.imageUrl}</code>
                  </div>
                  <p className="receipt-error-hint">
                    Please verify that the file exists on the server or contact support if the issue persists.
                  </p>
                </div>
              )}
              
              {!receiptModal.error && (
                <div className="receipt-image-container">
                  <img
                    src={receiptModal.imageUrl}
                    alt="Downpayment Receipt"
                    className="receipt-image"
                    style={{ display: receiptModal.loading ? 'none' : 'block' }}
                    onLoad={() => {
                      setReceiptModal(prev => ({ ...prev, loading: false, error: null }));
                    }}
                    onError={() => {
                      setReceiptModal(prev => ({ ...prev, loading: false, error: 'Failed to load image' }));
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="receipt-modal-footer">
              <button
                className="receipt-btn receipt-btn-primary"
                onClick={() => {
                  window.open(receiptModal.imageUrl, '_blank');
                }}
                disabled={receiptModal.loading || receiptModal.error}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open in New Tab
              </button>
              <button
                className="receipt-btn receipt-btn-secondary"
                onClick={() => setReceiptModal({ open: false, imageUrl: null, loading: false, error: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersReports;

