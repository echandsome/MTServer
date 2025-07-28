const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const constants = require('./config/contants');

const app = express();
const PORT = constants.PORT;

// Middleware
app.use(cors());
app.use(express.json({ limit: constants.MAX_FILE_SIZE }));

// Mount routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`MQL Compilation Server running on port ${PORT}`);
});