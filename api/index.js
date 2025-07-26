// Root API endpoint using CommonJS format
module.exports = (req, res) => {
  // Using the standard Express-like response object
  res.status(200).json({
    message: 'API is running12!',
    timestamp: new Date().toISOString(),
    note: 'This is the root API endpoint (/api)'
  });
};
