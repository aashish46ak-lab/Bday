# Happy Birthday, Esha KC ✨

A cinematic digital birthday experience built with Next.js.

## Experience flow

1. Volume-up intro
2. Cinematic name reveal
3. Birthday cake with interactive candles (tap or blow into mic)
4. Fireworks celebration
5. Gift box → interactive surprises (message, music, wishes)
6. Final constellation reveal + personal card

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS
- Canvas particle systems (stars, fireworks, constellation)
- Web Audio API for original birthday-style music & SFX
- Fully client-side, mobile-first

## Music

By default the site synthesizes a warm original instrumental via Web Audio API (royalty-free).

To use your own track: place an mp3 at `public/audio/birthday-theme.mp3`

Config lives in `src/lib/config.ts`.

## Develop

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Import the repo in Vercel. No environment variables required.
