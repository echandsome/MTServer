const CompilationService = require('../services/CompilationService');
const path = require('path');

class CompilationController {
  constructor() {
    this.compilationService = new CompilationService();
  }

  async compile(req, res) {
    const { code, platform, jobId } = req.body;
    
    if (!code || !platform || !jobId) {
      return res.status(400).json({
        success: false,
        errors: 'Missing required fields: code, platform, or jobId'
      });
    }

    try {
      const result = await this.compilationService.compileCode(code, platform, jobId);
      res.json(result);
    } catch (error) {
      console.error('Compilation error:', error);
      res.status(500).json({
        success: false,
        errors: error.message
      });
    }
  }

  async downloadFile(req, res) {
    const { jobId } = req.params;
    
    try {
      const filePath = await this.compilationService.getCompiledFile(jobId);
      
      if (!filePath) {
        return res.status(404).json({ error: 'Compiled file not found' });
      }
      
      res.download(filePath, path.basename(filePath));
    } catch (error) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  }

  getHealth(req, res) {
    const healthStatus = this.compilationService.getHealthStatus();
    res.json(healthStatus);
  }
}

module.exports = CompilationController; 