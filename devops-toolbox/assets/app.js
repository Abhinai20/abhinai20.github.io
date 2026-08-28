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
    panel.querySelectorAll('select').forEach((el) => { el.selectedIndex = 0; });
    panel.querySelectorAll('input[type="checkbox"]').forEach((el) => { el.checked = false; });
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

// ---------- Kubernetes Quantity Converter ----------
function parseK8sQuantity(q) {
  q = q.trim();
  const m = q.match(/^(-?\d+(?:\.\d+)?)([EPTGMK]i|[munkKMGTPE]?)$/);
  if (!m) throw new Error('Invalid quantity. Expected formats like 500m, 1Gi, 250Mi, or a plain number.');
  const num = parseFloat(m[1]);
  const suf = m[2];
  const binary = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, Ti: 2 ** 40, Pi: 2 ** 50, Ei: 2 ** 60 };
  const decimal = { n: 1e-9, u: 1e-6, m: 1e-3, '': 1, k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
  const value = binary[suf] !== undefined ? num * binary[suf] : num * decimal[suf];
  return { value };
}
function formatBytes(bytes) {
  const units = [['Ei', 2 ** 60], ['Pi', 2 ** 50], ['Ti', 2 ** 40], ['Gi', 2 ** 30], ['Mi', 2 ** 20], ['Ki', 2 ** 10]];
  for (const [label, size] of units) {
    if (Math.abs(bytes) >= size) return `${(bytes / size).toFixed(3).replace(/\.?0+$/, '')} ${label}B`;
  }
  return `${bytes} B`;
}
document.getElementById('k8sq-convert-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('k8sq-result');
  try {
    const raw = document.getElementById('k8sq-input').value.trim();
    if (!raw) throw new Error('Enter a quantity.');
    const { value } = parseK8sQuantity(raw);
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Raw value:       ${value.toLocaleString('en-US')}`,
      `As bytes/units:  ${formatBytes(value)}`,
      `As CPU cores:    ${value}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- chmod Calculator ----------
function symbolicToOctal(sym) {
  sym = sym.trim();
  if (sym.length !== 9 || !/^[rwxst-]{9}$/i.test(sym)) throw new Error('Expected 9 characters like rwxr-xr--.');
  let octal = '';
  for (let i = 0; i < 3; i++) {
    const chunk = sym.slice(i * 3, i * 3 + 3);
    let v = 0;
    if (chunk[0].toLowerCase() === 'r') v += 4;
    if (chunk[1].toLowerCase() === 'w') v += 2;
    if (chunk[2] !== '-') v += 1;
    octal += v;
  }
  return octal;
}
function octalToSymbolic(oct) {
  oct = oct.trim();
  if (!/^[0-7]{3,4}$/.test(oct)) throw new Error('Expected 3 or 4 octal digits, e.g. 754.');
  const digits = oct.length === 4 ? oct.slice(1) : oct;
  const map = { 0: '---', 1: '--x', 2: '-w-', 3: '-wx', 4: 'r--', 5: 'r-x', 6: 'rw-', 7: 'rwx' };
  return digits.split('').map((d) => map[d]).join('');
}
document.getElementById('chmod-to-octal-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('chmod-result');
  try {
    const sym = document.getElementById('chmod-symbolic').value;
    if (!sym.trim()) throw new Error('Enter a symbolic permission string.');
    const octal = symbolicToOctal(sym);
    document.getElementById('chmod-octal').value = octal;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = `${sym.trim()} = ${octal}\nchmod ${octal} file`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});
document.getElementById('chmod-to-symbolic-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('chmod-result');
  try {
    const oct = document.getElementById('chmod-octal').value;
    if (!oct.trim()) throw new Error('Enter an octal permission value.');
    const sym = octalToSymbolic(oct);
    document.getElementById('chmod-symbolic').value = sym;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = `${oct.trim()} = ${sym}\nchmod ${oct.trim()} file`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- XML Formatter & Validator ----------
function formatXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('Invalid XML: ' + errorNode.textContent.trim().split('\n')[0]);
  const serialized = new XMLSerializer().serializeToString(doc);
  const withBreaks = serialized.replace(/></g, '>\n<');
  const lines = withBreaks.split('\n');
  let depth = 0;
  const indented = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^<\/[^>]+>$/.test(trimmed)) depth = Math.max(0, depth - 1);
    indented.push('  '.repeat(depth) + trimmed);
    if (/^<[^/!?][^>]*[^/]>$/.test(trimmed) && !/^<[^>]+\/>$/.test(trimmed)) depth += 1;
  }
  return indented.join('\n');
}
document.getElementById('xml-format-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('xml-result');
  try {
    const input = document.getElementById('xml-input').value;
    if (!input.trim()) throw new Error('Paste some XML first.');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = formatXml(input);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- Color Converter ----------
function parseColorToRgb(input) {
  input = input.trim();
  let m = input.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  m = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  m = input.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (m) return hslToRgb(+m[1], +m[2], +m[3]);
  throw new Error('Unrecognized color format. Use hex (#3498db), rgb(52,152,219), or hsl(204,70%,53%).');
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
document.getElementById('color-convert-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('color-result');
  try {
    const input = document.getElementById('color-input').value;
    if (!input.trim()) throw new Error('Enter a color.');
    const { r, g, b } = parseColorToRgb(input);
    const hsl = rgbToHsl(r, g, b);
    resultEl.className = 'result-box result-success';
    resultEl.innerHTML =
      `<div style="width:100%;height:40px;border-radius:6px;margin-bottom:10px;background:${rgbToHex(r, g, b)};border:1px solid var(--border);"></div>` +
      `Hex:  ${rgbToHex(r, g, b)}\n` +
      `RGB:  rgb(${r}, ${g}, ${b})\n` +
      `HSL:  hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- CIDR Overlap Checker ----------
function cidrRange(cidr) {
  const [ip, prefixStr] = cidr.trim().split('/');
  const prefix = Number(prefixStr);
  if (!ip || Number.isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error('Invalid CIDR: ' + cidr);
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { network, broadcast, cidr: cidr.trim() };
}
function rangesOverlap(a, b) {
  return a.network <= b.broadcast && b.network <= a.broadcast;
}
document.getElementById('cidroverlap-check-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('cidroverlap-result');
  try {
    const lines = document.getElementById('cidroverlap-input').value.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error('Enter at least two CIDR blocks, one per line.');
    const ranges = lines.map(cidrRange);
    const overlaps = [];
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        if (rangesOverlap(ranges[i], ranges[j])) overlaps.push(`${ranges[i].cidr}  <->  ${ranges[j].cidr}`);
      }
    }
    resultEl.className = overlaps.length ? 'result-box result-error' : 'result-box result-success';
    resultEl.textContent = overlaps.length
      ? `Found ${overlaps.length} overlap(s):\n\n` + overlaps.join('\n')
      : `No overlaps found among ${ranges.length} CIDR blocks.`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- URL Analyzer ----------
document.getElementById('urlanalyzer-analyze-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('urlanalyzer-result');
  try {
    const raw = document.getElementById('urlanalyzer-input').value.trim();
    if (!raw) throw new Error('Enter a URL.');
    const url = new URL(raw);
    const lines = [
      `Protocol:   ${url.protocol}`,
      `Hostname:   ${url.hostname}`,
      `Port:       ${url.port || '(default)'}`,
      `Pathname:   ${url.pathname || '/'}`,
      `Search:     ${url.search || '(none)'}`,
      `Hash:       ${url.hash || '(none)'}`,
      `Username:   ${url.username || '(none)'}`,
      `Password:   ${url.password ? '(present)' : '(none)'}`,
      `Origin:     ${url.origin}`,
    ];
    if (url.search) {
      lines.push('', 'Query parameters:');
      for (const [k, v] of url.searchParams.entries()) lines.push(`  ${k} = ${v}`);
    }
    resultEl.className = 'result-box result-success';
    resultEl.textContent = lines.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Invalid URL: ' + e.message;
  }
});

// ---------- HTTP Status Explorer ----------
const HTTP_STATUSES = {
  200: ['OK', 'The request succeeded.'],
  201: ['Created', 'The request succeeded and a new resource was created.'],
  204: ['No Content', 'The request succeeded but there is no content to return.'],
  301: ['Moved Permanently', 'The resource has permanently moved to a new URL.'],
  302: ['Found', 'The resource temporarily resides at a different URL.'],
  304: ['Not Modified', 'The cached version is still valid; no need to re-download.'],
  400: ['Bad Request', 'The server could not understand the request due to invalid syntax.'],
  401: ['Unauthorized', 'Authentication is required and has failed or not been provided.'],
  403: ['Forbidden', 'The server understood the request but refuses to authorize it.'],
  404: ['Not Found', "The server can't find the requested resource."],
  405: ['Method Not Allowed', 'The request method is not supported for this resource.'],
  408: ['Request Timeout', 'The server timed out waiting for the request.'],
  409: ['Conflict', 'The request conflicts with the current state of the resource.'],
  413: ['Payload Too Large', 'The request body is larger than the server is willing to process.'],
  418: ["I'm a teapot", 'A joke status from RFC 2324 — the server refuses to brew coffee in a teapot.'],
  429: ['Too Many Requests', 'The user has sent too many requests in a given time ("rate limited").'],
  500: ['Internal Server Error', 'The server encountered an unexpected condition. Common causes: unhandled exceptions, misconfiguration.'],
  502: ['Bad Gateway', 'A gateway/proxy server got an invalid response from an upstream server. Common causes: upstream crashed, wrong upstream address, upstream still starting up.'],
  503: ['Service Unavailable', 'The server is not ready to handle the request. Common causes: overloaded, in maintenance, health check failing.'],
  504: ['Gateway Timeout', "A gateway/proxy server didn't get a response from the upstream server in time. Common causes: slow backend, network partition, deadlock."],
};
document.getElementById('httpstatus-lookup-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('httpstatus-result');
  try {
    const raw = document.getElementById('httpstatus-input').value.trim();
    const code = Number(raw);
    if (!raw || Number.isNaN(code) || code < 100 || code > 599) throw new Error('Enter a valid HTTP status code (100-599).');
    const known = HTTP_STATUSES[code];
    const category = code < 200 ? 'Informational' : code < 300 ? 'Success' : code < 400 ? 'Redirection' : code < 500 ? 'Client Error' : 'Server Error';
    resultEl.className = 'result-box result-success';
    resultEl.textContent = known
      ? `${code} ${known[0]}\nCategory: ${category}\n\n${known[1]}`
      : `${code}\nCategory: ${category}\n\nNo detailed description on file for this specific code, but it falls in the ${category} range.`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- UUID Inspector ----------
document.getElementById('uuid-inspect-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('uuid-result');
  try {
    const raw = document.getElementById('uuid-input').value.trim().toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(raw)) {
      throw new Error('Not a valid UUID. Expected format: 8-4-4-4-12 hex digits.');
    }
    const hex = raw.replace(/-/g, '');
    const version = parseInt(hex[12], 16);
    const variantNibble = parseInt(hex[16], 16);
    let variant = 'Unknown / reserved';
    if ((variantNibble & 0b1000) === 0) variant = 'NCS backward compatibility';
    else if ((variantNibble & 0b1100) === 0b1000) variant = 'RFC 4122 (standard)';
    else if ((variantNibble & 0b1110) === 0b1100) variant = 'Microsoft (legacy GUID)';
    const lines = [`Version:  ${version}`, `Variant:  ${variant}`];
    if (version === 1) {
      const timeLow = hex.slice(0, 8);
      const timeMid = hex.slice(8, 12);
      const timeHi = hex.slice(13, 16);
      const ts100ns = BigInt('0x' + timeHi + timeMid + timeLow);
      const GREGORIAN_OFFSET = 122192928000000000n;
      const unixMs = (ts100ns - GREGORIAN_OFFSET) / 10000n;
      lines.push(`Timestamp: ${new Date(Number(unixMs)).toISOString()} (embedded in v1 UUID)`);
    } else if (version === 7) {
      const ms = BigInt('0x' + hex.slice(0, 12));
      lines.push(`Timestamp: ${new Date(Number(ms)).toISOString()} (embedded in v7 UUID)`);
    } else {
      lines.push('Timestamp: (not embedded — only UUIDv1 and UUIDv7 carry a timestamp)');
    }
    resultEl.className = 'result-box result-success';
    resultEl.textContent = lines.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Snowflake ID Decoder ----------
document.getElementById('snowflake-decode-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('snowflake-result');
  try {
    const raw = document.getElementById('snowflake-input').value.trim();
    if (!/^\d+$/.test(raw)) throw new Error('Enter a numeric snowflake ID.');
    const platform = document.getElementById('snowflake-platform').value;
    const epoch = platform === 'discord' ? 1420070400000n : 1288834974657n;
    const idBig = BigInt(raw);
    const ms = (idBig >> 22n) + epoch;
    const workerOrShard = (idBig >> 17n) & 0x1Fn;
    const sequence = idBig & 0xFFFn;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Platform:   ${platform === 'discord' ? 'Discord' : 'Twitter/X'}`,
      `Timestamp:  ${new Date(Number(ms)).toISOString()}`,
      `Worker/machine bits: ${workerOrShard}`,
      `Sequence bits:       ${sequence}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Git Diff Statistics ----------
document.getElementById('gitdiff-stats-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('gitdiff-result');
  try {
    const input = document.getElementById('gitdiff-input').value;
    if (!input.trim()) throw new Error('Paste a unified diff first.');
    const lines = input.split('\n');
    const files = new Set();
    let added = 0, removed = 0;
    for (const line of lines) {
      const fileMatch = line.match(/^diff --git a\/(.+?) b\//) || line.match(/^\+\+\+ b\/(.+)/);
      if (fileMatch) files.add(fileMatch[1]);
      if (line.startsWith('+++') || line.startsWith('---')) continue;
      if (line.startsWith('+')) added++;
      else if (line.startsWith('-')) removed++;
    }
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Files changed:  ${files.size || '(unknown — no "diff --git" headers found)'}`,
      `Lines added:    +${added}`,
      `Lines removed:  -${removed}`,
      `Net change:     ${added - removed >= 0 ? '+' : ''}${added - removed}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Conventional Commit Generator ----------
document.getElementById('cc-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('cc-result');
  try {
    const type = document.getElementById('cc-type').value;
    const scope = document.getElementById('cc-scope').value.trim();
    const description = document.getElementById('cc-description').value.trim();
    const breaking = document.getElementById('cc-breaking').checked;
    if (!description) throw new Error('Enter a description.');
    const message = `${type}${scope ? `(${scope})` : ''}${breaking ? '!' : ''}: ${description}`;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = breaking ? `${message}\n\nBREAKING CHANGE: describe the breaking change here.` : message;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Branch Name Generator ----------
document.getElementById('branchname-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('branchname-result');
  try {
    const type = document.getElementById('branchname-type').value;
    const desc = document.getElementById('branchname-input').value.trim();
    if (!desc) throw new Error('Enter a description.');
    const slug = desc
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
      .replace(/-+$/, '');
    resultEl.className = 'result-box result-success';
    resultEl.textContent = `${type}/${slug}`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- SQL Formatter ----------
function formatSql(sql) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'AND', 'OR'];
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  let formatted = sql.replace(/\s+/g, ' ').trim();
  for (const kw of sorted) {
    const pattern = kw.split(' ').join('\\s+');
    const re = new RegExp('\\b' + pattern + '\\b', 'gi');
    formatted = formatted.replace(re, '\n' + kw);
  }
  return formatted.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
}
document.getElementById('sqlfmt-format-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('sqlfmt-result');
  try {
    const input = document.getElementById('sqlfmt-input').value;
    if (!input.trim()) throw new Error('Paste a SQL query first.');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = formatSql(input);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- XML <-> JSON Converter ----------
function xmlNodeToObj(node) {
  const children = Array.from(node.children);
  if (children.length === 0) return node.textContent;
  const obj = {};
  for (const child of children) {
    const val = xmlNodeToObj(child);
    if (obj[child.tagName] !== undefined) {
      if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
      obj[child.tagName].push(val);
    } else {
      obj[child.tagName] = val;
    }
  }
  return obj;
}
function jsonToXmlString(val, key) {
  if (Array.isArray(val)) return val.map((v) => jsonToXmlString(v, key)).join('');
  if (val !== null && typeof val === 'object') {
    return `<${key}>` + Object.entries(val).map(([k, v]) => jsonToXmlString(v, k)).join('') + `</${key}>`;
  }
  return `<${key}>${String(val)}</${key}>`;
}
document.getElementById('xmljson-to-json-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('xmljson-result');
  try {
    const input = document.getElementById('xmljson-input').value;
    if (!input.trim()) throw new Error('Paste some XML first.');
    const doc = new DOMParser().parseFromString(input, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error('Invalid XML: ' + errorNode.textContent.trim().split('\n')[0]);
    const obj = { [doc.documentElement.tagName]: xmlNodeToObj(doc.documentElement) };
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = JSON.stringify(obj, null, 2);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});
document.getElementById('xmljson-to-xml-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('xmljson-result');
  try {
    const input = document.getElementById('xmljson-input').value;
    if (!input.trim()) throw new Error('Paste some JSON first.');
    const parsed = JSON.parse(input);
    const keys = Object.keys(parsed);
    const xml = keys.length === 1
      ? jsonToXmlString(parsed[keys[0]], keys[0])
      : jsonToXmlString(parsed, 'root');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = formatXml(xml);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- JSON Schema Generator ----------
function inferSchema(value) {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) return { type: 'array', items: value.length ? inferSchema(value[0]) : {} };
  const t = typeof value;
  if (t === 'object') {
    const properties = {};
    for (const k of Object.keys(value)) properties[k] = inferSchema(value[k]);
    return { type: 'object', properties, required: Object.keys(value) };
  }
  if (t === 'number') return { type: Number.isInteger(value) ? 'integer' : 'number' };
  return { type: t };
}
document.getElementById('jsonschema-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('jsonschema-result');
  try {
    const input = document.getElementById('jsonschema-input').value;
    if (!input.trim()) throw new Error('Paste some sample JSON first.');
    const parsed = JSON.parse(input);
    const schema = { $schema: 'http://json-schema.org/draft-07/schema#', ...inferSchema(parsed) };
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = JSON.stringify(schema, null, 2);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Invalid JSON: ' + e.message;
  }
});

// ---------- Secret Scanner ----------
const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'GitHub Personal Access Token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g },
  { name: 'Generic API key/secret assignment', re: /\b(api[_-]?key|apikey|secret|token)\b\s*[:=]\s*['"][A-Za-z0-9\-_]{16,}['"]/gi },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z\-_]{35}\b/g },
];
document.getElementById('secretscanner-scan-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('secretscanner-result');
  try {
    const input = document.getElementById('secretscanner-input').value;
    if (!input.trim()) throw new Error('Paste some text to scan.');
    const findings = [];
    for (const p of SECRET_PATTERNS) {
      const matches = input.match(p.re);
      if (matches) findings.push(`${p.name}: ${matches.length} match(es)\n  ` + [...new Set(matches)].join('\n  '));
    }
    resultEl.className = findings.length ? 'result-box result-error' : 'result-box result-success';
    resultEl.textContent = findings.length
      ? `Found ${findings.length} potential secret pattern(s):\n\n` + findings.join('\n\n')
      : 'No known secret patterns detected. (This is a heuristic scan, not a guarantee — always double-check manually.)';
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- GraphQL Query Formatter ----------
function formatGraphql(query) {
  let depth = 0;
  let out = '';
  const compact = query.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < compact.length; i++) {
    const c = compact[i];
    if (c === '{') {
      out += ' {\n' + '  '.repeat(depth + 1);
      depth++;
    } else if (c === '}') {
      depth = Math.max(0, depth - 1);
      out += '\n' + '  '.repeat(depth) + '}';
    } else if (c === ' ' && (compact[i - 1] === '{' || compact[i - 1] === '}')) {
      // skip, handled above
    } else {
      out += c;
    }
  }
  return out.split('\n').map((l) => l.trimEnd()).join('\n').replace(/ \{\n/g, ' {\n');
}
document.getElementById('graphqlfmt-format-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('graphqlfmt-result');
  try {
    const input = document.getElementById('graphqlfmt-input').value;
    if (!input.trim()) throw new Error('Paste a GraphQL query first.');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = formatGraphql(input);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- ASCII Table Generator ----------
function generateAsciiTable(input) {
  const lines = input.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 1) throw new Error('Enter at least a header row.');
  const rows = lines.map((l) => l.split(',').map((c) => c.trim()));
  const colCount = rows[0].length;
  const widths = Array(colCount).fill(0);
  for (const row of rows) row.forEach((cell, i) => { widths[i] = Math.max(widths[i], (cell || '').length); });
  const sep = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
  const renderRow = (row) => '| ' + widths.map((w, i) => (row[i] || '').padEnd(w)).join(' | ') + ' |';
  const out = [sep, renderRow(rows[0]), sep];
  for (let i = 1; i < rows.length; i++) out.push(renderRow(rows[i]));
  out.push(sep);
  return out.join('\n');
}
document.getElementById('asciitable-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('asciitable-result');
  try {
    const input = document.getElementById('asciitable-input').value;
    if (!input.trim()) throw new Error('Paste CSV rows first.');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = generateAsciiTable(input);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- HTTP Header Parser ----------
document.getElementById('httpheader-parse-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('httpheader-result');
  try {
    const input = document.getElementById('httpheader-input').value;
    const lines = input.split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith('HTTP/'));
    if (!lines.length) throw new Error('Paste some headers first.');
    const parsed = [];
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) { parsed.push([line, '']); continue; }
      parsed.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
    }
    const maxKeyLen = Math.max(...parsed.map(([k]) => k.length));
    resultEl.className = 'result-box result-success';
    resultEl.textContent = parsed.map(([k, v]) => `${k.padEnd(maxKeyLen)}  =  ${v}`).join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- LLM Token Estimator ----------
document.getElementById('tokenestimator-estimate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('tokenestimator-result');
  try {
    const input = document.getElementById('tokenestimator-input').value;
    if (!input.trim()) throw new Error('Paste some text first.');
    const chars = input.length;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const estByChars = Math.ceil(chars / 4);
    const estByWords = Math.ceil(words * 1.3);
    const estimate = Math.round((estByChars + estByWords) / 2);
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Characters: ${chars.toLocaleString('en-US')}`,
      `Words:      ${words.toLocaleString('en-US')}`,
      ``,
      `Estimated tokens: ~${estimate.toLocaleString('en-US')}`,
      `(This is a rough heuristic, not an exact tokenizer — real results vary by model and language.)`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Cron Builder ----------
document.getElementById('cronbuilder-build-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('cronbuilder-result');
  try {
    const get = (id) => {
      const v = document.getElementById(id).value.trim();
      return v === '' ? '*' : v;
    };
    const minute = get('cronbuilder-minute');
    const hour = get('cronbuilder-hour');
    const dom = get('cronbuilder-dom');
    const month = get('cronbuilder-month');
    const dow = get('cronbuilder-dow');
    const validPart = /^(\*|\d+|\d+-\d+|\*\/\d+|\d+(,\d+)*)$/;
    for (const [label, v] of [['minute', minute], ['hour', hour], ['day of month', dom], ['month', month], ['day of week', dow]]) {
      if (!validPart.test(v)) throw new Error(`Invalid ${label} field: "${v}"`);
    }
    const expr = [minute, hour, dom, month, dow].join(' ');
    resultEl.className = 'result-box result-success';
    resultEl.textContent = expr;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Commit Message Validator ----------
function validateCommitMessage(msg) {
  const lines = msg.split('\n');
  const header = lines[0] || '';
  const re = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-z0-9_-]+\))?(!)?: .+$/;
  const issues = [];
  if (!header) issues.push('Message is empty.');
  if (header.length > 72) issues.push(`Header line is ${header.length} characters — conventionally kept to 72 or fewer.`);
  if (header && !re.test(header)) issues.push('Header doesn\'t match "type(scope): description" format (allowed types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert).');
  if (header.endsWith('.')) issues.push('Header should not end with a period.');
  return issues;
}
document.getElementById('commitvalidator-check-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('commitvalidator-result');
  try {
    const input = document.getElementById('commitvalidator-input').value;
    if (!input.trim()) throw new Error('Paste a commit message first.');
    const issues = validateCommitMessage(input);
    resultEl.className = issues.length ? 'result-box result-error' : 'result-box result-success';
    resultEl.textContent = issues.length
      ? `Not conventional — ${issues.length} issue(s):\n\n` + issues.map((i) => '- ' + i).join('\n')
      : 'Valid Conventional Commit message.';
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Changelog Generator ----------
document.getElementById('changelog-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('changelog-result');
  try {
    const input = document.getElementById('changelog-input').value;
    const lines = input.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Paste at least one commit message.');
    const groups = { feat: [], fix: [], docs: [], perf: [], refactor: [], other: [] };
    const labels = { feat: 'Features', fix: 'Bug Fixes', docs: 'Documentation', perf: 'Performance', refactor: 'Refactoring', other: 'Other Changes' };
    const re = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-z0-9_-]+\))?(!)?:\s*(.+)$/i;
    for (const line of lines) {
      const cleaned = line.replace(/^[a-f0-9]{7,40}\s+/i, '');
      const m = cleaned.match(re);
      if (m) {
        const type = m[1].toLowerCase();
        const scope = m[2] ? m[2].slice(1, -1) : '';
        const desc = m[4];
        const bucket = groups[type] ? type : 'other';
        groups[bucket].push(scope ? `**${scope}:** ${desc}` : desc);
      } else {
        groups.other.push(cleaned);
      }
    }
    const sections = [];
    for (const key of ['feat', 'fix', 'perf', 'refactor', 'docs', 'other']) {
      if (groups[key].length) sections.push(`### ${labels[key]}\n` + groups[key].map((d) => `- ${d}`).join('\n'));
    }
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = sections.join('\n\n') || 'No recognizable commit messages found.';
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- BSON/ObjectId Decoder ----------
document.getElementById('bsonid-decode-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('bsonid-result');
  try {
    const id = document.getElementById('bsonid-input').value.trim();
    if (!/^[0-9a-f]{24}$/i.test(id)) throw new Error('Expected a 24-character hex ObjectId.');
    const timestamp = parseInt(id.slice(0, 8), 16);
    const machineHex = id.slice(8, 14);
    const pid = parseInt(id.slice(14, 18), 16);
    const counter = parseInt(id.slice(18, 24), 16);
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Timestamp:        ${new Date(timestamp * 1000).toISOString()}`,
      `Machine ID (hex): ${machineHex}`,
      `Process ID:       ${pid}`,
      `Counter:          ${counter}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Helm Values Merger ----------
function deepMergeValues(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override)) {
    const ov = override[key];
    const bv = base[key];
    if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[key] = deepMergeValues(bv, ov);
    } else {
      out[key] = ov;
    }
  }
  return out;
}
document.getElementById('helmmerge-merge-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('helmmerge-result');
  try {
    const baseYaml = document.getElementById('helmmerge-base').value;
    const overrideYaml = document.getElementById('helmmerge-override').value;
    if (!baseYaml.trim() || !overrideYaml.trim()) throw new Error('Fill in both the base and override values files.');
    const base = jsyaml.load(baseYaml) || {};
    const override = jsyaml.load(overrideYaml) || {};
    const merged = deepMergeValues(base, override);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = jsyaml.dump(merged);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- K8s Label Selector Tester ----------
function parseLabelLines(text) {
  const labels = {};
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const idx = line.indexOf('=');
    if (idx === -1) throw new Error('Each label line must be key=value: ' + line);
    labels[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return labels;
}
function parseSelectorClauses(sel) {
  return sel.split(',').map((s) => s.trim()).filter(Boolean).map((clause) => {
    if (clause.includes('!=')) { const [k, v] = clause.split('!='); return { key: k.trim(), op: '!=', val: v.trim() }; }
    if (clause.includes('=')) { const [k, v] = clause.split('='); return { key: k.trim(), op: '=', val: v.trim() }; }
    return { key: clause.trim(), op: 'exists' };
  });
}
document.getElementById('labelselector-test-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('labelselector-result');
  try {
    const labels = parseLabelLines(document.getElementById('labelselector-labels').value);
    const exprRaw = document.getElementById('labelselector-expr').value.trim();
    if (!exprRaw) throw new Error('Enter a selector expression.');
    const clauses = parseSelectorClauses(exprRaw);
    const evaluated = clauses.map((c) => {
      let matched;
      if (c.op === 'exists') matched = Object.prototype.hasOwnProperty.call(labels, c.key);
      else if (c.op === '=') matched = labels[c.key] === c.val;
      else matched = labels[c.key] !== c.val;
      return { c, matched };
    });
    const allMatch = evaluated.every((e) => e.matched);
    const lines = evaluated.map(({ c, matched }) => {
      const desc = c.op === 'exists' ? c.key : `${c.key}${c.op}${c.val}`;
      return `${matched ? 'PASS' : 'FAIL'}  ${desc}`;
    });
    resultEl.className = allMatch ? 'result-box result-success' : 'result-box result-error';
    resultEl.textContent = (allMatch ? 'MATCH — all clauses satisfied\n\n' : 'NO MATCH\n\n') + lines.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Ingress Path Matcher ----------
function matchesIngressPath(requestPath, rulePath, pathType) {
  if (pathType === 'Exact') return requestPath === rulePath;
  if (pathType === 'Prefix') {
    if (rulePath === '/') return true;
    const normalizedRule = rulePath.endsWith('/') ? rulePath.slice(0, -1) : rulePath;
    return requestPath === normalizedRule || requestPath.startsWith(normalizedRule + '/');
  }
  if (pathType === 'ImplementationSpecific') {
    const escaped = rulePath.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$').test(requestPath);
  }
  return false;
}
document.getElementById('ingresspath-test-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('ingresspath-result');
  try {
    const requestPath = document.getElementById('ingresspath-request').value.trim();
    const rulePath = document.getElementById('ingresspath-rule').value.trim();
    const pathType = document.getElementById('ingresspath-type').value;
    if (!requestPath || !rulePath) throw new Error('Enter both a request path and a rule path.');
    const matched = matchesIngressPath(requestPath, rulePath, pathType);
    resultEl.className = matched ? 'result-box result-success' : 'result-box result-error';
    resultEl.textContent = matched
      ? `MATCH — "${requestPath}" satisfies ${pathType} rule "${rulePath}"`
      : `NO MATCH — "${requestPath}" does not satisfy ${pathType} rule "${rulePath}"`;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- JWT Expiration Checker ----------
function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=');
  return decodeURIComponent(atob(padded).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
}
document.getElementById('jwtexpiry-check-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('jwtexpiry-result');
  try {
    const token = document.getElementById('jwtexpiry-input').value.trim();
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Not a valid JWT (expected 3 dot-separated parts).');
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (!payload.exp) {
      resultEl.className = 'result-box result-idle';
      resultEl.textContent = 'This token has no "exp" claim — it does not expire.';
      return;
    }
    const expMs = payload.exp * 1000;
    const nowMs = Date.now();
    const isExpired = nowMs > expMs;
    const deltaSec = Math.abs(Math.round((expMs - nowMs) / 1000));
    const humanDelta = deltaSec < 60 ? `${deltaSec}s` : deltaSec < 3600 ? `${Math.round(deltaSec / 60)}m` : deltaSec < 86400 ? `${Math.round(deltaSec / 3600)}h` : `${Math.round(deltaSec / 86400)}d`;
    resultEl.className = isExpired ? 'result-box result-error' : 'result-box result-success';
    resultEl.textContent = [
      `Expires at: ${new Date(expMs).toISOString()}`,
      isExpired ? `Status: EXPIRED (${humanDelta} ago)` : `Status: Valid — expires in ${humanDelta}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- TLS Certificate Decoder ----------
function parseDer(bytes, offset) {
  const tag = bytes[offset];
  const lenByte = bytes[offset + 1];
  let lenOffset = offset + 2;
  let length;
  if (lenByte & 0x80) {
    const numBytes = lenByte & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) length = (length << 8) | bytes[lenOffset + i];
    lenOffset += numBytes;
  } else {
    length = lenByte;
  }
  const valueStart = lenOffset;
  const valueEnd = valueStart + length;
  const constructed = (tag & 0x20) !== 0;
  let children = null;
  if (constructed) {
    children = [];
    let p = valueStart;
    while (p < valueEnd) {
      const child = parseDer(bytes, p);
      children.push(child);
      p = child.end;
    }
  }
  return { tag, length, valueStart, valueEnd, children, end: valueEnd };
}
function oidToString(bytes, start, end) {
  const parts = [];
  const first = bytes[start];
  parts.push(Math.floor(first / 40), first % 40);
  let val = 0;
  for (let i = start + 1; i < end; i++) {
    val = (val << 7) | (bytes[i] & 0x7f);
    if (!(bytes[i] & 0x80)) { parts.push(val); val = 0; }
  }
  return parts.join('.');
}
const OID_NAMES = { '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST', '2.5.4.10': 'O', '2.5.4.11': 'OU' };
function parseX509Name(node, bytes) {
  const parts = [];
  for (const rdnSet of node.children) {
    for (const attrSeq of rdnSet.children) {
      const [oidNode, valNode] = attrSeq.children;
      const oid = oidToString(bytes, oidNode.valueStart, oidNode.valueEnd);
      const name = OID_NAMES[oid] || oid;
      const value = new TextDecoder('utf-8').decode(bytes.slice(valNode.valueStart, valNode.valueEnd));
      parts.push(`${name}=${value}`);
    }
  }
  return parts.join(', ');
}
function parseCertTime(bytes, start, end) {
  const str = String.fromCharCode(...bytes.slice(start, end));
  let m;
  if ((m = str.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/))) {
    let year = parseInt(m[1], 10);
    year += year < 50 ? 2000 : 1900;
    return new Date(Date.UTC(year, +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
  }
  if ((m = str.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/))) {
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
  }
  throw new Error('Unrecognized certificate time format.');
}
function certBytesToHex(bytes, start, end) {
  return Array.from(bytes.slice(start, end)).map((b) => b.toString(16).padStart(2, '0')).join(':');
}
function parseCertificatePem(pemStr) {
  const b64 = pemStr.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s+/g, '');
  if (!b64) throw new Error('No certificate data found. Expected a PEM block starting with -----BEGIN CERTIFICATE-----.');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const cert = parseDer(bytes, 0);
  const tbsCert = cert.children[0];
  const children = tbsCert.children;
  let ci = 0;
  if (children[ci].tag === 0xa0) ci++;
  const serialNode = children[ci++];
  ci++;
  const issuerNode = children[ci++];
  const validityNode = children[ci++];
  const subjectNode = children[ci++];
  const notBefore = parseCertTime(bytes, validityNode.children[0].valueStart, validityNode.children[0].valueEnd);
  const notAfter = parseCertTime(bytes, validityNode.children[1].valueStart, validityNode.children[1].valueEnd);
  return {
    serialNumber: certBytesToHex(bytes, serialNode.valueStart, serialNode.valueEnd),
    issuer: parseX509Name(issuerNode, bytes),
    subject: parseX509Name(subjectNode, bytes),
    notBefore,
    notAfter,
  };
}
document.getElementById('tlsdecoder-decode-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('tlsdecoder-result');
  try {
    const input = document.getElementById('tlsdecoder-input').value;
    if (!input.trim()) throw new Error('Paste a PEM certificate first.');
    const info = parseCertificatePem(input);
    const now = new Date();
    const isExpired = now > new Date(info.notAfter);
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = [
      `Subject:       ${info.subject}`,
      `Issuer:        ${info.issuer}`,
      `Serial Number: ${info.serialNumber}`,
      `Valid From:    ${info.notBefore}`,
      `Valid Until:   ${info.notAfter}`,
      `Status:        ${isExpired ? 'EXPIRED' : 'Valid (not expired)'}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Could not parse certificate: ' + e.message;
  }
});

// ---------- Sed Command Builder ----------
document.getElementById('sedbuilder-build-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('sedbuilder-result');
  try {
    const find = document.getElementById('sedbuilder-find').value;
    const replace = document.getElementById('sedbuilder-replace').value;
    const filename = document.getElementById('sedbuilder-filename').value.trim();
    const global = document.getElementById('sedbuilder-global').checked;
    const icase = document.getElementById('sedbuilder-icase').checked;
    if (!find) throw new Error('Enter a "find" pattern.');
    const escapedFind = find.replace(/\//g, '\\/');
    const escapedReplace = replace.replace(/\//g, '\\/');
    const flags = (global ? 'g' : '') + (icase ? 'i' : '');
    const expr = `s/${escapedFind}/${escapedReplace}/${flags}`;
    const cmd = filename ? `sed -i '${expr}' ${filename}` : `sed '${expr}'`;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = cmd;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- SQL Query Explainer ----------
function explainSqlQuery(sql) {
  const clauses = [];
  const patterns = [
    ['SELECT', /SELECT\s+(.+?)\s+FROM/is, (v) => `Selects these columns/expressions: ${v}`],
    ['FROM', /FROM\s+([^\s]+)/i, (v) => `From the table: ${v}`],
    ['WHERE', /WHERE\s+(.+?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/is, (v) => `Only rows where: ${v}`],
    ['GROUP BY', /GROUP BY\s+(.+?)(?:\s+ORDER BY|\s+LIMIT|$)/is, (v) => `Grouped by: ${v}`],
    ['ORDER BY', /ORDER BY\s+(.+?)(?:\s+LIMIT|$)/is, (v) => `Sorted by: ${v}`],
    ['LIMIT', /LIMIT\s+(\d+)/i, (v) => `Limited to ${v} row(s)`],
  ];
  for (const [label, re, describe] of patterns) {
    const m = sql.match(re);
    if (m) clauses.push(`${label}: ${describe(m[1].trim())}`);
  }
  return clauses;
}
document.getElementById('sqlexplainer-explain-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('sqlexplainer-result');
  try {
    const input = document.getElementById('sqlexplainer-input').value;
    if (!input.trim()) throw new Error('Paste a SQL query first.');
    const clauses = explainSqlQuery(input);
    resultEl.className = 'result-box result-success';
    resultEl.textContent = clauses.length ? clauses.join('\n\n') : 'Could not recognize any SQL clauses in this query.';
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- QR Code Generator ----------
document.getElementById('qrcode-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('qrcode-result');
  try {
    const input = document.getElementById('qrcode-input').value.trim();
    if (!input) throw new Error('Enter some text or a URL.');
    const qr = qrcode(0, 'M');
    qr.addData(input);
    qr.make();
    resultEl.className = 'result-box result-success';
    resultEl.innerHTML = qr.createSvgTag({ scalable: true });
    const svg = resultEl.querySelector('svg');
    if (svg) { svg.style.width = '220px'; svg.style.height = '220px'; svg.style.background = '#fff'; svg.style.borderRadius = '8px'; }
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Mermaid Diagram Preview ----------
if (window.mermaid) mermaid.initialize({ startOnLoad: false, theme: 'dark' });
document.getElementById('mermaid-render-btn').addEventListener('click', async () => {
  const resultEl = document.getElementById('mermaid-result');
  try {
    const input = document.getElementById('mermaid-input').value;
    if (!input.trim()) throw new Error('Paste some Mermaid syntax first.');
    const id = 'mermaid-svg-' + Date.now();
    const { svg } = await mermaid.render(id, input);
    resultEl.className = 'result-box result-success';
    resultEl.innerHTML = svg;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Could not render diagram: ' + (e.message || String(e));
  }
});

// ---------- Release Notes Generator ----------
document.getElementById('releasenotes-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('releasenotes-result');
  try {
    const version = document.getElementById('releasenotes-version').value.trim();
    const date = document.getElementById('releasenotes-date').value.trim();
    const lines = document.getElementById('releasenotes-input').value.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!version || !lines.length) throw new Error('Enter a version and at least one commit message.');
    const groups = { feat: [], fix: [], other: [] };
    const re = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-z0-9_-]+\))?(!)?:\s*(.+)$/i;
    for (const line of lines) {
      const m = line.match(re);
      if (m) {
        const type = m[1].toLowerCase();
        const bucket = type === 'feat' ? 'feat' : type === 'fix' ? 'fix' : 'other';
        groups[bucket].push(m[4]);
      } else {
        groups.other.push(line);
      }
    }
    let out = `## [${version}]${date ? ` - ${date}` : ''}\n\n`;
    if (groups.feat.length) out += '### Added\n' + groups.feat.map((d) => `- ${d}`).join('\n') + '\n\n';
    if (groups.fix.length) out += '### Fixed\n' + groups.fix.map((d) => `- ${d}`).join('\n') + '\n\n';
    if (groups.other.length) out += '### Changed\n' + groups.other.map((d) => `- ${d}`).join('\n') + '\n\n';
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = out.trim();
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- Incident Timeline Builder ----------
document.getElementById('incidenttimeline-build-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('incidenttimeline-result');
  try {
    const input = document.getElementById('incidenttimeline-input').value;
    const lines = input.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Paste at least one timestamped event.');
    const events = lines.map((line) => {
      const m = line.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?Z?)\s*[-:]?\s*(.*)$/) ||
        line.match(/^(\d{2}:\d{2}(:\d{2})?)\s*[-:]?\s*(.*)$/);
      if (!m) throw new Error('Could not parse a timestamp from line: ' + line);
      const tsStr = m[1];
      const desc = m[m.length - 1];
      const date = tsStr.length <= 8 ? new Date(`1970-01-01T${tsStr}Z`) : new Date(tsStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) throw new Error('Invalid timestamp: ' + tsStr);
      return { date, desc };
    });
    events.sort((a, b) => a.date - b.date);
    const out = events.map((ev, i) => {
      const delta = i === 0 ? '' : ` (+${Math.round((ev.date - events[i - 1].date) / 1000)}s)`;
      return `${ev.date.toISOString()}${delta}  —  ${ev.desc}`;
    });
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = out.join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- Log Timestamp Converter ----------
function parseLogTimestamp(str) {
  str = str.trim();
  let m = str.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/);
  if (m) return new Date(m[1].replace(' ', 'T'));
  m = str.match(/([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
  if (m) return new Date(`${m[1]} ${new Date().getFullYear()} UTC`);
  if (/^\d{10}$/.test(str)) return new Date(Number(str) * 1000);
  if (/^\d{13}$/.test(str)) return new Date(Number(str));
  throw new Error('Could not recognize a timestamp format in that input.');
}
document.getElementById('logtimestamp-convert-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('logtimestamp-result');
  try {
    const input = document.getElementById('logtimestamp-input').value.trim();
    if (!input) throw new Error('Enter a timestamp.');
    const date = parseLogTimestamp(input);
    if (isNaN(date.getTime())) throw new Error('Could not parse that as a valid date.');
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `ISO 8601:        ${date.toISOString()}`,
      `Unix (seconds):  ${Math.floor(date.getTime() / 1000)}`,
      `Unix (ms):       ${date.getTime()}`,
      `UTC string:      ${date.toUTCString()}`,
      `Local time:      ${date.toString()}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Rollout Budget Calculator ----------
function rolloutBudget({ replicas, maxSurge, maxUnavailable }) {
  const parsePct = (v, base) => {
    const s = String(v).trim();
    if (!s) throw new Error('Fill in all fields.');
    if (s.endsWith('%')) return Math.ceil((parseFloat(s) / 100) * base);
    const n = parseInt(s, 10);
    if (Number.isNaN(n)) throw new Error('Invalid value: ' + s);
    return n;
  };
  const surge = Math.max(0, parsePct(maxSurge, replicas));
  const unavail = Math.max(0, parsePct(maxUnavailable, replicas));
  return { surge, unavail, maxTotalPods: replicas + surge, minAvailablePods: Math.max(0, replicas - unavail) };
}
document.getElementById('rolloutbudget-calc-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('rolloutbudget-result');
  try {
    const replicas = parseInt(document.getElementById('rolloutbudget-replicas').value, 10);
    if (Number.isNaN(replicas) || replicas < 1) throw new Error('Enter a valid replica count.');
    const maxSurge = document.getElementById('rolloutbudget-surge').value;
    const maxUnavailable = document.getElementById('rolloutbudget-unavail').value;
    const { surge, unavail, maxTotalPods, minAvailablePods } = rolloutBudget({ replicas, maxSurge, maxUnavailable });
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `maxSurge resolves to:       ${surge} extra pod(s)`,
      `maxUnavailable resolves to: ${unavail} pod(s)`,
      ``,
      `During rollout, pod count may reach:  ${maxTotalPods} (${replicas} desired + ${surge} surge)`,
      `During rollout, available pods stay at least: ${minAvailablePods}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- K8s Resource Quota Calculator ----------
document.getElementById('resourcequota-calc-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('resourcequota-result');
  try {
    const lines = document.getElementById('resourcequota-input').value.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Paste at least one quantity.');
    let total = 0;
    for (const line of lines) total += parseK8sQuantity(line).value;
    resultEl.className = 'result-box result-success';
    resultEl.textContent = [
      `Sum of ${lines.length} value(s): ${total.toLocaleString('en-US')}`,
      `As bytes/units: ${formatBytes(total)}`,
      `As CPU cores/millicores: ${total}${total < 1 ? ` (${Math.round(total * 1000)}m)` : ''}`,
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Dockerfile Multi-Stage Visualizer ----------
function parseDockerStages(dockerfile) {
  const lines = dockerfile.split('\n');
  const stages = [];
  const edges = [];
  let stageIdx = 0;
  for (const line of lines) {
    const fromMatch = line.match(/^\s*FROM\s+(\S+)(?:\s+AS\s+(\S+))?/i);
    if (fromMatch) { stages.push({ base: fromMatch[1], name: fromMatch[2] || `stage${stageIdx}` }); stageIdx++; }
    const copyMatch = line.match(/^\s*COPY\s+--from=(\S+)/i);
    if (copyMatch) edges.push({ from: copyMatch[1], to: stages[stages.length - 1] ? stages[stages.length - 1].name : '?' });
  }
  return { stages, edges };
}
document.getElementById('dockerstages-visualize-btn').addEventListener('click', async () => {
  const resultEl = document.getElementById('dockerstages-result');
  try {
    const input = document.getElementById('dockerstages-input').value;
    if (!input.trim()) throw new Error('Paste a Dockerfile first.');
    const { stages, edges } = parseDockerStages(input);
    if (!stages.length) throw new Error('No FROM lines found.');
    let mermaidSrc = 'graph LR\n';
    stages.forEach((s) => { mermaidSrc += `  ${s.name}["${s.name}\\n(${s.base})"]\n`; });
    edges.forEach((e) => { mermaidSrc += `  ${e.from} --> ${e.to}\n`; });
    const { svg } = await mermaid.render('dockerstages-svg-' + Date.now(), mermaidSrc);
    resultEl.className = 'result-box result-success';
    resultEl.innerHTML = svg;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Could not visualize: ' + (e.message || String(e));
  }
});

// ---------- Docker Image Tag Comparator ----------
document.getElementById('tagcompare-compare-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('tagcompare-result');
  try {
    const a = document.getElementById('tagcompare-a').value.trim();
    const b = document.getElementById('tagcompare-b').value.trim();
    if (!a || !b) throw new Error('Enter both tags.');
    const semverRe = /^v?(\d+)\.(\d+)\.(\d+)/;
    const ma = a.match(semverRe), mb = b.match(semverRe);
    if (!ma || !mb) {
      resultEl.className = 'result-box result-idle';
      resultEl.textContent = `Cannot compare — at least one tag is not semantic-version-like: "${a}" vs "${b}"`;
      return;
    }
    let result = `${a} and ${b} are the same version`;
    for (let i = 1; i <= 3; i++) {
      const na = parseInt(ma[i], 10), nb = parseInt(mb[i], 10);
      if (na !== nb) { result = na > nb ? `${a} is newer than ${b}` : `${b} is newer than ${a}`; break; }
    }
    resultEl.className = 'result-box result-success';
    resultEl.textContent = result;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Terraform Variable Extractor ----------
function extractTfVariables(hcl) {
  const blocks = [];
  const re = /variable\s+"([^"]+)"\s*\{([^}]*)\}/gs;
  let m;
  while ((m = re.exec(hcl))) {
    const [, name, body] = m;
    const type = (body.match(/type\s*=\s*(\S+)/) || [])[1] || 'any';
    const def = (body.match(/default\s*=\s*(.+)/) || [])[1];
    const desc = (body.match(/description\s*=\s*"([^"]*)"/) || [])[1];
    blocks.push({ name, type, default: def ? def.trim() : undefined, description: desc });
  }
  return blocks;
}
document.getElementById('tfvars-extract-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('tfvars-result');
  try {
    const input = document.getElementById('tfvars-input').value;
    if (!input.trim()) throw new Error('Paste some Terraform HCL first.');
    const vars = extractTfVariables(input);
    if (!vars.length) throw new Error('No variable blocks found.');
    const lines = vars.map((v) => [
      `variable "${v.name}"`,
      `  type:        ${v.type}`,
      v.default !== undefined ? `  default:     ${v.default}` : `  default:     (required, no default)`,
      v.description ? `  description: ${v.description}` : null,
    ].filter(Boolean).join('\n'));
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = lines.join('\n\n');
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- Terraform Dependency Grapher ----------
function extractTfResources(hcl) {
  const resources = [];
  const re = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
  let m;
  const blocks = [];
  while ((m = re.exec(hcl))) blocks.push({ type: m[1], name: m[2], body: m[3], id: `${m[1]}.${m[2]}` });
  for (const block of blocks) {
    const refs = new Set();
    for (const other of blocks) {
      if (other.id === block.id) continue;
      const re2 = new RegExp('\\b' + other.id.replace('.', '\\.') + '\\b');
      if (re2.test(block.body)) refs.add(other.id);
    }
    resources.push({ id: block.id, refs: [...refs] });
  }
  return resources;
}
document.getElementById('tfgraph-visualize-btn').addEventListener('click', async () => {
  const resultEl = document.getElementById('tfgraph-result');
  try {
    const input = document.getElementById('tfgraph-input').value;
    if (!input.trim()) throw new Error('Paste some Terraform HCL first.');
    const resources = extractTfResources(input);
    if (!resources.length) throw new Error('No resource blocks found.');
    const safeId = (id) => id.replace(/[^a-zA-Z0-9_]/g, '_');
    let mermaidSrc = 'graph LR\n';
    resources.forEach((r) => { mermaidSrc += `  ${safeId(r.id)}["${r.id}"]\n`; });
    resources.forEach((r) => { r.refs.forEach((ref) => { mermaidSrc += `  ${safeId(r.id)} --> ${safeId(ref)}\n`; }); });
    const { svg } = await mermaid.render('tfgraph-svg-' + Date.now(), mermaidSrc);
    resultEl.className = 'result-box result-success';
    resultEl.innerHTML = svg;
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Could not visualize: ' + (e.message || String(e));
  }
});

// ---------- AWS IAM Policy Simulator ----------
function evaluateIamPolicy(policy, action, resource) {
  const statements = policy.Statement || [];
  const matches = (pattern, value) => {
    const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
    return re.test(value);
  };
  let decision = 'Deny (implicit — no matching statement)';
  const matchedStatements = [];
  for (const stmt of statements) {
    const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
    const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource];
    const actionMatches = actions.some((a) => matches(a, action));
    const resourceMatches = resources.some((r) => matches(r, resource));
    if (actionMatches && resourceMatches) {
      matchedStatements.push(stmt);
      if (stmt.Effect === 'Deny') return { decision: 'Deny (explicit)', matchedStatements: [stmt] };
      if (stmt.Effect === 'Allow') decision = 'Allow';
    }
  }
  return { decision, matchedStatements };
}
document.getElementById('iamsim-test-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('iamsim-result');
  try {
    const policyRaw = document.getElementById('iamsim-policy').value;
    const action = document.getElementById('iamsim-action').value.trim();
    const resource = document.getElementById('iamsim-resource').value.trim();
    if (!policyRaw.trim() || !action || !resource) throw new Error('Fill in the policy, action, and resource.');
    const policy = JSON.parse(policyRaw);
    const { decision, matchedStatements } = evaluateIamPolicy(policy, action, resource);
    resultEl.className = decision.startsWith('Allow') ? 'result-box result-success' : 'result-box result-error';
    resultEl.textContent = [
      `Decision: ${decision}`,
      ``,
      `Action:   ${action}`,
      `Resource: ${resource}`,
      ``,
      `Matched statement(s): ${matchedStatements.length}`,
      matchedStatements.length ? JSON.stringify(matchedStatements, null, 2) : '(none)',
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = 'Invalid policy JSON or input: ' + e.message;
  }
});

// ---------- REST Endpoint Mock Generator ----------
document.getElementById('restmock-generate-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('restmock-result');
  try {
    const method = document.getElementById('restmock-method').value;
    const path = document.getElementById('restmock-path').value.trim();
    const jsonRaw = document.getElementById('restmock-json').value;
    if (!path || !jsonRaw.trim()) throw new Error('Fill in a path and sample JSON.');
    const sample = JSON.parse(jsonRaw);
    const indented = JSON.stringify(sample, null, 2).split('\n').join('\n  ');
    const code = `const express = require('express');\nconst app = express();\n\napp.${method.toLowerCase()}('${path}', (req, res) => {\n  res.json(${indented});\n});\n\napp.listen(3000, () => console.log('Mock server running on http://localhost:3000'));`;
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = code;
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = 'Invalid JSON: ' + e.message;
  }
});

// ---------- Chat Prompt Formatter ----------
document.getElementById('promptfmt-format-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('promptfmt-result');
  try {
    const systemText = document.getElementById('promptfmt-system').value.trim();
    const userText = document.getElementById('promptfmt-user').value.trim();
    if (!systemText && !userText) throw new Error('Fill in at least one field.');
    const messages = [];
    if (systemText) messages.push({ role: 'system', content: systemText });
    if (userText) messages.push({ role: 'user', content: userText });
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = JSON.stringify({ messages }, null, 2);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- .env File Validator ----------
function parseEnvFile(text) {
  const lines = text.split('\n');
  const seen = {};
  const issues = [];
  const entries = [];
  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) { issues.push(`Line ${i + 1}: doesn't look like KEY=VALUE: "${line}"`); return; }
    const [, key, value] = m;
    if (seen[key]) issues.push(`Line ${i + 1}: duplicate key "${key}" (also defined on line ${seen[key]})`);
    seen[key] = i + 1;
    if (!value) issues.push(`Line ${i + 1}: "${key}" has an empty value`);
    entries.push({ key, value });
  });
  return { entries, issues };
}
document.getElementById('envparser-check-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('envparser-result');
  try {
    const input = document.getElementById('envparser-input').value;
    if (!input.trim()) throw new Error('Paste a .env file first.');
    const { entries, issues } = parseEnvFile(input);
    resultEl.className = issues.length ? 'result-box result-error' : 'result-box result-success';
    resultEl.textContent = [
      `${entries.length} key(s) found, ${issues.length} issue(s):`,
      '',
      ...(issues.length ? issues.map((i) => '- ' + i) : ['No issues found.']),
    ].join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});

// ---------- Nginx Config Formatter ----------
function formatNginxConfig(input) {
  const compact = input.replace(/\s+/g, ' ').trim();
  let depth = 0;
  const lines = [];
  let current = '';
  for (let i = 0; i < compact.length; i++) {
    const c = compact[i];
    if (c === '{') {
      lines.push('  '.repeat(depth) + current.trim() + ' {');
      current = '';
      depth++;
    } else if (c === '}') {
      if (current.trim()) lines.push('  '.repeat(depth) + current.trim());
      current = '';
      depth = Math.max(0, depth - 1);
      lines.push('  '.repeat(depth) + '}');
    } else if (c === ';') {
      lines.push('  '.repeat(depth) + current.trim() + ';');
      current = '';
    } else {
      current += c;
    }
  }
  return lines.filter((l) => l.trim()).join('\n');
}
document.getElementById('nginxfmt-format-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('nginxfmt-result');
  try {
    const input = document.getElementById('nginxfmt-input').value;
    if (!input.trim()) throw new Error('Paste an nginx config first.');
    resultEl.className = 'result-box result-success tf-output';
    resultEl.textContent = formatNginxConfig(input);
  } catch (e) {
    resultEl.className = 'result-box result-error tf-output';
    resultEl.textContent = e.message;
  }
});

// ---------- Cron Next Run Calculator ----------
function parseCronField(field, min, max) {
  const values = new Set();
  for (const part of field.split(',')) {
    let m;
    if (part === '*') { for (let i = min; i <= max; i++) values.add(i); }
    else if ((m = part.match(/^\*\/(\d+)$/))) { const step = +m[1]; for (let i = min; i <= max; i += step) values.add(i); }
    else if ((m = part.match(/^(\d+)-(\d+)(?:\/(\d+))?$/))) {
      const step = m[3] ? +m[3] : 1;
      for (let i = +m[1]; i <= +m[2]; i += step) values.add(i);
    } else if ((m = part.match(/^\d+$/))) { values.add(+part); }
    else throw new Error('Unsupported cron field syntax: ' + part);
  }
  return values;
}
function nextCronRuns(expr, count, fromDate) {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) throw new Error('Expected a 5-field cron expression (minute hour day-of-month month day-of-week).');
  const [minF, hourF, domF, monthF, dowF] = fields;
  const minutes = parseCronField(minF, 0, 59);
  const hours = parseCronField(hourF, 0, 23);
  const doms = domF === '*' ? null : parseCronField(domF, 1, 31);
  const months = parseCronField(monthF, 1, 12);
  const dows = dowF === '*' ? null : parseCronField(dowF, 0, 6);
  const results = [];
  let cursor = new Date(fromDate.getTime());
  cursor.setUTCSeconds(0, 0);
  cursor = new Date(cursor.getTime() + 60000);
  let iterations = 0;
  while (results.length < count && iterations < 600000) {
    iterations++;
    const min = cursor.getUTCMinutes(), hr = cursor.getUTCHours(), dom = cursor.getUTCDate(), mon = cursor.getUTCMonth() + 1, dow = cursor.getUTCDay();
    const domOk = doms === null || doms.has(dom);
    const dowOk = dows === null || dows.has(dow);
    const dayOk = (doms === null && dows === null) ? true : (doms !== null && dows !== null) ? (domOk || dowOk) : (domOk && dowOk);
    if (minutes.has(min) && hours.has(hr) && months.has(mon) && dayOk) results.push(new Date(cursor.getTime()));
    cursor = new Date(cursor.getTime() + 60000);
  }
  if (results.length < count) throw new Error('Could not find enough matching run times (check the expression).');
  return results;
}
document.getElementById('cronnext-calc-btn').addEventListener('click', () => {
  const resultEl = document.getElementById('cronnext-result');
  try {
    const expr = document.getElementById('cronnext-input').value.trim();
    if (!expr) throw new Error('Enter a cron expression.');
    const runs = nextCronRuns(expr, 5, new Date());
    resultEl.className = 'result-box result-success';
    resultEl.textContent = runs.map((d) => d.toISOString().replace('T', ' ').replace('.000Z', ' UTC')).join('\n');
  } catch (e) {
    resultEl.className = 'result-box result-error';
    resultEl.textContent = e.message;
  }
});
