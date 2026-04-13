
// THEME 
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

//  MOBILE MENU 
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

//  JOB LISTINGS STATE 
let allJobs      = [];
let filtered     = [];
let activeFilter = 'all';
let searchQuery  = '';

const grid        = document.getElementById('jobsGrid');
const countBadge  = document.getElementById('countBadge');
const statJobs    = document.getElementById('statJobs');
const searchInput = document.getElementById('searchInput');

//  API: FETCH ALL JOBS 
async function fetchJobs() {
  try {
    const res = await fetch('/allPosts');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    allJobs = await res.json();
    statJobs.textContent = allJobs.length;
    applyFilters();
  } catch (err) {
    showError();
  }
}

//  API: SEARCH JOBS 
async function searchJobs(q) {
  if (!q.trim()) {
    filtered = applyExpFilter(allJobs);
    renderJobs(filtered);
    return;
  }
  try {
    const res = await fetch('/posts/' + encodeURIComponent(q.trim()));
    if (!res.ok) throw new Error();
    const results = await res.json();
    filtered = applyExpFilter(results);
    renderJobs(filtered);
  } catch {
    // Fallback: client-side filter on cached data
    filtered = applyExpFilter(allJobs.filter(j =>
      (j.profile || '').toLowerCase().includes(q.toLowerCase()) ||
      (j.desc    || '').toLowerCase().includes(q.toLowerCase()) ||
      (j.techs   || []).some(t => t.toLowerCase().includes(q.toLowerCase()))
    ));
    renderJobs(filtered);
  }
}

//  FILTERS 
function applyExpFilter(jobs) {
  if (activeFilter === 'all') return jobs;
  return jobs.filter(j => {
    if (activeFilter === '0-2') return j.exp <= 2;
    if (activeFilter === '3-5') return j.exp >= 3 && j.exp <= 5;
    if (activeFilter === '5+')  return j.exp > 5;
    return true;
  });
}

function applyFilters() {
  if (searchQuery.trim()) {
    searchJobs(searchQuery);
  } else {
    filtered = applyExpFilter(allJobs);
    renderJobs(filtered);
  }
}

