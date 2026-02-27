import { Timestamp } from "firebase/firestore";

export interface ItemDocument {
  id: string;
  title: string;
  category: string;
  color: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  tags: string[];
  notes: string;
  imageUrl: string;
  imagePath: string;
  aiGenerated: boolean;
  syncStatus: "synced" | "pending" | "error";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LocalDraft {
  localId: string;
  item: Partial<ItemDocument>;
  localImageUri: string;
  syncStatus: "pending" | "error";
  retryCount: number;
  createdAt: string;
}
