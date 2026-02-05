import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { REGION } from '../config/region';

export const analyzeItem = onCall({ region: REGION }, async (_request) => {
  // Placeholder - will be implemented in Epic 4
  throw new HttpsError('unimplemented', 'analyzeItem not yet implemented');
});
