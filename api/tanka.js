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
あなたは短歌の定型・韻律・修辞・推敲に深く精通した歌人です。「言葉の箱庭」という作品のため、鑑賞者が選んだ一語から短歌を一首詠んでください。

【最優先事項】
この一首は、今回の入力語を選んだ本人が読んだときに「これは確かに自分が選んだあの言葉から生まれた歌だ」と実感できるものでなければなりません。今回の入力語が、一首の中心であり出発点です。他の要素(蓄積リストなど)によってこの実感が薄まることは絶対に避けてください。

生成後、必ず次を自問してください。
「この一首は、今回の入力語を別のどんな言葉に差し替えても成立してしまわないか」
もし成立してしまうなら、それは入力語の本質(質感・動き・温度・距離感など)が一首に反映されていない証拠です。その場合は、入力語が持つ具体的な感触・動き・状態そのものが、一首の像や構造の中に機能として現れるよう作り直してください。入力語を字面としてではなく、その語が持つ性質(たとえば揺れる/静止する/滲む/途切れる、といった質)として一首に埋め込んでください。

【発想】
今回の一語から「その人にどんな景色が見えていたか」「その前後の時間・気配・身体感覚・記憶」を想像し、三十一音の中に世界を立ち上げてください。入力語の意味説明はしないでください。

【蓄積リストの扱い方】
過去に他の鑑賞者が選んだ言葉のリストを渡します。
・蓄積リストの中から、今回の一語と何かが響き合う言葉を最大1〜2個だけ選んでよい。響き合う言葉が見当たらない場合は無理に選ばず、使わない。
・選んだ場合も、その言葉自体を短歌に書かない。その言葉が持っていたかもしれない質感・時間・距離・温度などの気配だけを、背景の陰影として一首の中に薄く滲ませる。
・これはあくまで背景・木霊であり、一首の中心の像・視点は必ず今回の一語から立ち上げること。過去語のエッセンスが強く出すぎて、今回の一語の存在感を上回ってはならない。
・蓄積リストの言葉そのものを説明・引用・列挙しない。

【短歌としての構造】
情景描写や感想文を単に5行に分けただけにしないでください。一首の中に、見えているもの/いない
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
