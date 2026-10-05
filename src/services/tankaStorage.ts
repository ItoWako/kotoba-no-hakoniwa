export interface SavedTanka {
  id: string;
  photoId: string;
  word: string;
  tanka: string;
  createdAt: string;
}

const STORAGE_KEY = 'kotoba-no-hakoniwa:tankas:v1';

function isSavedTanka(value: unknown): value is SavedTanka {
  if (!value || typeof value !== 'object') return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.photoId === 'string' &&
    typeof entry.word === 'string' &&
    typeof entry.tanka === 'string' &&
    typeof entry.createdAt === 'string'
  );
}

export function loadTankas(): SavedTanka[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || !parsed.every(isSavedTanka)) {
    throw new Error('保存された短歌のデータを読み込めませんでした。');
  }

  return parsed;
}

export function saveTanka(entry: SavedTanka): void {
  const entries = loadTankas();

  if (entries.some((saved) => saved.id === entry.id)) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, entry]));
}

export function loadTankasForPhoto(photoId: string): SavedTanka[] {
  return loadTankas().filter((entry) => entry.photoId === photoId);
}
