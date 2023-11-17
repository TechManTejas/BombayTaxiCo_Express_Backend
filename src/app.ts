const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const cors = require("cors")

import authRoutes from './routes/authRoutes';

const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

const PORT = 8080;

// Connect to MongoDB
mongoose.connect(`mongodb+srv://techmantejas:kWGzXjvq5ysUNerR@cluster0.p4uzy4h.mongodb.net/btc`);

app.use('/auth', authRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
