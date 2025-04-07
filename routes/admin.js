const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin");
const teamController = require("../controllers/team");
const User = require("../models/user");

// Session validation middleware
const authenticate = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/users/login');
    }
    // Verify user still exists in database
    const user = await User.query({ id: req.session.user.id });
    if (!user) {
      req.session.destroy();
      return res.redirect('/users/login');
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/users/login');
  }
};

// Role-based access control middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.session.user.rank)) {
      return res.status(403).render('admin/error', {
        message: 'Forbidden: Insufficient permissions',
        user: req.session.user
      });
    }
    next();
  };
};

// Public routes (no authentication required)
router.route('/login')
  .get(adminController.getLogin)
  .post(adminController.postLogin);

router.route('/register')
  .get(adminController.getRegister)
  .post(adminController.postRegister);

// Protected routes (require authentication)
router.use(authenticate);

// Dashboard routes
router.get('/', adminController.getIndex);
router.get('/dashboard', adminController.getIndex);

// User Management routes
router.route('/users')
  .get(authorize(['admin', 'super_admin']), adminController.getAddUser)
  .post(authorize(['admin', 'super_admin']), adminController.postAddUser);

// Team Management routes
router.route('/teams')
  .post(authorize(['admin', 'super_admin']), adminController.postAddTeam);

router.get('/teams/:teamId', teamController.getViewTeam);

// Player Management routes
router.route('/players/:playerSerial')
  .get(teamController.getViewPlayer)
  .delete(authorize(['admin', 'super_admin', 'team_manager']), teamController.getDelPlayer);

// Match Management routes
router.route('/matches')
  .post(authorize(['admin', 'super_admin']), adminController.postNewSeason);

router.route('/matches/:matchNo')
  .get(adminController.getPreMatch)
  .post(authorize(['admin', 'super_admin', 'referee']), adminController.postSetMatch)
  .put(authorize(['admin', 'super_admin', 'referee']), adminController.postMatch);

router.get('/matches/:matchNo/play', authorize(['admin', 'super_admin', 'referee']), adminController.getMatch);
router.get('/matches/:matchNo/results', adminController.getMatchRes);

// Squad Management routes
router.route('/squads/:matchNo/:teamId')
  .get(authorize(['admin', 'super_admin', 'team_manager']), teamController.getSquad)
  .post(authorize(['admin', 'super_admin', 'team_manager']), teamController.postSquad);

// Request Handling
router.post('/requests/:playerSerial', authorize(['admin', 'super_admin']), adminController.postHandleRequests);

// Session routes
router.get('/logout', adminController.getLogout);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('admin/error', {
    message: err.message || 'Operation failed',
    user: req.session.user,
    statusCode
  });
});

// 404 Not Found handler
router.use((req, res) => {
  res.status(404).render('admin/error', {
    message: 'Page not found',
    user: req.session.user,
    statusCode: 404
  });
});

module.exports = router;
