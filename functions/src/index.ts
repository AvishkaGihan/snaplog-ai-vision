import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export callable functions
export { analyzeItem } from './callable/analyze-item';
export { exportInventoryCsv } from './callable/export-inventory-csv';
export { requestAccountDeletion } from './callable/request-account-deletion';
