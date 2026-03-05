/* ============================================================
   CONFIGGO — SALES TRAINING HUB
   scripts.js — Tab switching, Language, Teleprompter,
                Accordion, Checklist, Quick Ref Modal
   ============================================================ */

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme preference
  const savedTheme = localStorage.getItem('cg-theme') || 'dark';
  applyTheme(savedTheme, false);

  // Restore language preference
  const savedLang = localStorage.getItem('cg-lang') || 'en';
  setLang(savedLang, false);

  // Restore checklists
  restoreChecklists();

  // Mark first tab as visited
  markVisited('tab1');

  // Bind all checklist clicks
  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => toggleCheck(item));
  });
});

// ── Theme Toggle ───────────────────────────────────────────────
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function applyTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (save) localStorage.setItem('cg-theme', theme);
}

// ── Language Toggle ────────────────────────────────────────────
function setLang(lang, save = true) {
  document.documentElement.setAttribute('data-lang', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  if (save) localStorage.setItem('cg-lang', lang);
}

// ── Tab Switching ──────────────────────────────────────────────
function showTab(tabId, btn) {
  // Panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Mark as visited
  markVisited(tabId);

  // Scroll content to top
  const main = document.querySelector('.main-content');
  if (main) main.scrollTop = 0;
}

// ── Progress Dots ──────────────────────────────────────────────
function markVisited(tabId) {
  const dot = document.getElementById('dot-' + tabId);
  if (dot) dot.classList.add('visited');
  // Persist
  const visited = JSON.parse(localStorage.getItem('cg-visited') || '[]');
  if (!visited.includes(tabId)) {
    visited.push(tabId);
    localStorage.setItem('cg-visited', JSON.stringify(visited));
  }
}

// Restore visited on load
(function restoreVisited() {
  const visited = JSON.parse(localStorage.getItem('cg-visited') || '[]');
  visited.forEach(id => {
    const dot = document.getElementById('dot-' + id);
    if (dot) dot.classList.add('visited');
  });
})();

// ── Teleprompter ───────────────────────────────────────────────
const tpState = {};

function toggleTP(tabId) {
  const panel   = document.getElementById(tabId);
  const btn     = document.getElementById('tp-btn-' + tabId);
  const nav     = document.getElementById('tp-nav-' + tabId);
  const steps   = panel.querySelectorAll('.step');

  if (!tpState[tabId]) {
    // Init state
    tpState[tabId] = { index: 0, total: steps.length };
  }

  const isOn = panel.classList.toggle('tp-mode');
  btn.classList.toggle('on', isOn);
  nav.classList.toggle('show', isOn);

  if (isOn) {
    btn.querySelector('.lang-en').textContent = 'Exit Teleprompter';
    btn.querySelector('.lang-tr').textContent = 'Teleprompterdan Çık';
    setTPStep(tabId, tpState[tabId].index);
  } else {
    btn.querySelector('.lang-en').textContent = 'Teleprompter Mode';
    btn.querySelector('.lang-tr').textContent = 'Teleprompter Modu';
    steps.forEach(s => s.classList.remove('tp-active'));
    steps[0] && steps[0].classList.add('tp-active');
    updateStepper(tabId, 0, steps.length);
  }
}

function setTPStep(tabId, index) {
  const panel = document.getElementById(tabId);
  const steps = panel.querySelectorAll('.step');
  const total = steps.length;

  steps.forEach((s, i) => s.classList.toggle('tp-active', i === index));
  tpState[tabId].index = index;

  // Update counter
  const counter = document.getElementById('tp-count-' + tabId);
  if (counter) counter.textContent = (index + 1) + ' / ' + total;

  // Update prev/next buttons
  const prevBtn = document.getElementById('tp-prev-' + tabId);
  const nextBtn = document.getElementById('tp-next-' + tabId);
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === total - 1;

  // Update flow stepper
  updateStepper(tabId, index, total);

  // Scroll step into view
  const activeStep = steps[index];
  if (activeStep) {
    setTimeout(() => activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  }
}

function tpMove(tabId, dir) {
  if (!tpState[tabId]) return;
  const panel = document.getElementById(tabId);
  const total = panel.querySelectorAll('.step').length;
  const next  = Math.max(0, Math.min(total - 1, tpState[tabId].index + dir));
  setTPStep(tabId, next);
}

function updateStepper(tabId, currentIdx, total) {
  const stepper = document.getElementById('stepper-' + tabId);
  if (!stepper) return;
  stepper.querySelectorAll('.flow-step').forEach((step, i) => {
    step.classList.remove('current', 'done');
    if (i < currentIdx) step.classList.add('done');
    if (i === currentIdx) step.classList.add('current');
  });
}

// ── Accordion (Objections & FAQ) ───────────────────────────────
function toggleAcc(header) {
  const item = header.closest('.acc-item');
  const wasOpen = item.classList.contains('open');

  // Close all in same container
  const container = item.closest('.accordion');
  container.querySelectorAll('.acc-item.open').forEach(i => i.classList.remove('open'));

  if (!wasOpen) item.classList.add('open');
}

function toggleFaq(header) {
  const item = header.closest('.faq-item');
  const wasOpen = item.classList.contains('open');

  const container = item.closest('.faq-accordion');
  container.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

  if (!wasOpen) item.classList.add('open');
}

// ── Branch Logic ───────────────────────────────────────────────
function selectBranch(btn, responseId) {
  // Deactivate all buttons in same branch-options group
  const options = btn.closest('.branch-options');
  options.querySelectorAll('.branch-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Hide all responses in same branch-responses group
  const responses = btn.closest('.branch-section').querySelector('.branch-responses');
  responses.querySelectorAll('.branch-resp').forEach(r => r.classList.remove('open'));

  // Show selected response
  const target = document.getElementById(responseId);
  if (target) target.classList.add('open');
}

// ── Checklist ──────────────────────────────────────────────────
function toggleCheck(item) {
  item.classList.toggle('checked');
  saveChecklists();
}

function saveChecklists() {
  const state = {};
  document.querySelectorAll('.checklist-items').forEach(list => {
    const id = list.id;
    state[id] = [];
    list.querySelectorAll('.checklist-item').forEach((item, i) => {
      state[id][i] = item.classList.contains('checked');
    });
  });
  localStorage.setItem('cg-checklists', JSON.stringify(state));
}

function restoreChecklists() {
  const state = JSON.parse(localStorage.getItem('cg-checklists') || '{}');
  Object.entries(state).forEach(([id, checks]) => {
    const list = document.getElementById(id);
    if (!list) return;
    list.querySelectorAll('.checklist-item').forEach((item, i) => {
      if (checks[i]) item.classList.add('checked');
    });
  });
}

// ── Auth ────────────────────────────────────────────────────────
function logout() {
  firebase.auth().signOut()
    .then(() => { window.location.href = 'login.html'; })
    .catch(err => console.error('Logout error:', err));
}

// ── Quick Ref Modal ────────────────────────────────────────────
function openQR() {
  document.getElementById('qr-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQR() {
  document.getElementById('qr-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeQROutside(e) {
  if (e.target === document.getElementById('qr-overlay')) closeQR();
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeQR();
});
