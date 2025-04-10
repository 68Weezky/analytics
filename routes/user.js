const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const knex = require('../config/knex'); // Added knex import

router.get('/', userController.getIndex);
router.get('/dashboard', userController.getUserDashboard);
router.get('/api-docs', userController.getApiDocs);
router.get('/profile', userController.getCurrentUser);
// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error('User route error:', err);
    res.status(500).render('error/500', {
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        user: req.user || null
    });
});

// 404 Not Found Handler
router.use((req, res) => {
    res.status(404).render('error/404', {
        title: 'Page Not Found',
        message: 'The page you requested could not be found.',
        user: req.user || null
    });
});

module.exports = router;
