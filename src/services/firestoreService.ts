import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/services/firebaseConfig';
import type { ItemDocument } from '@/types/item.types';

/**
 * Saves a new item document to `users/{userId}/items/{docId}` in Firestore.
 * A unique document ID is auto-generated; `createdAt` and `updatedAt` default
 * to `Timestamp.now()` if not already present in `itemData`.
 *
 * @param userId - The authenticated user's UID.
 * @param itemData - Item fields (excluding `id`; timestamps are set automatically).
 * @returns The saved `ItemDocument` including the Firestore-assigned `id`.
 * @throws {Error} Wraps any Firestore error with a descriptive message.
 */
export async function saveItem(
  userId: string,
  itemData: Omit<ItemDocument, 'id'>
): Promise<ItemDocument> {
  try {
    const itemsRef = collection(db, 'users', userId, 'items');
    const newDocRef = doc(itemsRef);
    const itemWithId: ItemDocument = {
      ...itemData,
      id: newDocRef.id,
      createdAt: itemData.createdAt ?? Timestamp.now(),
      updatedAt: itemData.updatedAt ?? Timestamp.now(),
    };

    await setDoc(newDocRef, itemWithId);

    return itemWithId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save item to Firestore: ${message}`);
  }
}

/**
 * Partially updates an existing item document in Firestore.
 * Always sets `updatedAt` to `Timestamp.now()` so the document reflects
 * the latest modification time.
 *
 * @param userId - The authenticated user's UID.
 * @param itemId - The Firestore document ID of the item to update.
 * @param updates - Partial item fields to merge into the document (excluding `id`).
 * @throws {Error} Wraps any Firestore error with a descriptive message.
 */
export async function updateItem(
  userId: string,
  itemId: string,
  updates: Partial<Omit<ItemDocument, 'id'>>
): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update item in Firestore: ${message}`);
  }
}

/**
 * Deletes an item document from `users/{userId}/items/{itemId}` in Firestore.
 *
 * @param userId - The authenticated user's UID.
 * @param itemId - The Firestore document ID of the item to delete.
 * @throws {Error} Wraps any Firestore error with a descriptive message.
 */
export async function deleteItem(userId: string, itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete item from Firestore: ${message}`);
  }
}

/**
 * Fetches all items for a user from Firestore, ordered by `createdAt` descending.
 * Firestore `Timestamp` fields (`createdAt`, `updatedAt`) are converted to ISO 8601
 * strings for consistent handling across the app.
 *
 * @param userId - The authenticated user's UID.
 * @returns An array of `ItemDocument` objects, newest first. Empty array if none exist.
 * @throws {Error} Wraps any Firestore error with a descriptive message.
 */
export async function fetchItems(userId: string): Promise<ItemDocument[]> {
  try {
    const itemsRef = collection(db, 'users', userId, 'items');
    const itemsQuery = query(itemsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(itemsQuery);
    return snapshot.docs.map((itemDoc) => {
      const data = itemDoc.data();
      return {
        ...data,
        id: itemDoc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    }) as ItemDocument[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch items from Firestore: ${message}`);
  }
}
