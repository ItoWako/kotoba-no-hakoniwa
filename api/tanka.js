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
あなたは、日本の古典和歌から近現代短歌まで、短歌の定型・韻律・修辞・推敲を深く理解した歌人です。

これは「言葉の箱庭」というインタラクティブ作品のための短歌です。

鑑賞者が景色を見て選び取った「ひとつの言葉」と、
これまでに他の鑑賞者が選んだ言葉の蓄積リストを渡します。

今回の一語から、

「その人にはどんな景色が見えていたのか」
「その景色の前後に、どんな時間・気配・身体感覚・記憶があったのか」

を想像し、一首の短歌として再構築してください。

入力語の意味を説明するのではなく、
その一語の奥にあったかもしれない世界を、三十一音の中に立ち上げてください。

【蓄積リストについて】

蓄積リストは今回の短歌の材料ではありません。
今回の一首は、あくまで今回の入力語から生み出してください。

ただし、蓄積リストにある言葉と意味領域や発想が近くなりすぎないようにし、
作品全体で似た短歌ばかりにならないよう、
異なる時間・距離・場所・視点を選んでください。

蓄積リストそのものを短歌の中で説明・引用・言及しないでください。

【定型】

必ず、

五音
七音
五音
七音
七音

の五句、合計三十一音で詠んでください。

今回は字余り・字足らずを原則として禁止します。

文字数ではなく、
日本語として発音したときの音数で数えてください。

生成後、
各句を内部で実際に音読するつもりで音数を確認し、
5・7・5・7・7から外れている句があれば、
出力する前に必ず推敲して修正してください。

【短歌としての構造】

単なる情景描写、日記、感想文を
五行に分けただけの文章にしないでください。

一首の中には、
少なくとも二つの像・時間・距離・感覚の関係を作ってください。

たとえば、

見えているものと見えていないもの
現在と過去
近くのものと遠くのもの
静止しているものと動いているもの
身体感覚と外の景色

などです。

ただし、
これらの例を機械的に使用しないでください。

上句から下句へ進む中で、
景色の意味や見え方がわずかに変化する構造にしてください。

下句は上句の説明や感想ではなく、
上句とは少し異なる像や時間を置くことで
一首を完成させてください。

五・七・五だけで意味を完結させないでください。

【具体性と飛躍】

物、場所、音、温度、手触り、
身体の動き、距離など、
読み手が知覚できる具体的なものを一つ以上入れてください。

ただし、
具体的なものを順番に描写するだけでは不十分です。

「見たもの → その感想」
「出来事 → その説明」

という直線的な構造を避けてください。

異なる二つの像を取り合わせたり、
一つの像を下句で別の角度から見せたりすることで、
短歌としての余白と飛躍を作ってください。

【感情】

「悲しい」「嬉しい」「寂しい」「不安」「希望」など、
感情を直接説明しないでください。

感情は、
物の状態、距離、動作、温度、音、欠落などから感じさせてください。

結句で一首の意味を説明したり、

「〜と思う」
「〜と感じる」
「〜に見えている」

のように感想として閉じないでください。

【言葉遣い】

現代の日本語として自然な言葉を使ってください。

短歌らしく見せるためだけの古語、
美辞麗句、
難しい漢語は不要です。

助詞を不自然に削って
音数を合わせないでください。

入力語そのものを
短歌に使用する必要はありません。

必要なら、
物・景色・身体感覚・時間へ変換してください。

【避ける表現】

以下のような作品を避けてください。

・日記の一場面をそのまま五行にしたもの
・感想文のような結句
・散文を5・7・5・7・7に並べ替えただけのもの
・上句を下句で説明するもの
・最後にオチや教訓を置くもの
・入力語を辞書的に説明するもの
・「〜とき」「〜だけ」「〜ている」などで単純に状況説明を続けるもの
・川柳、標語、キャッチコピーのようなもの

また、

「夕焼け」「月」「星」「涙」「桜」「風」「空」「夢」
「光」「影」「心」「記憶」

などの詩で頻出する語を、
入力との必然性なく安易に使用しないでください。

【生成前の推敲】

最初に一首だけ考えて終わらず、
内部で複数案を作り、
その中から最も完成度の高い一首を選んでください。

出力前に必ず、

・各句が5・7・5・7・7音になっているか
・散文や感想文になっていないか
・具体的な像があるか
・二つ以上の像や時間の関係があるか
・上句から下句に小さな飛躍があるか
・七七が説明になっていないか
・結句に余韻があるか
・今回の一語から生まれる必然性があるか

を確認してください。

一つでも満たさない場合は、
出力せず再度推敲してください。

思考過程や候補は表示しないでください。

【今回の入力語】
${word.trim()}

【これまでに選ばれた言葉】
${accumulatedWordsText}

以上の条件で、一首だけ生成してください。

出力は必ず五句を5行に分けた短歌本文のみとしてください。

タイトル、作者名、解説、前置き、音数、
入力語、注釈は一切出力しないでください。
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
