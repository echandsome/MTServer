const CompilationService = require('../services/CompilationService');
const path = require('path');
const logger = require('../utils/logger');

class CompilationController {
  constructor() {
    this.compilationService = new CompilationService();
  }

  async compile(req, res) {
    const { code, platform, jobId } = req.body;
    
    logger.info(`Compilation request: ${jobId} (${platform})`);
    
    if (!code || !platform || !jobId) {
      logger.warn(`Missing fields: jobId=${!!jobId}, platform=${!!platform}, code=${!!code}`);
      return res.status(400).json({
        success: false,
        errors: 'Missing required fields: code, platform, or jobId'
      });
    }

    try {
      const result = await this.compilationService.compileCode(code, platform, jobId);
      
      if (result.success) {
        logger.info(`Compilation success: ${jobId} -> ${result.compiledFile}`);
      } else {
        logger.warn(`Compilation failed: ${jobId} - ${result.errors}`);
      }
      
      res.json(result);
    } catch (error) {
      logger.error(`Compilation error: ${jobId} - ${error.message}`);
      res.status(500).json({
        success: false,
        errors: error.message
      });
    }
  }

  async downloadFile(req, res) {
    const { jobId } = req.params;
    
    logger.info(`Download request: ${jobId}`);
    
    try {
      const filePath = await this.compilationService.getCompiledFile(jobId);
      
      if (!filePath) {
        logger.warn(`File not found: ${jobId}`);
        return res.status(404).json({ error: 'Compiled file not found' });
      }
      
      logger.info(`Download success: ${jobId} -> ${path.basename(filePath)}`);
      res.download(filePath, path.basename(filePath));
    } catch (error) {
      logger.error(`Download error: ${jobId} - ${error.message}`);
      res.status(500).json({ error: 'Failed to download file' });
    }
  }

  getHealth(req, res) {
    logger.info('Health check');
    const healthStatus = this.compilationService.getHealthStatus();
    res.json(healthStatus);
  }
}

module.exports = CompilationController; 