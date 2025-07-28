const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Server configuration
const PORT = process.env.PORT || 3001;
const API_Key = process.env.API_Key || '';
const MAX_FILE_SIZE = '10mb';
const COMPILATION_TIMEOUT = 30000; // 30 seconds

// MetaTrader paths (adjust these for your MetaTrader installations)
const MQL4_PATH = 'C:\\Program Files\\MetaTrader\\';
const MQL5_PATH = 'C:\\Program Files\\MetaTrader 5\\';

// Directory paths
const TEMP_DIR = path.join(__dirname, 'assets', 'temp');
const COMPILED_DIR = path.join(__dirname, 'assets', 'compiled');

module.exports = {
    PORT,
    API_Key,
    MAX_FILE_SIZE,
    COMPILATION_TIMEOUT,
    MQL4_PATH,
    MQL5_PATH,
    TEMP_DIR,
    COMPILED_DIR
};