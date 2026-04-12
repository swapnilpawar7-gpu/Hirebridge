/* =====================================================
   HireBridge - script.js
   Handles: theme toggle, mobile menu, API calls,
            search (debounced), exp filters, rendering
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

// ── STATE ──────────────────────────────────────────────
let allJobs     = [];
let filtered    = [];
let activeFilter = 'all';
let searchQuery  = '';

const grid       = document.getElementById('jobsGrid');
const countBadge = document.getElementById('countBadge');
const statJobs   = document.getElementById('statJobs');
const searchInput = document.getElementById('searchInput');

// ── API CALLS ──────────────────────────────────────────
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
    // Fallback: client-side filter on already-fetched data
    filtered = applyExpFilter(allJobs.filter(j =>
      (j.profile || '').toLowerCase().includes(q.toLowerCase()) ||
      (j.desc    || '').toLowerCase().includes(q.toLowerCase()) ||
      (j.techs   || []).some(t => t.toLowerCase().includes(q.toLowerCase()))
    ));
    renderJobs(filtered);
  }
}

// ── FILTERS ───────────────────────────────────────────
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

// ── RENDER ─────────────────────────────────────────────
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
  window.location.href = '/apply.html?title=' + encodeURIComponent(profile);
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
  statJobs.textContent   = '-';
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

// ── INIT ───────────────────────────────────────────────
fetchJobs();
