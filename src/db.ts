import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Play } from "./types";

const DB_NAME = "spotify-history-explorer";
const DB_VERSION = 1;
const STORE = "plays";

interface HistoryDB extends DBSchema {
  [STORE]: {
    key: number;
    value: Play & { id?: number };
    indexes: { ts: string };
  };
}

let dbPromise: Promise<IDBPDatabase<HistoryDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
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

export async function clearPlays() {
  const db = await getDB();
  await db.clear(STORE);
}

export async function addPlaysBulk(plays: Play[]) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.store;
  for (const p of plays) {
    await store.add(p);
  }
  await tx.done;
}

export async function getAllPlays(): Promise<(Play & { id?: number })[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function countPlays(): Promise<number> {
  const db = await getDB();
  return db.count(STORE);
}
