// lib/constants/appwrite.js
import { Client, Account, Databases, Functions } from 'appwrite';

export const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '6847aae80036323aa42a',
  databaseId: '685d11b00003bcc13d62',
  userCollectionId: '685d11bc002877dba8d5',
  functionId: 'createUsernameDocument', 
};

export const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);