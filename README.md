# Lumina Demo

Interactive demo for [Lumina](https://github.com/Pranav301102/Luminx) — a distributed split-inference system that runs large language models across three physically separate machines.

This Next.js app simulates the full Lumina experience without requiring the real backend:
- All node stats (CPU, RAM, VRAM, latency, throughput) drift realistically via sine-wave simulation
- Chat uses the real **Gemini API**, streaming tokens as if they came from the 3-node pipeline
- The dashboard, cluster view, health monitor, trace history, and logs are all fully functional

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.local.example .env.local
# add your Gemini API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/dashboard/chat` | Chat with Gemini streaming |
| `/dashboard/cluster` | Live node table + throughput/latency charts |
| `/dashboard/health` | System health and model config |
| `/dashboard/trace` | Per-request step latency breakdown |
| `/dashboard/logs` | Frontend activity log |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio key — [get one here](https://aistudio.google.com/app/apikey) |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into Vercel
3. Add `GEMINI_API_KEY` in **Project Settings → Environment Variables**
4. Deploy — no other config needed

The `vercel.json` already sets a 60-second timeout on the streaming chat route.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Recharts** — throughput and latency charts
- **Google Generative AI SDK** — Gemini 2.0 Flash streaming
- **Lucide React** — icons
