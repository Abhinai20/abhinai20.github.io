// Cloudflare Worker backing the "Synonym Rephraser" tool on DevOps Toolbox
// (https://abhinai20.github.io/devops-toolbox/tools/paraphraser.html).
//
// Why this exists: GitHub Pages (where the toolbox lives) is static-only —
// it can't run server code or hold a secret. A real paraphrase (fluent,
// grammatical, typo-fixing, like QuillBot) needs a real generative model,
// and calling that model's API directly from the browser would expose the
// API key to anyone who opens dev tools. This Worker is the minimal proxy:
// it holds the Gemini API key as a Cloudflare secret (never in this file,
// never in the public devops-toolbox repo), accepts the pasted text from
// the browser, calls Gemini server-side, and returns just the rewritten
// text. The full pasted text IS sent here and on to Gemini — this is a
// real, disclosed change from the rest of the site's "nothing ever leaves
// your browser" claim, scoped to this one tool.

const ALLOWED_ORIGIN = '*'; // open CORS: no secrets or user accounts involved, only rewritten text
const MAX_INPUT_CHARS = 2000; // keeps latency/cost bounded on an unauthenticated public endpoint
const GEMINI_MODEL = 'gemini-3.5-flash-lite'; // same model already used by this account's blog automation

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// Mode-specific instructions layered onto the same base rewrite task.
// "standard" is deliberately the least aggressive - the other modes lean
// harder into their specific angle, since a user picking a named mode
// wants to see it actually reflected in the output.
const MODE_INSTRUCTIONS = {
  standard: 'Rewrite it so it reads naturally and fluently.',
  fluency: 'Rewrite it to flow smoothly and read naturally, smoothing over any awkward phrasing.',
  formal: 'Rewrite it in a more formal, professional register - no contractions, no casual phrasing.',
  diplomatic: 'Rewrite it more diplomatically and tactfully - soften any blunt, confrontational, or negative phrasing while keeping the actual meaning intact.',
  simple: 'Rewrite it in simple, plain language - short sentences, common words, easy to read quickly.',
  shorten: 'Rewrite it to be noticeably shorter while keeping every key point.',
};

function buildPrompt(text, mode) {
  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.standard;
  return `Rewrite the following text. ${instruction} Fix any spelling or grammar mistakes. Keep the original meaning - do not add new facts, opinions, or filler${mode === 'shorten' ? '' : ', and keep roughly the same length'}. Respond with ONLY the rewritten text - no quotes, no preamble, no explanation.

Text: ${text}`;
}

async function callGemini(apiKey, text, mode) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: buildPrompt(text, mode) }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Gemini API error ${resp.status}: ${errText.slice(0, 300)}`);
  }
  const data = await resp.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini returned no usable content');
  let out = raw.trim();
  if (/^".*"$/.test(out)) out = out.slice(1, -1).trim();
  return out;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Only POST is supported.' }, 405);
    }
    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Server misconfigured: missing API key.' }, 500);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Request body must be JSON.' }, 400);
    }

    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    if (!text) return jsonResponse({ error: 'No text provided.' }, 400);
    if (text.length > MAX_INPUT_CHARS) {
      return jsonResponse({ error: `Text too long — max ${MAX_INPUT_CHARS} characters.` }, 400);
    }
    const mode = typeof payload.mode === 'string' && MODE_INSTRUCTIONS[payload.mode] ? payload.mode : 'standard';

    try {
      const rewritten = await callGemini(env.GEMINI_API_KEY, text, mode);
      return jsonResponse({ rewritten });
    } catch (err) {
      return jsonResponse({ error: 'Could not generate a rewrite. Please try again.' }, 502);
    }
  },
};
