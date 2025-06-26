const { Client, Databases, Permission } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Use Backend Service Key

  const databases = new Databases(client);

  try {
    const payload = JSON.parse(req.payload);
    const { userId, username, email } = payload;

    const cleanUsername = username.replace(/^@/, '').toLowerCase();
    const documentId = require('appwrite').ID.unique();

    const document = await databases.createDocument(
      '685d11b00003bcc13d62',
      '685d11bc002877dba8d5',
      documentId,
      {
        username: cleanUsername,
        name: cleanUsername,
        email: email,
        userId: userId,
        phone: null,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read('any'), // Public read access
        Permission.update(`user:${userId}`), // User-specific update
        Permission.delete(`user:${userId}`), // User-specific delete
      ]
    );

    res.json({ success: true, documentId: document.$id });
  } catch (error) {
    res.json({ success: false, error: error.message }, error.code || 500);
  }
};