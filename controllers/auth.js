const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Secret Key (store this in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

module.exports = {
    // Authentication Middleware (JWT-based)
    authenticate: (req, res, next) => {
        console.log('Authentication middleware triggered');
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).redirect('/auth/login');
        }

        try {
            console.log('Verifying JWT token');
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            console.log(`Authenticated user: ${decoded.email} with rank: ${decoded.rank}`);
            next();
        } catch (err) {
            console.error('JWT verification failed:', err.message);
            res.clearCookie('token');
            return res.status(401).redirect('/auth/login');
        }
    },

    // Login Handling
    getLogin: (req, res) => {
        console.log('Rendering login page');
        res.render('auth/login', { message: "User Login" });
    },

    postLogin: async (req, res) => {
    console.log('[1] Starting login for:', req.body.email);
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('[2] Missing credentials');
            return res.render('auth/login', { message: "Email and password are required" });
        }

        console.log('[3] Calling verifyCredentials');
        const result = await User.verifyCredentials(email.toLowerCase(), password); // Ensure lowercase
        
        console.log('[4] Verify result:', result);
        if (!result.success) {
            console.log('[5] Auth failed:', result.message);
            return res.render('auth/login', { message: result.message || "Invalid credentials" });
        }

        console.log('[6] Creating token for user ID:', result.user.id);
        const token = jwt.sign(
            { 
                id: result.user.id, 
                email: result.user.email, 
                rank: result.user.rank,
                name: result.user.name 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('[7] Setting cookie with token');
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'lax' // Try 'lax' instead of 'strict' for local testing
        });

        console.log('[8] Redirecting to /user/userPage');
        return res.redirect('/user/userPage'); // Explicit return
        
    } catch (err) {
        console.error('[ERROR] Login failed:', err);
        return res.render('auth/login', { message: "Login failed. Please try again." });
    }
},
    // Registration Handling
    getSignup: (req, res) => {
        console.log('Rendering signup page');
        res.render('auth/signup', { message: "" });
    },

    postSignup: async (req, res) => {
        console.log('Registration attempt:', req.body.email);
        try {
            const { name, email, password } = req.body;
            const rank = 'user'; // Set default rank to 'user'
        
            if (!name || !email || !password) {
                console.log('Missing registration fields');
                return res.render('auth/signup', { 
                message: "All fields are required",
                formData: req.body
                });
            }

            if (password.length < 8) {
                console.log('Password too short');
                return res.render('auth/signup', { 
                    message: "Password must be at least 8 characters",
                    formData: req.body
                });
            }

            // Using the custom User model's store method
            const result = await User.store(name, email, rank, password);
            
            if (!result.success) {
                console.log('Registration failed:', result.message);
                return res.render('auth/signup', { 
                    message: result.message || "Registration failed",
                    formData: req.body
                });
            }

            console.log('User created successfully:', result.user.email);
            res.redirect('/auth/login');
        } catch (err) {
            console.error('Registration error:', err);
            res.render('auth/signup', { 
                message: "Registration failed. Please try again.",
                formData: req.body
            });
        }
    },

    // Dashboard
    getUserDashboard: async (req, res) => {
        console.log('Fetching user dashboard for:', req.user?.email);
        try {
            // Using the custom User model's query method
            const user = await User.query({ id: req.user.id });
            
            if (!user) {
                console.log('User not found in database, clearing cookie');
                res.clearCookie('token');
                return res.redirect('/auth/login');
            }
            
            console.log('Rendering user dashboard');
            res.render('user/userPage', { 
                user,
                currentTime: new Date().toLocaleString()
            });
        } catch (err) {
            console.error('Dashboard error:', err);
            res.status(500).render('error', { 
                message: "Server Error",
                error: process.env.NODE_ENV === 'development' ? err : {}
            });
        }
    },

    // Logout
    getLogout: (req, res) => {
        console.log('Logging out user:', req.user?.email);
        res.clearCookie('token');
        res.redirect('/auth/login');
    }
};
