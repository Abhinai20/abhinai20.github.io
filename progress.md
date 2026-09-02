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

## Batch 6 of tools — done and verified 2026-08-28 (67 tools total)

12 more tools: Rollout Budget Calculator, K8s Resource Quota Calculator, Dockerfile Multi-Stage Visualizer, Docker Image Tag Comparator, Terraform Variable Extractor, Terraform Dependency Grapher, AWS IAM Policy Simulator, REST Endpoint Mock Generator, Chat Prompt Formatter, .env File Validator, Nginx Config Formatter, Cron Next Run Calculator.

- **Scope correction caught before shipping:** originally planned a full step-by-step "K8s Deployment Rollout Visualizer" that simulates the rolling-update controller pod-by-pod. Node-tested it first and found the hand-rolled algorithm was genuinely wrong (got stuck cycling the same state for 45+ iterations — real K8s rollout scheduling isn't a simple deterministic loop). Rather than ship a plausible-looking but incorrect simulation, descoped it to a **Rollout Budget Calculator** — just the verifiable numbers (maxSurge/maxUnavailable pod counts, max total pods, min available pods), which is accurate and still useful for capacity planning. This is the right call whenever a "visualize the full process" idea turns out to need modeling a system's real dynamic behavior rather than a fixed formula — verify the algorithm first, and descope to what's provably correct rather than shipping a fabricated animation.
- Dockerfile Stage Visualizer and Terraform Dependency Grapher both reuse the Mermaid renderer added in batch 5 — good reuse, both verified to render real SVGs.
- Verified all other logic in Node first (label/env/HCL parsing regexes, IAM policy evaluation, semver tag comparison, nginx brace-depth indenting, cron next-run-time calculation), then ran a 91-assertion Playwright pass (0 real failures, 0 console errors — one flaky assertion about sidebar position turned out to be a Playwright click/scroll timing artifact in the test itself, confirmed via isolated reproduction that the page is correct).

Committed and pushed to `Abhinai20/abhinai20.github.io`.

**Backlog remaining** toward "70+" (~3 tools to round out): a few more ideas not yet scoped (e.g. GitHub Actions workflow linter, Docker Compose validator, S3 bucket policy generator). Continue in verified batches — Node-test the tricky logic first (cross-check against a real ground truth tool when possible, as done for the TLS decoder), descope anything that turns out to need modeling real dynamic system behavior rather than a fixed formula, then a full Playwright pass, then screenshot review, then commit.

## AI Paraphraser added 2026-08-28 (68 tools total)

User asked to add a QuillBot-style paraphraser and put it at the top of the sidebar. This was previously researched-but-deferred (see the old note about `Xenova/flan-t5-small` via transformers.js) — picked back up and actually shipped this time.

- **This tool is categorically different from the other 67**: it runs a real small ML model client-side (`Xenova/LaMini-Flan-T5-77M`, 77M params, quantized ONNX, ~90MB total download) via `@xenova/transformers` (loaded from jsdelivr CDN with a dynamic `import()` in app.js, so the ~90MB library+model only loads when someone actually opens this specific tool — everyone else's page load is unaffected). Still zero backend, zero API key, zero signup — the model runs in-browser via WebAssembly and is cached after first use (transformers.js uses the browser Cache API automatically).
- Added a new "AI Writing" sidebar category, placed first (above "Format & Validate"), containing just this one tool, per the user's "top of the list" request.
- Five modes (Standard/Formal/Fluency/Simple/Creative) implemented via different instruction prompts to the same model — mirrors QuillBot's mode selector, though it's one general-purpose small model, not mode-specific fine-tunes.
- **Verified with a real end-to-end Playwright test that actually downloads the model and runs inference** (not mocked) — confirmed a genuine, sensibly-reworded output, zero console errors, sidebar ordering correct, Clear button and empty-input validation both correct.
- **Quality caveat, set the right expectation with the user**: a 77M-parameter model is nowhere near QuillBot's actual paraphrasing quality — in testing, "Formal" and "Simple" modes sometimes returned output nearly identical to the input (the model under-edits on short/already-clean sentences). It's a genuine on-device paraphraser, not a QuillBot-equivalent. If quality turns out to matter more than the "no backend" constraint, the honest alternatives are: a larger model (slower first load, e.g. LaMini-Flan-T5-248M or -783M), or breaking the "no backend" rule with a real API (OpenAI/Claude/etc., which would need a paid API key and defeats the "always free, no signup" pitch of the rest of the site).

Not yet committed as of this note if resuming mid-session — check `git status` in the devops-toolbox repo.

**Follow-up same day**: expanded from 5 modes to 15, matching QuillBot's real mode list — Standard, Fluency, Formal, Academic, Simple, Creative, Expand, Shorten, Diplomatic, Casual, Confident, Friendly, Persuasive, News, Anonymize (each just a different instruction prompt to the same small model). Then, per user request, replaced the `<select>` dropdown with a row of pill buttons above the text boxes (matching QuillBot's actual UI pattern) — `.mode-btn-row` / `.mode-btn` in style.css, click handler in app.js reads `.mode-btn.active` instead of a select value. Also had to teach the universal Clear-button handler to reset the pill row back to "Standard" (it only knew about `<select>`/checkbox before). Verified with a real (non-mocked) Playwright run: 15 pills render, clicking one exclusively activates it, an actual paraphrase runs successfully through the pill-selected mode, and Clear resets back to Standard.

**Bug fix same day — "some modes are not working"**: user correctly caught that several modes produced garbage or off-task output (not crashes — no console errors, just wrong/nonsensical text). Root cause found by testing the real model directly: the original multi-line prompt phrasing `"Rewrite the following text in a ... tone:\n<text>"` made this small 77M model answer as if responding to a meta-question about the text (e.g. fluency mode replied "The sentence is already correctly punctuated," news mode echoed back "The news report is a neutral tone for a news report that...", friendly/persuasive/casual produced garbled or off-topic text). Fixed by switching every mode to a short single-line imperative phrasing — `"Paraphrase this sentence [qualifier]: <text>"` — verified directly against the live model for all 15 modes on two different input sentences before shipping; all now return coherent, on-task rewrites. Also stripped stray wrapping quotes the model sometimes added (seen in "shorten" mode).

**Speed fix same day — "first time is slow"**: the ~90MB model download can't be made meaningfully smaller (checked int8/uint8/q4 ONNX quantization variants for this model — q4 was actually *larger* than int8 for this small T5 architecture, ~90MB is the practical floor). Instead, added a preload: the model now starts downloading in the background the moment the user opens the AI Paraphraser tab (via a one-time click listener on that sidebar button), rather than waiting until they click "Paraphrase" — hides most of the wait behind the time spent reading the tool description and choosing a mode. Still fully cached after the first load either way.

**Second bug-fix round same day — "still some are not working"**: the previous prompt-wording fix only solved the worst failure (the model answering a meta-question instead of rewriting). Stress-tested all 15 modes against 6 different realistic sentences (not just the one demo sentence) and found casual/friendly/persuasive/confident genuinely broke 40-60% of the time — garbled grammar, hallucinated details, or reversed meaning. Root cause this time: those modes used `do_sample: true, temperature: 1.0` for variety, and the randomness was what broke them, not the wording. Switched every mode to fully deterministic generation (`do_sample: false`) — re-ran the same 6-sentence × 15-mode stress test (90 combinations) and got zero broken outputs. Also reworded `academic` (→ "Rewrite this sentence in a formal academic style") and `news` (→ "Rewrite this sentence as a news headline") after finding their original phrasing still leaked meta-commentary on some inputs even without sampling, and added a small post-processing step that strips a leading echoed-instruction preamble if the model produces one (e.g. "The following is a formal academic style: ..."). Verified again through the real UI (pill clicks + actual model calls), 33/33 assertions pass, zero console errors.
**Lesson for next time touching this tool**: always stress-test paraphraser prompt changes against several different real sentences, not just the one demo sentence in the textarea — single-sentence testing missed both rounds of these failures.

## Batch 7 added then reverted — 2026-08-28

Added 6 tools (Multi-Doc YAML Splitter, Toleration/Taint Matcher, .env Diff Tool, Storage Unit Converter, Duration/Timestamp Diff, Port Number Reference) as part of the tool-audit request (removed 5 low-value tools, then added these 6 as replacements). User asked to remove them immediately after. Reverted cleanly via `git revert 97081a3` (commit `c1d1c09`) since it was the tip commit and the working tree was clean — the removal-of-5 commit (`64fad47`) was left in place. Current state: 63 tools, matching the count right after the removal batch. Don't re-add these 6 without being asked again.

## Second, stricter audit pass — 2026-08-28 (63 -> 46 tools)

After reverting batch 7, user asked to also validate and remove unused/waste tools from the *existing* set (not just newly added ones). Applied a stricter bar this time: **does this tool meaningfully beat an existing CLI command or established real tool a DevOps engineer already has?** Presented the reasoning via AskUserQuestion before executing (large cut); user chose to proceed with the full list.

**Removed 17:**
- Helm Values Merger — `helm template -f a -f b` gives the real merged result with Helm's actual array-override semantics; our naive JS deep merge could disagree in edge cases
- K8s Label Selector Tester — `kubectl get pods -l <selector>` tests against real objects, strictly better than a simulator with typed-in fake labels
- Ingress Path Matcher — real ingress controllers (nginx/ALB) have their own path-matching nuances our regex heuristic doesn't capture; risk of false confidence
- Rollout Budget Calculator — simple arithmetic, low real friction
- Dockerfile Stage Visualizer — cosmetic, low search intent
- Docker Image Tag Comparator — trivial to eyeball two version strings
- TF Resource Counter — `terraform show -json | jq` does this from real state
- Terraform Variable Extractor — `terraform-docs` is the real, standard, widely-adopted tool for this
- Terraform Dependency Grapher — `terraform graph` is authoritative (built-in, real state); our regex-based reference scan could miss real dependencies (data sources, module refs, implicit `depends_on`)
- JWT Expiration Checker — confirmed genuine duplicate: the JWT Decoder already shows exp/iat/nbf as decoded dates plus an "Expires in X minutes" / "Expired X minutes ago" line
- AWS IAM Policy Simulator — AWS provides its own official, authoritative IAM Policy Simulator for free; ours was explicitly "simplified" (no SCPs/conditions/permission boundaries) and risked giving false confidence on real access decisions
- ASCII Table Generator, HTTP Header Parser, Sed Command Builder — all trivial to do by hand/eye, low real value-add
- SQL Query Explainer — redundant with SQL Formatter's indentation already giving the same visual clarity
- Log Timestamp Converter — overlapped heavily with Unix Timestamp Converter
- Git Diff Statistics — `git diff --stat` is a one-line CLI replacement

**Kept K8s Resource Quota Calculator** despite being in the same family as some removed K8s tools — passes the bar because summing requests/limits across many containers by hand is genuinely tedious and `kubectl` doesn't do this for you without metrics-server + a live cluster.

Verified via a 115-assertion Playwright pass: exactly 46 tools remain, all 17 removed ids confirmed gone, every single remaining panel exists and activates correctly on click (checked all 46, not just a sample), zero console errors, spot-checked core logic (CIDR calculator, JWT decoder, Mermaid rendering, resource quota calc) still correct after the cuts. Screenshot-reviewed the trimmed sidebar.

Removal script approach: since this touched ~17 HTML panels and ~17 JS sections, used small Python scripts (regex-based for HTML sections bounded by `<section id="panel-X">...</section>`, line-range-based for JS sections bounded by `// ---------- Title ----------` comment headers) rather than 34 manual Read+Edit round trips — much faster and less error-prone at this scale, verified with `node --check` for JS syntax validity and full Playwright pass afterward either way.

Committed and pushed to `Abhinai20/abhinai20.github.io`.

## Critical fidelity bug fix — 2026-08-28 (model upgraded 77M -> 248M)

User reported the paraphraser "didn't even rephrase correctly in any modes" and — the important part — that it **dropped the dollar figure** from a cost-estimate sentence ("approximately USD 10/month" vanished entirely from the output). Reproduced and confirmed: this was a real information-fidelity failure, not a wording nitpick.

**Root cause**: stress-tested the 77M model against longer, fact-heavy sentences (multiple numbers/percentages/dollar amounts in one sentence) — it silently dropped or garbled facts across all modes, and in one case actively misattributed numbers to the wrong metric (claimed "the error rate fell from 450ms to 90ms" when 450ms/90ms was actually the *other* clause's latency figures). This never showed up in earlier testing because those tests used short, single-fact sentences.

**Fix**: upgraded the model from `Xenova/LaMini-Flan-T5-77M` to `Xenova/LaMini-Flan-T5-248M`. Verified the larger model preserves every number correctly across a 90-combination stress test (15 modes × 6 sentences including the exact multi-fact sentences that broke the small model) — only 3 residual "failures," and those are defensible by design: "news" (headline style) and "persuasive" compressing out granular metrics the way a real headline/pitch would, not fidelity loss. Re-tested the exact bug-report sentence through the live UI — now correctly preserves both "USD 10/month" and "20 GB/month".

**Trade-off accepted**: model download grew from ~90MB to ~260MB (updated in the tool description and result placeholder text, plus the code comment). Fidelity matters more than download size for a tool whose entire purpose is preserving meaning.

**User's separate question — "can I use this for timesheet rephrasing/summarizing/expanding?"**: yes, already feasible with the existing modes — Standard/Fluency for rephrasing, Shorten for summaries. "Expand" is the weak point: tested 4 different prompt phrasings and found small models can't reliably add *genuinely relevant* new detail — safer phrasings barely change the input, more assertive ones invent generic filler (e.g. turned a $120/month server spec into a paragraph of "high-performance, reliable, efficient" filler while dropping the $120 itself). Shipped the version that elaborates naturally on short task-log-style lines (the closest match to real timesheet entries) and added a visible caution in the tool description: "Expand and Creative modes can add generic-sounding phrasing that wasn't in your original text — always review the output before using it somewhere that needs to be strictly accurate (e.g. a timesheet or status report)." This is an honest disclosure of a real limitation, not a fixable bug — don't over-promise Expand mode's reliability in future copy changes.

**Immediate follow-up — "except expand all are wrong"**: investigated by testing the exact same sentence directly against the live model and separately through the real deployed UI — both came back completely correct across all 14 non-Expand modes (facts preserved, coherent output, 28/28 Playwright assertions passing). The actual deployed code was fine.

**Real root cause found**: `index.html` was still loading `assets/app.js?v=2` and `assets/style.css?v=2` — the cache-busting query string had not been bumped since early in this session, despite dozens of subsequent edits to `app.js` across many commits (including the model upgrade and every paraphraser prompt fix). GitHub Pages serves static assets with `Cache-Control: max-age=600`, and depending on when the user's browser last fetched the file, they could easily have been running a stale, several-commits-old copy of the paraphraser logic — possibly even from before the model upgrade. **Fixed by bumping to `?v=3`.**

**Standing lesson, easy to forget**: whenever `app.js` or `style.css` changes, bump the `?v=` query string in `index.html` in the same commit. This exact class of bug (stale cached JS/CSS) has now bitten this project twice — once for a layout issue early on, and now for the paraphraser. Make bumping the version part of the standard "ship this change" checklist for this site, not an afterthought.

## SEO fix — individual indexable pages per tool — 2026-08-28

User asked how to get more traffic; biggest lever identified: all 46 tools lived behind JS tab-switching on one URL (`index.html`), so nothing could rank in Google for tool-specific searches like "cidr calculator online" — the whole site was invisible to that kind of query. Fixed:

- Generated a real, standalone HTML page per tool at `devops-toolbox/tools/<toolid>.html` (45 pages — `yaml` stays covered by the homepage itself), each with a unique `<title>` and `<meta description>` pulled from that tool's own heading/description, and that tool's panel active by default (visible without needing JS to click anything).
- Converted every sidebar `.tab-btn` from a `<button>` into a real `<a href="tools/<id>.html">` (or `../index.html` from within `tools/`) so search engines can discover and crawl every tool page via real links, not just via a sitemap.
- For actual visitors with JS, click handling still intercepts (`preventDefault`) and does the same instant in-page panel switch as before — no behavior change for users, `history.pushState` keeps the URL bar in sync so links stay shareable/bookmarkable. Added a `popstate` handler (and a `history.replaceState` on load to seed the initial entry) so the back/forward buttons correctly restore the right tool.
- Added `sitemap.xml` (46 URLs) and `robots.txt` (references the sitemap) at the `devops-toolbox/` root — next step for the user is to submit `https://abhinai20.github.io/devops-toolbox/sitemap.xml` to Google Search Console to speed up indexing.
- Generation was scripted (Python), not hand-written per page — parses `index.html` once for nav/panel structure, then stamps out each tool page from a shared template with only title/meta/active-markers/asset-paths swapped. Rerunning it isn't set up as an automated build step; if new tools are added later, either rerun a similar script or manually create the new page following the same pattern as an existing one in `tools/`.
- Verified via Playwright: direct-loaded 5 sample tool pages and confirmed unique title/meta/default-active-panel on each with zero JS needed; confirmed all 46 sitemap URLs match generated files; confirmed clicking a sidebar link from `index.html` still does instant in-page switching (no full reload) while correctly updating the URL bar; confirmed back button restores the previous tool; regression-checked that all 46 tools still switch correctly; landed directly on a deep tool page (simulating a Google click-through) and confirmed the tool actually works and other tools (including Mermaid) still work after navigating away. 28 total assertions, 0 failures, 0 console errors, 0 broken requests.
- Cache-bust version bumped to `?v=6` across `index.html` and all 45 generated tool pages (each edit to `app.js`/`style.css` during this fix required a fresh bump — did this consistently in the same commit as the code change this time, per the standing lesson from the earlier stale-cache incident).

## Automatic sitemap resubmission wired in (2026-08-31)

Added by the sister-project session working on the two blogs, since this site's Search Console property was found already verified there. Unlike the blogs, this site has no scheduled publishing cadence — it's static, updated whenever a tool gets added/changed — so this runs on **push** instead of a schedule: `.github/workflows/resubmit-sitemap.yml` triggers on any push to `main` touching `devops-toolbox/**`, running `scripts/resubmit_sitemap.py` which pings Search Console's sitemap resubmit endpoint (a real, documented API — not the restricted Indexing API, which only covers JobPosting/BroadcastEvent content). Verified working end-to-end locally.

**Manual step needed**: add 3 GitHub Actions secrets to this repo (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) — see `credentials/api_keys.md` for the values. Same Google account/grant as the two blogs (shared refresh token, now scoped to cover both Blogger and Search Console).

## Monetization expansion — Recommended Resources page (2026-08-31)

This site had zero monetization beyond AdSense — no Amazon affiliate links at all, unlike the two blogs. Added `devops-toolbox/resources.html`: real, category-matched book/gear recommendations (AWS certs, Kubernetes, Terraform, Git, home-lab hardware) using the existing Amazon Associates tag `abhinaibondada-21`, genuinely tied to what the tools on this site are for — not a generic "best DevOps books" list.

- Linked from every single page's nav (all 45 tool pages + homepage) via a new "More" nav-group. **Important implementation detail**: the link deliberately uses a new CSS class `.nav-static-link`, NOT `.tab-btn` — giving it `.tab-btn` would have made `app.js`'s click handler intercept it and crash (`document.getElementById('panel-' + undefined)` since there's no matching tool panel for this page), breaking navigation entirely. `.nav-static-link` is a visual clone with no JS binding, so it's just a normal link (full page load, not the instant in-page switch other tools get).
- Batch-inserted via a small Python script (`add_resources_link.py`, run once from scratch, not kept in the repo) following this project's own established pattern for site-wide edits — same approach documented earlier in this file for tool removal/addition batches.
- Added to `sitemap.xml`. Bumped the CSS cache-bust version to `?v=8` site-wide per the project's own documented "always bump `?v=` when style.css changes" lesson (see the earlier stale-cache incident notes above).
- Verified live: HTTP 200, 8 affiliate links present with the correct tag, nav link confirmed on both a sample tool page and the homepage with correct relative paths (`../resources.html` vs `resources.html`), sitemap confirmed updated.
- Not yet run through the project's own Playwright verification pass (the standing practice for this codebase) — worth doing if touching this area again, to confirm no regression on the tab-switching JS across all 45 tool pages.

## AdSense status check across all 3 properties (2026-08-31)

All three sites (this one, abhinaibondada.blogspot.com, theclouddesk.blogspot.com) show approval status **"Getting ready"** in AdSense — still in review, not rejected. All three also showed **"Ads.txt status: Not found"** in the dashboard, which looked alarming since this exact issue was already fixed once on the sister blog. Investigated directly via curl: **all three ads.txt files are actually correct and live right now** (HTTP 200, correct publisher ID `pub-8946983522733896` on each). The dashboard's "Not found" is almost certainly a stale AdSense crawl — its own "Last updated" timestamps predate when each was actually fixed/verified. Nothing to fix on the ads.txt content itself; likely clears on Google's next periodic re-crawl (no way to force this, unlike Search Console's Request Indexing).

**Real bug found and fixed in the process**: this site (`abhinai20.github.io`) had no `robots.txt` at the actual domain root — only inside `/devops-toolbox/`, which crawlers don't recognize (robots.txt must be at the true root). Not a blocker (missing robots.txt just means "crawl everything," not blocked), but added a proper root `robots.txt` anyway, pointing at the devops-toolbox sitemap.

## AI Paraphraser replaced with Synonym Rephraser (2026-09-01)

User reported the paraphraser was "one of the worst, not working properly" even after the earlier mode trim (15 → 5). Investigated with a real Playwright test against the live site (not mocked) instead of guessing:

**Confirmed the real bug**: ran "standard" mode on the default demo sentence — input "Our team is currently investigating the **root** cause of the outage and will provide updates as soon as we have more information," output was identical except the word "root" was dropped. That's the entire rewrite, after a 260MB download and 90+ seconds of generation. Not a crash, just a tool that costs a lot and does almost nothing — matches the user's complaint exactly.

**Root cause**: this was the structural ceiling of the approach, not a fixable prompt bug — a 248M-parameter on-device model genuinely cannot do much better than near-identity rewrites on already-clean input, and this had already been the story through 3+ rounds of fixes in this file (77M → 248M upgrade, prompt rewording, sampling removed, 15 → 5 modes). Every fix treated a symptom; the model itself was the limit.

**User showed a QuillBot screenshot** of its synonym-slider feature (click a highlighted word → pick from a list of alternatives → swap in place) and asked to replicate that instead. This is a much better fit for a client-side-only tool than a neural rewrite:
- Instant — no model download, no generation wait
- Deterministic — real dictionary synonyms, never hallucinated or a near-no-op
- Gives the user direct control instead of a black-box rewrite

**Implementation** (`Abhinai20/abhinai20.github.io`, commit `1095181`):
- Removed the entire `@xenova/transformers` pipeline, the 248M model, and all mode-prompt logic from `assets/app.js`.
- New client-side tokenizer splits pasted text into words/non-words, marks content words (4+ letters, not a stopword) as clickable spans, renders them highlighted (`.syn-word` CSS).
- Clicking a word calls **api.datamuse.com** (free, no key, CORS-enabled) with just that single word (`?rel_syn=word`) and shows a popup of alternatives (`.syn-popup`/`.syn-option`); picking one swaps the word in place, preserving capitalization.
- **Privacy posture changed and disclosed**: the pasted text itself still never leaves the browser, but this is no longer a 100%-offline tool — the single clicked word is sent to Datamuse. Got explicit user sign-off before implementing (asked directly via AskUserQuestion) and updated the tool's on-page description, meta description, and JSON-LD to state this plainly rather than leaving the old "nothing is uploaded anywhere" claim in place.
- Renamed the tool "AI Paraphraser" → **"Synonym Rephraser"** everywhere: nav label (46 pages + `resources.html`), `<title>`, meta/OG/Twitter tags, JSON-LD `name`/`description`, panel H1. Ran a Python script across all 46 tool pages + `index.html` (same pattern as every prior batch edit in this file) since the block was byte-identical across all of them; verified zero stale references afterward (`grep -rl "AI Paraphraser"` clean except two nav-only files fixed by hand — `resources.html` and `index.html` had a different relative href prefix than the shared block pattern expected).
- Bumped cache-bust version to `?v=10` for both `style.css` and `app.js` across every page, per this project's own standing lesson about stale cached assets.
- **Verified with a real (non-mocked) Playwright test against the local file**: "Find Synonyms" correctly identifies clickable words (10 found on the demo sentence), clicking a word fetches and shows real synonyms (e.g. "team" → "squad", "team up"), selecting one swaps it in place correctly, Copy button doesn't throw, zero console/page errors.
- Tool count unchanged at 46 — this was a rewrite of an existing tool, not an addition/removal.

**Standing lesson for this tool specifically**: don't try to fix output quality with more prompt engineering or a bigger model next time something like this comes up — a small on-device model has a real ceiling, and this file already shows 3+ rounds of chasing that ceiling. If a future request wants genuinely QuillBot-level *rewrite* quality (not just synonym swapping), the honest options are a much bigger model (probably too large for a free client-side download) or a real backend API call, which breaks this site's "no signup, nothing leaves your browser" identity and needs new infrastructure — surface that tradeoff explicitly rather than attempting another prompt-tweak round.

## Same-day follow-up: auto-apply attempt failed, real backend added instead (2026-09-01)

Two more rounds happened the same day, in order:

**Round 1 — auto-apply synonyms, made things worse.** User correctly pointed out the click-only version wasn't how QuillBot actually works (it auto-rewrites immediately; clicking is refinement, not the primary mechanism) and that "no synonyms found for 'immedialtely'" (a typo) was a real gap. Fixed the typo issue with a spelling-correction fallback (Datamuse's `sp=` endpoint) and made "Find Synonyms" auto-apply the top synonym to every eligible word immediately. **Tested before shipping and it was genuinely broken**: input "This cant be discussed immedialtely, as it require different teams colloboration and help" came back as "This vernacular be discussed forthwith, as it compel distinct teams coaction and facilitate" — wrong verb conjugation ("it compel"), and "cant" (meant as "can't") got read as the unrelated real word "cant" (jargon/vernacular) since the tokenizer stripped the apostrophe. **This was caught locally before pushing** — never went live. Root cause: word-for-word synonym substitution with no grammar awareness structurally cannot produce correct sentences; this isn't a bug to patch, QuillBot itself doesn't work this way either.

**Round 2 — added a real backend, with explicit user sign-off on the tradeoff.** Presented the honest fork (bigger model / real API call / stay conservative-synonym-only) via `AskUserQuestion`; user chose the real backend. Built:

- **New repo folder `rephraser-worker/`** (Cloudflare Worker source, `src/index.js` + `wrangler.toml`) — proxies the full pasted text to Gemini (`gemini-3.5-flash-lite`, same model the blog automation uses) with a prompt to fix typos/grammar and rewrite naturally, returns just the rewritten text. No secret ever in this repo — the Worker reads `env.GEMINI_API_KEY` from a Cloudflare secret at runtime. Validated every code path locally first (`wrangler dev --local` + curl: empty body, invalid JSON, wrong method, CORS preflight, length cap, error path) before any deploy.
- **Deployment blocked for a while by a real Cloudflare outage**, then by `wrangler login`'s local OAuth callback repeatedly failing (`localhost` refusing the redirect even after a valid auth code came back — likely a local firewall/security-policy blocking the loopback listener, not anything WARP-related, which was checked and ruled out). Worked around entirely by switching to a Cloudflare **API token** instead of interactive login (`dash.cloudflare.com/profile/api-tokens` → "Edit Cloudflare Workers" template) — no loopback needed, worked on the first try. **Confirmed the token authenticates to the user's own personal Cloudflare account** (`abhinaibondada@gmail.com`), not the Minfy work AWS account that was flagged and explicitly avoided earlier in this same session.
- Deployed to `https://devops-toolbox-rephraser.abhinaibondada.workers.dev` (had to register the account's `workers.dev` subdomain first via a direct Cloudflare API call, since `wrangler deploy`'s own interactive prompt for this failed non-interactively — worked around with `PUT /accounts/{id}/workers/subdomain`). Real test through the live Worker: same problem sentence from Round 1 → *"This cannot be discussed immediately, as it requires collaboration and help from different teams"* — genuinely fluent, typo-corrected, comparable to the QuillBot screenshot the user provided.
- **Final architecture matches QuillBot's real two-layer design**: "Rephrase" calls the Worker for one fluent full-sentence rewrite (this is the part that needed a real model, not synonym substitution), then the rewritten sentence is tokenized and every eligible word stays clickable for the existing Datamuse-based single-word refinement layer, unchanged from the earlier version.
- **Privacy copy updated again** to be accurate: unlike every other tool on this site, the full pasted text now leaves the browser for this one tool (Worker → Gemini) — disclosed plainly in the tool description, meta tags, and JSON-LD, not just the "single word" framing from the click-only version.
- Bumped cache-bust to `?v=12` across all 47 pages (style.css + app.js), per the project's standing lesson.
- **Verified end-to-end via a real Playwright test against the live Worker** (not mocked): fluent rewrite returned, 8 clickable refinement words rendered, clicking one shows a real Datamuse popup, Copy button doesn't throw, empty-input validation still works, zero console/page errors.
- Committed and pushed (`b0add9b`) — confirmed via `git grep` that no secret value (Cloudflare token or Gemini key) exists anywhere in the repo or commit history before pushing.

**Standing lessons from this round**:
1. **Test locally before pushing, every time** — the broken auto-apply version was caught precisely because it was tested before committing, not after. Never ship a "should work" change to this tool without a real Playwright/curl check first, given its track record.
2. **This account's Cloudflare login is real, `abhinaibondada@gmail.com`** — an API token from `dash.cloudflare.com/profile/api-tokens` (Edit Cloudflare Workers template) is the reliable way in; interactive `wrangler login` had a persistent local OAuth callback failure on this machine, cause not fully diagnosed (WARP ruled out, likely local firewall/endpoint security) — don't re-attempt interactive login first if this comes up again, go straight to a token.
3. **`rephraser-worker/` deploy commands, for next time a change is needed**: `cd rephraser-worker && CLOUDFLARE_API_TOKEN=<token> npx wrangler deploy` (get a fresh token from the dashboard if the old one isn't saved anywhere retrievable — it was not written to disk anywhere in this repo or session, by design).

## Two more real bugs found and fixed the same day (2026-09-01)

**Bug 1 — stale privacy-disclosure text, never actually deployed.** After the backend rewrite shipped, the tool description still claimed "only the single word being looked up is sent" — false once the full text started going to the Worker/Gemini. Traced to an earlier Python replace script whose search string used a literal em-dash that didn't byte-match what was actually in the files; `str.replace()` silently no-ops on a non-match, and a *different* replacement in the same script succeeded, so the script printed "changed 46" even though this specific text was untouched — false confidence. Fixed by anchoring the replacement to HTML structure (a regex between known tags) instead of matching literal text containing special characters, and verifying the match count (46/46) before trusting it this time. **Lesson: when a batch-replace script reports success, verify the actual resulting content, not just the script's own change-count — a partial match inside a multi-replacement script can still report "success."**

**Bug 2 — sparse synonym coverage, "No other synonyms found" way too often.** The click-to-refine layer used Datamuse's `rel_syn` relation (strict WordNet synonym-set membership) — genuinely returns zero results for lots of ordinary words ("outage", "currently" both had none). Fixed by merging `rel_syn` with Datamuse's `ml=` (means-like, broader semantic-similarity) relation, `rel_syn` results ranked first when present. Verified across all 12 clickable words in a real rephrased sentence — 0/12 empty before the fix's confirmation test, all 12 returned real alternatives after. **Note: this merge was refined again the same day, see below — the initial version reintroduced a different quality problem.**

## Same-day round 3: mode selector, synonym-noise fix, layout fix, rename (2026-09-01)

**Synonym quality regression caught before it shipped further.** The Bug-2 fix above (merging `rel_syn` + raw `ml=`) fixed the empty-list problem but user then flagged the results themselves looked wrong for some words. Real cause: Datamuse's `ml=` relation returns both real synonyms AND merely co-occurring/associated words with no tag distinguishing them by default — e.g. "team" returned `squad, team up, coach, sled, yoke, pack, archery, staff`, where `sled`/`yoke`/`archery` come from a completely different, unrelated sense of "team" (a team of harnessed animals). Fixed properly by requesting Datamuse's `md=p` metadata, which tags genuine dictionary synonyms within `ml` results as `"syn"` — filtered to prefer `rel_syn` + `ml`'s syn-tagged results always, only falling back to the untagged/loosely-related results when a word has **zero** real synonyms at all (not "fewer than 4," which was tried first and still let noise through for words like "team" that only have 2 genuine synonyms — showing 2 accurate results beats padding to 8 with wrong ones). Verified: "team" now returns exactly `[squad, team up]`; words with no real synonyms (outage, investigating) still get a non-empty fallback list instead of nothing.

**Mode selector added back — but backed by the real Gemini rewrite this time, not the old dead-end on-device model.** User asked for a "diplomatic" mode and others. Added `mode` support to the Worker (6 modes: Standard, Fluency, Formal, Diplomatic, Simple, Shorten, each its own instruction layered onto the same base rewrite prompt) and the client-side mode-button row (reused the CSS from the original on-device-model version, which had been sitting unused in `style.css` since that whole approach was scrapped). Verified Diplomatic mode live against a deliberately blunt sentence ("your team messed up the deployment again") — genuinely softened output ("There appears to be an error... did not go as expected"), not just cosmetic. The universal Clear-button handler already resets any `.mode-btn-row` generically (a lesson from an earlier tool batch in this same file), so no extra wiring needed there.

**Copy-text button was overlapping its label.** The header row (`display:flex; justify-content:space-between`) had no `flex-wrap`/`gap`, and the label text was long enough to squeeze the button on narrower widths. Shortened the label and added `flex-wrap:wrap; gap:8px` plus `flex-shrink:0` on the button.

**Renamed "Synonym Rephraser" → "AI Rephraser"** (user request) — the old name undersold the tool now that it's a real full-sentence AI rewrite with synonym-level refinement on top, not just word-swapping. 97 replacements across 47 files (nav label, title, meta/OG/Twitter tags, JSON-LD, panel H1), verified zero stale references after.

All of the above verified together in one Playwright pass before pushing: modes render and apply correctly, Diplomatic output genuinely different from Standard, "team" synonym popup clean, Copy button no longer overlaps its label, Clear resets the mode row to Standard, zero console/page errors. Cache-bust bumped to `?v=14`.

## Round 4 same day: find/sed builders added, ARN/Token Estimator removed, QuillBot references dropped (2026-09-01, 46 tools)

**Added `find` and `sed` command builders** (user request; a third tool, `locate`, was requested then dropped again mid-build before generation finished — removed cleanly, zero leftover references). New "Shell & Files" nav category. Logic tested standalone in Node first (11 assertions covering flag combinations) before any DOM wiring, per this project's standing practice. New standalone pages generated by cloning `arn.html`'s structure and re-targeting the active panel/nav marker plus head metadata — caught a real bug in the process, the JSON-LD block's regex substitution silently failed to match (a multi-group regex spanning a newline), leaving stale metadata on both new pages; fixed with a verified plain-string anchor instead.

**Removed ARN Parser and Token Estimator** — user asked to review the tool list again against this project's own established bar ("does it meaningfully beat an existing CLI command?"). Presented both as candidates via `AskUserQuestion` (ARN: near-trivial to split by eye; Token Estimator: self-admittedly "a rough heuristic, not an exact tokenizer") — user confirmed both.

**A serious bug happened and was caught before it shipped — worth remembering in detail.** The first removal attempt used a DOTALL regex (`<!-- .*?ARN PARSER.*?--> ... </section>`) to strip each panel. This does NOT respect intermediate `-->` boundaries — non-greedy `.*?` just finds the *shortest span* satisfying the whole pattern, which can stretch across many real, unrelated HTML comments and panels if that's what "shortest" happens to require. Result: it matched from the *first* `<!--` comment anywhere in each file through the first `-->` following the *next* occurrence of "ARN PARSER" — deleting ~31,000 lines (nearly the entire site, including the JWT/Hash/Base64/chmod panels) across all 46 files, instead of ~150 lines for two small panels. **Caught via `git diff --stat` before committing** — "48 files changed, 33655 deletions" is an obviously wrong number for removing two ~17-line panels, which is exactly why checking the diff stat before every commit matters even when a script "reports success." Nothing had been committed yet, so `git checkout --` cleanly reverted all of it with zero data loss. Redid the removal safely: per-file dynamic boundary detection using plain substring markers (not regex), with explicit sanity checks before deleting anything (the extracted block must be under 30 lines AND must contain its own panel's id) plus a manual cross-file verification that the extracted block actually matched byte-for-byte in a second file before trusting it. Confirmed the final diff was ~36 lines/file (2 panels + 2 nav lines) before committing this time.

**Standing lesson, added to this file's existing "verify a batch script's actual output" rule**: DOTALL/non-greedy regex across HTML is genuinely dangerous for deletion — it can silently span way more than intended because `.` matches `-->` too, so nothing stops it at the "next" comment the way plain-string or line-anchored matching does. For any future panel/section removal in this codebase, use per-file dynamic marker-based line extraction (find start line, find end line, slice between them) with a sanity check on the resulting block size — never a DOTALL regex spanning from one HTML comment to another.

**Removed the "QuillBot" brand comparison** from the AI Rephraser's description (meta tags, JSON-LD, body copy) per user request — replaced with generic phrasing describing what the tool does rather than who it resembles. Checked the rest of the site for similar competitor-brand comparisons (Grammarly, JSONLint, regex101, jwt.io) — found none; this was the only one.

**`resources.html` had drifted out of sync** with every other page (still listed ARN/Token Estimator, was missing the "Shell & Files" category from earlier in this same session) — brought back in sync. This file isn't covered by the batch-edit scripts used for `index.html` + `tools/*.html` (different glob), worth remembering to include it explicitly next time a nav-wide change happens.

Deleted `arn.html`/`tokenestimator.html`, removed their `sitemap.xml` entries and all cross-links from other tools' Related Tools lists. Cache-bust bumped to `?v=17`. Full Playwright regression pass confirmed nav/tab counts correct, JWT/curl panels (adjacent to the removed ones) still work, find/sed builders still work, AI Rephraser modes and synonym refinement still work, zero real errors.

**Open question from the user, not yet acted on**: asked to review the tool list once more for other "very bad" tools beyond ARN/Token Estimator, without naming which ones. Proposed next-round candidates by the same bar (Color Converter, Hash Generator, Base64/URL Encode, Diff Viewer — all have a simple single CLI-command equivalent, similar to the two already removed) but did not cut anything further without explicit confirmation, consistent with this project's established practice of confirming before a content cut. Ask before removing more if picking this up again.

## Round 5 same day: second removal pass (2026-09-01, 42 tools)

User confirmed all four proposed candidates from the open question above via `AskUserQuestion`. Removed **Color Converter, Hash Generator, Base64/URL Encode, Diff Viewer** — each had a genuinely simple single CLI-command equivalent (base64, md5sum/sha256sum, urlencode one-liners, diff), same weakness as ARN Parser/Token Estimator.

**Used the safe method from the very start this time** — the per-file dynamic marker extraction + sanity-check approach documented after the previous round's near-catastrophic regex bug (block must be under ~35 lines, must contain its own panel id), and checked `git diff --stat` immediately after the panel-removal pass before doing anything further (81 lines/file for 46 files — exactly 4 panels + 4 nav lines, confirming no repeat of the earlier bug). No incidents this round.

Removed cross-links from other tools' Related Tools lists, `resources.html` nav (remembered to include it explicitly this time), `sitemap.xml` entries, and ~200 lines of JS (including the hand-written MD5 implementation and LCS diff algorithm from earlier batches — both genuinely solid engineering, just for tools that didn't clear the bar). Verified zero leftover references and valid JS syntax. Deleted `color.html`/`hash.html`/`base64.html`/`diff.html`. Cache-bust bumped to `?v=18`.

Full Playwright regression: nav no longer lists any of the four, tab count correct (42), five adjacent surviving tools (JWT, Regex, Timestamp, CIDR Overlap, Secret Scanner) all still work, zero real errors.

**Tool count history this session, for reference**: 46 → 48 (added find/sed builders) → 46 (removed ARN/Token Estimator) → 42 (removed Color/Hash/Base64/Diff) → 41 (removed JSON Formatter, see below). Current: **41 tools**.

## Round 6 same day: third removal pass, one more tool (2026-09-01, 41 tools)

User asked for another review without naming a specific tool ("remove unwanted ones if you feel it"). Re-reviewed all 42 with fresh eyes against the same bar. Most held up (the cron trio, CIDR/URL/HTTP group, and commit-message trio were all re-confirmed as genuinely distinct, not redundant). One clear candidate remained: **JSON Formatter** — `jq .`/`jq -c`/`jq -S` cover pretty-print/minify/sort-keys in one command, and `jq` is close to universally pre-installed specifically for this DevOps/Kubernetes audience, a stronger single-command case than anything else left. Removed it using the same safe method (verified 21 lines/file removed, matching one panel + one nav line, before proceeding further). Full regression: 4 adjacent JSON-family tools (JSON↔YAML, K8s Manifest Analyzer, XML↔JSON, JSON Schema Generator) all still work, zero errors.

**Separately answered a user question mid-task**: whether removing tools affects AdSense qualification or the site's ability to earn once traffic arrives. Answer: no impact — Auto ads is site-wide (not per-tool), so any surviving page with traffic serves ads regardless of which tools exist; if anything, cutting thin/low-value pages is mildly *positive* for the content-quality signal AdSense's review looks at. The only real gate to actual earnings is the still-pending site content review (see the "AdSense status check" section above), unrelated to any of today's tool changes.

## Root landing page redesigned (2026-09-01)

`index.html` at the repo root (the bare `abhinai20.github.io` domain) was badly stale — still described the original 4 tools from weeks ago instead of the current 41, and both blogs were buried as plain text links in the footer instead of real project cards. User asked to fix the content and then separately asked for a real visual upgrade ("attractive widgets", "change the color and UI").

**Content**: rewrote the toolbox card's copy to reflect current reality, elevated both blogs (The Cloud Desk, abhinaibondada.blogspot.com) to full project cards matching the toolbox's treatment, updated the meta description.

**Visual design**: gave the page a deliberate identity instead of the generic dark-navy-with-cyan-accent default — warm amber/copper terminal-glow palette (`--bg: #0d0f12`, `--accent: #f0a868`), explicitly chosen to avoid the generic AI-default look (purple gradients, acid-green-on-black). IBM Plex Mono (headings, labels, stat badges) paired with IBM Plex Sans (body) for a genuine engineer-terminal feel tied to the subject. Small deliberate touches: a blinking-cursor eyebrow (`~/abhinai20`), monospace file-path labels above each project card, a stat-badge row (41 tools / 2 blogs / 11+ years), considered hover states (lift + accent glow + arrow shift, not just a border-color swap), a GitHub icon in the footer instead of plain text. Committed to a single dark theme deliberately (a terminal aesthetic doesn't translate to light mode) rather than building both.

Verified via Playwright (3 cards render, correct hrefs/headings, zero console errors) and a full-page screenshot reviewed before shipping — this file isn't part of the shared `devops-toolbox/assets/app.js` system, it's a standalone page, so no cache-bust version bump was needed here.

## DevOps Toolbox visual redesign (2026-09-01)

Same request as the landing page redesign, applied to the actual toolbox site — user asked to make it more attractive with better color/UI and some widgets. This one is much higher-risk: one `assets/style.css` drives all 42 pages, with lots of functional components (buttons, diff-color legends, mode pills, the AI Rephraser's synonym-swap UI) that all had to keep working.

**Approach**: evolved the existing CSS custom-property token system rather than rewriting — same variable names throughout (`--bg`, `--accent`, `--border`, etc.), so zero HTML or JS structural changes were needed. Only risk was picking new color *values* that still read correctly everywhere they're used.

**Palette**: promoted the existing (previously secondary) `--teal` token to primary accent (`#4fd1c5`) instead of the old flat dusty-blue, deliberately checked against the Terraform Plan Formatter's semantic diff colors (green/red/yellow/orange) side by side to confirm no hue collision — a real risk since "accent color" and "this line was changed" both being warm/cool similar tones would be a genuine usability bug, not just aesthetics. Complements rather than matches the landing page's warm amber (sibling properties, related but distinct identity). Added `--bg-glow` and `--accent-glow` tokens, and used the latter to replace two spots that had the *old* accent hardcoded as a raw `rgba()` value instead of a token (would have gone stale/mismatched otherwise).

**Typography**: kept Inter + JetBrains Mono (already loaded via a `<link>` in all 42 pages' `<head>` — changing font families site-wide would have meant editing every single page just for a font link, not worth it) but pushed JetBrains Mono further into headings/logo/badges for a stronger technical identity, consistent with the landing page's mono-driven treatment.

**Widget**: a small pulsing-dot "41 tools" badge under the sidebar tagline, matching the landing page's stat-badge language. Batch-inserted into all 42 pages (byte-identical block), verified 42/42 matched before writing — same safe verify-before-trust pattern used throughout this session's batch edits.

**Verified before shipping**: Playwright + full screenshots on two different tool panels — YAML Validator (plain layout) and Terraform Plan Formatter specifically because it has the diff-color legend, to visually confirm the new accent doesn't get confused with the semantic create/destroy/update colors. Zero real errors, colors confirmed distinct and legible. Cache-bust bumped to `?v=20`.

## Real bug: "Recommended Resources" 404'd after SPA navigation (2026-09-01)

User hit a live 404 at `.../devops-toolbox/tools/resources.html`. Root cause: `.nav-static-link` (the Recommended Resources link, deliberately excluded from the SPA router's click interception since there's no matching tool panel for it) had a **relative** href. The router updates the address bar via `pushState` on every tab click without ever reloading the page — so after browsing a few tools in a row, the address bar shows a path deeper than where the physical document actually lives, and the browser resolves the static link's relative href against that faked address instead of reality.

This is the same *class* of bug as the already-documented "URL drift" fix (`progress.md`, 2026-08-28 SEO section) — but that fix only covers links the router intercepts (`.tab-btn`, `.related-tools a`); `.nav-static-link` was never brought under it, precisely because it's supposed to bypass the router entirely.

**Fixed** by making the href absolute (`/devops-toolbox/resources.html`) instead of relative — sidesteps address-bar drift entirely rather than extending the router to cover it, since a real full-page link doesn't need router logic at all.

**Standing lesson, worth remembering**: this bug was **undetectable by every `file://`-based Playwright test run this whole session** (and there were 20+) — `file://` silently blocks `pushState`, so the address bar never actually drifts locally, meaning any bug that depends on real drifted browser state can only be caught by testing against the live HTTPS site. Worth doing a live-site pushState/navigation check occasionally, not just local file tests, for anything touching the SPA router.

## Round 7: "Git & IDs" category removed entirely (2026-09-02, 41 → 34 tools)

User explicitly asked to remove the whole "Git & IDs" nav category, judging its 7 tools not good enough. Removed: UUID Inspector, Snowflake ID Decoder, Conventional Commit Generator, Commit Message Validator, Changelog Generator, BSON/ObjectId Decoder, Incident Timeline Builder.

Removed across all 42 pages (`index.html` + `tools/*.html` + `resources.html`), using the established safe per-file marker-extraction method (never a DOTALL regex spanning comments), with a sanity check (block size + own panel id) before each deletion, and a `git diff --stat` check after each stage:

1. The `<details class="nav-group">…Git &amp; IDs…</details>` wrapper (7 `<a class="tab-btn">` entries) — removed from all 42 pages, 421 deletions, ~10 lines/file, consistent.
2. The 7 tool `<section class="tool-panel">` blocks from every page. 6 of 7 removed cleanly via marker-pair extraction. The 7th (Incident Timeline Builder) failed the sanity check because its closing `</section>` was concatenated on the same line as the *next* tool's opening comment (`...</section>  <!-- K8S RESOURCE QUOTA CALCULATOR -->`) — the "next standalone comment line" heuristic skipped past it. Fixed with a targeted substring-based removal (find start marker → find nearest `</section>` → verify `panel-incidenttimeline` appears in between → splice), then cleaned up a leftover blank-line/indent artifact from the splice.
3. Cross-link check: no other surviving tool's "Related tools" list linked to any of the 7 (confirmed via repo-wide grep) — no cross-link cleanup needed.
4. Deleted the 7 standalone files (`tools/uuid.html`, `snowflake.html`, `conventionalcommit.html`, `commitvalidator.html`, `changelog.html`, `bsonid.html`, `incidenttimeline.html`).
5. Removed the 7 corresponding `<url>` entries from `sitemap.xml`.
6. Removed the 7 corresponding JS logic blocks from `assets/app.js` (marker-pair extraction again; one sanity-check false alarm — Conventional Commit's block uses `cc-` element IDs, not the string "conventionalcommit", so the hint substring needed adjusting, not the deletion range). Verified `node -c app.js` still parses.
7. Bumped cache-bust `?v=21` → `?v=22` across all pages (35 files referenced it).
8. Updated the "41 tools" badge/counts to "34" everywhere: both `devops-toolbox` nav badges (all 42 pages), and the root landing page's stat, meta description, and body copy.

**Verified** via Playwright against the local file build: nav no longer mentions "Git & IDs" or any of the 7 removed tools, badge reads 34, and two tools that were physically adjacent to removed panels in the source (SQL Formatter, K8s Resource Quota Calculator) still activate correctly on click — confirming the splice didn't corrupt neighboring panels. (One unrelated `pushState` console error is the known `file://`-protocol limitation, not a regression — see the 2026-09-01 "Recommended Resources 404" entry above.)

Net diff: 45 files changed, 141 insertions(+), 12723 deletions(-), 7 files deleted. Not yet committed/pushed as of writing this entry — see immediate next step below.

## How to resume

Open a Claude Code session with working directory `C:\Users\Minfy\Documents\GitHubRootSite` and say "resume the DevOps Toolbox work" — this file has the context needed.
