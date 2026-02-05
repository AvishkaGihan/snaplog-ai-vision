import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { REGION } from '../config/region';

export const requestAccountDeletion = onCall({ region: REGION }, async (_request) => {
  // Placeholder - will be implemented in Epic 1
  throw new HttpsError('unimplemented', 'requestAccountDeletion not yet implemented');
});
