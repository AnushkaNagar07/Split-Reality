require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// A rotating set of "universe" flavors so 3 branches never feel like the same idea reworded.
const UNIVERSE_ANGLES = [
  'the most emotionally realistic outcome',
  'a chaotic, over-the-top outcome',
  'a slow-burn, years-later outcome',
  'a plot-twist outcome nobody saw coming',
  'a bittersweet, mixed-blessing outcome',
];

function pickAngles(n) {
  const shuffled = [...UNIVERSE_ANGLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function callClaude(systemPrompt, userPrompt) {
  if (!API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY. Add it to your .env file.');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textBlock = data.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text returned from Claude.');

  // Strip accidental markdown fences before parsing.
  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

const SYSTEM_PROMPT = `You are the narrative engine behind "Split Reality," an app where a user types one real (or hypothetical) moment from their life, and you fracture it into alternate timelines - "what if it had gone differently" versions.

Rules:
- Always respond with ONLY valid JSON. No prose, no markdown fences, no commentary.
- Each reality needs: "universe" (a short punchy 2-4 word label for this timeline, like "THE BOLD PATH" or "THE QUIET REGRET"), "title" (a one-line dramatic headline, max 10 words), and "story" (3-5 sentences, second person "you", vivid, emotionally specific, concrete details - not generic platitudes).
- Keep it PG-13, no hate speech, no real named public figures depicted in defamatory or explicit scenarios - keep celebrity/public-figure mentions light, playful, and clearly speculative/fictional.
- Tone: cinematic and a little wry, like a narrator who's seen a thousand timelines. Never preachy or therapist-y.
- Vary the emotional register across the different realities you're asked for - don't make them all happy or all sad.`;

app.post('/api/split', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const angles = pickAngles(3);
    const userPrompt = `The user's moment: "${message.trim()}"

Generate exactly 3 alternate realities branching from this moment. Make reality 1 follow the angle: ${angles[0]}. Make reality 2 follow the angle: ${angles[1]}. Make reality 3 follow the angle: ${angles[2]}.

Respond with ONLY this JSON shape:
{"realities":[{"universe":"...","title":"...","story":"..."},{"universe":"...","title":"...","story":"..."},{"universe":"...","title":"...","story":"..."}]}`;

    const result = await callClaude(SYSTEM_PROMPT, userPrompt);
    const realities = result.realities.map((r, i) => ({ id: i + 1, ...r }));
    res.json({ realities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something broke the timeline.' });
  }
});

app.post('/api/reroll', async (req, res) => {
  try {
    const { message, exclude } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const angle = pickAngles(1)[0];
    const excludeList = Array.isArray(exclude) ? exclude.join(', ') : '';
    const userPrompt = `The user's moment: "${message.trim()}"

Generate exactly 1 NEW alternate reality branching from this moment, different from any of these already-shown universes: [${excludeList}]. Follow this angle: ${angle}.

Respond with ONLY this JSON shape:
{"universe":"...","title":"...","story":"..."}`;

    const reality = await callClaude(SYSTEM_PROMPT, userPrompt);
    res.json({ reality });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something broke the timeline.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Split Reality running at http://localhost:${PORT}`);
});
