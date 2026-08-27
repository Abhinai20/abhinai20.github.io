// ---------- Tab switching ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tool).classList.add('active');
  });
});
// (Categories default to open so every tool is always reachable in one
// click; each can still be individually collapsed via its <summary> to
// tidy up, but opening one never hides another.)

// ---------- Universal Clear buttons ----------
document.querySelectorAll('.clear-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById('panel-' + btn.dataset.clear);
    if (!panel) return;
    panel.querySelectorAll('textarea, input[type="text"], input[type="datetime-local"]').forEach((el) => {
      el.value = '';
    });
    panel.querySelectorAll('.result-box').forEach((box) => {
      box.className = box.className
        .split(' ')
        .filter((c) => c !== 'result-success' && c !== 'result-error')
        .concat('result-idle')
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .join(' ');
      box.textContent = 'Cleared.';
    });
  });
});

// ---------- YAML Validator ----------
document.getElementById('yaml-check-btn').addEventListener('click', () => {
  const input = document.getElementById('yaml-input').value;
  const resultEl = document.getElementById('yaml-result');

  if (!input.trim()) {
    resultEl.className = 'result-box result-idle';
    resultEl.textContent = 'Paste some YAML first.';
    return;
  }

  try {
    // Support multi-document YAML (---) separated files, common in k8s manifests
    const docs = jsyaml.loadAll(input);
    resultEl.className = 'result-box result-success';
    const docCount = docs.length;
    resultEl.textContent =
      `Valid YAML — ${docCount} document${docCount === 1 ? '' : 's'} parsed successfully.\n\n` +
      JSON.stringify(docs.length === 1 ? docs[0] : docs, null, 2);
  } catch (e) {
    resultEl.className = 'result-box result-error';
    let msg = e.message || String(e);
    // js-yaml errors already include line/column info in the message
    resultEl.textContent = 'Invalid YAML:\n\n' + msg;
  }
});

// ---------- Terraform Plan Formatter ----------
document.getElementById('tf-format-btn').addEventListener('click', () => {
  const input = document.getElementById('tf-input').value;
  const resultEl = document.getElementById('tf-result');

  if (!input.trim()) {
    resultEl.className = 'result-box result-idle tf-output';
    resultEl.textContent = 'Paste a terraform plan first.';
    return;
  }

  const lines = input.split('\n');
  const frag = document.createDocumentFragment();

  lines.forEach((line) => {
    const span = document.createElement('span');
    const trimmed = line.trimStart();

    if (trimmed.startsWith('-/+') || trimmed.startsWith('+/-')) {
      span.className = 'tf-line-replace';
    } else if (trimmed.startsWith('+')) {
      span.className = 'tf-line-add';
    } else if (trimmed.startsWith('-')) {
      span.className = 'tf-line-remove';
    } else if (trimmed.startsWith('~')) {
      span.className = 'tf-line-change';
    } else {
      span.className = 'tf-line-plain';
    }
    span.textContent = line + '\n';
    frag.appendChild(span);
  });

  resultEl.className = 'result-box result-success tf-output';
  resultEl.innerHTML = '';
  resultEl.appendChild(frag);
});

// ---------- Cron Explainer ----------
// Minimal, dependency-free 5-field cron parser (minute hour dom month dow).
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function describeField(field, unitSingular, names, offset) {
  offset = offset || 0;
  if (field === '*') return null; // "every" - contributes nothing to the sentence
  const parts = field.split(',').map((p) => p.trim());
  const described = parts.map((part) => {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const base = range === '*' ? `every ${step} ${unitSingular}(s)` : `every ${step} ${unitSingular}(s) starting at ${range}`;
      return base;
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-');
      const s = names ? names[(parseInt(start, 10) + offset) % names.length] : start;
      const e = names ? names[(parseInt(end, 10) + offset) % names.length] : end;
      return `${s} through ${e}`;
    }
    return names ? names[(parseInt(part, 10) + offset) % names.length] : part;
  });
  return described.join(', ');
}

