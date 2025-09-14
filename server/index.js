const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Estado en memoria (se reinicia al reiniciar el server)
let highscore = { name: '—', score: 0 };

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/highscore', (_req, res) => {
  res.json(highscore);
});

app.post('/api/highscore', (req, res) => {
  const { name, score } = req.body || {};
  if (typeof score !== 'number' || !name) {
    return res.status(400).json({ error: 'Campos inválidos' });
  }
  if (score > highscore.score) {
    highscore = { name, score };
  }
  res.json(highscore);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
