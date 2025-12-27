import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  like: (id) => api.post(`/products/${id}/like`),
  buyNow: (id, orderData) => api.post(`/products/${id}/buy`, orderData),
};

export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getSellerOrders: () => api.get('/orders/seller/orders'),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const ratingsAPI = {
  create: (ratingData) => {
    console.log('API call to create rating:', ratingData);
    return api.post('/ratings', ratingData);
  },
  getByProduct: (productId) => api.get(`/ratings/product/${productId}`),
};

export default api;