function explainCron(expr) {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Expected 5 fields (minute hour day-of-month month day-of-week), got ${fields.length}. Example: "30 6 * * 1,4"`);
  }
  const [minute, hour, dom, month, dow] = fields;

  const isSimpleNumber = (f) => /^\d+$/.test(f);

  let timePart;
  if (minute === '*' && hour === '*') {
    timePart = 'every minute';
  } else if (isSimpleNumber(minute) && isSimpleNumber(hour)) {
    // The common, friendly case: a single fixed time - format as 12-hour clock.
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    timePart = `at ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  } else if (hour === '*') {
    const minDesc = describeField(minute, 'minute') || `minute ${minute}`;
    timePart = `at ${minDesc} of every hour`;
  } else {
    // Hour and/or minute is a list, range, or step (e.g. "9-17", "*/2") -
    // describe both in plain 24-hour terms rather than risk a wrong 12-hour
    // conversion on a range.
    const minDesc = isSimpleNumber(minute) ? `minute ${minute}` : (describeField(minute, 'minute') || 'minute 0');
    const hourDesc = describeField(hour, 'hour') || `hour ${hour}`;
    timePart = `at ${minDesc}, during hour(s) ${hourDesc} (24-hour clock)`;
  }

  const domDesc = describeField(dom, 'day');
  const monthDesc = describeField(month, 'month', MONTH_NAMES, -1);
  const dowDesc = describeField(dow, 'day', DOW_NAMES);

  let dayPart;
  if (!domDesc && !dowDesc) {
    dayPart = 'every day';
  } else if (dowDesc && !domDesc) {
    dayPart = `on ${dowDesc}`;
  } else if (domDesc && !dowDesc) {
    dayPart = `on day ${domDesc} of the month`;
  } else {
    dayPart = `on day ${domDesc} of the month AND on ${dowDesc}`;
  }

  let sentence = `Runs ${timePart}, ${dayPart}`;
  if (monthDesc) sentence += `, in ${monthDesc}`;
  return sentence + '.';
}

document.getElementById('cron-explain-btn').addEventListener('click', () => {
  const input = document.getElementById('cron-input').value;
  const resultEl = document.getElementById('cron-result');

  if (!input.trim()) {
    resultEl.className = 'result-box result-idle';
    resultEl.textContent = 'Enter a cron expression first.';
    return;
  }

  try {
    const explanation = explainCron(input);
    resultEl.className = 'result-box result-success';
    resultEl.textContent = explanation;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Could not parse: ' + e.message;
  }
});

// Explain the default example on load
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cron-explain-btn').click();
});

