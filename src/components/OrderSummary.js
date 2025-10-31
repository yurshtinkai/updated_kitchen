import React, { useState } from 'react';

const OrderSummary = ({ cart, totalPrice, onClose, onComplete, updateCart }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });

  const [orderComplete, setOrderComplete] = useState(false);
  const [localCart, setLocalCart] = useState(cart);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [trackingUrl, setTrackingUrl] = useState(null);

  const handleRemoveItem = (itemId) => {
    const updatedCart = localCart.filter(item => item.id !== itemId);
    setLocalCart(updatedCart);
    if (updateCart) {
      updateCart(updatedCart);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updatedCart = localCart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setLocalCart(updatedCart);
    if (updateCart) {
      updateCart(updatedCart);
    }
  };

  const getCurrentTotalPrice = () => {
    return localCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        e.target.value = ''; // Reset input
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = ''; // Reset input
        return;
      }
      setReceiptFile(file);
      console.log('Receipt file set:', file.name);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
        console.log('Receipt preview generated');
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('No file selected');
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    try {
      // Check if cart is empty
      if (localCart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
      }

      // Validate customer info before submission
      if (!customerInfo.name || customerInfo.name.trim() === '') {
        alert('Please enter your name');
        return;
      }
      if (!customerInfo.email || customerInfo.email.trim() === '') {
        alert('Please enter your email');
        return;
      }
      if (!customerInfo.phone || customerInfo.phone.trim() === '') {
        alert('Please enter your phone number');
        return;
      }
      if (!customerInfo.address || customerInfo.address.trim() === '') {
        alert('Please enter your delivery address');
        return;
      }

      // Check if receipt is uploaded
      if (!receiptFile) {
        alert('Please upload a screenshot of your 50% downpayment receipt.');
        return;
      }

      // Calculate total price
      const totalAmount = getCurrentTotalPrice();
      
      // Validate total amount
      if (totalAmount <= 0) {
        alert('Order total must be greater than 0');
        return;
      }
      
      // Prepare order items
      const items = localCart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        productName: item.name,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      // Validate items
      if (items.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('customerName', customerInfo.name.trim());
      formData.append('customerEmail', customerInfo.email.trim());
      formData.append('customerPhone', customerInfo.phone.trim());
      formData.append('deliveryAddress', customerInfo.address.trim());
      formData.append('totalAmount', totalAmount.toString());
      formData.append('items', JSON.stringify(items));
      formData.append('specialInstructions', customerInfo.specialInstructions?.trim() || '');
      formData.append('receipt', receiptFile);

      // Verify FormData contents
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'receipt') {
          console.log(`${pair[0]}: [File] ${pair[1].name}, ${pair[1].size} bytes`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Debug logging
      console.log('Submitting order with:', {
        customerName: customerInfo.name,
        totalAmount,
        itemsCount: items.length,
        receiptFile: receiptFile ? { name: receiptFile.name, size: receiptFile.size, type: receiptFile.type } : 'MISSING'
      });

      // Submit order to backend
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit order';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage;
          console.error('Backend error response:', JSON.stringify(error, null, 2));
          console.error('Status:', response.status);
          console.error('Full error object:', error);
        } catch (parseError) {
          const text = await response.text();
          console.error('Backend error (text):', text);
          console.error('Status:', response.status);
          errorMessage = text || errorMessage;
        }
        alert(`Order submission failed: ${errorMessage}\n\nCheck console for details.`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Generate frontend tracking URL
      const frontendUrl = `${window.location.origin}/track/${result.order.trackingToken}`;
      setTrackingUrl(frontendUrl);
      setOrderComplete(true);
      
      // Show success message
      setTimeout(() => {
        onComplete();
      }, 5000);
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order! We'll prepare your food and notify you when it's ready.
          </p>
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-primary-700 mb-2">
              <strong>Order Total:</strong> ${getCurrentTotalPrice().toFixed(2)}
            </p>
            <p className="text-sm text-primary-700 mb-2">
              <strong>Downpayment (50%):</strong> ${(getCurrentTotalPrice() * 0.5).toFixed(2)}
            </p>
            <p className="text-sm text-primary-700">
              <strong>Remaining Balance:</strong> ${(getCurrentTotalPrice() * 0.5).toFixed(2)}
            </p>
          </div>
          {trackingUrl && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-green-800 mb-2">Track Your Order:</p>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
              >
                {trackingUrl}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  alert('Tracking URL copied to clipboard!');
                }}
                className="mt-2 text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Copy Link
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This window will close automatically...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>
            <div className="space-y-3">
              {localCart.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center flex-1">
                    {/* Product Image */}
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                      />
                    )}
                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-3 text-gray-700">Qty: {item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Price and Remove */}
                    <div className="flex flex-col items-end ml-4">
                      <span className="font-semibold text-gray-900 mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {localCart.length === 0 && (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-primary-600">${getCurrentTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmitOrder}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={customerInfo.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Any special requests or dietary restrictions?"
              />
            </div>

            {/* Receipt Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshot of Downpayment Receipt (50% DP) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                {!receiptPreview ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      className="hidden"
                      id="receipt-upload"
                      required
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload receipt screenshot
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto rounded-lg mb-2"
                    />
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove & Upload Different
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Please upload a clear screenshot of your 50% downpayment receipt
              </p>
            </div>
          </form>
        </div>

        {/* Footer - Fixed with Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitOrder}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
