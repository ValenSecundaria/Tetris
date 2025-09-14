import type { VercelRequest, VercelResponse } from '@vercel/node';

// Estado en memoria (se reinicia cuando Vercel recicla la lambda)
let highscore = { name: '—', score: 0 };

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS por si pruebas desde orígenes distintos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    return res.json(highscore);
  }

  if (req.method === 'POST') {
    const { name, score } = (req.body ?? {}) as { name?: string; score?: number };
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Campos inválidos' });
    }
    if (score > highscore.score) highscore = { name, score };
    return res.json(highscore);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