// ---------- Markdown to Word ----------
document.getElementById('md-convert-btn').addEventListener('click', () => {
  const input = document.getElementById('md-input').value;
  const previewEl = document.getElementById('md-preview');

  if (!input.trim()) {
    previewEl.className = 'result-box result-idle md-preview';
    previewEl.textContent = 'Paste some Markdown first.';
    return;
  }

  let bodyHtml;
  try {
    bodyHtml = marked.parse(input);
  } catch (e) {
    previewEl.className = 'result-box result-error';
    previewEl.textContent = 'Could not parse Markdown: ' + e.message;
    return;
  }

  previewEl.className = 'result-box result-success md-preview';
  previewEl.innerHTML = bodyHtml;

  // html-docx-js needs a full HTML document string, not just a fragment.
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${bodyHtml}</body></html>`;

  try {
    const converted = htmlDocx.asBlob(fullHtml);
    const url = URL.createObjectURL(converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) {
    previewEl.className = 'result-box result-error md-preview';
    previewEl.textContent = 'Preview generated, but the .docx download failed: ' + e.message;
  }
});

// ---------- Shared helpers ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseAsJsonOrYaml(text) {
  try {
    return { data: JSON.parse(text), from: 'json' };
  } catch (e) {
    try {
      return { data: jsyaml.load(text), from: 'yaml' };
    } catch (e2) {
      throw new Error('Could not parse as JSON or YAML: ' + e2.message);
    }
  }
}

// ---------- JSON <-> YAML ----------
document.getElementById('jy-to-yaml-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('jy-result');
  try {
    const { data } = parseAsJsonOrYaml(document.getElementById('jy-input').value);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = jsyaml.dump(data);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});
document.getElementById('jy-to-json-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('jy-result');
  try {
    const { data } = parseAsJsonOrYaml(document.getElementById('jy-input').value);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- JSON Formatter ----------
function sortKeysDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj && typeof obj === 'object') {
    const sorted = {};
    Object.keys(obj).sort().forEach((k) => { sorted[k] = sortKeysDeep(obj[k]); });
    return sorted;
  }
  return obj;
}
function jsonFmtAction(fn) {
  const resultEl = document.getElementById('jf-result');
  try {
    const data = JSON.parse(document.getElementById('jf-input').value);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = fn(data);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Invalid JSON: ' + e.message;
  }
}
document.getElementById('jf-pretty-btn').addEventListener('click', () => jsonFmtAction((d) => JSON.stringify(d, null, 2)));
document.getElementById('jf-minify-btn').addEventListener('click', () => jsonFmtAction((d) => JSON.stringify(d)));
document.getElementById('jf-sort-btn').addEventListener('click', () => jsonFmtAction((d) => JSON.stringify(sortKeysDeep(d), null, 2)));

// ---------- Terraform Resource Counter ----------
document.getElementById('tfc-count-btn').addEventListener('click', () => {
  const input = document.getElementById('tfc-input').value;
  const resultEl = document.getElementById('tfc-result');
  const re = /resource\s+"([^"]+)"\s+"([^"]+)"/g;
  const counts = {};
  let total = 0;
  let m;
  while ((m = re.exec(input)) !== null) {
    counts[m[1]] = (counts[m[1]] || 0) + 1;
    total++;
  }
  if (total === 0) {
    resultEl.className = 'result-box result-idle';
    resultEl.textContent = 'No resource blocks found. Expected format: resource "type" "name" { ... }';
    return;
  }
  const lines = Object.keys(counts).sort().map((k) => `${k}: ${counts[k]}`);
  lines.push('', `Total resources: ${total}`);
  resultEl.className = 'result-box result-success';
  resultEl.textContent = lines.join('\n');
});

// ---------- Kubernetes Manifest Analyzer ----------
function findContainers(obj, path, out) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => findContainers(item, `${path}[${i}]`, out));
    return;
  }
  for (const key of Object.keys(obj)) {
    if ((key === 'containers' || key === 'initContainers') && Array.isArray(obj[key])) {
      obj[key].forEach((c, i) => out.push({ container: c, path: `${path}.${key}[${i}]` }));
    } else {
      findContainers(obj[key], `${path}.${key}`, out);
    }
  }
}
document.getElementById('k8s-lint-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('k8s-result');
  let manifest;
  try {
    manifest = jsyaml.load(document.getElementById('k8s-input').value);
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Invalid YAML: ' + e.message;
    return;
  }
  if (!manifest || typeof manifest !== 'object') {
    resultEl.className = 'result-box result-idle';
    resultEl.textContent = 'Nothing to analyze.';
    return;
  }
  const findings = [];
  const containers = [];
  findContainers(manifest, '$', containers);

  if (manifest?.spec?.hostNetwork === true || manifest?.spec?.template?.spec?.hostNetwork === true) {
    findings.push('⚠️ hostNetwork is enabled — the pod shares the host\'s network namespace, a real security exposure.');
  }

  if (containers.length === 0) {
    findings.push('ℹ️ No containers found in this manifest (this analyzer looks for spec.containers or spec.template.spec.containers).');
  }

  containers.forEach(({ container: c, path }) => {
    const name = c.name || path;
    const image = c.image || '';
    if (!image) {
      findings.push(`⚠️ [${name}] No image specified.`);
    } else if (image.endsWith(':latest') || !image.includes(':')) {
      findings.push(`⚠️ [${name}] Image "${image}" uses (or defaults to) the :latest tag — deployments become non-reproducible. Pin a specific version or digest.`);
    }
    if (!c.resources || !c.resources.limits) {
      findings.push(`⚠️ [${name}] No resource limits set — this container can consume unbounded CPU/memory on the node.`);
    }
    if (!c.resources || !c.resources.requests) {
      findings.push(`ℹ️ [${name}] No resource requests set — the scheduler can't make good bin-packing decisions for this pod.`);
    }
    if (!c.livenessProbe) {
      findings.push(`ℹ️ [${name}] No livenessProbe — Kubernetes can't detect and restart this container if it hangs.`);
    }
    if (!c.readinessProbe) {
      findings.push(`ℹ️ [${name}] No readinessProbe — traffic may be sent to this container before it's actually ready.`);
    }
    const sc = c.securityContext || {};
    if (sc.privileged === true) {
      findings.push(`⚠️ [${name}] Container runs privileged=true — full access to the host, avoid unless absolutely required.`);
    }
    if (sc.runAsNonRoot !== true && sc.runAsUser !== undefined && sc.runAsUser !== 0) {
      // has explicit non-root user, fine - no finding
    } else if (sc.runAsNonRoot !== true) {
      findings.push(`ℹ️ [${name}] runAsNonRoot is not set to true — this container may run as root by default.`);
    }
  });

  if (findings.length === 0) {
    resultEl.className = 'result-box result-success';
    resultEl.textContent = 'No issues found by these checks. (This is a lightweight linter, not a substitute for a full policy engine like kube-linter or OPA Gatekeeper.)';
  } else {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = findings.join('\n\n');
  }
});

