const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const constants = require('../config/contants');
const logger = require('../utils/logger');

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
    try {
      fs.ensureDirSync(this.TEMP_DIR);
      fs.ensureDirSync(this.COMPILED_DIR);
    } catch (error) {
      logger.error(`Failed to create directories: ${error.message}`);
      throw error;
    }
  }

  async compileCode(code, platform, jobId) {
    const fileExtension = platform === 'mql5' ? '.mq5' : '.mq4';
    const compiledExtension = platform === 'mql5' ? '.ex5' : '.ex4';
    
    logger.info(`Starting compilation: ${jobId} (${platform})`);
    
    // Create temporary source file
    const sourceFile = path.join(this.TEMP_DIR, `${jobId}${fileExtension}`);
    const compiledFile = path.join(this.COMPILED_DIR, `${jobId}${compiledExtension}`);
    const logFile = path.join(this.TEMP_DIR, `${jobId}.log`);
    
    try {
      // Write code to temporary file
      await fs.writeFile(sourceFile, code, 'utf8');
      
      // Determine compiler path
      const compilerPath = platform === 'mql5' 
        ? path.join(this.MQL5_PATH, 'metaeditor64.exe')
        : path.join(this.MQL4_PATH, 'metaeditor.exe');
      
      // Compile command with output path and log file
      const compileCommand = `"${compilerPath}" /compile:"${sourceFile}" /log:"${logFile}"`;

      try {
        // Execute compilation
        await execAsync(compileCommand, {
          timeout: this.COMPILATION_TIMEOUT,
          cwd: path.dirname(sourceFile)
        });
      } catch (err) {
        logger.warn(`Compilation command failed: ${jobId} - ${err.message}`);
      }

      const tempeComeplationFile = sourceFile.replace(fileExtension, compiledExtension);
     
      // Check if compilation was successful by looking for the output file
      const compilationSuccessful = await fs.pathExists(tempeComeplationFile);
      
      // Read compilation log if it exists
      let compilationLog = '';
      if (await fs.pathExists(logFile)) {
        try {
          // Try different encodings to handle MetaEditor's log file encoding
          const encodings = ['utf8', 'utf16le', 'latin1', 'cp1252'];
          
          for (const encoding of encodings) {
            try {
              compilationLog = await fs.readFile(logFile, encoding);
              break;
            } catch (encodingErr) {
              continue;
            }
          }
          
          // If all encodings fail, try with buffer and detect encoding
          if (!compilationLog) {
            const buffer = await fs.readFile(logFile);
            compilationLog = buffer.toString('utf8').replace(/\0/g, '');
          }
        } catch (logErr) {
          logger.warn(`Could not read log file: ${jobId} - ${logErr.message}`);
        }
      }
      
      if (compilationSuccessful) {
        await fs.move(tempeComeplationFile, compiledFile);
        // Clean the compilation log for successful compilation
        const cleanOutput = compilationLog ? this.parseCompilationErrors(compilationLog) : 'Compilation completed successfully';
        
        logger.info(`Compilation completed: ${jobId} -> ${jobId}${compiledExtension}`);
        
        return {
          success: true,
          compiledFile: `${jobId}${compiledExtension}`,
          outputPath: compiledFile,
          compilerOutput: cleanOutput
        };
      } else {
        // Parse and clean the compilation log for errors
        const errorMessage = this.parseCompilationErrors(compilationLog);
        
        logger.warn(`Compilation failed: ${jobId} - ${errorMessage}`);
        
        return {
          success: false,
          errors: errorMessage
        };
      }
      
    } finally {
      // Clean up temporary files
      await fs.remove(sourceFile).catch(() => {});
      await fs.remove(logFile).catch(() => {});
    }
  }

  parseCompilationErrors(output) {
    if (!output) return 'No compilation output received';
    
    // Clean up the output by removing null characters and fixing encoding issues
    let cleanOutput = output
      .replace(/\0/g, '') // Remove null characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
    
    // Extract meaningful error messages from MetaEditor output
    const lines = cleanOutput.split('\n');
    const errors = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && (trimmedLine.includes('error') || trimmedLine.includes('Error'))) {
        errors.push(trimmedLine);
      }
    }
    
    return errors.length > 0 ? errors.join('\n') : cleanOutput;
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