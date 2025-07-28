const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const constants = require('../config/contants');

const execAsync = promisify(exec);

class CompilationService {
  constructor() {
    // Configuration paths from constants
    this.MQL4_PATH = constants.MQL4_PATH;
    this.MQL5_PATH = constants.MQL5_PATH;
    this.TEMP_DIR = constants.TEMP_DIR;
    this.COMPILED_DIR = constants.COMPILED_DIR;
    this.COMPILATION_TIMEOUT = constants.COMPILATION_TIMEOUT;

    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    fs.ensureDirSync(this.TEMP_DIR);
    fs.ensureDirSync(this.COMPILED_DIR);
  }

  async compileCode(code, platform, jobId) {
    const fileExtension = platform === 'mql5' ? '.mq5' : '.mq4';
    const compiledExtension = platform === 'mql5' ? '.ex5' : '.ex4';
    
    // Create temporary source file
    const sourceFile = path.join(this.TEMP_DIR, `${jobId}${fileExtension}`);
    const compiledFile = path.join(this.COMPILED_DIR, `${jobId}${compiledExtension}`);
    
    try {
      // Write code to temporary file
      await fs.writeFile(sourceFile, code, 'utf8');
      
      // Determine compiler path
      const compilerPath = platform === 'mql5' 
        ? path.join(this.MQL5_PATH, 'metaeditor64.exe')
        : path.join(this.MQL4_PATH, 'metaeditor.exe');
      
      // Compile command
      const compileCommand = `"${compilerPath}" /compile:"${sourceFile}" /log`;
      
      // Execute compilation
      const { stdout, stderr } = await execAsync(compileCommand, {
        timeout: this.COMPILATION_TIMEOUT,
        cwd: path.dirname(sourceFile)
      });
      
      // Check if compilation was successful
      const expectedCompiledFile = sourceFile.replace(fileExtension, compiledExtension);
      const compilationSuccessful = await fs.pathExists(expectedCompiledFile);
      
      if (compilationSuccessful) {
        // Move compiled file to output directory
        await fs.move(expectedCompiledFile, compiledFile);
        
        return {
          success: true,
          compiledFile: `${jobId}${compiledExtension}`,
          outputPath: compiledFile,
          compilerOutput: stdout
        };
      } else {
        // Parse compilation errors from stderr or stdout
        const errors = this.parseCompilationErrors(stderr || stdout);
        return {
          success: false,
          errors: errors || 'Compilation failed with unknown error'
        };
      }
      
    } finally {
      // Clean up temporary source file
      await fs.remove(sourceFile).catch(() => {});
    }
  }

  parseCompilationErrors(output) {
    if (!output) return 'No compilation output received';
    
    // Extract meaningful error messages from MetaEditor output
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      if (line.includes('error') || line.includes('Error')) {
        errors.push(line.trim());
      }
    }
    
    return errors.length > 0 ? errors.join('\n') : output;
  }

  async getCompiledFile(jobId) {
    const ex5File = path.join(this.COMPILED_DIR, `${jobId}.ex5`);
    const ex4File = path.join(this.COMPILED_DIR, `${jobId}.ex4`);
    
    if (await fs.pathExists(ex5File)) {
      return ex5File;
    } else if (await fs.pathExists(ex4File)) {
      return ex4File;
    }
    
    return null;
  }

  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mql4Path: this.MQL4_PATH,
      mql5Path: this.MQL5_PATH
    };
  }
}

module.exports = CompilationService; 