// ---------- Dockerfile Checker ----------
document.getElementById('docker-lint-btn').addEventListener('click', () => {
  const input = document.getElementById('docker-input').value;
  const resultEl = document.getElementById('docker-result');
  if (!input.trim()) {
    resultEl.className = 'result-box result-idle';
    resultEl.textContent = 'Paste a Dockerfile first.';
    return;
  }
  // Join line continuations (trailing backslash) before splitting into instructions
  const joined = input.replace(/\\\s*\n/g, ' ');
  const lines = joined.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

  const findings = [];
  let hasUser = false, hasHealthcheck = false, runCount = 0, fromCount = 0;

  lines.forEach((line) => {
    const upper = line.toUpperCase();
    if (upper.startsWith('FROM')) {
      fromCount++;
      const imageRef = line.split(/\s+/)[1] || '';
      if (imageRef.endsWith(':latest') || (!imageRef.includes(':') && !imageRef.includes('@'))) {
        findings.push(`⚠️ "${line}" — base image has no pinned tag (or uses :latest). Builds become non-reproducible over time.`);
      }
    }
    if (upper.startsWith('USER')) {
      hasUser = true;
      if (/^USER\s+root\b/i.test(line) || /^USER\s+0\b/.test(line)) {
        findings.push(`⚠️ "${line}" — explicitly runs as root.`);
      }
    }
    if (upper.startsWith('HEALTHCHECK')) hasHealthcheck = true;
    if (upper.startsWith('RUN')) {
      runCount++;
      if (/apt-get install/i.test(line) && !/--no-install-recommends/i.test(line)) {
        findings.push(`ℹ️ "${line}" — consider --no-install-recommends to keep the image smaller.`);
      }
      if (/apt-get install/i.test(line) && !/=/.test(line)) {
        findings.push(`ℹ️ "${line}" — package versions aren't pinned, so builds can silently pick up newer packages over time.`);
      }
    }
    if (upper.startsWith('ADD') && !/https?:\/\//i.test(line) && !/\.(tar|tgz|gz)\b/i.test(line)) {
      findings.push(`ℹ️ "${line}" — ADD is used for a plain local file/directory; COPY is preferred (ADD's extra behavior — URL fetch, auto-extract — isn't needed here).`);
    }
  });

  if (fromCount === 0) findings.unshift('⚠️ No FROM instruction found — is this a complete Dockerfile?');
  if (!hasUser) findings.push('⚠️ No USER instruction found — the container will run as root by default.');
  if (!hasHealthcheck) findings.push('ℹ️ No HEALTHCHECK instruction — orchestrators can\'t tell if the app inside is actually healthy, just that the process is running.');
  if (runCount > 4) findings.push(`ℹ️ ${runCount} separate RUN instructions — consider combining related ones with && to reduce the number of image layers.`);

  if (findings.length === 0) {
    resultEl.className = 'result-box result-success';
    resultEl.textContent = 'No issues found by these checks.';
  } else {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = findings.join('\n\n');
  }
});

