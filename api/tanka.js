const TARGET_MORAS = [5, 7, 5, 7, 7];
const MAX_ATTEMPTS = 3;
const TOTAL_TIMEOUT_MS = 85000;

// 読みをひらがなに統一する。
function normalizeReading(value) {
  if (typeof value !== 'string') return '';

  return value
    .normalize('NFKC')
    .replace(/[\u30A1-\u30F6]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60))
    .replace(/\s+/g, '');
}

// 拗音の小さい「ゃ・ゅ・ょ」は直前の音に含める。
// 「っ」「ん」「ー」はそれぞれ1音として数える。
// 小さい母音も直前の音に含める。
function countMoras(reading) {
  const normalized = normalizeReading(reading);

  if (!normalized || !/^[ぁ-ゖー]+$/.test(normalized)) {
    throw new Error('読みは、かなだけで返してください。');
  }

  const smallKana = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ']);
  let count = 0;
  let previousCharacter = '';

  for (const character of normalized) {
    if (smallKana.has(character)) {
      if (!previousCharacter || smallKana.has(previousCharacter) || ['っ', 'ん', 'ー'].includes(previousCharacter)) {
        throw new Error('読みの小さいかなの使い方を確認してください。');
      }
    } else {
      if (character === 'ー' && !previousCharacter) {
        throw new Error('読みの先頭に長音符は使えません。');
      }

      count += 1;
    }

    previousCharacter = character;
  }

  return count;
}

function parseCandidate(text) {
  // JSONをコードブロックで返した場合にも対応する。
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const data = JSON.parse(cleaned);

  if (!data || typeof data !== 'object' || !Array.isArray(data.lines) || data.lines.length !== 5) {
    throw new Error('lines配列に5句を返してください。');
  }

  const lines = data.lines.map((line, index) => {
    if (!line || typeof line.text !== 'string' || typeof line.reading !== 'string') {
      throw new Error(`第${index + 1}句にtextとreadingが必要です。`);
    }

    const text = line.text.trim();

    if (!text || /[\r\n]/.test(text)) {
      throw new Error(`第${index + 1}句の本文を1句だけ返してください。`);
    }

    const reading = normalizeReading(line.reading);

    // かなだけの句なら、本文と読みが一致するかも確認する。
    const kanaText = normalizeReading(text);

    if (/^[ぁ-ゖー]+$/.test(kanaText)) {
      // 助詞「は・へ」の発音表記の違いを許容する。
      const pronunciationKey = (value) => value.replace(/は/g, 'わ').replace(/へ/g, 'え');

      if (pronunciationKey(kanaText) !== pronunciationKey(reading)) {
        throw new Error(`第${index + 1}句の本文と読みが一致していません。`);
      }
    }

    const moras = countMoras(reading);

    return {
      text,
      reading,
      moras,
      difference: moras - TARGET_MORAS[index]
    };
  });

  return {
    lines,
    exact: lines.every((line) => line.difference === 0),
    acceptable: lines.every((line) => Math.abs(line.difference) <= 1),
    score: lines.reduce((sum, line) => sum + Math.abs(line.difference), 0)
  };
}

function describeCandidate(candidate) {
  return candidate.lines
    .map(
      (line, index) =>
        `第${index + 1}句「${line.text}」／読み「${line.reading}」／` + `${line.moras}音／目標${TARGET_MORAS[index]}音`
    )
    .join('\n');
}

