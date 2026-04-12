// ── MediMatch app.js — page renderers & event handlers ───────────────────

// ── Router registration ───────────────────────────────────────────────────
Router.register('home',     renderHome);
Router.register('search',   renderSearchPage);
Router.register('doctor',   renderDoctorProfile);
Router.register('medicine', renderMedicineDetail);
Router.register('rag',      ()=>{});
Router.register('book',     renderBookPage);
Router.register('history',  renderHistoryPage);
Router.register('admin',    renderAdminPage);

// ── HOME PAGE ─────────────────────────────────────────────────────────────
function renderHome() {
  renderSpecGrid();
  renderFeaturedDocs();
}

function setHeroQ(q) {
  document.getElementById('heroSearch').value = q;
}

function heroDoSearch() {
  const q = document.getElementById('heroSearch').value.trim();
  if (!q) return;
  const { doctors, medicines } = runSearch(q, {
    type: document.getElementById('fType')?.value || 'both'
  });
  const box = document.getElementById('homeResults');
  const specHead = document.getElementById('specHeading');
  const specGrid = document.getElementById('specGrid');
  const featDocs = document.getElementById('featuredDocs');
  box.style.display = 'block';
  specHead.style.display = 'none';
  specGrid.style.display = 'none';
  featDocs.style.display = 'none';

  let html = `<div class="result-bar">
    <strong>"${q}"</strong>
    <span class="result-bar-sep">·</span>
    <span>${doctors.length} doctors found</span>
    <span class="result-bar-sep">·</span>
    <span>${medicines.length} medicines found</span>
    <span class="result-badge" style="margin-left:auto">Endee Vector DB</span>
    <button class="btn btn-ghost btn-sm" onclick="clearHeroSearch()">✕ Clear</button>
  </div>`;

  if (!doctors.length && !medicines.length) {
    html += `<div style="text-align:center;padding:48px;color:var(--text-muted)"><p style="font-size:18px;margin-bottom:8px">🔍</p><p>No results found. Try different keywords.</p></div>`;
  }

  if (doctors.length) {
    html += `<div class="section-heading" style="margin-bottom:16px">Recommended Doctors</div><div class="docs-grid stagger">`;
    html += doctors.map(d => docCardHTML(d)).join('');
    html += '</div>';
  }
  if (medicines.length) {
    html += `<div class="section-heading" style="margin-top:8px;margin-bottom:16px">Relevant Medicines</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:32px;" class="stagger">`;
    html += medicines.map(m => medCardHTML(m)).join('');
    html += '</div>';
  }
  box.innerHTML = html;
}

function clearHeroSearch() {
  document.getElementById('heroSearch').value = '';
  document.getElementById('homeResults').style.display = 'none';
  document.getElementById('specHeading').style.display = '';
  document.getElementById('specGrid').style.display = '';
  document.getElementById('featuredDocs').style.display = '';
}

const SPECS = [
  { icon:'🧠', name:'Neurology',     sub:'Headache, migraine, seizure', q:'headache migraine dizziness seizure' },
  { icon:'❤️', name:'Cardiology',    sub:'Heart, chest pain, BP',       q:'chest pain shortness of breath heart palpitations' },
  { icon:'🦴', name:'Orthopedics',   sub:'Joint pain, arthritis',       q:'joint pain arthritis back pain muscle' },
  { icon:'🩹', name:'Dermatology',   sub:'Rash, acne, allergies',       q:'rash itching skin allergy acne eczema' },
  { icon:'🧘', name:'Psychiatry',    sub:'Anxiety, depression',         q:'anxiety depression stress insomnia mental health' },
  { icon:'🍽️', name:'Gastro',       sub:'Stomach, digestion',          q:'stomach pain bloating acidity GERD nausea' },
  { icon:'🫁', name:'Pulmonology',   sub:'Asthma, breathing',           q:'asthma cough breathing difficulty wheezing' },
  { icon:'💉', name:'Endocrinology', sub:'Diabetes, thyroid',           q:'diabetes thyroid frequent urination excessive thirst' },
];

