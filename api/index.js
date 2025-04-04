// Serverless API route for Vercel
module.exports = (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Example API endpoint
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle other requests
  res.status(404).json({ error: 'Not found' });
};
