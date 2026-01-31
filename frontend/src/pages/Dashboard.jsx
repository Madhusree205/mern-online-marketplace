import React, { useState, useEffect } from 'react';
import { productsAPI, ordersAPI, ratingsAPI } from '../services/api';
import RatingForm from '../components/RatingForm.jsx';

const Dashboard = ({ user, showNotification }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: '', image: '', stock: ''
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === 'seller') {
        fetchProducts();
        fetchSellerOrders();
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
      // Filter delivered orders for rating
      setDeliveredOrders(response.data.filter(order => order.status === 'delivered'));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      const response = await ordersAPI.getSellerOrders();
      setSellerOrders(response.data);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.filter(p => p.seller._id === user.id));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      });
      setNewProduct({ name: '', description: '', price: '', category: '', image: '', stock: '' });
      fetchProducts();
      showNotification('Product created successfully!', 'success');
    } catch (error) {
      showNotification('Error creating product: ' + (error.response?.data?.message || 'Unknown error'), 'error');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.update(editingProduct._id, {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock)
      });
      setEditingProduct(null);
      fetchProducts();
      showNotification('Product updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating product: ' + (error.response?.data?.message || 'Unknown error'), 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId);
        fetchProducts();
        showNotification('Product deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting product: ' + (error.response?.data?.message || 'Unknown error'), 'error');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      fetchSellerOrders();
      showNotification('Order status updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating order status: ' + (error.response?.data?.message || 'Unknown error'), 'error');
    }
  };

  const handleRating = async (productId, orderId, rating, review) => {
    try {
      console.log('Submitting rating:', { productId, orderId, rating, review });
      const response = await ratingsAPI.create({ productId, orderId, rating, review });
      console.log('Rating response:', response);
      showNotification('Rating submitted successfully!', 'success');
      fetchOrders(); // Refresh to update UI
    } catch (error) {
      console.error('Full rating error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      showNotification('Error submitting rating: ' + errorMsg, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      console.log('Cancelling order:', orderId);
      const response = await ordersAPI.cancel(orderId);
      console.log('Cancel response:', response);
      showNotification('Order cancelled successfully!', 'success');
      setCancellingOrderId(null);
      fetchOrders(); // Refresh to update UI
    } catch (error) {
      console.error('Cancel order error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      showNotification('Error cancelling order: ' + errorMsg, 'error');
    }
  };

  if (!user) return <div className="loading">Please login to access dashboard</div>;

  return (
    <div className="container">
      <div className="dashboard">
        <div className="sidebar">
          <h3>Dashboard</h3>
          <ul>
            <li 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </li>
            <li 
              className={activeTab === 'ratings' ? 'active' : ''}
              onClick={() => setActiveTab('ratings')}
            >
              Rate Products
            </li>
            {user.role === 'seller' && (
              <>
                <li 
                  className={activeTab === 'seller-orders' ? 'active' : ''}
                  onClick={() => setActiveTab('seller-orders')}
                >
                  Customer Orders
                </li>
                <li 
                  className={activeTab === 'products' ? 'active' : ''}
                  onClick={() => setActiveTab('products')}
                >
                  My Products
                </li>
                <li 
                  className={activeTab === 'add-product' ? 'active' : ''}
                  onClick={() => setActiveTab('add-product')}
                >
                  Add Product
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="main-content">
          {activeTab === 'orders' && (
            <div>
              <h3>My Orders</h3>
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Total:</strong> ₹{order.total}</p>
                  <p><strong>Status:</strong> 
                    <span style={{textTransform: 'capitalize', color: order.status === 'delivered' ? '#4caf50' : order.status === 'shipped' ? '#ff9800' : order.status === 'cancelled' ? '#f44336' : '#667eea'}}>
                      {order.status === 'shipped' ? 'Order Dispatched' : order.status}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  {order.shippingAddress && <p><strong>Address:</strong> {order.shippingAddress}</p>}
                  {order.phoneNumber && <p><strong>Phone:</strong> {order.phoneNumber}</p>}
                  
                  {/* Cancel Order Button */}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button 
                      onClick={() => setCancellingOrderId(order._id)}
                      className="btn btn-danger"
                      style={{ marginTop: '1rem' }}
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  {/* Rating Button for Delivered Orders */}
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => setActiveTab('ratings')}
                      className="btn btn-success"
                      style={{ marginTop: '1rem' }}
                    >
                      Rate Products
                    </button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <p style={{ color: '#f44336', marginTop: '1rem', fontStyle: 'italic' }}>
                      Cannot cancel order as it has already been shipped
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'seller-orders' && user.role === 'seller' && (
            <div>
              <h3>Customer Orders</h3>
              {sellerOrders.map(order => (
                <div key={order._id} className="order-card">
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Customer:</strong> {order.buyer?.name}</p>
                  <p><strong>Total:</strong> ₹{order.total}</p>
                  <p><strong>Status:</strong> 
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '5px', marginLeft: '0.5rem' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Address:</strong> {order.shippingAddress}</p>
                  <p><strong>Phone:</strong> {order.phoneNumber}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && user.role === 'seller' && (
            <div>
              <h3>My Products</h3>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <img src={product.image || 'https://via.placeholder.com/300x200'} alt={product.name} />
                    <h4>{product.name}</h4>
                    <p className="price">₹{product.price}</p>
                    <p>Stock: {product.stock}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                      <button 
                        onClick={() => setEditingProduct(product)} 
                        className="btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)} 
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'add-product' && user.role === 'seller' && (
            <div>
              <h3>Add New Product</h3>
              <form onSubmit={handleCreateProduct} className="form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Image URL:</label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Stock:</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn">Add Product</button>
              </form>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div>
              <h3>Rate Delivered Products</h3>
              {deliveredOrders.length === 0 ? (
                <p>No delivered orders to rate yet.</p>
              ) : (
                deliveredOrders.map(order => (
                  <div key={order._id} className="order-card">
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.items.map(item => (
                      item.product ? (
                        <RatingForm 
                          key={`${order._id}-${item.product._id}`}
                          product={item.product}
                          orderId={order._id}
                          onSubmit={handleRating}
                        />
                      ) : null
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Edit Product Modal */}
          {editingProduct && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="form" style={{ maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
                <h3>Edit Product</h3>
                <form onSubmit={handleEditProduct}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL:</label>
                    <input
                      type="url"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock:</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn">Update Product</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-danger">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Cancel Order Confirmation Modal */}
          {cancellingOrderId && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', maxWidth: '400px', textAlign: 'center' }}>
                <h3>Cancel Order</h3>
                <p style={{ margin: '1rem 0' }}>Are you sure you want to cancel this order?</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleCancelOrder(cancellingOrderId)}
                    className="btn btn-danger"
                  >
                    Yes, Cancel Order
                  </button>
                  <button 
                    onClick={() => setCancellingOrderId(null)}
                    className="btn btn-secondary"
                  >
                    No, Keep Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;