//  RENDER JOBS 
function renderJobs(jobs) {
  countBadge.textContent = jobs.length + ' Jobs Found';

  if (jobs.length === 0) {
    grid.innerHTML = `
      <div class="state-box" role="alert">
        <div class="state-icon" aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <p class="state-title">No jobs found</p>
        <p class="state-sub">Try a different search term or clear your filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = jobs.map(job => createCard(job)).join('');
}

function createCard(job) {
  const techs    = (job.techs || []).slice(0, 5);
  const expLabel = job.exp === 0 ? 'Entry Level'
                 : job.exp === 1 ? '1 yr exp'
                 : `${job.exp} yrs exp`;
  const desc     = job.desc || 'Exciting opportunity to work with a talented team on cutting-edge technology.';
  const tagHTML  = techs.map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('');

  return `
    <article class="job-card" tabindex="0" role="article" aria-label="${escHtml(job.profile || 'Job')} position">
      <div class="card-top">
        <div class="company-icon" aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.7">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>
        <span class="exp-badge" aria-label="${expLabel}">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          ${escHtml(expLabel)}
        </span>
      </div>
      <h3 class="job-title">${escHtml(job.profile || 'Untitled Position')}</h3>
      <p class="job-desc">${escHtml(desc)}</p>
      <div class="tech-tags" aria-label="Required skills">${tagHTML}</div>
      <button class="apply-btn" onclick="applyNow('${escHtml(job.profile || '')}')">
        Apply Now
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </article>`;
}

function applyNow(profile) {
  window.location.href = '/apply?title=' + encodeURIComponent(profile);
}

// ── ERROR STATE ────────────────────────────────────────
function showError() {
  grid.innerHTML = `
    <div class="state-box error" role="alert">
      <div class="state-icon" aria-hidden="true">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p class="state-title">Failed to load jobs</p>
      <p class="state-sub">Please check the backend is running and try again.</p>
      <button class="retry-btn" onclick="fetchJobs()">Retry</button>
    </div>`;
  countBadge.textContent = 'Error';
  statJobs.textContent   = '—';
}

// ── UTILITY ────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// ── SEARCH EVENTS ──────────────────────────────────────
let debounceTimer;

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFilters(), 280);
});

document.getElementById('searchBtn').addEventListener('click', () => {
  searchQuery = searchInput.value;
  applyFilters();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    searchQuery = searchInput.value;
    applyFilters();
  }
});

// ── FILTER CHIP EVENTS ─────────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    applyFilters();
  });
});

// ── KEYBOARD NAV FOR CARDS ─────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList.contains('job-card')) {
    e.target.querySelector('.apply-btn')?.click();
  }
});

// ══════════════════════════════════════════════════════
//  POST JOB MODAL
// ══════════════════════════════════════════════════════

const modalBackdrop    = document.getElementById('modalBackdrop');
const modalCard        = document.getElementById('modalCard');
const modalClose       = document.getElementById('modalClose');
const modalCancelBtn   = document.getElementById('modalCancelBtn');
const postJobForm      = document.getElementById('postJobForm');
const postJobSubmitBtn = document.getElementById('postJobSubmitBtn');
const modalApiError    = document.getElementById('modalApiError');
const toast            = document.getElementById('toast');

// ── OPEN / CLOSE MODAL ─────────────────────────────────
function openModal() {
  modalBackdrop.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    const first = postJobForm.querySelector('.field-input');
    if (first) first.focus();
  });
}

function closeModal() {
  modalBackdrop.classList.remove('modal-open');
  document.body.style.overflow = '';
  resetPostForm();
}

// Wire all open triggers — gate behind login
function handlePostJobClick(e, closeMobileMenu) {
  e.preventDefault();
  if (closeMobileMenu) mobileMenu.classList.remove('open');
  if (isLoggedIn()) {
    openModal();
  } else {
    openLoginModal();
  }
}

document.getElementById('navPostBtn').addEventListener('click',    e => handlePostJobClick(e, false));
document.getElementById('navPostLink').addEventListener('click',   e => handlePostJobClick(e, false));
document.getElementById('mobilePostLink').addEventListener('click',e => handlePostJobClick(e, true));

// Close triggers
modalClose.addEventListener('click',      closeModal);
modalCancelBtn.addEventListener('click',  closeModal);

// Click backdrop (outside card) to close
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

// Escape key to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('modal-open')) closeModal();
});

// ── MODAL FIELD VALIDATION ─────────────────────────────
const MODAL_RULES = {
  pjTitle:    {
    empty: 'This field is required',
    test:  v => /^[A-Za-z\s]+$/.test(v.trim()),
    msg:   'Alphabets and spaces only'
  },
  pjDesc:     {
    empty: 'This field is required',
    test:  v => v.trim().length >= 10,
    msg:   'Description must be at least 10 characters'
  },
  pjSkills:   {
    empty: 'This field is required',
    test:  v => v.trim().length > 0,
    msg:   'This field is required'
  },
  pjExp:      {
    empty: 'This field is required',
    test:  v => /^[A-Za-z0-9\s]+$/.test(v.trim()),
    msg:   'Alphanumeric characters only (e.g. 2 Years)'
  },
  pjLocation: {
    empty: 'This field is required',
    test:  v => /^[A-Za-z\s]+$/.test(v.trim()),
    msg:   'Alphabets and spaces only'
  },
  pjType:     {
    empty: 'Please select a job type',
    test:  v => v !== '' && v !== 'select',
    msg:   'Please select a job type'
  },
  pjSalary:   {
    empty: 'This field is required',
    test:  v => v.trim().length > 0,
    msg:   'This field is required'
  },
};

const MODAL_CHECK = `<svg class="field-icon valid" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const MODAL_CROSS = `<svg class="field-icon invalid" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function validateModalField(id) {
  const input  = document.getElementById(id);
  const rule   = MODAL_RULES[id];
  const wrap   = input.closest('.input-wrap') || input.parentElement;
  const errEl  = document.getElementById(id + 'Error');

  const oldIcon = wrap.querySelector('.field-icon');
  if (oldIcon) oldIcon.remove();

  const isEmpty = input.value.trim() === '' ||
    (input.tagName === 'SELECT' && (input.value === '' || input.value === 'select'));

  if (isEmpty) {
    input.classList.remove('is-valid'); input.classList.add('is-invalid');
    errEl.textContent = rule.empty; errEl.classList.add('visible');
    wrap.insertAdjacentHTML('beforeend', MODAL_CROSS);
    return false;
  }
  if (!rule.test(input.value)) {
    input.classList.remove('is-valid'); input.classList.add('is-invalid');
    errEl.textContent = rule.msg; errEl.classList.add('visible');
    wrap.insertAdjacentHTML('beforeend', MODAL_CROSS);
    return false;
  }
  input.classList.remove('is-invalid'); input.classList.add('is-valid');
  errEl.classList.remove('visible');
  wrap.insertAdjacentHTML('beforeend', MODAL_CHECK);
  return true;
}

// Attach blur + input listeners for modal fields
Object.keys(MODAL_RULES).forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => validateModalField(id));
  el.addEventListener('input', () => {
    if (el.classList.contains('is-invalid') || el.classList.contains('is-valid')) {
      el.classList.remove('is-invalid', 'is-valid');
      const wrap = el.closest('.input-wrap') || el.parentElement;
      const icon = wrap.querySelector('.field-icon');
      if (icon) icon.remove();
      document.getElementById(id + 'Error').classList.remove('visible');
    }
  });
  if (el.tagName === 'SELECT') {
    el.addEventListener('change', () => validateModalField(id));
  }
});

// ── RESET POST FORM ────────────────────────────────────
function resetPostForm() {
  postJobForm.reset();
  Object.keys(MODAL_RULES).forEach(id => {
    const el   = document.getElementById(id);
    const wrap = el.closest('.input-wrap') || el.parentElement;
    const icon = wrap.querySelector('.field-icon');
    if (icon) icon.remove();
    el.classList.remove('is-valid', 'is-invalid');
    document.getElementById(id + 'Error').classList.remove('visible');
  });
  modalApiError.style.display = 'none';
  postJobSubmitBtn.disabled = false;
}

// ── SUBMIT POST JOB FORM ───────────────────────────────
postJobForm.addEventListener('submit', async e => {
  e.preventDefault();
  modalApiError.style.display = 'none';

  // Validate all fields — run all so every error shows at once
  const ids    = Object.keys(MODAL_RULES);
  const valid  = ids.map(id => validateModalField(id)).every(Boolean);

  if (!valid) {
    const firstErr = postJobForm.querySelector('.is-invalid');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Build the payload matching the Post model: profile, desc, exp (int), techs (array)
  const skillsRaw = document.getElementById('pjSkills').value;
  const expRaw    = document.getElementById('pjExp').value.trim();
  // Parse a leading number from expRaw, e.g. "2 Years" → 2, fallback 0
  const expNum    = parseInt(expRaw, 10) || 0;

  const payload = {
    profile: document.getElementById('pjTitle').value.trim(),
    desc:    document.getElementById('pjDesc').value.trim(),
    exp:     expNum,
    techs:   skillsRaw.split(',').map(s => s.trim()).filter(Boolean),
  };

  postJobSubmitBtn.disabled = true;

  try {
    const res = await fetch('/post', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    closeModal();
    showToast();

    // Refresh the listings so the new job appears immediately
    await fetchJobs();

  } catch (err) {
    modalApiError.style.display = 'flex';
    postJobSubmitBtn.disabled = false;
    modalApiError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});


// ══════════════════════════════════════════════════════
//  AUTH — LOGIN / LOGOUT
//  Credentials are checked client-side only.
//  Username: admin   |   Password: hirebridge123
// ══════════════════════════════════════════════════════

const ADMIN_USER = 'swap';
const ADMIN_PASS = 'swap@369';
const AUTH_KEY   = 'hb-admin-auth';

function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setLoggedIn(val) {
  if (val) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
  updateAdminBadge();
}

function updateAdminBadge() {
  const badge = document.getElementById('adminBadge');
  badge.style.display = isLoggedIn() ? 'flex' : 'none';
}

// ── LOGIN MODAL ELEMENTS ───────────────────────────────
const loginBackdrop   = document.getElementById('loginBackdrop');
const loginForm       = document.getElementById('loginForm');
const loginError      = document.getElementById('loginError');
const loginSubmitBtn  = document.getElementById('loginSubmitBtn');
const loginCancelBtn  = document.getElementById('loginCancelBtn');
const loginModalClose = document.getElementById('loginModalClose');
const pwToggle        = document.getElementById('pwToggle');
const pwEyeIcon       = document.getElementById('pwEyeIcon');
const loginUsername   = document.getElementById('loginUsername');
const loginPassword   = document.getElementById('loginPassword');

const EYE_OPEN   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSED = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

function openLoginModal() {
  loginBackdrop.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => loginUsername.focus());
}

function closeLoginModal() {
  loginBackdrop.classList.remove('modal-open');
  document.body.style.overflow = '';
  loginForm.reset();
  loginError.style.display = 'none';
  loginSubmitBtn.disabled = false;
  clearLoginFieldErrors();
  // Reset password visibility
  loginPassword.type = 'password';
  pwEyeIcon.innerHTML = EYE_OPEN;
}

function clearLoginFieldErrors() {
  [loginUsername, loginPassword].forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
    const wrap = el.closest('.input-wrap') || el.parentElement;
    const icon = wrap.querySelector('.field-icon');
    if (icon) icon.remove();
  });
  document.getElementById('loginUsernameError').classList.remove('visible');
  document.getElementById('loginPasswordError').classList.remove('visible');
}

// Close triggers
loginModalClose.addEventListener('click', closeLoginModal);
loginCancelBtn.addEventListener('click',  closeLoginModal);
loginBackdrop.addEventListener('click', e => {
  if (e.target === loginBackdrop) closeLoginModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && loginBackdrop.classList.contains('modal-open')) closeLoginModal();
});

// Password show/hide toggle
pwToggle.addEventListener('click', () => {
  const isHidden = loginPassword.type === 'password';
  loginPassword.type = isHidden ? 'text' : 'password';
  pwEyeIcon.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
  pwToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

// Clear field errors on input
loginUsername.addEventListener('input', () => {
  loginUsername.classList.remove('is-invalid');
  document.getElementById('loginUsernameError').classList.remove('visible');
  loginError.style.display = 'none';
});
loginPassword.addEventListener('input', () => {
  loginPassword.classList.remove('is-invalid');
  document.getElementById('loginPasswordError').classList.remove('visible');
  loginError.style.display = 'none';
});

// ── LOGIN FORM SUBMIT ──────────────────────────────────
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  loginError.style.display = 'none';

  const uVal = loginUsername.value.trim();
  const pVal = loginPassword.value;
  let valid  = true;

  // Empty checks
  if (!uVal) {
    showLoginFieldError(loginUsername, 'loginUsernameError', 'Username is required');
    valid = false;
  }
  if (!pVal) {
    showLoginFieldError(loginPassword, 'loginPasswordError', 'Password is required');
    valid = false;
  }
  if (!valid) return;

  // Credential check
  if (uVal !== ADMIN_USER || pVal !== ADMIN_PASS) {
    loginError.style.display = 'flex';
    loginPassword.value = '';
    loginPassword.classList.add('is-invalid');
    loginUsername.classList.add('is-invalid');
    loginSubmitBtn.disabled = false;
    return;
  }

  // Success
  setLoggedIn(true);
  closeLoginModal();
  // Immediately open the Post Job modal
  openModal();
});

function showLoginFieldError(input, errorId, msg) {
  input.classList.add('is-invalid');
  const errEl = document.getElementById(errorId);
  errEl.textContent = msg;
  errEl.classList.add('visible');
}

// ── LOGOUT ─────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  setLoggedIn(false);
});

// ── RESTORE SESSION STATE ON LOAD ─────────────────────
updateAdminBadge();

// ── TOAST ──────────────────────────────────────────────
let toastTimer;

function showToast() {
  toast.style.display = 'flex';
  toast.classList.add('toast-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 3000);
}

// ── INIT ───────────────────────────────────────────────
fetchJobs();