// ---------- ARN Parser ----------
function parseArn(arn) {
  const parts = arn.trim().split(':');
  if (parts.length < 6 || parts[0] !== 'arn') {
    throw new Error('Not a valid ARN. Expected format: arn:partition:service:region:account-id:resource');
  }
  const [, partition, service, region, account] = parts;
  const resourcePart = parts.slice(5).join(':');
  let resourceType = null, resource = resourcePart;
  if (resourcePart.includes('/')) {
    const idx = resourcePart.indexOf('/');
    resourceType = resourcePart.slice(0, idx);
    resource = resourcePart.slice(idx + 1);
  } else if (resourcePart.includes(':')) {
    const idx = resourcePart.indexOf(':');
    resourceType = resourcePart.slice(0, idx);
    resource = resourcePart.slice(idx + 1);
  }
  return { partition, service, region, account, resourceType, resource };
}
document.getElementById('arn-parse-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('arn-result');
  try {
    const r = parseArn(document.getElementById('arn-input').value);
    const lines = [
      `Partition:      ${r.partition}`,
      `Service:        ${r.service}`,
      `Region:         ${r.region || '(none - global service)'}`,
      `Account ID:     ${r.account || '(none)'}`,
      `Resource Type:  ${r.resourceType || '(none)'}`,
      `Resource:       ${r.resource}`,
    ];
    resultEl.className = 'result-box result-success';
    resultEl.textContent = lines.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- JWT Decoder ----------
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
document.getElementById('jwt-decode-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('jwt-result');
  const token = document.getElementById('jwt-input').value.trim();
  const parts = token.split('.');
  if (parts.length < 2) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Not a valid JWT — expected 3 dot-separated parts (header.payload.signature).';
    return;
  }
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    let out = 'HEADER:\n' + JSON.stringify(header, null, 2) + '\n\nPAYLOAD:\n' + JSON.stringify(payload, null, 2);
    const dateFields = ['exp', 'iat', 'nbf'];
    const dateLines = dateFields.filter((f) => typeof payload[f] === 'number').map((f) => `  ${f}: ${new Date(payload[f] * 1000).toISOString()}`);
    if (dateLines.length) out += '\n\nTIMESTAMPS (decoded):\n' + dateLines.join('\n');
    if (payload.exp) {
      const msLeft = payload.exp * 1000 - Date.now();
      out += '\n\n' + (msLeft < 0 ? `Expired ${Math.round(-msLeft / 60000)} minute(s) ago.` : `Expires in ${Math.round(msLeft / 60000)} minute(s).`);
    }
    out += '\n\n(Signature not verified — this is a read-only decoder.)';
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = out;
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Could not decode: ' + e.message;
  }
});

