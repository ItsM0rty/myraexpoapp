// appwrite.js
import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // your Appwrite endpoint
  .setProject('6847aae80036323aa42a');         // your Project ID

const account = new Account(client);

export { client, account };
