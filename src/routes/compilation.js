const express = require('express');
const CompilationController = require('../controllers/CompilationController');
const { validateApiKey } = require('../middleware/auth');

const router = express.Router();
const compilationController = new CompilationController();

// Compile MQL code (requires API key)
router.post('/compile', validateApiKey, (req, res) => compilationController.compile(req, res));

// Download compiled file
router.get('/download/:jobId', (req, res) => compilationController.downloadFile(req, res));

// Health check
router.get('/health', (req, res) => compilationController.getHealth(req, res));

module.exports = router; 