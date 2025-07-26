// Simple hello world API endpoint
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  });
};
