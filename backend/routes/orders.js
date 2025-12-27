const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, phoneNumber } = req.body;
    
    // Reduce stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }
    
    const order = new Order({
      buyer: req.user._id,
      items,
      total: req.body.total,
      shippingAddress,
      phoneNumber
    });
    
    await order.save();
    await order.populate('items.product buyer');
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product buyer');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (for sellers)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user is seller of any product in the order
    const isSeller = order.items.some(item => 
      item.product.seller.toString() === req.user._id.toString()
    );
    
    if (!isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller orders
router.get('/seller/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this' });
    }
    
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);
    
    const orders = await Order.find({
      'items.product': { $in: productIds }
    }).populate('items.product').populate('buyer', 'name').sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    console.log('Cancel order request for ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order found:', order);
    console.log('Order buyer:', order.buyer.toString());
    
    if (order.buyer.toString() !== req.user._id.toString()) {
      console.log('Not authorized - buyer mismatch');
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.status === 'shipped' || order.status === 'delivered') {
      console.log('Cannot cancel - already shipped/delivered');
      return res.status(400).json({ message: 'Cannot cancel order as it has already been shipped' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    console.log('Order cancelled successfully');
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;