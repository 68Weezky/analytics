const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin");
const teamController = require("../controllers/team");

// Session validation middleware
const authenticate = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  next();
};

// Public routes
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);

router.get('/register', adminController.getRegister);
router.post('/register', adminController.postRegister);

// Protected routes
router.use(authenticate); // Applies to all routes below

// Dashboard
router.get('/dashboard', adminController.getIndex);

// User management
router.get('/addUser', adminController.getAddUser);
router.post('/addUser', adminController.postAddUser);

// Team management
router.post('/addTeam', adminController.postAddTeam);
router.get('/viewTeam', teamController.getViewTeam);

// Match management
router.route('/match/:matchNo')
  .get(adminController.getPreMatch)
  .post(adminController.postSetMatch);

router.get('/match/:matchNo/play', adminController.getMatch);
router.post('/matchRes/:matchNo', adminController.postMatch);

// Player management
router.get('/delPlayer/:playerSerial', teamController.getDelPlayer);
router.get('/:playerSerial', teamController.getViewPlayer);

// Logout
router.get('/logout', adminController.getLogout);

// Error handling
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  res.status(500).render('admin/error', {
    message: 'Operation failed',
    user: req.session.user
  });
});

module.exports = router;
