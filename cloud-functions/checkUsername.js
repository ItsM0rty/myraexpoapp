const { Client, Databases, Query } = require('node-appwrite');

module.exports = async (req, res) => {
  try {
    // Initialize the Appwrite client with API key
    const client = new Client()
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject('6847aae80036323aa42a')
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Handle different payload formats
    let requestData;
    try {
      if (typeof req.payload === 'string') {
        requestData = JSON.parse(req.payload);
      } else {
        requestData = req.payload;
      }
    } catch (parseError) {
      console.error('Failed to parse payload:', parseError);
      return res.json({
        success: false,
        error: 'Invalid JSON payload'
      }, 400);
    }

    const { username } = requestData;

    console.log('Checking username availability:', username);

    // Validate username format
    if (!username || username.length < 3 || username.length > 20) {
      return res.json({
        success: false,
        error: 'Username must be between 3 and 20 characters'
      }, 400);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({
        success: false,
        error: 'Username can only contain letters, numbers, and underscores'
      }, 400);
    }

    // Check if username is already taken
    const existingUsers = await databases.listDocuments(
      '684ed11000071b8df1d6', // Database ID
      '684ed196003dd068d0a0', // Collection ID
      [Query.equal('username', username.toLowerCase())]
    );

    console.log('Existing users found:', existingUsers.documents.length);

    if (existingUsers.documents.length > 0) {
      return res.json({
        success: false,
        available: false,
        error: 'Username is already taken'
      }, 409);
    }

    return res.json({
      success: true,
      available: true,
      message: 'Username is available'
    });

  } catch (error) {
    console.error('Error checking username:', error);
    return res.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
};