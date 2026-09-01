# Synonym Rephraser backend (Cloudflare Worker)

Backs the "Synonym Rephraser" tool at
https://abhinai20.github.io/devops-toolbox/tools/paraphraser.html.

GitHub Pages (where the toolbox lives) is static-only and can't hold a
secret or run server code. This Worker is the minimal proxy: it holds the
Gemini API key as a Cloudflare secret, accepts pasted text from the
browser, calls Gemini server-side, and returns the rewritten text. No
secret is ever in this repo — `src/index.js` only reads `env.GEMINI_API_KEY`
at runtime.

**Privacy note (also disclosed on the tool page itself):** unlike the rest
of the site, the full text you paste into this one tool IS sent off-device
— to this Worker, then to Google's Gemini API. Every other tool on
DevOps Toolbox stays 100% client-side.

## One-time setup

```bash
cd rephraser-worker
npm install
npx wrangler login          # opens a browser to authorize this CLI
npx wrangler secret put GEMINI_API_KEY   # paste the key when prompted
```

## Deploy

```bash
npx wrangler deploy
```

This prints the live Worker URL, something like
`https://devops-toolbox-rephraser.<your-subdomain>.workers.dev` — that URL
gets wired into `devops-toolbox/assets/app.js` (the `REPHRASE_ENDPOINT`
constant) on the site side.

## Local testing

```bash
npx wrangler dev
```

Then `curl -X POST http://localhost:8787 -H "Content-Type: application/json" -d '{"text":"This cant be discussed immedialtely."}'`
