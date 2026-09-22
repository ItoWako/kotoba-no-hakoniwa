import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/tanka', async (req, res) => {
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
説明や前置きは付けず、短歌本文だけを返してください。`
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

    res.json({
      tanka: text
    });
  } catch (error) {
    console.error('Server error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

/* ─────────────────────────────
   Frontend
───────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

/*
  React / Vite の画面を返すフォールバック
  Express 5では app.get("*") を使わない
*/
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  res.sendFile(path.join(distPath, 'index.html'));
});

/* ─────────────────────────────
   Server start
───────────────────────────── */

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