// ---------- Regex Tester ----------
document.getElementById('regex-test-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('regex-result');
  const pattern = document.getElementById('regex-pattern').value;
  const flags = document.getElementById('regex-flags').value;
  const text = document.getElementById('regex-text').value;
  let re;
  try {
    re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Invalid regex: ' + e.message;
    return;
  }
  const matches = [...text.matchAll(re)];
  if (matches.length === 0) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'No matches.';
    return;
  }
  let html = '';
  let lastIndex = 0;
  matches.forEach((m) => {
    html += escapeHtml(text.slice(lastIndex, m.index));
    html += `<span class="regex-match">${escapeHtml(m[0])}</span>`;
    lastIndex = m.index + m[0].length;
  });
  html += escapeHtml(text.slice(lastIndex));
  const summary = matches.map((m, i) => {
    const groups = m.slice(1).filter((g) => g !== undefined);
    return `Match ${i + 1}: "${m[0]}" at index ${m.index}` + (groups.length ? ` — groups: ${JSON.stringify(groups)}` : '');
  }).join('\n');
  resultEl.className = 'result-box result-success';
  resultEl.innerHTML = `<div style="margin-bottom:12px; white-space:pre-wrap;">${html}</div><div style="white-space:pre-wrap; color:var(--text-muted); border-top:1px solid var(--border); padding-top:10px;">${escapeHtml(summary)}</div>`;
});

// ---------- Base64 / URL Encode ----------
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}
function base64ToUtf8(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
function b64Action(fn) {
  const resultEl = document.getElementById('b64-result');
  try {
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = fn(document.getElementById('b64-input').value);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Error: ' + e.message;
  }
}
document.getElementById('b64-encode-btn').addEventListener('click', () => b64Action(utf8ToBase64));
document.getElementById('b64-decode-btn').addEventListener('click', () => b64Action(base64ToUtf8));
document.getElementById('url-encode-btn').addEventListener('click', () => b64Action(encodeURIComponent));
document.getElementById('url-decode-btn').addEventListener('click', () => b64Action(decodeURIComponent));

// ---------- Hash Generator ----------
function md5(str) {
  function rotl(n, s) { return (n << s) | (n >>> (32 - s)); }
  function toHexLE(n) {
    const bytes = [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  const K = [];
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const bytes = new TextEncoder().encode(str);
  const bitLen = bytes.length * 8;
  const withOne = new Uint8Array(((bytes.length + 8) >> 6) * 64 + 64);
  withOne.set(bytes);
  withOne[bytes.length] = 0x80;
  const dv = new DataView(withOne.buffer);
  dv.setUint32(withOne.length - 8, bitLen >>> 0, true);
  dv.setUint32(withOne.length - 4, Math.floor(bitLen / 4294967296), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let chunkStart = 0; chunkStart < withOne.length; chunkStart += 64) {
    const M = [];
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(chunkStart + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}
async function sha(algo, str) {
  const bytes = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest(algo, bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
document.getElementById('hash-generate-btn').addEventListener('click', async () => {
  const resultEl = document.getElementById('hash-result');
  const input = document.getElementById('hash-input').value;
  try {
    const [sha1, sha256, sha512] = await Promise.all([sha('SHA-1', input), sha('SHA-256', input), sha('SHA-512', input)]);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = `MD5:    ${md5(input)}\nSHA-1:  ${sha1}\nSHA-256:${sha256}\nSHA-512:${sha512}`;
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Error: ' + e.message;
  }
});

// ---------- Diff Viewer ----------
function lineDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const n = oldLines.length, m = newLines.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldLines[i] === newLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) { result.push({ type: 'same', line: oldLines[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'removed', line: oldLines[i] }); i++; }
    else { result.push({ type: 'added', line: newLines[j] }); j++; }
  }
  while (i < n) { result.push({ type: 'removed', line: oldLines[i] }); i++; }
  while (j < m) { result.push({ type: 'added', line: newLines[j] }); j++; }
  return result;
}
document.getElementById('diff-compare-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('diff-result');
  const oldText = document.getElementById('diff-old').value;
  const newText = document.getElementById('diff-new').value;
  const diff = lineDiff(oldText, newText);
  const html = diff.map((d) => {
    const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
    const cls = d.type === 'added' ? 'diff-added' : d.type === 'removed' ? 'diff-removed' : 'diff-same';
    return `<span class="${cls}">${escapeHtml(prefix + d.line)}</span>`;
  }).join('\n');
  resultEl.className = 'result-box result-success tf-output';
  resultEl.innerHTML = html;
});

// ---------- Unix Timestamp Converter ----------
document.getElementById('ts-to-date-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('ts-result');
  const raw = document.getElementById('ts-unix').value.trim();
  const ts = Number(raw);
  if (!raw || Number.isNaN(ts)) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Enter a valid Unix timestamp (seconds).';
    return;
  }
  const d = new Date(ts * 1000);
  resultEl.className = 'result-box result-success';
  resultEl.textContent = `UTC:   ${d.toUTCString()}\nISO:   ${d.toISOString()}\nLocal: ${d.toString()}`;
});
document.getElementById('ts-to-unix-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('ts-result');
  const raw = document.getElementById('ts-date').value;
  if (!raw) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Pick a date/time first.';
    return;
  }
  const d = new Date(raw);
  resultEl.className = 'result-box result-success';
  resultEl.textContent = `Unix timestamp (seconds): ${Math.floor(d.getTime() / 1000)}\nUnix timestamp (ms):      ${d.getTime()}`;
});

