const { Client, Databases, ID, Query } = require('node-appwrite');

// Initialize the Appwrite client
const getClient = () => {
  return new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6847aae80036323aa42a')
    .setKey(process.env.APPWRITE_API_KEY);
};

const getDatabases = () => {
  return new Databases(getClient());
};

// Check username availability
const checkUsernameAvailability = async (username) => {
  const databases = getDatabases();
  
  if (!username) {
    return {
      success: false,
      error: 'Username is required'
    };
  }

  // Remove @ symbol if present for checking
  const cleanUsername = username.replace(/^@/, '');

  // Validate username format (after removing @)
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return {
      success: false,
      error: 'Username must be between 3 and 20 characters'
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return {
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Check if username is already taken (always check without @)
  console.log('Checking username availability:', cleanUsername);
  
  const existingUsers = await databases.listDocuments(
    '684ed11000071b8df1d6', // Database ID
    '684ed196003dd068d0a0', // Collection ID
    [Query.equal('username', cleanUsername.toLowerCase())]
  );

  console.log('Existing users found:', existingUsers.documents.length);

  if (existingUsers.documents.length > 0) {
    return {
      success: false,
      error: 'Username is already taken'
    };
  }

  return {
    success: true,
    available: true,
    message: 'Username is available'
  };
};

// Create user document
const createUser = async (userData) => {
  const databases = getDatabases();
  const { userId, username, name, email, phone } = userData;

  // Remove @ symbol if present
  const cleanUsername = username.replace(/^@/, '');

  // Validate required fields
  if (!userId || !cleanUsername || !name) {
    return {
      success: false,
      error: 'Missing required fields: userId, username, name'
    };
  }

  // Validate username format
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return {
      success: false,
      error: 'Username must be between 3 and 20 characters'
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return {
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Check if username is already taken
  console.log('Checking username availability:', cleanUsername);
  const existingUsers = await databases.listDocuments(
    '684ed11000071b8df1d6', // Database ID
    '684ed196003dd068d0a0', // Collection ID
    [Query.equal('username', cleanUsername.toLowerCase())]
  );

  console.log('Existing users found:', existingUsers.documents.length);

  if (existingUsers.documents.length > 0) {
    return {
      success: false,
      error: 'Username is already taken'
    };
  }

  // Create the user document
  console.log('Creating user document...');
  const userDocument = await databases.createDocument(
    '684ed11000071b8df1d6', // Database ID
    '684ed196003dd068d0a0', // Collection ID
    ID.unique(),
    {
      userId: userId,
      username: cleanUsername.toLowerCase(),
      name: name,
      email: email || null,
      phone: phone || null,
      createdAt: new Date().toISOString(),
    }
  );

  console.log('User document created successfully:', userDocument.$id);

  return {
    success: true,
    user: userDocument,
    message: 'User profile created successfully'
  };
};

module.exports = {
  checkUsernameAvailability,
  createUser
}; 