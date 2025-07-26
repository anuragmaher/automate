// Local development server using Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

// Hello world API endpoint
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- http://localhost:${PORT}/api`);
  console.log(`- http://localhost:${PORT}/api/hello`);
});
