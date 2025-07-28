# MQL Compilation Server

A Node.js server for compiling MQL4 and MQL5 code using MetaTrader's MetaEditor.

## Project Structure

The project follows a clean architecture pattern with separation of concerns:

```
src/
├── config/
│   └── contants.js          # Configuration constants
├── controllers/
│   └── CompilationController.js  # HTTP request handlers
├── services/
│   └── CompilationService.js     # Business logic (class-based)
├── routes/
│   ├── index.js             # Main router
│   └── compilation.js       # Compilation-specific routes
└── index.js                 # Application entry point
```

## Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic as classes
- **Routes**: Define API endpoints and map them to controllers
- **Config**: Centralized configuration management

## API Endpoints

### `POST /compile` - Compile MQL code
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Body:**
```json
{
  "code": "your MQL code here",
  "platform": "mql4" or "mql5",
  "jobId": "unique-job-identifier"
}
```

### `GET /download/:jobId` - Download compiled file
Download the compiled file using the job ID.

### `GET /health` - Health check
Check server status and configuration.

## Configuration

Edit `src/config/contants.js` to customize:
- Port number
- API key (set via environment variable `API_Key` or directly in the file)
- MetaTrader installation paths
- File size limits
- Compilation timeout

### Setting up API Key

You can set the API key in two ways:

1. **Environment Variable** (recommended):
   ```bash
   export API_Key=your-secret-api-key-here
   ```

2. **Direct in constants file**:
   ```javascript
   const API_Key = 'your-secret-api-key-here';
   ```

## Usage

```bash
npm install
npm start
```

The server will start on the configured port (default: 3001).