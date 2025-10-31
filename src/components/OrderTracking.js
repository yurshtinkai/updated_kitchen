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
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-container">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>{error || 'Unable to find the order with this tracking code.'}</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h1>Order Tracking</h1>
        <p className="order-id">Order #{order.id}</p>
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
        <div className={`status-message status-${order.status}`}>
          {order.status === 'pending' && (
            <p>Your order has been received and is waiting for confirmation.</p>
          )}
          {order.status === 'preparing' && (
            <div>
              <p className="cooking-text">🔥 Our chefs are preparing your delicious meal!</p>
            </div>
          )}
          {order.status === 'on_the_way' && (
            <p>🚗 Your order is on the way! It should arrive soon.</p>
          )}
          {order.status === 'delivered' && (
            <p>✅ Your order has been delivered! Enjoy your meal!</p>
          )}
          {order.status === 'completed' && (
            <p>✅ Order completed. Thank you for choosing CHOX Kitchen!</p>
          )}
        </div>

        {/* Order Details */}
        <div className="order-details">
          <h3>Order Details</h3>
          <div className="detail-row">
            <span className="detail-label">Customer:</span>
            <span className="detail-value">{order.customerName}</span>
          </div>
          {order.customerPhone && (
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{order.customerPhone}</span>
            </div>
          )}
          {order.deliveryAddress && (
            <div className="detail-row">
              <span className="detail-label">Delivery Address:</span>
              <span className="detail-value">{order.deliveryAddress}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Order Date:</span>
            <span className="detail-value">{new Date(order.orderDate).toLocaleString()}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.Items?.map((item, index) => (
              <div key={item.id || index} className="item-row">
                <span className="item-name">{item.productName}</span>
                <span className="item-quantity">x {item.quantity}</span>
                <span className="item-price">${parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span className="total-label">Total:</span>
            <span className="total-amount">${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="payment-info">
            <p className="downpayment">Downpayment (50%): ${(parseFloat(order.totalAmount) * 0.5).toFixed(2)}</p>
            <p className="balance">Remaining Balance: ${(parseFloat(order.totalAmount) * 0.5).toFixed(2)}</p>
          </div>
        </div>

        {/* Receipt Display */}
        {order.receiptImage && (
          <div className="receipt-section">
            <h3>Downpayment Receipt</h3>
            <img 
              src={`http://localhost:3001${order.receiptImage}`} 
              alt="Receipt" 
              className="receipt-image"
            />
          </div>
        )}

        {/* Share Button */}
        <div className="share-section">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Tracking link copied to clipboard!');
            }}
            className="share-button"
          >
            📋 Copy Tracking Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

