import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const InventoryReports = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'pcs',
    minStockLevel: 0,
    supplier: '',
  });

  useEffect(() => {
    fetchInventory();
  }, [page]);

  useEffect(() => {
    // Filter inventory based on search term
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.category.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredInventory(filtered);
    }
  }, [searchTerm, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
      });

      const response = await fetch(`http://localhost:3001/api/admin/reports/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/signin';
          return;
        }
        throw new Error('Failed to fetch inventory');
      }

      const result = await response.json();
      setInventory(result.inventory);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuantity = async (id) => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(quantity) || quantity <= 0) return;

    if (!window.confirm(`Add ${quantity} to this item?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/inventory/${id}/add-quantity`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        fetchInventory();
      } else {
        alert('Failed to update inventory');
      }
    } catch (err) {
      alert('Error updating inventory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchInventory();
      } else {
        alert('Failed to delete item');
      }
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/inventory', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchInventory();
        setFormData({
          name: '',
          category: '',
          quantity: 0,
          unit: 'pcs',
          minStockLevel: 0,
          supplier: '',
        });
      } else {
        alert('Failed to add inventory item');
      }
    } catch (err) {
      alert('Error adding inventory item');
    }
  };

  const isLowStock = (item) => {
    return parseFloat(item.quantity) < parseFloat(item.minStockLevel);
  };

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <h1>Inventory Reports</h1>
        <button onClick={() => setShowModal(true)} className="add-button">
          + Add Supply
        </button>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min Level</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className={isLowStock(item) ? 'low-stock' : ''}
                >
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.minStockLevel} {item.unit}</td>
                  <td>{item.supplier || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleAddQuantity(item.id)}
                        className="add-btn"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-btn"
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
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`mobile-card ${isLowStock(item) ? 'low-stock' : ''}`}
              >
                <div className="mobile-card-header">
                  <h3 className="mobile-card-title">{item.name}</h3>
                  <span className={`mobile-card-status ${isLowStock(item) ? 'low' : 'normal'}`}>
                    {isLowStock(item) ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Category</span>
                    <span className="mobile-card-value">{item.category}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Quantity</span>
                    <span className="mobile-card-value">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Min Level</span>
                    <span className="mobile-card-value">{item.minStockLevel} {item.unit}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Supplier</span>
                    <span className="mobile-card-value">{item.supplier || '-'}</span>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button
                    onClick={() => handleAddQuantity(item.id)}
                    className="add-btn"
                  >
                    Add Quantity
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="delete-btn"
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
            <h2>Add New Supply</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
              <input
                type="text"
                placeholder="Unit (pcs, kg, lbs, etc.)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Min Stock Level"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
              <input
                type="text"
                placeholder="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
              
              <div className="modal-buttons">
                <button type="submit">Add Supply</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReports;

