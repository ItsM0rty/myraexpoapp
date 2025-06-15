# Myra Appwrite Cloud Functions

This directory contains all Cloud Functions for the Myra app.

## Structure

```
cloud-functions/
├── index.js                 # Main entry point - routes to different functions
├── package.json            # Dependencies and project info
├── README.md               # This file
├── functions/              # Function modules
│   ├── userManagement.js   # User-related functions
│   ├── postManagement.js   # Post-related functions (future)
│   ├── chatManagement.js   # Chat-related functions (future)
│   └── ...
└── utils/                  # Shared utilities (future)
    ├── database.js         # Database connection utilities
    ├── validation.js       # Validation helpers
    └── ...
```

## Available Functions

### User Management (`functions/userManagement.js`)

#### `checkUsername`
- **Action**: `checkUsername`
- **Purpose**: Check if a username is available
- **Parameters**: `{ username: string }`
- **Returns**: `{ success: boolean, available?: boolean, error?: string }`

#### `createUser`
- **Action**: `createUser`
- **Purpose**: Create a new user profile
- **Parameters**: `{ userId: string, username: string, name: string, email?: string, phone?: string }`
- **Returns**: `{ success: boolean, user?: object, error?: string }`

## Usage Examples

### Check Username Availability
```javascript
const response = await fetch('https://fra.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': '6847aae80036323aa42a',
  },
  body: JSON.stringify({
    action: 'checkUsername',
    username: 'john_doe'
  }),
});
```

### Create User
```javascript
const response = await fetch('https://fra.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': '6847aae80036323aa42a',
  },
  body: JSON.stringify({
    action: 'createUser',
    userId: 'user123',
    username: 'john_doe',
    name: 'John Doe',
    email: 'john@example.com'
  }),
});
```

## Adding New Functions

1. Create a new file in the `functions/` directory (e.g., `postManagement.js`)
2. Export your functions from the new file
3. Import the new module in `index.js`
4. Add a new case in the switch statement
5. Update this README with the new function documentation

## Environment Variables

- `APPWRITE_API_KEY`: Your Appwrite API key with necessary permissions

## Database IDs

- **Database ID**: `684ed11000071b8df1d6`
- **Users Collection ID**: `684ed196003dd068d0a0` 