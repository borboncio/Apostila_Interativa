// src/db.ts
import * as SQLite from 'expo-sqlite';

export type ScanRecord = {
  id: number;
  qrData: string;
  createdAt: number; // timestamp (Date.now)
};

// Abre (ou cria) o banco de forma síncrona
const db = SQLite.openDatabaseSync('mathlens.db');

export function initDatabase() {
  try {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qrData TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );`
    );
  } catch (e) {
    console.warn('Erro ao criar tabela scans', e);
  }
}

// INSERT usando runSync com parâmetros nomeados ($qrData, $createdAt)
export function insertScan(qrData: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      db.runSync(
        'INSERT INTO scans (qrData, createdAt) VALUES ($qrData, $createdAt);',
        {
          $qrData: qrData,
          $createdAt: Date.now(),
        }
      );
      resolve();
    } catch (e) {
      console.warn('Erro ao inserir scan', e);
      reject(e);
    }
  });
}

// SELECT usando getAllSync tipado
export function getAllScans(): Promise<ScanRecord[]> {
  return new Promise((resolve, reject) => {
    try {
      const rows = db.getAllSync<ScanRecord>(
        'SELECT id, qrData, createdAt FROM scans ORDER BY createdAt DESC;',
        []
      );
      resolve(rows);
    } catch (e) {
      console.warn('Erro ao buscar scans', e);
      reject(e);
    }
  });
}
