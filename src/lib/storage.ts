import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readData<T>(key: string): T | null {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeData<T>(key: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
}
