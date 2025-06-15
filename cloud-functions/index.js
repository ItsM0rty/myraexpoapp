const { Client, Databases, ID, Query } = require('node-appwrite');

// Import function modules
const userManagement = require('./functions/userManagement');

module.exports = async (req, res) => {
  try {
    // Get the request data
    const requestData = JSON.parse(req.payload);
    const { action, function: functionName, ...params } = requestData;

    console.log('Received request:', requestData);

    // Route to appropriate function based on action or function name
    let result;

    switch (action || functionName) {
      case 'checkUsername':
        result = await userManagement.checkUsernameAvailability(params.username);
        break;

      case 'createUser':
        result = await userManagement.createUser(params);
        break;

      // Add more cases for future functions
      // case 'updateUser':
      //   result = await userManagement.updateUser(params);
      //   break;

      // case 'deleteUser':
      //   result = await userManagement.deleteUser(params);
      //   break;

      // case 'getUserProfile':
      //   result = await userManagement.getUserProfile(params);
      //   break;

      default:
        return res.json({
          success: false,
          error: 'Invalid action or function specified',
          availableActions: ['checkUsername', 'createUser']
        }, 400);
    }

    // Return the result with appropriate status code
    const statusCode = result.success ? 200 : (result.error === 'Username is already taken' ? 409 : 400);
    return res.json(result, statusCode);

  } catch (error) {
    console.error('Error in function:', error);
    return res.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
}; 