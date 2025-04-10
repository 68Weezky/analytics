const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin");
const leagueController = require("../controllers/league");
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
    // Attach fresh user data to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/users/login');
  }
};

// Role-based access control middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rank)) {
      return res.status(403).render('admin/error', {
        message: 'Forbidden: Insufficient permissions',
        user: req.user,
        statusCode: 403
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
  .get(authorize(['admin']), adminController.getUsers)  // Only admin can view all users
  .post(authorize(['admin']), adminController.postAddUser);  // Only admin can add users

router.route('/users/update-rank')
  .post(authorize(['admin']), adminController.postUpdateUserRank);  // Only admin can update ranks

// Team Management routes
router.route('/teams')
  .post(authorize(['admin', 'league_manager']), leagueController.postAddTeam);  // Admin and league managers can add teams

router.get('/teams/:teamId', 
  authorize(['admin', 'league_manager', 'team_manager']), 
  teamController.getViewTeam);

// Player Management routes
router.route('/players/:playerSerial')
  .get(authorize(['admin', 'league_manager', 'team_manager']), 
    teamController.getViewPlayer)
  .delete(authorize(['admin', 'team_manager']), 
    teamController.getDelPlayer);

// Match Management routes
router.route('/matches')
  .post(authorize(['admin', 'league_manager']), 
    leagueController.postNewSeason);

router.route('/matches/:matchNo')
  .get(leagueController.getPreMatch)
  .post(authorize(['admin', 'league_manager']), 
    leagueController.postSetMatch)
  .put(authorize(['admin']), 
    leagueController.postMatch);

router.get('/matches/:matchNo/play', 
  authorize(['admin']), 
  leagueController.getMatch);

router.get('/matches/:matchNo/results', 
  authorize(['admin', 'league_manager', 'team_manager']), 
  leagueController.getMatchRes);

// Squad Management routes
router.route('/squads/:matchNo/:teamId')
  .get(authorize(['admin', 'team_manager']), 
    teamController.getSquad)
  .post(authorize(['admin', 'team_manager']), 
    teamController.postSquad);

// Request Handling
router.post('/requests/:playerSerial', 
  authorize(['admin', 'league_manager']), 
  leagueController.postHandleRequests);

// Session routes
router.get('/logout', adminController.getLogout);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('admin/error', {
    message: err.message || 'Operation failed',
    user: req.user,
    statusCode
  });
});

// 404 Not Found handler
router.use((req, res) => {
  res.status(404).render('admin/error', {
    message: 'Page not found',
    user: req.user,
    statusCode: 404
  });
});

module.exports = router;
