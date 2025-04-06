const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// API Documentation Route
router.get('/api-docs', (req, res) => {
  res.render('user/api-docs', { title: 'API Documentation' });
});

// Standings Routes
router.get('/', asyncHandler(userController.getStandings));
router.get('/standings', asyncHandler(userController.getStandings));

// Teams Routes
router.get('/teams', asyncHandler(userController.getTeams));
router.get('/teams/:teamId', asyncHandler(userController.getViewTeam));

// Matches Routes
router.get('/matches', asyncHandler(userController.getMatches));

// Statistics Routes
router.get('/stats', asyncHandler(userController.getStats));
router.get('/stats/top-scorers', asyncHandler(userController.getStats)); // Alternate endpoint

// Error Handling Middleware
router.use((err, req, res, next) => {
  console.error('User route error:', err);
   res.status(500).render('error', {  // Using a common error view
    title: 'Error',
    message: 'Something went wrong. Please try again later.',
    user: req.session.user
  });  
});

// 404 Not Found Handler
router.use((req, res) => {
  res.status(404).render('user/error', {
    title: 'Page Not Found',
    message: 'The page you requested could not be found.'
  });
});

module.exports = router;
