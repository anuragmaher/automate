/**
 * Hello World API endpoint
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default function handler(req, res) {
  const { method } = req;

  try {
    // Handle different HTTP methods
    switch (method) {
      case 'GET':
        // Return a simple response
        return res.status(200).json({
          success: true,
          message: 'Hello World!',
          timestamp: new Date().toISOString(),
          method: method
        });
      
      default:
        // Method not allowed for other request types
        return res.status(405).json({ 
          success: false, 
          message: `Method ${method} Not Allowed` 
        });
    }
  } catch (error) {
    // Handle any errors
    console.error('API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error' 
    });
  }
}
