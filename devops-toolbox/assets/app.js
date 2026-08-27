// ---------- Tab switching ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tool).classList.add('active');
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
