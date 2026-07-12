# ◆ Split Reality

**Type one real moment. Watch it fracture into the timelines it could have become.**

You send a text you shouldn't have sent, you propose, you quit the job, a striker misses a penalty in the 90th minute — every moment forks into a hundred versions of itself. Split Reality takes the one you actually lived through and shows you three you didn't, written as short, specific, cinematic scenes — not generic "you'd feel happier" advice. Don't like a timeline? Reroll it for a different one, same moment.

---

## Table of contents
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Run it locally (5 min)](#run-it-locally-5-min)
- [Push to GitHub (first time? read this)](#push-to-github-first-time-read-this)
- [Deploy a live link (5 min, free)](#deploy-a-live-link-5-min-free)
- [Pitch script](#pitch-script)
- [Demo script (2 min, judges watching)](#demo-script-2-min-judges-watching)
- [What's next](#whats-next)

---

## How it works

1. User types a moment — anything from a real personal memory to a hypothetical ("if Ronaldo wins the World Cup").
2. The backend sends it to **Claude**, asking for 3 alternate timelines, each written from a different emotional angle (realistic / chaotic / bittersweet / slow-burn / plot-twist) so they never feel like the same idea reworded.
3. Each timeline renders as a card: a universe label, a headline, and a 3-5 sentence scene written in second person.
4. Each card has its own **reroll** button — regenerate just that one timeline for a fresh take, without losing the other two.

No accounts, no database, no saved history — it's a single moment in, three timelines out. That scope is deliberate: it's what you can build, demo, and explain in a weekend.

## Tech stack

- **Frontend:** plain HTML/CSS/JS — no build step, no framework overhead, so there's nothing to break five minutes before judging.
- **Backend:** Node.js + Express — one server serves the static frontend *and* the API, so you deploy exactly one service.
- **AI:** [Claude](https://www.anthropic.com/) (Anthropic API) for the timeline generation.
- **Hosting:** Render / Railway / Fly.io — anything that runs `npm start`.

```
split-reality/
├── server.js            # Express server + Claude API calls
├── package.json
├── .env.example          # copy to .env and add your key
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Run it locally (5 min)

**Prerequisites:** [Node.js 18+](https://nodejs.org) installed, and an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys) (new accounts get free credits — plenty for a hackathon demo).

```bash
# 1. install dependencies
npm install

# 2. copy the env template and paste in your key
cp .env.example .env
# open .env and set ANTHROPIC_API_KEY=sk-ant-...

# 3. run it
npm start

# 4. open it
# http://localhost:3000
```

That's it — type a moment, hit "Split it."

## Push to GitHub (first time? read this)

If you've never pushed a project to GitHub before, this is the whole process:

```bash
# from inside the split-reality folder
git init
git add .
git commit -m "Split Reality: initial hackathon build"

# create a new EMPTY repo on github.com first (no README/gitignore there),
# then copy the URL it gives you and run:
git remote add origin https://github.com/YOUR_USERNAME/split-reality.git
git branch -M main
git push -u origin main
```

Your `.env` file (with your real API key) is already excluded via `.gitignore` — never commit real API keys. Judges and anyone browsing your repo will see `.env.example` instead, which is safe.

## Deploy a live link (5 min, free)

Judges want a URL, not a `localhost`. Easiest path — **Render**:

1. Push your code to GitHub (above).
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
3. Build command: `npm install` · Start command: `npm start`.
4. Under **Environment**, add `ANTHROPIC_API_KEY` with your real key (and optionally `CLAUDE_MODEL`).
5. Deploy. Render gives you a `https://your-app.onrender.com` link — that's what goes on your submission form and slide.

Railway and Fly.io work the same way if Render is slow to spin up on the free tier that day.

## Pitch script

**30-second elevator pitch (say this when someone asks "what did you build?"):**

> "Split Reality takes one real moment from your life — a text you sent, a decision you made — and uses Claude to write three timelines of what could have happened instead. Not generic advice, actual short scenes: a chaotic version, a slow-burn version, a plot-twist version. Don't like one? You reroll just that timeline. It's built on the idea that the most human thing we do is wonder 'what if' — we just gave it a UI."

**Why it matters (one line for the judges' "impact" question):**

> "Everyone has replayed a moment and wondered how it would've gone. Split Reality turns that private, unproductive loop into something playful and shareable in under 10 seconds."

## Demo script (2 min, judges watching)

1. **Open on the empty state.** Say: *"This is Split Reality — one input, no accounts, no setup."*
2. **Click the "crush rejection" example chip.** Say: *"Real moment: I proposed to my crush and got rejected."* Hit Split.
3. **While it loads (~3-5s):** *"That's going to Claude right now, generating three alternate timelines from three different emotional angles, so they don't all just say 'it would've been fine.'"*
4. **Point at the three cards as they land:** *"Realistic outcome, chaotic outcome, bittersweet outcome — different universe, different color, different voice."*
5. **Click reroll on one card.** Say: *"If a timeline doesn't land, you reroll just that one — the other two stay put."*
6. **Type the Ronaldo example live** to show it's not hardcoded to breakups: *"It's not just personal moments — same engine, any hypothetical."*
7. **Close:** *"Built end-to-end this weekend — Node backend, Claude for generation, zero frameworks on the frontend so it's fast and it doesn't break."*

## What's next

- Let users **pick a timeline and branch again** — "what if *that* went differently too" (recursive forking).
- Shareable timeline cards (image export) for socials.
- Voice input for the moment.
- A "collide" mode: paste two people's moments and generate the timeline where they intersect.

---

Built at a hackathon. Powered by [Claude](https://www.anthropic.com/).
