export interface GenerateTankaRequest {
  word: string;
  photoId: string;
}

export interface GenerateTankaResponse {
  tanka: string;
  source: 'claude' | 'fallback';
}

export async function requestTanka(request: GenerateTankaRequest): Promise<GenerateTankaResponse> {
  const word = request.word.trim();

  if (!word) {
    throw new Error('A word is required to generate a tanka.');
  }

  try {
    const response = await fetch('/api/tanka', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word
      })
    });

    if (!response.ok) {
      throw new Error('短歌の生成に失敗しました');
    }

    const data = await response.json();

    if (!data.tanka) {
      throw new Error('短歌が返ってきませんでした');
    }

    // Claudeが改行で返しても、既存のResultScreenで扱える形に統一
    const tanka = data.tanka
      .trim()
      .split(/\r?\n+/)
      .map((line: string) => line.trim())
      .filter(Boolean)
      .join('　');

    return {
      tanka,
      source: 'claude'
    };
  } catch (error) {
    console.error('Tanka generation error:', error);

    return {
      tanka: `${word}という　言葉からひらく　景色には　まだ名も知らない　光が残る`,
      source: 'fallback'
    };
  }
}
