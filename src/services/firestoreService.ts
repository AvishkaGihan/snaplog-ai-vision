import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

import { db } from "@/services/firebaseConfig";
import type { ItemDocument } from "@/types/item.types";

export async function saveItem(
  userId: string,
  itemData: Omit<ItemDocument, "id">,
): Promise<ItemDocument> {
  try {
    const itemsRef = collection(db, "users", userId, "items");
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
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save item to Firestore: ${message}`);
  }
}
