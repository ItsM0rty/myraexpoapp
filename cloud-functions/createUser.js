const { Client, Databases, ID, Query } = require('node-appwrite');

module.exports = async (req, res) => {
  // Initialize the Appwrite client with API key
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6847aae80036323aa42a')
    .setKey(process.env.APPWRITE_API_KEY); // Use environment variable

  const databases = new Databases(client);

  try {
    // Get the request data
    const requestData = JSON.parse(req.payload);
    const { action, userId, username, name, email, phone } = requestData;

    console.log('Received request:', requestData);

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

      return res.json({
        success: true,
        available: true,
        message: 'Username is available'
      });
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

      // Check if username is already taken
      console.log('Checking username availability:', username);
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
    }

    return res.json({
      success: false,
      error: 'Invalid action specified'
    }, 400);

  } catch (error) {
    console.error('Error in function:', error);
    return res.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
}; 