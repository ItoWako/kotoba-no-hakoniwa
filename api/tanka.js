export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({
        error: 'word is required'
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `「${word}」という一語から、日本語の短歌を一首作ってください。

五七五七七を意識しつつ、不自然に字数を合わせすぎないでください。
説明や前置きは付けず、短歌本文だけを返してください。
五句をそれぞれ改行してください。`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(500).json({
        error: 'Claude API error'
      });
    }

    const text = data.content
      ?.filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('')
      .trim();

    if (!text) {
      return res.status(500).json({
        error: 'No tanka returned'
      });
    }

    return res.status(200).json({
      tanka: text
    });
  } catch (error) {
    console.error('Server error:', error);

    return res.status(500).json({
      error: 'Server error'
    });
  }
}
