/* =====================================================
   HireBridge — apply.js
   Handles: theme, mobile menu, URL params,
            inline validation, file upload, submit
   ===================================================== */

// ── THEME ──────────────────────────────────────────────
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

const sunPath  = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
const moonPath = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  themeIcon.innerHTML = t === 'dark' ? sunPath : moonPath;
  localStorage.setItem('hb-theme', t);
}

applyTheme(localStorage.getItem('hb-theme') || 'light');

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ── MOBILE MENU ────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

// ── URL PARAMS → INJECT JOB TITLE ──────────────────────
const params   = new URLSearchParams(window.location.search);
const jobTitle = params.get('title') ? decodeURIComponent(params.get('title')) : 'this position';

document.getElementById('applyRoleLabel').textContent = 'Applying for: ' + jobTitle;
// FIX: the <title> element id is "pageTitleTag", not "pageTitleJob"
document.getElementById('pageTitleTag').textContent = 'Apply: ' + jobTitle + ' — HireBridge';

// ── VALIDATION RULES ────────────────────────────────────
const RULES = {
  firstName:   {
    empty: 'This field is required',
    test:  v => /^[A-Za-z]+$/.test(v.trim()),
    msg:   'Only alphabetic characters are allowed'
  },
  lastName:    {
    empty: 'This field is required',
    test:  v => /^[A-Za-z]+$/.test(v.trim()),
    msg:   'Only alphabetic characters are allowed'
  },
  contact:     {
    empty: 'This field is required',
    test:  v => /^\d{10}$/.test(v.trim()),
    msg:   'Please enter a valid 10-digit phone number'
  },
  email:       {
    empty: 'This field is required',
    test:  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    msg:   'Please enter a valid email address'
  },
  education:   {
    empty: 'Please select your education level',
    test:  v => v !== '' && v !== 'select',
    msg:   'Please select your education level'
  },
  major:       {
    empty: 'This field is required',
    test:  v => /^[A-Za-z\s]+$/.test(v.trim()),
    msg:   'Only alphabetic characters and spaces are allowed'
  },
  currentCtc:  {
    empty: 'This field is required',
    test:  v => v.trim() !== '' && !isNaN(v) && Number(v) >= 0,
    msg:   'Please enter a valid number'
  },
  expectedCtc: {
    empty: 'This field is required',
    test:  v => v.trim() !== '' && !isNaN(v) && Number(v) >= 0,
    msg:   'Please enter a valid number'
  },
};

// ── ICON SVGs ───────────────────────────────────────────
const CHECK_SVG = `<svg class="field-icon valid" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const CROSS_SVG = `<svg class="field-icon invalid" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

// ── FIELD VALIDATION HELPER ─────────────────────────────
function validateField(fieldId) {
  const input  = document.getElementById(fieldId);
  const rule   = RULES[fieldId];
  const wrap   = input.closest('.input-wrap') || input.parentElement;
  const errEl  = document.getElementById(fieldId + 'Error');

  // Remove existing icon
  const oldIcon = wrap.querySelector('.field-icon');
  if (oldIcon) oldIcon.remove();

  const isEmpty = input.value.trim() === '' ||
    (input.tagName === 'SELECT' && (input.value === '' || input.value === 'select'));

  if (isEmpty) {
    setInvalid(input, wrap, errEl, rule.empty);
    return false;
  }

  if (!rule.test(input.value)) {
    setInvalid(input, wrap, errEl, rule.msg);
    return false;
  }

  setValid(input, wrap, errEl);
  return true;
}

function setValid(input, wrap, errEl) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  errEl.classList.remove('visible');
  wrap.insertAdjacentHTML('beforeend', CHECK_SVG);
}

function setInvalid(input, wrap, errEl, msg) {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  errEl.textContent = msg;
  errEl.classList.add('visible');
  wrap.insertAdjacentHTML('beforeend', CROSS_SVG);
}

// ── RESUME VALIDATION ───────────────────────────────────
const resumeInput = document.getElementById('resume');
const fileLabel   = document.getElementById('fileLabel');
const fileText    = document.getElementById('fileText');
const resumeError = document.getElementById('resumeError');
let resumeValid   = false;

resumeInput.addEventListener('change', () => {
  const file = resumeInput.files[0];
  if (!file) {
    markResumeInvalid('Please upload your resume (PDF, DOC, or DOCX)');
    return;
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(ext)) {
    markResumeInvalid('Only PDF, DOC, or DOCX files are accepted');
    return;
  }
  resumeValid = true;
  fileText.textContent = file.name;
  fileText.classList.add('selected');
  fileLabel.classList.remove('is-invalid');
  fileLabel.classList.add('is-valid');
  resumeError.classList.remove('visible');
});

function markResumeInvalid(msg) {
  resumeValid = false;
  fileText.textContent = 'Choose file…';
  fileText.classList.remove('selected');
  fileLabel.classList.remove('is-valid');
  fileLabel.classList.add('is-invalid');
  resumeError.textContent = msg;
  resumeError.classList.add('visible');
}

// ── ATTACH BLUR + INPUT LISTENERS ──────────────────────
['firstName', 'lastName', 'contact', 'email', 'education', 'major', 'currentCtc', 'expectedCtc'].forEach(id => {
  const el = document.getElementById(id);
  // validate immediately when user leaves a field
  el.addEventListener('blur', () => validateField(id));
  // clear error state while user is actively typing/changing
  el.addEventListener('input', () => {
    if (el.classList.contains('is-invalid') || el.classList.contains('is-valid')) {
      el.classList.remove('is-invalid', 'is-valid');
      const wrap = el.closest('.input-wrap') || el.parentElement;
      const icon = wrap.querySelector('.field-icon');
      if (icon) icon.remove();
      document.getElementById(id + 'Error').classList.remove('visible');
    }
  });
  // also clear on change (handles <select>)
  el.addEventListener('change', () => {
    if (el.tagName === 'SELECT') validateField(id);
  });
});

// ── SUBMIT ──────────────────────────────────────────────
const form          = document.getElementById('applyForm');
const submitBtn     = document.getElementById('submitBtn');
const successBanner = document.getElementById('successBanner');

form.addEventListener('submit', e => {
  e.preventDefault();

  // Validate all text/select fields — run ALL even if one fails so all errors show
  const fieldIds = ['firstName', 'lastName', 'contact', 'email', 'education', 'major', 'currentCtc', 'expectedCtc'];
  const results  = fieldIds.map(id => validateField(id));
  let allValid   = results.every(Boolean);

  // Resume check
  if (!resumeValid) {
    markResumeInvalid('Please upload your resume (PDF, DOC, or DOCX)');
    allValid = false;
  }

  if (!allValid) {
    // Scroll to the first invalid field
    const firstInvalid = form.querySelector('.is-invalid, .file-upload-label.is-invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // All valid → show success and redirect
  submitBtn.disabled = true;
  successBanner.classList.add('visible');
  successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => { window.location.href = '/'; }, 1500);
});

// ── GO BACK ─────────────────────────────────────────────
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/';
});
