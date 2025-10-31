import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './OrderTracking.css';

const OrderTracking = () => {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for status updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/track/${token}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    return [
      { key: 'pending', label: 'Order Received', icon: '📋', active: ['pending', 'preparing', 'on_the_way', 'delivered', 'completed'].includes(order?.status) },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', active: ['preparing', 'on_the_way', 'delivered', 'completed'].includes(order?.status) },
      { key: 'on_the_way', label: 'On the Way', icon: '🚗', active: ['on_the_way', 'delivered', 'completed'].includes(order?.status) },
      { key: 'delivered', label: 'Delivered', icon: '✅', active: ['delivered', 'completed'].includes(order?.status) },
    ];
  };

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Tracking Your Order</h2>
          <p className="loading-subtext">Please wait while we fetch your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Order Not Found</h2>
          <p className="error-message-text">{error || 'Unable to find the order with this tracking code.'}</p>
          <p className="error-hint">Please check your tracking link and try again.</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <div className="tracking-logo">
          <img 
            src="/logo.jpg" 
            alt="CHOX Kitchen Logo" 
            className="tracking-logo-image"
          />
        </div>
        <h1>Order Tracking</h1>
        <p className="order-id">Order #{order.id}</p>
        <div className="order-badge">
          <span className={`status-badge status-${order.status}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="tracking-card">
        {/* Status Timeline */}
        <div className="status-timeline">
          {statusSteps.map((step, index) => (
            <div key={step.key} className={`timeline-step ${step.active ? 'active' : ''} ${order.status === step.key ? 'current' : ''}`}>
              <div className="step-icon">
                {order.status === 'preparing' && step.key === 'preparing' ? (
                  <div className="cooking-animation">👨‍🍳</div>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <div className="step-label">{step.label}</div>
              {index < statusSteps.length - 1 && (
                <div className={`step-connector ${step.active ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Current Status Message */}
        <div className={`status-banner status-${order.status}`}>
          <div className="status-banner-icon">
            {order.status === 'pending' && '⏳'}
            {order.status === 'preparing' && '👨‍🍳'}
            {order.status === 'on_the_way' && '🚗'}
            {order.status === 'delivered' && '✅'}
            {order.status === 'completed' && '🎉'}
          </div>
          <div className="status-banner-content">
            {order.status === 'pending' && (
              <div>
                <h3>Order Received</h3>
                <p>Your order has been received and is waiting for confirmation.</p>
              </div>
            )}
            {order.status === 'preparing' && (
              <div>
                <h3>Preparing Your Meal</h3>
                <p className="cooking-text">🔥 Our chefs are preparing your delicious meal!</p>
              </div>
            )}
            {order.status === 'on_the_way' && (
              <div>
                <h3>Out for Delivery</h3>
                <p>🚗 Your order is on the way! It should arrive soon.</p>
              </div>
            )}
            {order.status === 'delivered' && (
              <div>
                <h3>Delivered Successfully</h3>
                <p>✅ Your order has been delivered! Enjoy your meal!</p>
              </div>
            )}
            {order.status === 'completed' && (
              <div>
                <h3>Order Completed</h3>
                <p>✅ Order completed. Thank you for choosing CHOX Kitchen!</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="order-info-section">
          <div className="section-header">
            <div className="section-icon">📋</div>
            <h3>Order Information</h3>
          </div>
          <div className="order-details">
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">Customer Name</span>
                <span className="detail-value">{order.customerName}</span>
              </div>
            </div>
            {order.customerEmail && (
              <div className="detail-row">
                <div className="detail-group">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.customerEmail}</span>
                </div>
              </div>
            )}
            {order.customerPhone && (
              <div className="detail-row">
                <div className="detail-group">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{order.customerPhone}</span>
                </div>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="detail-row">
                <div className="detail-group">
                  <span className="detail-label">Delivery Address</span>
                  <span className="detail-value">{order.deliveryAddress}</span>
                </div>
              </div>
            )}
            {order.specialInstructions && (
              <div className="detail-row">
                <div className="detail-group">
                  <span className="detail-label">Special Instructions</span>
                  <span className="detail-value special-instructions">{order.specialInstructions}</span>
                </div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-group">
                <span className="detail-label">Order Date</span>
                <span className="detail-value">{new Date(order.orderDate).toLocaleString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-info-section">
          <div className="section-header">
            <div className="section-icon">🍽️</div>
            <h3>Order Items</h3>
          </div>
          <div className="items-list">
            {order.Items?.map((item, index) => (
              <div key={item.id || index} className="item-card">
                <div className="item-info">
                  <span className="item-name">{item.productName}</span>
                  <span className="item-quantity">Quantity: {item.quantity}</span>
                </div>
                <span className="item-price">${parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="payment-summary">
            <div className="payment-row">
              <span className="payment-label">Subtotal:</span>
              <span className="payment-value">${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="payment-row highlight">
              <span className="payment-label">Downpayment (50%):</span>
              <span className="payment-value">${(parseFloat(order.totalAmount) * 0.5).toFixed(2)}</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">Remaining Balance:</span>
              <span className="payment-value">${(parseFloat(order.totalAmount) * 0.5).toFixed(2)}</span>
            </div>
            <div className="order-total">
              <span className="total-label">Total Amount:</span>
              <span className="total-amount">${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Receipt Display */}
        {order.receiptImage && (
          <div className="order-info-section">
            <div className="section-header">
              <div className="section-icon">🧾</div>
              <h3>Payment Receipt</h3>
            </div>
            <div className="receipt-display">
              <img 
                src={`http://localhost:3001${order.receiptImage}`} 
                alt="Downpayment Receipt" 
                className="receipt-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #dc2626;">
                      <p>Failed to load receipt image</p>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              const btn = document.querySelector('.share-button');
              if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Link Copied!';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.style.background = '';
                }, 2000);
              }
            }}
            className="share-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Copy Tracking Link
          </button>
          <button
            onClick={() => window.print()}
            className="print-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

