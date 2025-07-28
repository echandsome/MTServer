const express = require('express');
const compilationRoutes = require('./compilation');

const router = express.Router();

// Mount compilation routes
router.use('/', compilationRoutes);

module.exports = router;
