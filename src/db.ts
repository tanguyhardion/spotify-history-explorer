import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Play, StoredPlay } from "./types";

const DB_NAME = "spotify-history-explorer";
const DB_VERSION = 1;
const STORE_NAME = "plays";

interface HistoryDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: StoredPlay;
    indexes: { ts: string };
  };
}

let dbPromise: Promise<IDBPDatabase<HistoryDB>> | null = null;

/**
 * Gets or creates the database connection
 */
function getDB(): Promise<IDBPDatabase<HistoryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("ts", "ts");
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Clears all plays from the database
 */
export async function clearPlays(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("Failed to clear plays:", error);
    throw new Error("Failed to clear existing data");
  }
}

/**
 * Adds multiple plays to the database in a single transaction
 */
export async function addPlaysBulk(plays: Play[]): Promise<void> {
  if (plays.length === 0) return;

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;
    
    const promises = plays.map(play => store.add(play));
    await Promise.all(promises);
    await tx.done;
  } catch (error) {
    console.error("Failed to add plays:", error);
    throw new Error("Failed to save data to database");
  }
}

/**
 * Retrieves all plays from the database
 */
export async function getAllPlays(): Promise<StoredPlay[]> {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error("Failed to get plays:", error);
    throw new Error("Failed to load data from database");
  }
}

/**
 * Gets the total count of plays in the database
 */
export async function countPlays(): Promise<number> {
  try {
    const db = await getDB();
    return await db.count(STORE_NAME);
  } catch (error) {
    console.error("Failed to count plays:", error);
    throw new Error("Failed to get data count");
  }
}

/**
 * Checks if the database has any data
 */
export async function hasData(): Promise<boolean> {
  try {
    const count = await countPlays();
    return count > 0;
  } catch {
    return false;
  }
}
