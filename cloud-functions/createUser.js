// Add this at the very beginning of your function for debugging
console.log('Environment check:', {
  hasApiKey: !!process.env.APPWRITE_API_KEY,
  payloadType: typeof req.payload,
  payload: req.payload
});




const { Client, Databases, ID, Query } = require('node-appwrite');

module.exports = async (req, res) => {
  console.log('Function started');
  
  try {
    // Check if API key exists
    if (!process.env.APPWRITE_API_KEY) {
      console.error('APPWRITE_API_KEY environment variable is not set');
      return res.json({
        success: false,
        error: 'Server configuration error'
      }, 500);
    }

    // Initialize the Appwrite client with API key
    const client = new Client()
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject('6847aae80036323aa42a')
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Parse request data with better error handling
    let requestData;
    try {
      if (typeof req.payload === 'string') {
        requestData = JSON.parse(req.payload);
      } else {
        requestData = req.payload || {};
      }
    } catch (parseError) {
      console.error('Failed to parse request payload:', parseError);
      return res.json({
        success: false,
        error: 'Invalid request format'
      }, 400);
    }

    const { action, userId, username, name, email, phone } = requestData;
    console.log('Received request:', { action, userId, username: username ? 'provided' : 'missing' });

    // Handle username checking
    if (action === 'checkUsername') {
      if (!username) {
        return res.json({
          success: false,
          error: 'Username is required'
        }, 400);
      }

      // Validate username format
      if (username.length < 3 || username.length > 20) {
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
      console.log('Checking username availability:', username);
      try {
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
          }, 200); // Return 200 for proper handling
        }

        return res.json({
          success: true,
          available: true,
          message: 'Username is available'
        });
      } catch (dbError) {
        console.error('Database error during username check:', dbError);
        return res.json({
          success: false,
          error: 'Database connection error'
        }, 500);
      }
    }

    // Handle user creation
    if (action === 'createUser' || !action) {
      // Validate required fields
      if (!userId || !username || !name) {
        return res.json({
          success: false,
          error: 'Missing required fields: userId, username, name'
        }, 400);
      }

      // Validate username format
      if (username.length < 3 || username.length > 20) {
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

      try {
        // Check if username is already taken
        console.log('Checking username availability before creation:', username);
        const existingUsers = await databases.listDocuments(
          '684ed11000071b8df1d6', // Database ID
          '684ed196003dd068d0a0', // Collection ID
          [Query.equal('username', username.toLowerCase())]
        );

        console.log('Existing users found:', existingUsers.documents.length);

        if (existingUsers.documents.length > 0) {
          return res.json({
            success: false,
            error: 'Username is already taken'
          }, 409);
        }

        // Create the user document
        console.log('Creating user document...');
        const userDocument = await databases.createDocument(
          '684ed11000071b8df1d6', // Database ID
          '684ed196003dd068d0a0', // Collection ID
          ID.unique(),
          {
            userId: userId,
            username: username.toLowerCase(),
            name: name,
            email: email || null,
            phone: phone || null,
            createdAt: new Date().toISOString(),
          }
        );

        console.log('User document created successfully:', userDocument.$id);

        return res.json({
          success: true,
          user: userDocument,
          message: 'User profile created successfully'
        });
      } catch (dbError) {
        console.error('Database error during user creation:', dbError);
        return res.json({
          success: false,
          error: 'Failed to create user profile'
        }, 500);
      }
    }

    return res.json({
      success: false,
      error: 'Invalid action specified'
    }, 400);

  } catch (error) {
    console.error('Unexpected error in function:', error);
    return res.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
};