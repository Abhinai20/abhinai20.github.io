# API keys — recovery reference

**This repo is PUBLIC** (`Abhinai20/abhinai20.github.io`, required for GitHub Pages on the free tier) — unlike the two blog repos, actual secret values must NEVER be committed here. GitHub's push protection confirmed this by blocking an earlier commit attempt (2026-08-31) that mistakenly included them, copy-pasted from the private blog repos' equivalent file without adjusting for this repo being public.

## Google OAuth (Blogger + Search Console grant, shared across all 3 properties)

This repo only uses the Search Console (`webmasters`) side of the shared Google OAuth grant, not Blogger.

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` — same values as documented in the **private** repos `Abhinai20/blogspot-automation` and `Abhinai20/clouddesk-automation` (`credentials/api_keys.md` in either), and in Claude's local memory (`reference_blogspot_api_keys.md`). Look there for the actual values, or ask Claude.

In use: `.github/workflows/resubmit-sitemap.yml` → `scripts/resubmit_sitemap.py`, resubmits the DevOps Toolbox sitemap to Search Console on every push that touches `devops-toolbox/**`.

**Manual step needed**: add the 3 values above as GitHub Actions repository secrets on `Abhinai20/abhinai20.github.io` (Settings → Secrets and variables → Actions → New repository secret) — get the actual values from one of the private repos or ask Claude, don't paste them into any file in this repo.
