// Replace your entire function with this minimal debug version first
module.exports = async (req, res) => {
  try {
    // Basic test - this should work
    console.log('Function started successfully');
    
    // Check environment variables
    console.log('Environment check:', {
      hasApiKey: !!process.env.APPWRITE_API_KEY,
      apiKeyLength: process.env.APPWRITE_API_KEY ? process.env.APPWRITE_API_KEY.length : 0,
      payloadType: typeof req.payload,
      payloadContent: req.payload
    });
    
    // Test basic response
    return res.json({
      success: true,
      message: 'Function is working',
      debug: {
        hasApiKey: !!process.env.APPWRITE_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in debug function:', error);
    return res.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, 500);
  }
};