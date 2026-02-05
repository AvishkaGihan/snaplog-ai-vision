import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { REGION } from '../config/region';

export const exportInventoryCsv = onCall({ region: REGION }, async (_request) => {
  // Placeholder - will be implemented in Epic 6
  throw new HttpsError('unimplemented', 'exportInventoryCsv not yet implemented');
});
