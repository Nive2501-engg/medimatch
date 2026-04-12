// ── MediMatch UI utilities ─────────────────────────────────────────────────

/* ── Router ──────────────────────────────────────────────────── */
const Router = (() => {
  const routes = {};
  let current = null;

  function register(id, fn) { routes[id] = fn; }

  function go(id, params = {}) {
    // hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // update nav
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === id);
    });
    // show page
    const page = document.getElementById('page-' + id);
    if (page) {
      page.classList.add('active');
      page.classList.remove('fade-in');
      void page.offsetWidth;
      page.classList.add('fade-in');
    }
    current = id;
    if (routes[id]) routes[id](params);

    // gate protected pages
    const protected_ = ['book','history','admin'];
    if (protected_.includes(id) && !MM.loggedIn) {
      Toast.show('Please log in to continue', 'warn');
      LoginModal.open(() => { go(id, params); });
      return;
    }
  }

  return { register, go, get current() { return current; } };
})();

/* ── Toast ───────────────────────────────────────────────────── */
const Toast = (() => {
  let wrap = null;
  function init() {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  function show(msg, type = 'success', duration = 3200) {
    if (!wrap) init();
    const icons = { success:'✓', error:'✕', warn:'⚠' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(40px)'; t.style.transition='all .25s'; setTimeout(()=>t.remove(),260); }, duration);
  }
  return { show };
})();

/* ── Modal helper ────────────────────────────────────────────── */
const Modal = (() => {
  function open(id)  { document.getElementById(id)?.classList.add('open'); }
  function close(id) { document.getElementById(id)?.classList.remove('open'); }
  function closeAll(){ document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')); }
  // close on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) closeAll();
  });
  return { open, close, closeAll };
})();

/* ── Notification Panel ──────────────────────────────────────── */
const NotifPanel = (() => {
  let panel = null;
  let unread = MM.NOTIFICATIONS.filter(n => !n.read).length;

  function toggle() {
    if (!panel) render();
    panel.classList.toggle('open');
  }

  function render() {
    panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-header">
        <h4>Notifications</h4>
        <span class="badge badge-teal">${unread} new</span>
      </div>
      ${MM.NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}">
          <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
          <div class="notif-text">
            <p>${n.msg}</p>
            <span>${n.time}</span>
          </div>
        </div>`).join('')}
      <div style="padding:12px 18px;border-top:1px solid var(--border)">
        <button class="btn btn-ghost btn-sm btn-full" onclick="NotifPanel.markAll()">Mark all as read</button>
      </div>`;
    document.body.appendChild(panel);
  }

  function markAll() {
    MM.NOTIFICATIONS.forEach(n => n.read = true);
    unread = 0;
    document.querySelector('.notif-dot')?.remove();
    if (panel) panel.remove();
    panel = null;
    Toast.show('All notifications marked as read');
  }

  document.addEventListener('click', e => {
    if (panel && panel.classList.contains('open') &&
        !panel.contains(e.target) && !e.target.closest('.notif-btn')) {
      panel.classList.remove('open');
    }
  });

  return { toggle, markAll };
})();

/* ── Login Modal ─────────────────────────────────────────────── */
const LoginModal = (() => {
  let afterLoginCb = null;

  function open(cb) {
    afterLoginCb = cb || null;
    Modal.open('modal-login');
  }

  function submit() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPass').value.trim();
    if (!email || !pass) { Toast.show('Please enter email and password', 'error'); return; }

    // Simulate auth
    MM.login({ name: email.split('@')[0].replace(/\./g,' ').replace(/\b\w/g,c=>c.toUpperCase()), email });
    updateNavForLogin();
    Modal.close('modal-login');
    Toast.show(`Welcome back, ${MM.user.name}! 👋`);
    if (afterLoginCb) afterLoginCb();
  }

  function register() {
    const name  = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass  = document.getElementById('regPass').value.trim();
    if (!name || !email || !pass) { Toast.show('Please fill all fields', 'error'); return; }
    MM.login({ name, email });
    updateNavForLogin();
    Modal.close('modal-login');
    Toast.show(`Account created! Welcome, ${name} 🎉`);
    if (afterLoginCb) afterLoginCb();
  }

  function logout() {
    MM.logout();
    updateNavForLogin();
    Router.go('home');
    Toast.show('Logged out successfully');
  }

  function updateNavForLogin() {
    const btn = document.getElementById('navAuthBtn');
    const av  = document.getElementById('navAvatar');
    if (MM.loggedIn) {
      btn?.classList.add('hidden');
      if (av) { av.textContent = MM.user.name.slice(0,1); av.style.display='flex'; }
    } else {
      btn?.classList.remove('hidden');
      if (av) av.style.display='none';
    }
  }

  return { open, submit, register, logout };
})();

