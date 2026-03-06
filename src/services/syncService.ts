import { MAX_AI_RETRIES, RETRY_BASE_DELAY_MS } from '@/constants/config';
import { saveItem } from '@/services/firestoreService';
import { cleanupTempImage } from '@/services/imageService';
import { uploadItemImage } from '@/services/storageService';
import { useItemStore } from '@/stores/useItemStore';
import type { ItemDocument, LocalDraft } from '@/types/item.types';

export type SyncProgressStatus = 'idle' | 'syncing' | 'complete';

export interface SyncProgressUpdate {
  total: number;
  completed: number;
  status: SyncProgressStatus;
}

let isSyncing = false;
let syncProgressListener: ((update: SyncProgressUpdate) => void) | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notifyProgress(update: SyncProgressUpdate): void {
  syncProgressListener?.(update);
}

function resolveCondition(
  value: ItemDocument['condition'] | string | undefined
): ItemDocument['condition'] {
  if (value === 'Excellent' || value === 'Good' || value === 'Fair' || value === 'Poor') {
    return value;
  }

  return 'Good';
}

function buildItemPayload(
  draft: LocalDraft,
  downloadUrl: string,
  storagePath: string
): Omit<ItemDocument, 'id'> {
  return {
    title: draft.item.title ?? '',
    category: draft.item.category ?? '',
    color: draft.item.color ?? '',
    condition: resolveCondition(draft.item.condition),
    tags: Array.isArray(draft.item.tags) ? draft.item.tags : [],
    notes: draft.item.notes ?? '',
    imageUrl: downloadUrl,
    imagePath: storagePath,
    aiGenerated: draft.item.aiGenerated ?? false,
    syncStatus: 'synced',
    createdAt: draft.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Registers a callback that receives progress updates while `syncAllDrafts` runs.
 * Pass `null` to remove the listener.
 *
 * @param listener - Callback invoked with `{ total, completed, status }` on each
 *   state transition, or `null` to unsubscribe.
 */
export function setSyncProgressListener(
  listener: ((update: SyncProgressUpdate) => void) | null
): void {
  syncProgressListener = listener;
}

/**
 * Syncs a single offline draft to Firebase.
 *
 * **Steps performed (in order)**:
 * 1. Upload the draft's local image URI to Cloud Storage → receive `downloadUrl` + `storagePath`.
 * 2. Build the full `ItemDocument` payload using the draft's AI-extracted fields.
 * 3. Save the document to Firestore via `saveItem`.
 * 4. Remove the draft from the local store and add the saved item.
 * 5. Delete the temporary local image file (best-effort, non-fatal).
 *
 * @param draft - The `LocalDraft` to sync (must have `syncStatus: "pending"`).
 * @param userId - The authenticated user's UID.
 * @throws {Error} If the image upload or Firestore save fails.
 */
export async function syncSingleDraft(draft: LocalDraft, userId: string): Promise<void> {
  const { downloadUrl, storagePath } = await uploadItemImage(draft.localImageUri, userId);

  const itemData = buildItemPayload(draft, downloadUrl, storagePath);
  const savedItem = await saveItem(userId, itemData);

  useItemStore.getState().removeDraft(draft.localId);
  useItemStore.getState().addItem(savedItem);

  void cleanupTempImage(draft.localImageUri);
}

/**
 * Iterates over all pending drafts for `userId` and syncs them one by one,
 * retrying each draft up to `MAX_AI_RETRIES` times with exponential backoff
 * on failure before marking it as `"error"`.
 *
 * Progress updates are dispatched via `setSyncProgressListener` and the
 * Zustand item store's `setSyncProgress`. After all drafts are processed,
 * the sync progress banner is reset to idle after a 2-second display delay.
 *
 * Guards against concurrent runs: if a sync is already in progress for any
 * user, subsequent calls return immediately.
 *
 * @param userId - The authenticated user's UID used to filter pending drafts.
 */
export async function syncAllDrafts(userId: string): Promise<void> {
  if (isSyncing) {
    return;
  }

  isSyncing = true;

  try {
    const { drafts } = useItemStore.getState();
    const initialPending = drafts.filter(
      (draft) => draft.syncStatus === 'pending' && draft.userId === userId
    );

    if (initialPending.length === 0) {
      return;
    }

    useItemStore.getState().setSyncProgress({
      isSyncing: true,
      syncTotal: initialPending.length,
      syncCompleted: 0,
      syncComplete: false,
    });
    notifyProgress({
      total: initialPending.length,
      completed: 0,
      status: 'syncing',
    });

    let completed = 0;

    while (true) {
      const currentDrafts = useItemStore
        .getState()
        .drafts.filter((draft) => draft.syncStatus === 'pending' && draft.userId === userId);

      if (currentDrafts.length === 0) {
        break;
      }

      const draft = currentDrafts[0];
      let retryCount = draft.retryCount;
      const currentTotal = useItemStore.getState().syncTotal;
      const newTotal = Math.max(currentTotal, completed + currentDrafts.length);

      for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt += 1) {
        try {
          await syncSingleDraft(draft, userId);
          completed += 1;

          useItemStore.getState().setSyncProgress({
            isSyncing: true,
            syncTotal: newTotal,
            syncCompleted: completed,
            syncComplete: false,
          });
          notifyProgress({
            total: newTotal,
            completed,
            status: 'syncing',
          });
          break;
        } catch {
          retryCount += 1;

          if (attempt < MAX_AI_RETRIES) {
            useItemStore.getState().updateDraftStatus(draft.localId, 'pending', retryCount);
            await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
            continue;
          }

          useItemStore.getState().updateDraftStatus(draft.localId, 'error', retryCount);
        }
      }
    }

    const finalTotal = useItemStore.getState().syncTotal;

    useItemStore.getState().setSyncProgress({
      isSyncing: false,
      syncTotal: finalTotal,
      syncCompleted: completed,
      syncComplete: completed > 0,
    });

    if (completed > 0) {
      notifyProgress({
        total: finalTotal,
        completed,
        status: 'complete',
      });

      setTimeout(() => {
        useItemStore.getState().setSyncProgress({
          isSyncing: false,
          syncTotal: 0,
          syncCompleted: 0,
          syncComplete: false,
        });
        notifyProgress({ total: 0, completed: 0, status: 'idle' });
      }, 2000);
    } else {
      notifyProgress({
        total: finalTotal,
        completed,
        status: 'idle',
      });
    }
  } finally {
    isSyncing = false;
  }
}
