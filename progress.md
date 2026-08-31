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

## How to resume

Open a Claude Code session with working directory `C:\Users\Minfy\Documents\GitHubRootSite` and say "resume the DevOps Toolbox work" — this file has the context needed.
