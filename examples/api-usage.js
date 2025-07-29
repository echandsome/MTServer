// Example usage of the MQL Compilation API

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';
const API_KEY = 'your-api-key-here'; // Replace with your actual API key

// Example MQL4 code
const mql4Code = `
//+------------------------------------------------------------------+
//| Simple Moving Average Expert Advisor
//+------------------------------------------------------------------+
#property copyright "Your Name"
#property link      "https://www.yourwebsite.com"
#property version   "1.00"
#property strict

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
}

//+------------------------------------------------------------------+
//| Expert tick function                                           |
//+------------------------------------------------------------------+
void OnTick()
{
   // Your trading logic here
}
`;

async function compileMQLCode() {
  try {
    const response = await axios.post(`${API_BASE_URL}/compile`, {
      code: mql4Code,
      platform: 'mql4',
      jobId: 'example-job-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    console.log('Compilation result:', response.data);
    
    if (response.data.success) {
      console.log('Compilation successful!');
      console.log('Compiled file:', response.data.compiledFile);
    } else {
      console.log('Compilation failed:', response.data.errors);
    }
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('Server health:', response.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Run examples
async function runExamples() {
  console.log('Checking server health...');
  await checkHealth();
  
  console.log('\nCompiling MQL code...');
  await compileMQLCode();
}

// Uncomment to run examples
// runExamples();

module.exports = {
  compileMQLCode,
  checkHealth
}; 