/* ── RAG Pipeline ─────────────────────────────────────────────── */
const RAG = (() => {
  function run(query, onDone) {
    const steps = document.querySelectorAll('.pipe-step');
    steps.forEach(s => s.className = 'pipe-step');

    let i = 0;
    const iv = setInterval(() => {
      if (i > 0 && steps[i-1]) steps[i-1].className = 'pipe-step done';
      if (i < steps.length) {
        if (steps[i]) steps[i].className = 'pipe-step active';
        i++;
      } else {
        clearInterval(iv);
        const q    = query.toLowerCase();
        const docs = MM.DOCTORS .map(d=>({...d,sim:MM.score(d,q)})).filter(d=>d.sim>0).sort((a,b)=>b.sim-a.sim).slice(0,3);
        const meds = MM.MEDICINES.map(m=>({...m,sim:MM.score(m,q)})).filter(m=>m.sim>0).sort((a,b)=>b.sim-a.sim).slice(0,3);
        const answer = buildAnswer(query, docs, meds);
        if (onDone) onDone(answer, docs, meds);
      }
    }, 600);
  }

  function buildAnswer(q, docs, meds) {
    let ans = `Based on your query: "${q}"\n\n`;
    if (docs.length) {
      ans += `🩺 Recommended Specialist\n${docs[0].name} (${docs[0].spec}) — ${docs[0].hospital}, ${docs[0].city}\n`;
      ans += `${docs[0].exp} years experience · Rating ${docs[0].rating}/5 · Consultation fee ₹${docs[0].fee}\n\n`;
    }
    if (meds.length) {
      ans += `💊 Relevant Medicines\n`;
      meds.forEach(m => {
        ans += `• ${m.name} (${m.generic}) — ${m.rx ? 'Prescription required' : 'OTC available'}, ₹${m.price}\n`;
        ans += `  Dosage: ${m.dosage}\n`;
      });
    }
    ans += `\n⚠️ This is AI-generated guidance for informational purposes only. Always consult a qualified medical professional before starting any treatment.`;
    return ans;
  }

  return { run };
})();

/* ── Booking form helper ──────────────────────────────────────── */
function openBookingFor(doctorId) {
  if (!MM.loggedIn) {
    LoginModal.open(() => openBookingFor(doctorId));
    return;
  }
  Router.go('book', { doctorId });
}

/* ── Shared search scoring ───────────────────────────────────── */
function runSearch(query, filters = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return { doctors: [], medicines: [] };

  let docs = MM.DOCTORS
    .filter(d => (!filters.spec || d.spec === filters.spec) && (!filters.city || d.city === filters.city))
    .map(d => ({ ...d, sim: MM.score(d, q) }))
    .filter(d => d.sim > 0)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 6);

  let meds = MM.MEDICINES
    .map(m => ({ ...m, sim: MM.score(m, q) }))
    .filter(m => m.sim > 0)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 6);

  MM.addHistory({ q: query, time: new Date().toLocaleTimeString(), docs: docs.length, meds: meds.length, type: filters.type || 'search' });
  return { doctors: docs, medicines: meds };
}