import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import OrderSummary from './OrderSummary';
import './MenuPage.css';

const MenuWithCart = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
    { id: 'mains', name: 'Main Courses', icon: '🍖' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
  ];

  const menuItems = [
    { id: 1, name: 'Caesar Salad', price: 8.99, category: 'appetizers', description: 'Fresh romaine lettuce with parmesan cheese and croutons', image: '/1.jpg', popular: true },
    { id: 2, name: 'Buffalo Wings', price: 12.99, category: 'appetizers', description: 'Spicy chicken wings with blue cheese dip', image: '/2.jpg', popular: false },
    { id: 3, name: 'Mozzarella Sticks', price: 9.99, category: 'appetizers', description: 'Crispy breaded mozzarella with marinara sauce', image: '/3.jpg', popular: true },
    { id: 4, name: 'Bruschetta', price: 7.99, category: 'appetizers', description: 'Toasted bread with fresh tomatoes and basil', image: '/4.jpg', popular: false },
    { id: 5, name: 'Grilled Salmon', price: 18.99, category: 'mains', description: 'Fresh Atlantic salmon with lemon herb butter', image: '/5.jpg', popular: true },
    { id: 6, name: 'Beef Burger', price: 14.99, category: 'mains', description: 'Juicy beef patty with lettuce, tomato, and special sauce', image: '/6.jpg', popular: true },
    { id: 7, name: 'Chicken Parmesan', price: 16.99, category: 'mains', description: 'Breaded chicken breast with marinara and mozzarella', image: '/7.jpg', popular: false },
    { id: 8, name: 'Vegetarian Pasta', price: 13.99, category: 'mains', description: 'Penne pasta with seasonal vegetables and olive oil', image: '/8.jpg', popular: false },
    { id: 9, name: 'Ribeye Steak', price: 24.99, category: 'mains', description: 'Premium ribeye steak cooked to perfection', image: '/1.jpg', popular: true },
    { id: 10, name: 'Fish & Chips', price: 15.99, category: 'mains', description: 'Beer-battered fish with crispy fries', image: '/2.jpg', popular: false },
    { id: 11, name: 'Mango Tapoica', price: 6.99, category: 'desserts', description: 'Rich chocolate cake with vanilla ice cream', image: '/3.jpg', popular: true },
    { id: 12, name: 'Tiramisu', price: 7.99, category: 'desserts', description: 'Classic Italian dessert with coffee and mascarpone', image: '/4.jpg', popular: true },
    { id: 13, name: 'Chicken Katsu W/ Cucumber', price: 150, category: 'desserts', description: 'Three scoops with your choice of toppings', image: '/5.jpg', popular: false },
    { id: 14, name: 'Cheesecake', price: 6.99, category: 'desserts', description: 'New York style cheesecake with berry compote', image: '/6.jpg', popular: false },
    { id: 15, name: 'Fresh Orange Juice', price: 4.99, category: 'beverages', description: 'Freshly squeezed orange juice', image: '/7.jpg', popular: false },
    { id: 16, name: 'Premium Coffee', price: 3.99, category: 'beverages', description: 'Premium roasted coffee beans', image: '/8.jpg', popular: true },
    { id: 17, name: 'Soft Drinks', price: 2.99, category: 'beverages', description: 'Coke, Pepsi, Sprite, or Fanta', image: '/1.jpg', popular: false },
    { id: 18, name: 'Craft Beer', price: 5.99, category: 'beverages', description: 'Local craft beer selection', image: '/2.jpg', popular: true },
    { id: 19, name: 'Wine Selection', price: 8.99, category: 'beverages', description: 'Curated wine selection by the glass', image: '/3.jpg', popular: false }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCompleteOrder = () => {
    setCart([]);
    setShowCheckout(false);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const getItemImages = (item) => {
   
    if (item.id === 1) {
      return ['/1.jpg', '/sandwich.jpg', '/sandwich1.jpg', '/sandwich3.jpg'];
    }
    
   
    if (item.id === 18) {
      return ['/2.jpg', '/bonelessPorkchop.jpg', '/bonelessPorkchop1.jpg'];
    }
    
    if (item.id === 11) {
      return ['/3.jpg','/mangoTapoica.jpg','/mangoTapoica1.jpg'];
    }
    // For other items, just show the main image
    return [item.image];
  };

  const nextImage = () => {
    const images = selectedItem ? getItemImages(selectedItem) : [];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = selectedItem ? getItemImages(selectedItem) : [];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="menu-page">
      <Header />
      
      <main className="menu-main">
        {/* Hero Section */}
        <section className="menu-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Our Menu</h1>
              <p className="hero-description">
                Discover our carefully crafted selection of delicious dishes, 
                prepared with the finest ingredients and culinary expertise.
              </p>
              <div className="cart-info">
                <button className="cart-button" onClick={handleCheckout} disabled={cart.length === 0}>
                  <span className="cart-icon">🛒</span>
                  <span className="cart-count">{getTotalItems()} items</span>
                  {cart.length > 0 && (
                    <span className="cart-total">${getTotalPrice().toFixed(2)}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="category-filter">
          <div className="container">
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="menu-items">
          <div className="container">
            <div className="menu-header">
              <h2 className="menu-section-title">
                {selectedCategory === 'all' ? 'All Items' : 
                 categories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              <p className="menu-count">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
            <div className="menu-grid">
              {filteredItems.map((item, index) => (
                <div key={item.id} className="menu-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  {item.popular && <div className="popular-badge">⭐ Popular</div>}
                  <div className="card-image" onClick={() => openModal(item)} style={{ cursor: 'pointer' }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="food-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="food-emoji" style={{ display: 'none' }}>🍽️</div>
                  </div>
                  <div className="card-content">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="card-footer">
                      <span className="item-price">${item.price}</span>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Floating Cart Summary */}
        {cart.length > 0 && !showCheckout && (
          <div className="floating-cart">
            <div className="cart-summary">
              <span>{getTotalItems()} items in cart</span>
              <span className="cart-total">${getTotalPrice().toFixed(2)}</span>
              <button onClick={handleCheckout} className="checkout-btn">
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Order Summary Modal */}
      {showCheckout && (
        <OrderSummary
          cart={cart}
          totalPrice={getTotalPrice()}
          onClose={handleCloseCheckout}
          onComplete={handleCompleteOrder}
          updateCart={setCart}
        />
      )}

      {/* Menu Item Modal */}
      {selectedItem && (
        <div className="menu-modal-overlay" onClick={closeModal}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <div className="modal-image-container">
              {getItemImages(selectedItem).length > 1 && (
                <>
                  <button className="modal-arrow left" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                    ‹
                  </button>
                  <button className="modal-arrow right" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                    ›
                  </button>
                  <div className="image-counter">
                    {currentImageIndex + 1} / {getItemImages(selectedItem).length}
                  </div>
                </>
              )}
              <img 
                src={getItemImages(selectedItem)[currentImageIndex]} 
                alt={selectedItem.name}
                className="modal-food-image"
              />
              {selectedItem.popular && <div className="modal-popular-badge">⭐ Popular</div>}
            </div>
            <div className="modal-content"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuWithCart;