function renderSpecGrid() {
  document.getElementById('specGrid').innerHTML = SPECS.map(s => `
    <div class="spec-card" onclick="setHeroQ('${s.q}');heroDoSearch()">
      <div class="spec-card-icon">${s.icon}</div>
      <div class="spec-card-name">${s.name}</div>
      <div class="spec-card-sub">${s.sub}</div>
    </div>`).join('');
}

function renderFeaturedDocs() {
  const top = [...MM.DOCTORS].sort((a,b)=>b.rating-a.rating).slice(0,4);
  document.getElementById('featuredDocs').innerHTML = top.map(d => docCardHTML(d)).join('');
}

// ── Doctor Card HTML ──────────────────────────────────────────────────────
function docCardHTML(d) {
  const pct = d.sim !== undefined ? Math.round(Math.min(d.sim,1)*100) : null;
  return `<div class="doc-card">
    <div class="doc-card-top">
      ${MM.doctorAvatar(d, 52)}
      <div class="doc-card-info">
        <div class="doc-name">${d.name}</div>
        <div class="doc-spec">${d.spec}</div>
        <span class="badge ${MM.specColor(d.spec)}">${d.spec}</span>
        ${pct !== null ? `<span class="badge badge-teal" style="margin-left:6px">${pct}% match</span>` : ''}
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-meta-item">🏥 ${d.hospital}</div>
      <div class="doc-meta-item">📍 ${d.city}</div>
      <div class="doc-meta-item">🎓 ${d.exp}y exp</div>
      <div class="doc-meta-item">${MM.starsHTML(d.rating)} ${d.rating}</div>
      <div class="avail"><div class="avail-dot ${d.available?'on':'off'}"></div>${d.available?'Available':'Busy'}</div>
    </div>
    <div class="doc-card-footer">
      <span style="font-size:14px;font-weight:700;color:var(--navy)">₹${d.fee}</span>
      <span style="font-size:12px;color:var(--text-muted)">per visit</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="Router.go('doctor',{id:${d.id}})">View Profile</button>
        <button class="btn btn-primary btn-sm" onclick="openBookingFor(${d.id})">Book</button>
      </div>
    </div>
  </div>`;
}

// ── Medicine Card HTML ────────────────────────────────────────────────────
function medCardHTML(m) {
  const pct = m.sim !== undefined ? Math.round(Math.min(m.sim,1)*100) : null;
  return `<div class="card card-hover" style="padding:16px;cursor:pointer" onclick="Router.go('medicine',{id:${m.id}})">
    <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
      <div style="width:44px;height:44px;border-radius:var(--radius);background:var(--teal-light);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">💊</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:var(--navy)">${m.name}</div>
        <div style="font-size:12px;color:var(--text-muted)">${m.generic}</div>
      </div>
      ${pct !== null ? `<span class="badge badge-teal">${pct}%</span>` : ''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      <span class="badge badge-blue">${m.cat}</span>
      ${m.rx ? '<span class="badge badge-red">Rx Required</span>' : '<span class="badge badge-green">OTC</span>'}
      <span class="badge badge-amber">₹${m.price}</span>
    </div>
    <div style="font-size:12px;color:var(--text-muted)">Dosage: ${m.dosage}</div>
  </div>`;
}

// ── SEARCH PAGE ───────────────────────────────────────────────────────────
function renderSearchPage() {
  renderAllDocTable(MM.DOCTORS);
}

function doPageSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) { clearSearch(); return; }
  const filters = {
    spec:  document.getElementById('fSpec').value,
    city:  document.getElementById('fCity').value,
    type:  document.getElementById('fType').value,
  };
  const avail = document.getElementById('fAvail').value;
  const { doctors, medicines } = runSearch(q, filters);
  const filteredDocs = avail === '1' ? doctors.filter(d=>d.available) : doctors;

  let html = `<div class="result-bar">
    <strong>"${q}"</strong>
    <span class="result-bar-sep">·</span>
    ${filteredDocs.length} doctors
    <span class="result-bar-sep">·</span>
    ${medicines.length} medicines
    <span class="result-badge" style="margin-left:auto">Endee Vector DB</span>
  </div>`;

  if (!filteredDocs.length && !medicines.length) {
    html += `<div style="text-align:center;padding:48px;color:var(--text-muted)">No results. Try different keywords.</div>`;
  }
  if (filters.type !== 'medicines' && filteredDocs.length) {
    html += `<div class="section-heading" style="margin-bottom:14px">Doctors <small>${filteredDocs.length} results</small></div><div class="docs-grid stagger">`;
    html += filteredDocs.map(d=>docCardHTML(d)).join('');
    html += '</div>';
  }
  if (filters.type !== 'doctors' && medicines.length) {
    html += `<div class="section-heading" style="margin-bottom:14px">Medicines <small>${medicines.length} results</small></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:32px" class="stagger">`;
    html += medicines.map(m=>medCardHTML(m)).join('');
    html += '</div>';
  }

  document.getElementById('searchResults').innerHTML = html;
  document.getElementById('allDoctorsSection').style.display = 'none';
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('allDoctorsSection').style.display = 'block';
  renderAllDocTable(MM.DOCTORS);
}

function quickSearch(q) {
  document.getElementById('searchInput').value = q;
  doPageSearch();
}