async function callClaude(messages, signal) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      thinking: {
        type: 'adaptive'
      },
      output_config: {
        effort: 'high'
      },
      messages
    }),
    signal
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Claude API error:', data?.error);

    throw new Error('AIとの通信に失敗しました。');
  }

  if (data.stop_reason === 'max_tokens') {
    throw new Error('AIの出力が途中で終了しました。');
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .filter((item) => item && item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('')
        .trim()
    : '';

  if (!text) {
    throw new Error('短歌を受け取れませんでした。');
  }

  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const controller = new AbortController();
  let timeoutTimer;

  try {
    const { word, accumulatedWords = [] } = req.body || {};

    if (typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({
        error: 'word is required'
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is missing');

      return res.status(500).json({
        error: '短歌の生成設定を確認してください。'
      });
    }

    const accumulatedWordsText =
      Array.isArray(accumulatedWords) && accumulatedWords.length > 0
        ? accumulatedWords
            .filter((value) => typeof value === 'string')
            .slice(0, 100)
            .join('、') || 'まだありません'
        : 'まだありません';

    const prompt = `
あなたは短歌の定型・韻律・修辞・推敲に深く精通した歌人です。「言葉の箱庭」という作品のため、鑑賞者が選んだ一語から短歌を一首詠んでください。

【最優先事項】
この一首は、今回の入力語を選んだ本人が読んだときに「これは確かに自分が選んだあの言葉から生まれた歌だ」と実感できるものでなければなりません。今回の入力語が、一首の中心であり出発点です。他の要素(蓄積リストなど)によってこの実感が薄まることは絶対に避けてください。

生成後、必ず次を自問してください。
「この一首は、今回の入力語を別のどんな言葉に差し替えても成立してしまわないか」
もし成立してしまうなら、それは入力語の本質(質感・動き・温度・距離感など)が一首に反映されていない証拠です。その場合は、入力語が持つ具体的な感触・動き・状態そのものが、一首の像や構造の中に機能として現れるよう作り直してください。入力語を字面としてではなく、その語が持つ性質(たとえば揺れる/静止する/滲む/途切れる、といった質)として一首に埋め込んでください。

【発想】
今回の一語から「その人にどんな景色が見えていたか」「その前後の時間・気配・身体感覚・記憶」を想像し、三十一音の中に世界を立ち上げてください。入力語の意味説明はしないでください。

【題材の多様性】
抽象的な入力語(喪失・懐かしさ・疲れ、など)に対して、最初に思い浮かぶ最も典型的な場面(例:玄関、靴、鍵、通夜、別れ際など)に安易に頼らないでください。
身体の部位、道具、台所、乗り物、天候、音、手仕事、動物、植物、職場、店先など、できるだけ幅広い場面の中から、その入力語の質感に本当に合う一つを選んでください。
一般的によく連想される「定番の場面」を選んだ場合でも、そこにありがちな細部(靴紐、鍵穴、写真立て、など)をそのまま使わず、視点や角度を変えてください。

【蓄積リストの扱い方】
過去に他の鑑賞者が選んだ言葉のリストを渡します。
・蓄積リストの中から、今回の一語と何かが響き合う言葉を最大1〜2個だけ選んでよい。響き合う言葉が見当たらない場合は無理に選ばず、使わない。
・選んだ場合も、その言葉自体を短歌に書かない。その言葉が持っていたかもしれない質感・時間・距離・温度などの気配だけを、背景の陰影として一首の中に薄く滲ませる。
・これはあくまで背景・木霊であり、一首の中心の像・視点は必ず今回の一語から立ち上げること。過去語のエッセンスが強く出すぎて、今回の一語の存在感を上回ってはならない。
・蓄積リストの言葉そのものを説明・引用・列挙しない。

【短歌としての構造】
情景描写や感想文を単に5行に分けただけにしないでください。一首の中に、見えているもの/いないもの、現在/過去、近い/遠い、静止/動き、身体感覚/外景、などから少なくとも二つの像・時間・距離の関係を作り(例を機械的に使わない)、上句から下句へ景色の意味がわずかに変化する構造にしてください。下句は上句の説明・感想にせず、五七五だけで意味を完結させないでください。

【技法】
必要に応じて、見立て、取り合わせ、体言止め、句またがりなどの技法を使って構いません。技法のための技法にせず、一首の必然性がある場合のみ使ってください。

【密度】
複数の曖昧な具体を並べるより、一つの鮮明で動きのある具体(動詞を効かせた一瞬の動作・変化)を選んでください。説明的な形容詞・副詞を減らし、名詞と動詞の質で像を立ち上げてください。

【具体性と飛躍】
物・場所・音・温度・手触り・動き・距離など知覚できる像を一つ以上入れてください。「見たもの→感想」「出来事→説明」という直線的構造は避け、二つの像の取り合わせや視点の転換で余白と飛躍を作ってください。

【感情】
「悲しい」「嬉しい」「寂しい」「不安」「希望」など感情語を直接使わず、物の状態・距離・動作・温度・音・欠落などで感じさせてください。

【結句について・特に重要】
結句を、次のいずれの形でも閉じないでください。

・感想(「〜と思う」「〜と感じる」)
・断定的な説明(「それが〜だ」「だから〜」)
・意志形・呼びかけ・提案(「〜しよう」「〜したい」「〜してみる」など、読み手や自分自身への呼びかけになるもの)
・スローガンめいた前向きな締めくくり(「頑張ろう」「進んでいこう」に類する響きを持つもの全般)

結句は、像・時間・気配のいずれかが宙に浮いたまま終わるようにし、答えや行動指針を示さないでください。

【言葉遣い・クリシェの回避】
現代日本語として自然な言葉を使い、古語・美辞麗句・難解な漢語は使わないでください。助詞を削って音数を合わせないでください。入力語自体を使う必要はなく、必要なら物・景色・身体感覚・時間へ変換してください。

特定の単語だけを避ければよいわけではありません。次のようなカテゴリそのものを避けてください。

・季節の景物をテンプレート的に並べただけの情景(春風が吹く/花が開く/木漏れ日が差す、など、絵はがきやポエムカレンダーにありそうな組み合わせ)
・「自然+前向きな心情」という組み合わせで安易に一首を成立させること(例:花が咲く→希望が生まれる、光が差す→未来を描く、といった連想の自動運転)
・「夕焼け」「月」「星」「涙」「桜」「花」「風」「空」「夢」「光」「影」「心」「記憶」など、詩で頻出する語や、その類義語・言い換え(「陽だまり」「そよ風」「花びら」等を含む)を、入力語との必然性なく使うこと

これらの語や情景が今回の入力語の本質と強く結びつく場合にのみ、例外的に使用可としますが、その場合も一般的な使われ方(希望の象徴としての光、など)を踏襲しないでください。

短歌らしく見せるためだけに「けり」「かな」「なり」「たり」「たる」などの文語(古典的な活用形)を使わないでください。動詞は「〜した」「〜する」のような現代口語の活用にしてください。

【避けること】
日記の一場面をそのまま5行にしたもの/感想文的な結句/散文の並べ替え/上句を下句で説明するもの/オチや教訓/入力語の辞書的説明/「〜とき」「〜だけ」「〜ている」の単純な状況説明の連続/川柳・標語・キャッチコピー的なもの。

【定型・音数】
五・七・五・七・七、計31音を基本としてください。文字数ではなく発音音数で数えてください。
1音程度の字余り・字足らずは表現上許容範囲とします。ただし、2音以上ずれる句が出ないようにしてください。特定の一句だけが大きく膨らむ(例:本来7音のところが10音になる)ことは避け、全体として定型の輪郭が保たれるようにしてください。
音数合わせを優先して不自然な語順や助詞削り・意味の薄い言葉で帳尻を合わせないでください。まず内容として自然な一首を作り、音数が大きくずれていれば語彙自体を別のものに置き換えて調整してください。

【推敲】
一首だけで終わらせず内部で複数案を作り、最も完成度の高いものを選んでください。出力前に、以下をすべて確認し、一つでも満たさなければ再度推敲してください。

・各句がおおむね5・7・5・7・7音になっているか(2音以上ずれる句がないか)
・この一首は、今回の入力語を別の言葉に差し替えても成立してしまわないか(最重要。成立してしまうなら作り直す)
・入力語から最初に思い浮かぶ典型的な場面に安易に頼っていないか
・季節の景物やテンプレート的な自然描写の安易な組み合わせになっていないか
・結句が感想・断定・意志形・呼びかけ・スローガンになっていないか
・具体像があるか、動詞が効いているか
・二つ以上の像や時間の関係があるか
・上句から下句への飛躍があるか
・蓄積リストのエッセンスを使った場合、それが今回の一語の存在感を薄めていないか

思考過程・候補は表示しないでください。

【今回の入力語】
${word.trim()}

【これまでに選ばれた言葉】
${accumulatedWordsText}

【出力形式】
鑑賞者に表示する短歌は一首のみ、五・七・五・七・七の5句としてください。
今回はサーバーで音数を検証するため、本文5行の代わりに、次のJSON形式だけを返してください。

{
  "lines": [
    {"text": "第1句の本文", "reading": "だいいっくのよみ"},
    {"text": "第2句の本文", "reading": "だいにくのよみ"},
    {"text": "第3句の本文", "reading": "だいさんくのよみ"},
    {"text": "第4句の本文", "reading": "だいよんくのよみ"},
    {"text": "第5句の本文", "reading": "だいごくのよみ"}
  ]
}

上の文字列は項目の説明であり、短歌の見本ではありません。
linesには必ず5つの要素を入れてください。
textには1句だけを書き、改行・タイトル・解説・音数・注釈を含めないでください。
readingには、その句全体の正確な読みをひらがなで書いてください。
本文にある語や助詞を省略したり、存在しない音を加えたりしないでください。
音数を合わせるために読みを偽らず、本文そのものを推敲してください。

「きゃ・きゅ・きょ」などの拗音は1音、「っ」「ん」はそれぞれ1音です。
長音も1音として数え、「きゅう」は2音です。
「魚焼く火が」は「さかなやくひが」で7音なので、第1句には長すぎます。

まず正確な五・七・五・七・七を目指してください。
自然さを損なう場合だけ、元の方針に従って1音のずれを許容してください。
現代短歌の自由な行分けは採用せず、1要素につき1句を返してください。

思考過程・候補・訂正の過程は返さず、最終稿のJSONだけを返してください。
`.trim();

    timeoutTimer = setTimeout(() => {
      controller.abort();
    }, TOTAL_TIMEOUT_MS);

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    let bestCandidate = null;
    let finalCandidate = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const text = await callClaude(messages, controller.signal);

      messages.push({
        role: 'assistant',
        content: text
      });

      let candidate;

      try {
        candidate = parseCandidate(text);
      } catch (error) {
        if (attempt < MAX_ATTEMPTS - 1) {
          messages.push({
            role: 'user',
            content:
              `形式または読みの検証に失敗しました。\n` +
              `${error instanceof Error ? error.message : String(error)}\n` +
              '本文と正確な読みを持つ5句のJSONを返してください。' +
              '作品の条件を保ち、五・七・五・七・七を目指してください。'
          });
        }

        continue;
      }

      if (candidate.acceptable && (!bestCandidate || candidate.score < bestCandidate.score)) {
        bestCandidate = candidate;
      }

      if (candidate.exact) {
        finalCandidate = candidate;
        break;
      }

      if (attempt < MAX_ATTEMPTS - 1) {
        messages.push({
          role: 'user',
          content: `
プログラムで読みの音数を数えた結果です。

${describeCandidate(candidate)}

五・七・五・七・七に近づくよう、本文を推敲してください。
正しい読みを短縮して音数だけ合わせることは禁止です。
一部の句を修正した場合も、一首全体の自然さと像の関係を確認してください。
入力語を中心にすること、結句やクリシェ回避など、最初の作品条件を維持してください。
句またがりは可能です。各句で文法的な意味を完結させる必要はありません。
最終稿の5句について、本文と正確な読みを持つJSONだけを返してください。
`.trim()
        });
      }
    }

    finalCandidate = finalCandidate || bestCandidate;

    if (!finalCandidate) {
      return res.status(502).json({
        error: '短歌の音数を整えられませんでした。もう一度お試しください。'
      });
    }

    console.log(
      'Tanka mora check:',
      finalCandidate.lines.map((line) => line.moras)
    );

    return res.status(200).json({
      tanka: finalCandidate.lines.map((line) => line.text).join('\n')
    });
  } catch (error) {
    console.error('Server error:', error);

    return res.status(controller.signal.aborted ? 504 : 502).json({
      error: controller.signal.aborted
        ? '短歌の推敲に時間がかかりました。もう一度お試しください。'
        : '短歌を生成できませんでした。もう一度お試しください。'
    });
  } finally {
    if (timeoutTimer !== undefined) {
      clearTimeout(timeoutTimer);
    }
  }
}
