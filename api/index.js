// Root API endpoint
module.exports = (req, res) => {
  res.status(200).json({
    message: 'API is running!',
    timestamp: new Date().toISOString(),
    endpoints: [
      {
        path: '/api',
        description: 'This endpoint (Root API)'
      },
      {
        path: '/api/hello',
        description: 'Hello world endpoint'
      }
    ]
  });
};