function renderAllDocTable(docs) {
  document.getElementById('allDocTbody').innerHTML = docs.map(d => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${MM.doctorAvatar(d,34)}
          <div>
            <div style="font-weight:600;font-size:14px">${d.name}</div>
          </div>
        </div>
      </td>
      <td><span class="badge ${MM.specColor(d.spec)}">${d.spec}</span></td>
      <td style="font-size:13px">${d.hospital}</td>
      <td style="font-size:13px">${d.city}</td>
      <td style="font-size:13px">${d.exp}y</td>
      <td>${MM.starsHTML(d.rating)} <span style="font-size:13px">${d.rating}</span></td>
      <td style="font-weight:600;font-size:14px">₹${d.fee}</td>
      <td><div class="avail"><div class="avail-dot ${d.available?'on':'off'}"></div>${d.available?'Available':'Busy'}</div></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="Router.go('doctor',{id:${d.id}})">Profile</button>
          <button class="btn btn-primary btn-sm" onclick="openBookingFor(${d.id})">Book</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── DOCTOR PROFILE PAGE ───────────────────────────────────────────────────
function renderDoctorProfile({ id } = {}) {
  const d = MM.DOCTORS.find(x => x.id == id);
  if (!d) { document.getElementById('doctorProfileContent').innerHTML = '<div class="page-shell">Doctor not found.</div>'; return; }
  const reviews = MM.REVIEWS.filter(r => r.doctorId == d.id);
  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : d.rating;
  const colors = ['#0d9488','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#10b981'];
  const color  = colors[d.id % colors.length];

  document.getElementById('doctorProfileContent').innerHTML = `
    <!-- Hero -->
    <div class="profile-hero">
      <div style="max-width:1280px;margin:0 auto;padding:0 32px 8px">
        <button class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,.7);margin-bottom:16px" onclick="history.back()">← Back</button>
      </div>
      <div class="profile-hero-inner">
        <div class="profile-avatar-lg" style="background:${color}">${d.img}</div>
        <div class="profile-info">
          <div class="profile-name">${d.name}</div>
          <div class="profile-spec">${d.spec} · ${d.hospital}, ${d.city}</div>
          <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
            <div class="avail" style="color:rgba(255,255,255,.9)"><div class="avail-dot ${d.available?'on':'off'}"></div>${d.available?'Available now':'Currently busy'}</div>
            <span style="color:rgba(255,255,255,.4)">·</span>
            <span style="color:rgba(255,255,255,.8);font-size:14px">₹${d.fee} per consultation</span>
          </div>
          <div class="profile-stats">
            <div class="profile-stat"><div class="profile-stat-val">${d.exp}</div><div class="profile-stat-label">Years exp</div></div>
            <div class="profile-stat"><div class="profile-stat-val">${avgRating}</div><div class="profile-stat-label">Avg rating</div></div>
            <div class="profile-stat"><div class="profile-stat-val">${reviews.length}</div><div class="profile-stat-label">Reviews</div></div>
            <div class="profile-stat"><div class="profile-stat-val">₹${d.fee}</div><div class="profile-stat-label">Fee</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="profile-body">
      <div class="profile-grid">
        <!-- Left column -->
        <div style="display:flex;flex-direction:column;gap:18px">
          <!-- About -->
          <div class="card" style="padding:24px">
            <div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:12px">About</div>
            <p style="font-size:14px;line-height:1.7;color:var(--navy-soft)">${d.bio}</p>
            <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:7px">
              ${d.symptoms.split(',').map(s=>`<span class="badge badge-teal">${s.trim()}</span>`).join('')}
            </div>
          </div>

          <!-- Reviews -->
          <div class="card" style="overflow:hidden">
            <div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:16px;font-weight:700;color:var(--navy)">Patient Reviews</div>
              <button class="btn btn-outline btn-sm" onclick="openReviewModal(${d.id})">✍ Write Review</button>
            </div>
            <div id="reviewsContainer">
              ${reviews.length ? reviews.map(r => `
                <div class="review-card">
                  <div class="review-header">
                    ${MM.avatarHTML(r.avatar, '#334155', 34)}
                    <div>
                      <div style="font-size:14px;font-weight:600">${r.user}</div>
                      <div class="review-meta">${MM.starsHTML(r.rating)} · ${r.date}</div>
                    </div>
                  </div>
                  <div class="review-text">${r.text}</div>
                </div>`).join('') : `<div style="padding:32px;text-align:center;color:var(--text-muted)">No reviews yet. Be the first!</div>`}
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div style="display:flex;flex-direction:column;gap:18px">
          <!-- Book card -->
          <div class="card" style="padding:22px">
            <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:16px">Book Appointment</div>
            <div style="font-size:14px;color:var(--text-muted);margin-bottom:12px">Available slots today</div>
            <div class="slot-grid" id="slotGrid">
              ${d.slots.map(s=>`<div class="slot-btn" onclick="selectSlot(this,'${s}')">${s}</div>`).join('')}
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px" onclick="openBookingFor(${d.id})">Confirm Booking</button>
            <div style="margin-top:12px;font-size:13px;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              <span>💰</span> Consultation fee: <strong>₹${d.fee}</strong>
            </div>
          </div>

          <!-- Info card -->
          <div class="card" style="padding:22px">
            <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:14px">Doctor Info</div>
            <div class="detail-row"><span class="detail-label">Hospital</span><span class="detail-val">${d.hospital}</span></div>
            <div class="detail-row"><span class="detail-label">City</span><span class="detail-val">${d.city}</span></div>
            <div class="detail-row"><span class="detail-label">Specialization</span><span class="detail-val">${d.spec}</span></div>
            <div class="detail-row"><span class="detail-label">Experience</span><span class="detail-val">${d.exp} years</span></div>
            <div class="detail-row"><span class="detail-label">Rating</span><span class="detail-val">${MM.starsHTML(d.rating)} ${d.rating}/5</span></div>
            <div class="detail-row"><span class="detail-label">Status</span><span class="detail-val">${d.available?'✅ Available':'🔴 Busy'}</span></div>
          </div>
        </div>
      </div>
    </div>`;
}

function selectSlot(el, slot) {
  document.querySelectorAll('.slot-btn').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
}

// ── MEDICINE DETAIL PAGE ──────────────────────────────────────────────────
function renderMedicineDetail({ id } = {}) {
  const m = MM.MEDICINES.find(x => x.id == id);
  if (!m) { document.getElementById('medicineDetailContent').innerHTML = '<div class="page-shell">Medicine not found.</div>'; return; }
  const related = MM.DOCTORS.map(d=>({...d,sim:MM.score(d,m.uses)})).filter(d=>d.sim>0).sort((a,b)=>b.sim-a.sim).slice(0,3);

  document.getElementById('medicineDetailContent').innerHTML = `
    <div class="med-hero">
      <div style="max-width:1280px;margin:0 auto;padding:0 32px 12px">
        <button class="btn btn-ghost btn-sm" style="color:rgba(255,255,255,.7);margin-bottom:16px" onclick="history.back()">← Back</button>
      </div>
      <div class="med-hero-inner" style="max-width:1280px;margin:0 auto;padding:0 32px">
        <div class="med-icon-lg">💊</div>
        <div>
          <h1 style="font-family:var(--font-display);font-size:32px;margin-bottom:6px">${m.name}</h1>
          <div style="font-size:16px;color:rgba(255,255,255,.75);margin-bottom:14px">${m.generic} · ${m.cat}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${m.rx ? '<span class="badge badge-red">Prescription Required</span>' : '<span class="badge badge-green">Over the Counter</span>'}
            <span class="badge badge-navy">₹${m.price}</span>
            <span class="badge badge-teal">${m.cat}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="med-body">
      <div class="med-grid">
        <div style="display:flex;flex-direction:column;gap:18px">
          <!-- Details -->
          <div class="card" style="padding:24px">
            <div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:16px">Medicine Details</div>
            <div class="detail-row"><span class="detail-label">Generic Name</span><span class="detail-val">${m.generic}</span></div>
            <div class="detail-row"><span class="detail-label">Category</span><span class="detail-val">${m.cat}</span></div>
            <div class="detail-row"><span class="detail-label">Dosage</span><span class="detail-val">${m.dosage}</span></div>
            <div class="detail-row"><span class="detail-label">Price</span><span class="detail-val">₹${m.price}</span></div>
            <div class="detail-row"><span class="detail-label">Type</span><span class="detail-val">${m.rx?'Prescription (Rx)':'Over the Counter (OTC)'}</span></div>
            <div class="detail-row"><span class="detail-label">Uses</span><span class="detail-val" style="text-align:right;max-width:280px">${m.uses}</span></div>
          </div>

          <!-- Warning -->
          <div class="warn-box">
            ⚠️ <strong>Medical Disclaimer:</strong> This information is for educational purposes only. Always consult a licensed physician before starting, stopping, or changing any medication.
            ${m.rx ? ' A valid prescription is required to purchase this medicine.' : ''}
          </div>

          <!-- Related docs -->
          ${related.length ? `
          <div class="card" style="overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-size:15px;font-weight:700;color:var(--navy)">Doctors who treat these conditions</div>
            ${related.map(d=>`
              <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);cursor:pointer" onclick="Router.go('doctor',{id:${d.id}})">
                ${MM.doctorAvatar(d,38)}
                <div style="flex:1">
                  <div style="font-size:14px;font-weight:600">${d.name}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${d.spec} · ${d.city}</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openBookingFor(${d.id})">Book</button>
              </div>`).join('')}
          </div>` : ''}
        </div>

        <!-- Sidebar -->
        <div style="display:flex;flex-direction:column;gap:18px">
          <div class="card" style="padding:22px">
            <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:16px">Quick Info</div>
            <div style="font-size:36px;font-weight:800;color:var(--teal);margin-bottom:4px">₹${m.price}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Per strip / unit</div>
            <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--navy)">Common uses:</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${m.uses.split(',').slice(0,6).map(u=>`<span class="badge badge-teal">${u.trim()}</span>`).join('')}
            </div>
          </div>
          <div class="card" style="padding:22px">
            <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:12px">Need a Doctor?</div>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.6">Find specialists who treat conditions this medicine is used for.</p>
            <button class="btn btn-primary btn-full" onclick="Router.go('search')">Find Doctors →</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── RAG PAGE ──────────────────────────────────────────────────────────────
function runRagQuery() {
  const q = document.getElementById('ragInput').value.trim();
  if (!q) { Toast.show('Please enter a question', 'warn'); return; }
  document.getElementById('ragAnswer').textContent = '';
  document.getElementById('ragSources').innerHTML = '';
  document.getElementById('ragDocResults').innerHTML = '';

  RAG.run(q, (answer, docs, meds) => {
    document.getElementById('ragAnswer').textContent = answer;

    // Source pills
    const pills = [
      ...docs.map(d=>`<span class="badge badge-teal">${d.name}</span>`),
      ...meds.map(m=>`<span class="badge badge-blue">${m.name}</span>`)
    ].join('');
    document.getElementById('ragSources').innerHTML =
      `<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;font-weight:600">Sources retrieved from Endee:</div>${pills}`;

    // Doc cards
    if (docs.length) {
      document.getElementById('ragDocResults').innerHTML =
        `<div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;margin-top:20px">Matched Doctors</div>` +
        docs.map(d=>docCardHTML(d)).join('');
    }

    MM.addHistory({ q, time: new Date().toLocaleTimeString(), docs: docs.length, meds: meds.length, type: 'rag' });
  });
}

