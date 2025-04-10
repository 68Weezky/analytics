const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security Middlewares
router.use(helmet());
router.use(express.json({ limit: '10kb' })); // Body size limit

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many attempts, please try again later'
});

// Async error handler wrapper (for cleaner route handlers)
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(error => {
      console.error('Async handler caught:', error);
      next(error);
    });
};

// Public routes
router.route('/login')
  .get(authController.getLogin)
  .post(authLimiter, asyncHandler(authController.postLogin));

router.route('/signup')
  .get(authController.getSignup)
  .post(authLimiter, asyncHandler(authController.postSignup));

// Protected routes (JWT authenticated)
router.use(authController.authenticate); // JWT verification

// Dashboard routes with async wrapper
router.get('/', asyncHandler(authController.getUserDashboard));
router.get('/dashboard', asyncHandler(authController.getUserDashboard));

// Role-protected route example
const authorize = (roles = []) => asyncHandler(async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  next();
});

// Admin-only route example
router.get('/admin', 
  authorize(['admin']), 
  asyncHandler(async (req, res) => {
    res.render('admin/dashboard', { user: req.user });
  })
);

// Logout
router.get('/logout', asyncHandler(authController.getLogout));

// Centralized error handling
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Operation failed' : err.message;
  
  console.error(`[${req.method}] ${req.path} >>`, err.stack || err);

  if (req.accepts('html')) {
    res.status(statusCode).render(`error/${statusCode}`, {
      message,
      user: req.user,
      statusCode
    });
  } else {
    res.status(statusCode).json({ error: message });
  }
};

// 404 Handler (must be last)
router.use((req, res) => {
  res.status(404).render('error/404', {
    message: 'Page not found',
    user: req.user,
    statusCode: 404
  });
});

router.use(errorHandler);

module.exports = router;