// ---------- Timezone Converter ----------
const TIMEZONES = [
  ['UTC', 'UTC'],
  ['New York (ET)', 'America/New_York'],
  ['Los Angeles (PT)', 'America/Los_Angeles'],
  ['London (UK)', 'Europe/London'],
  ['India (IST)', 'Asia/Kolkata'],
  ['Tokyo (JST)', 'Asia/Tokyo'],
  ['Sydney (AEST/AEDT)', 'Australia/Sydney'],
];
document.getElementById('tz-convert-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('tz-result');
  const raw = document.getElementById('tz-datetime').value;
  if (!raw) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Pick a date/time first.';
    return;
  }
  const d = new Date(raw);
  const lines = TIMEZONES.map(([label, tz]) => {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, dateStyle: 'medium', timeStyle: 'short',
    }).format(d);
    return `${label.padEnd(20)} ${formatted}`;
  });
  resultEl.className = 'result-box result-success tf-output';
  resultEl.textContent = lines.join('\n');
});

// ---------- cURL -> Code ----------
function tokenizeShell(str) {
  const tokens = [];
  let current = '', inSingle = false, inDouble = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inSingle) {
      if (c === "'") inSingle = false;
      else current += c;
    } else if (inDouble) {
      if (c === '\\' && (str[i + 1] === '"' || str[i + 1] === '\\')) { current += str[i + 1]; i++; }
      else if (c === '"') inDouble = false;
      else current += c;
    } else if (c === "'") inSingle = true;
    else if (c === '"') inDouble = true;
    else if (/\s/.test(c)) { if (current) { tokens.push(current); current = ''; } }
    else current += c;
  }
  if (current) tokens.push(current);
  return tokens;
}
function parseCurl(cmd) {
  cmd = cmd.trim().replace(/^curl\s+/, '').replace(/\\\s*\n/g, ' ');
  const tokens = tokenizeShell(cmd);
  let url = null, method = null, headers = [], data = null, user = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '-X' || t === '--request') method = tokens[++i];
    else if (t === '-H' || t === '--header') headers.push(tokens[++i]);
    else if (t === '-d' || t === '--data' || t === '--data-raw') data = tokens[++i];
    else if (t === '-u' || t === '--user') user = tokens[++i];
    else if (t.startsWith('-')) { /* skip unrecognized flag */ }
    else url = t;
  }
  if (!method) method = data ? 'POST' : 'GET';
  return { url, method, headers, data, user };
}
function generateJs({ url, method, headers, data }) {
  const headerLines = headers.map((h) => {
    const idx = h.indexOf(':');
    return `    "${h.slice(0, idx).trim()}": "${h.slice(idx + 1).trim()}"`;
  }).join(',\n');
  return `fetch("${url}", {
  method: "${method}",
  headers: {
${headerLines || '    // no headers'}
  },${data ? `\n  body: ${JSON.stringify(data)},` : ''}
})
  .then((res) => res.json())
  .then((data) => console.log(data));`;
}
function generatePython({ url, method, headers, data }) {
  const headerDict = headers.length
    ? '{\n' + headers.map((h) => { const i = h.indexOf(':'); return `    "${h.slice(0, i).trim()}": "${h.slice(i + 1).trim()}"`; }).join(',\n') + '\n}'
    : 'None';
  return `import requests

response = requests.request(
    "${method}",
    "${url}",
    headers=${headerDict},${data ? `\n    data=${JSON.stringify(data)},` : ''}
)
print(response.json())`;
}
function generatePowerShell({ url, method, headers, data }) {
  const headerLines = headers.map((h) => { const i = h.indexOf(':'); return `    "${h.slice(0, i).trim()}" = "${h.slice(i + 1).trim()}"`; }).join('\n');
  return `Invoke-RestMethod -Uri "${url}" -Method ${method}${headers.length ? ` -Headers @{\n${headerLines}\n}` : ''}${data ? ` -Body '${data}'` : ''}`;
}
document.getElementById('curl-convert-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('curl-result');
  const input = document.getElementById('curl-input').value;
  if (!input.trim()) {
    resultEl.className = 'result-box result-idle tf-output';
    resultEl.textContent = 'Paste a curl command first.';
    return;
  }
  try {
    const parsed = parseCurl(input);
    if (!parsed.url) throw new Error('Could not find a URL in that command.');
    const out = `// JavaScript (fetch)\n${generateJs(parsed)}\n\n# Python (requests)\n${generatePython(parsed)}\n\n# PowerShell\n${generatePowerShell(parsed)}`;
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = out;
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Could not parse: ' + e.message;
  }
});

