// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const dummyData = require('./dummyData.json'); // Make sure this path is correct

app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// API to get the route data
app.get('/api/route', (req, res) => {
  res.json(dummyData);
});

app.get('/', (req, res) => { 
  res.sendFile(path.join(__dirname, '../public/index.html'));
 })

// API to get current location
let currentIndex = 0;
app.get('/api/current-location', (req, res) => {
  const data = dummyData[currentIndex];
  currentIndex = (currentIndex + 1) % dummyData.length;
  res.json(data);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
