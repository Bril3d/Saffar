import * as SQLite from 'expo-sqlite';

import { confirmPrescription } from '@/services/api';

export type OfflineAction = {
  payload: Record<string, unknown>;
  type: 'CONFIRM_ADMINISTRATION';
};

type QueueRow = {
  created_at: string;
  id: number;
  payload: string;
  type: OfflineAction['type'];
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('safar-offline.db');
  }

  const db = await dbPromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}

export async function enqueue(action: OfflineAction) {
  const db = await getDb();

  await db.runAsync(
    'INSERT INTO offline_queue (type, payload, created_at) VALUES (?, ?, ?)',
    action.type,
    JSON.stringify(action.payload),
    new Date().toISOString()
  );
}

export async function getQueueLength() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM offline_queue');

  return row?.count ?? 0;
}

export async function processQueue() {
  const db = await getDb();
  const rows = await db.getAllAsync<QueueRow>('SELECT * FROM offline_queue ORDER BY id ASC');

  for (const row of rows) {
    const payload = JSON.parse(row.payload) as { administeredAt: string; id: string; notes?: string };

    if (row.type === 'CONFIRM_ADMINISTRATION') {
      await confirmPrescription(payload.id, {
        administeredAt: payload.administeredAt,
        notes: payload.notes,
      });
    }

    await db.runAsync('DELETE FROM offline_queue WHERE id = ?', row.id);
  }

  return rows.length;
}