// ---------- CIDR Calculator ----------
function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IPv4 address: ' + ip);
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}
function cidrInfo(cidr) {
  const [ip, prefixStr] = cidr.trim().split('/');
  const prefix = Number(prefixStr);
  if (!ip || Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Expected format: IP/prefix, e.g. 10.0.0.0/24');
  }
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  let firstUsable, lastUsable, usableCount;
  if (prefix === 32) { firstUsable = network; lastUsable = network; usableCount = 1; }
  else if (prefix === 31) { firstUsable = network; lastUsable = broadcast; usableCount = 2; }
  else { firstUsable = (network + 1) >>> 0; lastUsable = (broadcast - 1) >>> 0; usableCount = total - 2; }
  return {
    network: intToIp(network), broadcast: intToIp(broadcast), mask: intToIp(mask),
    total, usableCount, firstUsable: intToIp(firstUsable), lastUsable: intToIp(lastUsable), prefix,
  };
}
document.getElementById('cidr-calc-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('cidr-result');
  try {
    const r = cidrInfo(document.getElementById('cidr-input').value);
    const lines = [
      `Network address:    ${r.network}/${r.prefix}`,
      `Subnet mask:        ${r.mask}`,
      `Broadcast address:  ${r.broadcast}`,
      `Total addresses:    ${r.total.toLocaleString()}`,
      `Usable hosts:       ${r.usableCount.toLocaleString()}`,
      `First usable IP:    ${r.firstUsable}`,
      `Last usable IP:     ${r.lastUsable}`,
    ];
    if (r.prefix >= 31) lines.push('', '(Note: /31 and /32 have no distinct network/broadcast address by the usual convention — RFC 3021 point-to-point and host routes.)');
    resultEl.className = 'result-box result-success';
    resultEl.textContent = lines.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});
