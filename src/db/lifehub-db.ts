import { openDB } from "idb";
import type { LifeHubData } from "@/src/entities/types";

const DB_NAME = "lifehub-local";
const DB_VERSION = 1;
const STATE_KEY = "current";

async function database() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("state")) db.createObjectStore("state");
      if (!db.objectStoreNames.contains("backups")) db.createObjectStore("backups", { keyPath: "at" });
    },
  });
}

export async function loadLifeHubData(): Promise<LifeHubData | undefined> {
  const db = await database();
  return db.get("state", STATE_KEY);
}

export async function saveLifeHubData(data: LifeHubData): Promise<void> {
  const db = await database();
  await db.put("state", data, STATE_KEY);
}

export async function replaceLifeHubData(data: LifeHubData): Promise<void> {
  const db = await database();
  const tx = db.transaction(["state", "backups"], "readwrite");
  await tx.objectStore("backups").put({ at: new Date().toISOString(), data });
  await tx.objectStore("state").put(data, STATE_KEY);
  await tx.done;
}

export async function databaseReady(): Promise<boolean> {
  try {
    const db = await database();
    return db.objectStoreNames.contains("state");
  } catch {
    return false;
  }
}
