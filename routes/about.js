const express = require('express');
const router = express.Router();

// Report Form
router.get('/', (req, res) => {
    res.render('about');
});

module.exports = router;