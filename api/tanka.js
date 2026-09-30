export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { word, accumulatedWords = [] } = req.body || {};

    if (!word || !word.trim()) {
      return res.status(400).json({
        error: 'word is required'
      });
    }

    const accumulatedWordsText =
      Array.isArray(accumulatedWords) && accumulatedWords.length > 0 ? accumulatedWords.join('、') : 'まだありません';

    const prompt = `
【最重要】

出力するのは「一首のみ」です。

一首は必ず次の5句で構成してください。

第1句：5音
第2句：7音
第3句：5音
第4句：7音
第5句：7音

1行につき1句だけを書いてください。
1行の中に複数の句を入れないでください。
6行以上出力しないでください。
5行未満にもしてください。

各行は、それぞれ独立した5・7・5・7・7音の句として成立させてください。

長い文章を5行に分割するのは禁止です。
複数の短歌や候補を出力するのも禁止です。
`.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1200,

        thinking: {
          type: 'adaptive'
        },

        output_config: {
          effort: 'low'
        },

        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: 'Claude API error',
        anthropicStatus: response.status,
        message: data?.error?.message || 'Unknown Anthropic error',
        type: data?.error?.type || 'unknown',
        debug: data
      });
    }

    const text = Array.isArray(data?.content)
      ? data.content
          .filter((item) => item && item.type === 'text' && typeof item.text === 'string')
          .map((item) => item.text)
          .join('')
          .trim()
      : '';

    if (!text) {
      return res.status(500).json({
        error: 'No tanka returned',
        debug: data
      });
    }

    return res.status(200).json({
      tanka: text
    });
  } catch (error) {
    console.error('Server error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