// ── BOOK PAGE ─────────────────────────────────────────────────────────────
function renderBookPage({ doctorId } = {}) {
  // Populate doctor select
  const sel = document.getElementById('bDoctor');
  sel.innerHTML = MM.DOCTORS.map(d=>`<option value="${d.id}">${d.name} — ${d.spec} (₹${d.fee})</option>`).join('');
  if (doctorId) sel.value = doctorId;
  // Set min date
  document.getElementById('bDate').min = new Date().toISOString().split('T')[0];
  // Pre-fill if logged in
  if (MM.loggedIn && MM.user) {
    document.getElementById('bName').value = MM.user.name;
    document.getElementById('bEmail').value = MM.user.email;
  }
  updateBookingSummary();
}

function updateBookingSummary() {
  const docId = document.getElementById('bDoctor')?.value;
  const date  = document.getElementById('bDate')?.value;
  const time  = document.getElementById('bTime')?.value;
  const type  = document.getElementById('bVisitType')?.value;
  if (!docId) return;
  const doc = MM.DOCTORS.find(d=>d.id==docId);
  if (!doc) return;
  const videoDiscount = type==='video' ? 0.8 : 1;
  const fee = Math.round(doc.fee * videoDiscount);
  document.getElementById('bookSummaryContent').innerHTML = `
    <div class="summary-row"><span>Doctor</span><span style="font-weight:600">${doc.name}</span></div>
    <div class="summary-row"><span>Specialization</span><span>${doc.spec}</span></div>
    <div class="summary-row"><span>Hospital</span><span>${doc.hospital}</span></div>
    <div class="summary-row"><span>Date</span><span>${date || '—'}</span></div>
    <div class="summary-row"><span>Time</span><span>${time}</span></div>
    <div class="summary-row"><span>Type</span><span>${type==='video'?'🎥 Video':'🏥 In-person'}</span></div>
    <div class="summary-row" style="margin-top:8px"><span>Consultation Fee</span><span class="summary-total">₹${fee}</span></div>
    ${type==='video'?'<div style="font-size:12px;color:var(--teal);margin-top:6px">20% discount on video consultations!</div>':''}`;
}

