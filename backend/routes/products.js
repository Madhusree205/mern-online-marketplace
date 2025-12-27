const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products with search
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const products = await Product.find(query).populate('seller', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike product
router.post('/:id/like', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const isLiked = product.likes.includes(req.user._id);
    
    if (isLiked) {
      product.likes = product.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      product.likes.push(req.user._id);
    }
    
    await product.save();
    res.json({ liked: !isLiked, likesCount: product.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (sellers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    const product = new Product({
      ...req.body,
      seller: req.user._id
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buy product directly
router.post('/:id/buy', auth, async (req, res) => {
  try {
    const { quantity = 1, shippingAddress, phoneNumber } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    
    // Reduce stock
    product.stock -= quantity;
    await product.save();
    
    // Create order
    const order = new Order({
      buyer: req.user._id,
      items: [{ product: product._id, quantity, price: product.price }],
      total: product.price * quantity,
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

module.exports = router;