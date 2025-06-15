const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  try {
    // Initialize the Appwrite client with API key
    const client = new sdk.Client()
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject('6847aae80036323aa42a')
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    // Get the request data
    const requestData = JSON.parse(req.payload);
    const { action, userId, username, name, email, phone } = requestData;

    console.log('Received request:', requestData);

    // Route to appropriate function based on action
    let result;

    switch (action) {
      case 'checkUsername':
        if (!username) {
          result = {
            success: false,
            error: 'Username is required'
          };
          break;
        }

        // Remove @ symbol if present
        const cleanUsername = username.replace(/^@/, '');

        // Validate username format
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
          result = {
            success: false,
            error: 'Username must be between 3 and 20 characters'
          };
          break;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
          result = {
            success: false,
            error: 'Username can only contain letters, numbers, and underscores'
          };
          break;
        }

        // Check if username is already taken
        console.log('Checking username availability:', cleanUsername);
        const existingUsers = await databases.listDocuments(
          '684ed11000071b8df1d6', // Database ID
          '684ed196003dd068d0a0', // Collection ID
          [sdk.Query.equal('username', cleanUsername.toLowerCase())]
        );

        console.log('Existing users found:', existingUsers.documents.length);

        if (existingUsers.documents.length > 0) {
          result = {
            success: false,
            error: 'Username is already taken'
          };
        } else {
          result = {
            success: true,
            available: true,
            message: 'Username is available'
          };
        }
        break;

      case 'createUser':
        // Validate required fields
        if (!userId || !username || !name) {
          result = {
            success: false,
            error: 'Missing required fields: userId, username, name'
          };
          break;
        }

        // Remove @ symbol if present
        const cleanUsernameForCreate = username.replace(/^@/, '');

        // Validate username format
        if (cleanUsernameForCreate.length < 3 || cleanUsernameForCreate.length > 20) {
          result = {
            success: false,
            error: 'Username must be between 3 and 20 characters'
          };
          break;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsernameForCreate)) {
          result = {
            success: false,
            error: 'Username can only contain letters, numbers, and underscores'
          };
          break;
        }

        // Check if username is already taken
        console.log('Checking username availability:', cleanUsernameForCreate);
        const existingUsersForCreate = await databases.listDocuments(
          '684ed11000071b8df1d6', // Database ID
          '684ed196003dd068d0a0', // Collection ID
          [sdk.Query.equal('username', cleanUsernameForCreate.toLowerCase())]
        );

        console.log('Existing users found:', existingUsersForCreate.documents.length);

        if (existingUsersForCreate.documents.length > 0) {
          result = {
            success: false,
            error: 'Username is already taken'
          };
          break;
        }

        // Create the user document
        console.log('Creating user document...');
        const userDocument = await databases.createDocument(
          '684ed11000071b8df1d6', // Database ID
          '684ed196003dd068d0a0', // Collection ID
          sdk.ID.unique(),
          {
            userId: userId,
            username: cleanUsernameForCreate.toLowerCase(),
            name: name,
            email: email || null,
            phone: phone || null,
            createdAt: new Date().toISOString(),
          }
        );

        console.log('User document created successfully:', userDocument.$id);

        result = {
          success: true,
          user: userDocument,
          message: 'User profile created successfully'
        };
        break;

      default:
        result = {
          success: false,
          error: 'Invalid action specified',
          availableActions: ['checkUsername', 'createUser']
        };
    }

    // Return the result with appropriate status code
    const statusCode = result.success ? 200 : (result.error === 'Username is already taken' ? 409 : 400);
    res.json(result, statusCode);

  } catch (error) {
    console.error('Error in function:', error);
    res.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
}; 