function submitBooking() {
  const name  = document.getElementById('bName').value.trim();
  const phone = document.getElementById('bPhone').value.trim();
  const docId = document.getElementById('bDoctor').value;
  const date  = document.getElementById('bDate').value;
  const time  = document.getElementById('bTime').value;
  if (!name||!phone||!date) { Toast.show('Please fill in all required fields', 'error'); return; }
  const doc = MM.DOCTORS.find(d=>d.id==docId);
  document.getElementById('bookSuccessMsg').innerHTML =
    `Your appointment with <strong>${doc.name}</strong> (${doc.spec}) has been confirmed for <strong>${date}</strong> at <strong>${time}</strong>.<br><br>A confirmation will be sent to your registered contact.`;
  document.getElementById('bookFormArea').style.display='none';
  document.getElementById('bookSuccess').style.display='block';
  Toast.show('Appointment confirmed! 🎉');
  MM.APPOINTMENTS.unshift({ id:'APT'+(Date.now()%10000), patientName: name, doctorId: parseInt(docId), date, time, status:'confirmed', reason: document.getElementById('bSymptoms').value.trim()||'General consultation', fee: doc.fee });
}

function clearBooking() {
  ['bName','bPhone','bEmail','bAge','bDate','bSymptoms'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  updateBookingSummary();
}

function resetBooking() {
  document.getElementById('bookFormArea').style.display='block';
  document.getElementById('bookSuccess').style.display='none';
  clearBooking();
}

// ── HISTORY PAGE ──────────────────────────────────────────────────────────
function renderHistoryPage() {
  renderSearchHistory();
  renderAppointmentHistory();
}

function renderSearchHistory() {
  const list = document.getElementById('historyList');
  const h = MM.history;
  if (!h.length) {
    list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">
      <div style="font-size:32px;margin-bottom:10px">🔍</div>
      <p>No search history yet. Start searching!</p></div>`;
    return;
  }
  list.innerHTML = h.map((item,i) => `
    <div class="history-item">
      <div class="history-icon" style="background:${i%2===0?'var(--teal-light)':'var(--blue-light)'}">
        ${item.type==='rag'?'🤖':'🔍'}
      </div>
      <div style="flex:1;min-width:0">
        <div class="history-q">${item.q}</div>
        <div class="history-meta">${item.time} · ${item.type.toUpperCase()} · ${item.docs} doctors, ${item.meds} medicines</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="rerunSearch('${item.q}','${item.type}')">Repeat</button>
    </div>`).join('');
}

function renderAppointmentHistory() {
  document.getElementById('aptHistoryTbody').innerHTML = MM.APPOINTMENTS.map(a => {
    const doc = MM.DOCTORS.find(d=>d.id===a.doctorId);
    return `<tr>
      <td><span style="font-family:monospace;font-size:12px;font-weight:700;color:var(--teal)">${a.id}</span></td>
      <td><div style="font-weight:600;font-size:14px">${doc?.name||'—'}</div><div style="font-size:12px;color:var(--text-muted)">${doc?.spec||''}</div></td>
      <td style="font-size:13px">${a.date}</td>
      <td style="font-size:13px">${a.time}</td>
      <td style="font-size:13px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.reason}</td>
      <td style="font-weight:600">₹${a.fee}</td>
      <td><span class="status status-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
      <td>
        ${a.status==='confirmed'?`<button class="btn btn-danger btn-sm" onclick="cancelAppointment('${a.id}')">Cancel</button>`:''}
        ${a.status==='completed'?`<button class="btn btn-outline btn-sm" onclick="openReviewModal(${a.doctorId})">Review</button>`:''}
      </td>
    </tr>`;
  }).join('');
}

function switchHistoryTab(tab, btn) {
  document.querySelectorAll('.tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('historySearches').style.display    = tab==='searches'     ? 'block':'none';
  document.getElementById('historyAppointments').style.display= tab==='appointments' ? 'block':'none';
}

function clearAllHistory() {
  MM.history.splice(0);
  renderSearchHistory();
  Toast.show('History cleared');
}

function rerunSearch(q, type) {
  if (type==='rag') { Router.go('rag'); document.getElementById('ragInput').value=q; }
  else { Router.go('search'); document.getElementById('searchInput').value=q; doPageSearch(); }
}

function cancelAppointment(id) {
  const apt = MM.APPOINTMENTS.find(a=>a.id===id);
  if (apt) { apt.status='cancelled'; renderAppointmentHistory(); Toast.show('Appointment cancelled', 'warn'); }
}

// ── ADMIN PAGE ─────────────────────────────────────────────────────────────
function renderAdminPage() {
  renderAdminAppointments();
  renderAdminDoctors();
  renderSpecChart();
}

function renderAdminAppointments() {
  const filter = document.getElementById('adminAptFilter')?.value;
  const apts = filter ? MM.APPOINTMENTS.filter(a=>a.status===filter) : MM.APPOINTMENTS;
  document.getElementById('adminAptList').innerHTML = apts.map(a => {
    const doc = MM.DOCTORS.find(d=>d.id===a.doctorId);
    return `<div class="apt-track">
      <span class="apt-id">${a.id}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${a.patientName}</div>
        <div style="font-size:12px;color:var(--text-muted)">${doc?.name||'—'} · ${a.date} ${a.time}</div>
      </div>
      <span class="status status-${a.status}">${a.status}</span>
      <span style="font-weight:700;font-size:13px;color:var(--navy)">₹${a.fee}</span>
    </div>`;
  }).join('') || '<div style="padding:24px;text-align:center;color:var(--text-muted)">No appointments</div>';
}

function renderAdminDoctors() {
  const q = document.getElementById('adminDocSearch')?.value.toLowerCase()||'';
  const docs = MM.DOCTORS.filter(d=>!q||d.name.toLowerCase().includes(q)||d.spec.toLowerCase().includes(q));
  document.getElementById('adminDocTbody').innerHTML = docs.map(d=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">${MM.doctorAvatar(d,32)}<div style="font-weight:600;font-size:13px">${d.name}</div></div></td>
      <td><span class="badge ${MM.specColor(d.spec)}">${d.spec}</span></td>
      <td style="font-size:13px">${d.hospital}</td>
      <td style="font-size:13px">${d.city}</td>
      <td>${MM.starsHTML(d.rating)} <span style="font-size:12px">${d.rating}</span></td>
      <td style="font-weight:600">₹${d.fee}</td>
      <td><div class="avail"><div class="avail-dot ${d.available?'on':'off'}"></div>${d.available?'Available':'Busy'}</div></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="Router.go('doctor',{id:${d.id}})">View</button>
          <button class="btn btn-ghost btn-sm" onclick="toggleAvail(${d.id})">${d.available?'Set Busy':'Set Available'}</button>
        </div>
      </td>
    </tr>`).join('');
}

function renderSpecChart() {
  const counts = {};
  MM.DOCTORS.forEach(d=>{ counts[d.spec]=(counts[d.spec]||0)+1; });
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const max = sorted[0]?.[1]||1;
  document.getElementById('specChart').innerHTML = sorted.map(([spec,count])=>`
    <div class="bar-row">
      <div class="bar-label">${spec}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/max*100)}%"></div></div>
      <div class="bar-val">${count}</div>
    </div>`).join('');
}

function toggleAvail(id) {
  const d = MM.DOCTORS.find(x=>x.id===id);
  if (d) { d.available=!d.available; renderAdminDoctors(); Toast.show(`${d.name} marked as ${d.available?'available':'busy'}`); }
}

// ── REVIEWS ───────────────────────────────────────────────────────────────
function openReviewModal(doctorId) {
  if (!MM.loggedIn) { LoginModal.open(()=>openReviewModal(doctorId)); return; }
  document.getElementById('reviewDoctorId').value = doctorId;
  document.getElementById('reviewRating').value   = 0;
  document.getElementById('reviewText').value     = '';
  document.querySelectorAll('#starPicker .star-input').forEach(s=>s.className='star-input star-empty');
  Modal.open('modal-review');
}

let _reviewRating = 0;
function pickStar(val) {
  _reviewRating = val;
  document.getElementById('reviewRating').value = val;
  document.querySelectorAll('#starPicker .star-input').forEach((s,i) => {
    s.className = `star-input ${i<val?'star-filled':'star-empty'}`;
  });
}

function submitReview() {
  const rating = parseInt(document.getElementById('reviewRating').value);
  const text   = document.getElementById('reviewText').value.trim();
  const did    = parseInt(document.getElementById('reviewDoctorId').value);
  if (!rating) { Toast.show('Please select a star rating', 'warn'); return; }
  if (!text)   { Toast.show('Please write a review', 'warn'); return; }
  MM.REVIEWS.unshift({ id: Date.now(), doctorId: did, user: MM.user?.name||'Anonymous', rating, text, date: new Date().toISOString().split('T')[0], avatar: (MM.user?.name||'A').slice(0,2).toUpperCase() });
  Modal.close('modal-review');
  Toast.show('Review submitted! Thank you 🌟');
  if (Router.current==='doctor') renderDoctorProfile({id:did});
}

// ── AUTH helpers ──────────────────────────────────────────────────────────
function switchAuthTab(tab, btn) {
  document.querySelectorAll('#modal-login .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('authLogin').style.display    = tab==='login'?'block':'none';
  document.getElementById('authRegister').style.display = tab==='register'?'block':'none';
}

// ── Init ──────────────────────────────────────────────────────────────────
(function init() {
  renderHome();

  // Animate bar chart fills on admin load with slight delay
  document.addEventListener('click', e => {
    if (e.target.dataset.page==='admin') {
      setTimeout(()=>{ document.querySelectorAll('.bar-fill').forEach(b=>{ const w=b.style.width; b.style.width='0'; setTimeout(()=>b.style.width=w,50); }); }, 200);
    }
  });
})();