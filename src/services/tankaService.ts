import { loadTankasForPhoto } from './tankaStorage';

export interface GenerateTankaRequest {
  word: string;
  photoId: string;
}

export interface GenerateTankaResponse {
  tanka: string;
  source: 'claude' | 'fallback';
}

export async function requestTanka(
  request: GenerateTankaRequest,
  signal?: AbortSignal
): Promise<GenerateTankaResponse> {
  const word = request.word.trim();

  if (!word) {
    throw new Error('言葉を入力してください。');
  }

  const savedEntries = loadTankasForPhoto(request.photoId);

  // 同じ写真の過去の言葉を、新しい順に最大100語送る。
  // 重複した言葉や空の言葉は除く。
  const accumulatedWords = [
    ...new Set(
      [...savedEntries]
        .reverse()
        .map((entry) => entry.word.trim())
        .filter(Boolean)
    )
  ].slice(0, 100);

  const response = await fetch('/api/tanka', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      word,
      photoId: request.photoId,
      accumulatedWords
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`短歌を生成できませんでした（${response.status}）。少し待ってから、もう一度お試しください。`);
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== 'object' || !('tanka' in data) || typeof data.tanka !== 'string') {
    throw new Error('短歌を受け取れませんでした。もう一度お試しください。');
  }

  const tanka = data.tanka
    .trim()
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('　');

  if (!tanka) {
    throw new Error('短歌が空でした。もう一度お試しください。');
  }

  return {
    tanka,
    source: 'claude'
  };
}
