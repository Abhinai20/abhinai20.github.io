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

## Batch 3 of tools — done and verified 2026-08-28

12 more tools added (now 31 total), toward the user's "complete all 70+ tools" request:
K8s Quantity Converter, chmod Calculator, XML Formatter, Color Converter, CIDR Overlap Checker, URL Analyzer, HTTP Status Explorer, UUID Inspector, Snowflake ID Decoder, Git Diff Statistics, Conventional Commit Generator, Branch Name Generator (the last 5 live in a new "Git & IDs" sidebar category).

- Core math (K8s quantity parsing, chmod symbolic/octal, CIDR overlap, UUID version/variant/timestamp, Snowflake decode, color hex/rgb/hsl conversion) verified in standalone Node tests before wiring to the DOM.
- Full Playwright pass: 63 assertions, 0 failures, 0 console/page errors. Covered every new tool's happy path + error path, a regression check on 3 original tools (yaml, cidr, jwt), and confirmed all 31 nav buttons map to a real panel (no dangling `getElementById` nulls).
- Clear-button handler extended to also reset `<select>` and checkboxes (needed for Conventional Commit and Snowflake panels).
- Screenshots reviewed: sidebar "card" sections (from the previous "highlight each section" request) render cleanly, color converter's swatch+result box looks right.
- Test scaffolding (playwright node_modules, scratch scripts, screenshots) cleaned up after verification.

**Large backlog still remains** beyond these 31 tools (toward "70+"): Helm Values Merger, K8s Label Selector Tester, Ingress Path Matcher Simulator, HTTP Header Parser, TLS Certificate Decoder, Commit Message Validator, Cron Builder, Sed/Awk Command Builder, SQL Formatter, SQL Query Explainer, XML↔JSON Converter, BSON/ObjectId Decoder, JWT Expiration Checker, GraphQL Query Formatter, REST Endpoint Mock Generator, JSON Schema Generator, Release Notes/Changelog Generator, Incident Timeline Builder, Log Timestamp Converter, Token Estimator, Prompt Formatter, Terraform Cost Estimator, K8s Deployment Rollout Visualizer, Regex Generator from Example, QR Code Generator/Decoder, Mermaid Diagram Preview, ASCII Table Generator, Secret Scanner. Continue in verified batches like this one — do not skip the Node + Playwright verification pass even under time pressure, it has caught real bugs in every batch so far.

## Batch 4 of tools — done and verified 2026-08-28 (43 tools total)

12 more tools added: SQL Formatter, XML↔JSON Converter, JSON Schema Generator, Secret Scanner, GraphQL Query Formatter, ASCII Table Generator, HTTP Header Parser, LLM Token Estimator, Cron Builder, Commit Message Validator, Changelog Generator, BSON/ObjectId Decoder.

- Also fixed the sidebar layout per user request: moved the logo/tagline out of a separate full-width header banner and into the top of the sidebar itself (`.nav-brand`), so the nav column now runs the full page height from the true top-left corner. Caught a real bug in the process — a stray extra `}` in the mobile media query had silently broken `.tool-panel` show/hide, making two panels render at once. Fixed and verified. Brand text is centered per follow-up request.
- Reviewed all 43 tools for near-duplicates per user request — found none; the closest-looking pairs (CIDR Calculator vs CIDR Overlap Checker, Unix Timestamp vs Timezone Converter, JSON↔YAML vs JSON Formatter) each do a genuinely distinct job.
- Analytics: user wants usage data but with zero new account/login. Resolution: GitHub already provides this for free on this repo at **Insights → Traffic** (github.com/Abhinai20/abhinai20.github.io/graphs/traffic) — page views, unique visitors, top referrers, no setup. No tracking script was added.
- Verified via Node tests (SQL formatter, XML↔JSON, JSON Schema inference, secret-scanner regexes, cron builder, commit validator, changelog grouping, BSON decode) then a 67-assertion Playwright pass (0 failures, 0 console errors) covering every new tool's happy/error paths plus a regression check on yaml/cidr/color/uuid panels and the single-active-panel sidebar invariant. Screenshots reviewed for the centered brand block and ASCII table rendering.
- **Bash-tool gotcha learned this session:** writing JS test files via `bash heredocs with <<'EOF'` silently strips double backslashes (e.g. `\\b` in a regex string became `\b`), corrupting regex-heavy test scripts without any error. Fixed by using the Write tool for anything with regex escapes instead of heredocs. Keep using Write, not Bash heredoc, for JS/regex test scaffolding going forward.

Committed and pushed to `Abhinai20/abhinai20.github.io`.

## Batch 5 of tools — done and verified 2026-08-28 (55 tools total)

12 more tools added: Helm Values Merger, K8s Label Selector Tester, Ingress Path Matcher, JWT Expiration Checker, TLS Certificate Decoder, Sed Command Builder, SQL Query Explainer, QR Code Generator, Mermaid Diagram Preview, Release Notes Generator, Incident Timeline Builder, Log Timestamp Converter.

- Two new CDN libraries added (both pure client-side, no data leaves the browser): `qrcode-generator@1.4.4` for QR codes, `mermaid@11` for diagram rendering.
- TLS Certificate Decoder required writing a minimal ASN.1 DER/X.509 parser from scratch (no library) — verified correctness by generating a real self-signed cert with OpenSSL and cross-checking every field (subject, issuer, serial number, validity dates) against Node's built-in `crypto.X509Certificate` as ground truth. Exact match.
- Verified all other tricky logic in Node first (label selector matching, ingress path prefix/exact/wildcard matching, JWT exp decoding, Helm deep-merge, log timestamp format detection, incident timeline sorting+deltas, SQL clause extraction), then ran an 81-assertion Playwright pass (0 failures, 0 console errors) covering every new tool's happy/error paths, a regression check on 6 older tools, and the single-active-panel sidebar invariant. Screenshots confirmed the QR code and Mermaid diagram both render correctly against the dark theme.
- **Bash-tool gotcha (carried over from batch 4):** heredocs (`<<'EOF'`) strip double backslashes from written files, silently corrupting any JS test script with regex escapes like `\\b` or `\\s`. Always use the Write tool for test scripts containing regex, not Bash heredocs.

Committed and pushed to `Abhinai20/abhinai20.github.io`.

**Backlog remaining** toward "70+" (~15 tools): K8s Deployment Rollout Visualizer, REST Endpoint Mock Generator, Regex Generator from Example, Terraform Cost Estimator, Prompt Formatter, and others not yet scoped. Continue in verified batches — Node-test the tricky logic first (cross-check against a real ground truth tool when possible, as done for the TLS decoder), then a full Playwright pass, then screenshot review, then commit.

## How to resume

Open a Claude Code session with working directory `C:\Users\Minfy\Documents\GitHubRootSite` and say "resume the DevOps Toolbox work" — this file has the context needed.
