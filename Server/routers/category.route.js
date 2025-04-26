const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Routes for categories
router.post('/addCategory', categoryController.createCategory);
router.get('/getAll', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/name/:name', categoryController.getCategoryByName);
router.get('/donationItem/:id', categoryController.getCategoryByDonationItemId);

module.exports = router;