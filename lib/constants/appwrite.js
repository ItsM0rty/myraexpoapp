// appwrite.js
import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // your Appwrite endpoint
  .setProject('6847aae80036323aa42a');         // your Project ID

const account = new Account(client);
const databases = new Databases(client);

// Test the databases object
console.log('Databases object:', databases);
console.log('Databases methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(databases)));

export { client, account, databases };
