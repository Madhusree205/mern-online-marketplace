const express = require('express');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Create rating
router.post('/', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, review } = req.body;
    
    console.log('Rating request:', { productId, orderId, rating, review, userId: req.user._id });
    
    // Simple validation
    if (!productId || !orderId || !rating || !review) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if already rated
    const existingRating = await Rating.findOne({ product: productId, user: req.user._id });
    if (existingRating) {
      return res.status(400).json({ message: 'Already rated this product' });
    }
    
    const newRating = new Rating({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating: parseInt(rating),
      review
    });
    
    await newRating.save();
    await newRating.populate('user', 'name');
    
    console.log('Rating saved:', newRating);
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get ratings for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const ratings = await Rating.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;