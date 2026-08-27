# DevOps Toolbox (abhinai20.github.io) — Progress

Last updated: 2026-08-27

## Goal

A third income source alongside the two blogs — genuinely different in kind, not another blog. Free, client-side utility tools instead of recurring content: build once, no new "posts" ever needed, ads run on repeat usage.

## This is now a single repo

**Repo:** `Abhinai20/abhinai20.github.io` (GitHub's special "user site" naming — serves at the bare root domain automatically, no manual Pages toggle needed).

- `/` (this repo's root `index.html`) — a small landing page linking to the tools and both blogs
- `/devops-toolbox/` — the actual tools site, as a subfolder of this same repo
- `/ads.txt` — domain-level file, covers both paths since ads.txt is checked at the domain root regardless of subpath

**History note:** this was originally two separate repos (`devops-toolbox` as its own "project site" + this root repo). Consolidated into one 2026-08-27 once it became clear a GitHub Pages project-site repo and a user-site repo's matching subfolder can't coexist at the same URL — the project site always wins until removed. The old standalone repo has been deleted; this repo is now the only source of truth. **The local folder `C:\Users\Minfy\Documents\DevOpsToolbox` is superseded — don't edit it, everything now lives under `C:\Users\Minfy\Documents\GitHubRootSite\devops-toolbox\`.**

## Tools — 18 total

Original 4: YAML Validator, Terraform Plan Formatter, Cron Expression Explainer, Markdown → Word.

Added 2026-08-27 (14 more, picked from a much larger user-provided list, prioritizing daily-use DevOps/security utilities that are copy-paste-friendly and need no auth):
- JSON ↔ YAML Converter, JSON Formatter & Validator (pretty/minify/sort keys)
- Terraform Resource Counter
- Kubernetes Manifest Analyzer (missing resource limits/probes, privileged containers, `:latest` tags, hostNetwork)
- Dockerfile Best-Practices Checker (unpinned base image, missing USER/HEALTHCHECK, apt-get flags)
- AWS ARN Parser
- JWT Decoder (with expiry shown as a real date/countdown)
- Regex Tester (with match highlighting)
- Base64 / URL Encode & Decode
- Hash Generator (MD5 — hand-written and verified against known test vectors since Web Crypto doesn't support it; SHA-1/256/512 via the real Web Crypto API)
- Diff Viewer (LCS-based line diff)
- Unix Timestamp Converter
- Timezone Converter (7 common zones)
- cURL → Code Generator (JavaScript/Python/PowerShell, with a proper shell tokenizer handling quoted args and backslash-escaped quotes)

**A large backlog of further tool ideas (~45 more, e.g. CIDR calculator, secret scanner, SQL formatter, UUID inspector, QR code tools) exists from the same user conversation — not yet built, intentionally deferred to keep quality high on what's shipped. Ask the user before starting a "round 3" — see chat history for the full list if resuming this.**

All 18 verified end-to-end via Playwright + Chrome before and after deployment: the trickier logic (MD5, LCS diff, ARN/JWT parsing, the curl shell tokenizer) was first checked against known-correct outputs in Node, then the full set was smoke-tested in a real browser (26 assertions, zero console/network errors) including a regression check on the original 4 tools.

## AdSense — connected 2026-08-27

Site added as `abhinai20.github.io` (whole domain). First verification attempt failed because the bare domain root had no content (GitHub Pages project sites only serve under `/reponame/`) — fixed by building this root landing page. `ads.txt` added proactively. Verification succeeded; shows in AdSense's site list with Auto ads ON, same "Getting ready" content-review stage the blogs went through.

## Not done yet / next steps

- [ ] AdSense site content review — check back around the same time as the blogs' manual check-in (~2026-09-26).
- [ ] Possible "round 3" of tools from the deferred backlog, if this proves worth investing more in.

## How to resume

Open a Claude Code session with working directory `C:\Users\Minfy\Documents\GitHubRootSite` and say "resume the DevOps Toolbox work" — this file has the context needed.
