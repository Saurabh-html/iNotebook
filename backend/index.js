require('dotenv').config({ path: './backend/.env' });

const connectToMongo = require('./db');
connectToMongo();

const cors = require('cors');
const express = require('express');

const app = express();

// ENV PORT
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Start server
app.listen(port, () => {
  console.log(`iNotebook backend running on port ${port}`);
});