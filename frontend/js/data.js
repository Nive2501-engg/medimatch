// ── MediMatch shared data & state ─────────────────────────────────────────
const MM = (() => {
  // ── Doctors ──
  const DOCTORS = [
    { id:1,  name:'Dr. Priya Sharma',     spec:'Neurologist',        hospital:'Apollo Hospital',         city:'Chennai',    exp:15, rating:4.8, fee:800,  available:true,  img:'PS', bio:'Expert in headaches, migraines, epilepsy and neurological disorders. Trained at AIIMS Delhi with 15+ years in academic & clinical neurology.', symptoms:'headache,migraine,nausea,light sensitivity,dizziness,seizure,vertigo', slots:['9:00 AM','10:00 AM','11:30 AM','3:00 PM'] },
    { id:2,  name:'Dr. Ramesh Iyer',      spec:'Cardiologist',       hospital:'Fortis Malar',            city:'Chennai',    exp:20, rating:4.9, fee:1200, available:true,  img:'RI', bio:'Pioneer in interventional cardiology with 20 years treating complex cardiac cases. Performed 3000+ angioplasties.', symptoms:'chest pain,shortness of breath,palpitations,fatigue,hypertension,heart failure', slots:['8:30 AM','10:00 AM','2:00 PM','4:30 PM'] },
    { id:3,  name:'Dr. Meena Krishnan',   spec:'Pulmonologist',      hospital:'MIOT International',     city:'Chennai',    exp:12, rating:4.7, fee:700,  available:true,  img:'MK', bio:'Specializes in asthma, COPD, sleep apnea, and respiratory infections. Certified sleep medicine specialist.', symptoms:'cough,breathing difficulty,wheezing,asthma,breathlessness,COPD,sleep apnea', slots:['9:00 AM','11:00 AM','3:00 PM'] },
    { id:4,  name:'Dr. Suresh Babu',      spec:'Gastroenterologist', hospital:'Kauvery Hospital',       city:'Trichy',     exp:18, rating:4.6, fee:900,  available:false, img:'SB', bio:'Leading GI specialist focusing on inflammatory bowel disease and advanced endoscopy.', symptoms:'stomach pain,bloating,diarrhea,nausea,acidity,GERD,IBS,liver disease', slots:['10:00 AM','2:00 PM'] },
    { id:5,  name:'Dr. Kavitha Nair',     spec:'Dermatologist',      hospital:'Skin Care Clinic',       city:'Coimbatore', exp:10, rating:4.5, fee:600,  available:true,  img:'KN', bio:'Cosmetic and clinical dermatologist. Specializes in acne, psoriasis, hair disorders, and aesthetic procedures.', symptoms:'rash,itching,acne,eczema,psoriasis,hair loss,skin allergy,fungal infection', slots:['9:00 AM','10:30 AM','12:00 PM','4:00 PM'] },
    { id:6,  name:'Dr. Anand Patel',      spec:'Orthopedist',        hospital:'Sri Ramachandra Hospital',city:'Chennai',    exp:16, rating:4.7, fee:850,  available:true,  img:'AP', bio:'Sports medicine & joint replacement specialist. Expert in arthroscopic surgery and rehabilitation.', symptoms:'joint pain,knee pain,back pain,arthritis,muscle pain,fracture,sports injury', slots:['8:00 AM','10:00 AM','2:30 PM','4:00 PM'] },
    { id:7,  name:'Dr. Lakshmi Devi',     spec:'Endocrinologist',    hospital:'Global Hospital',        city:'Chennai',    exp:14, rating:4.6, fee:750,  available:true,  img:'LD', bio:'Expert in diabetes, thyroid, PCOS and hormonal disorders. Pioneer in insulin pump therapy.', symptoms:'diabetes,thyroid,fatigue,excessive thirst,frequent urination,weight gain,PCOS', slots:['9:30 AM','11:00 AM','3:00 PM'] },
    { id:8,  name:'Dr. Vijay Kumar',      spec:'Ophthalmologist',    hospital:'Sankara Nethralaya',     city:'Chennai',    exp:22, rating:4.9, fee:900,  available:true,  img:'VK', bio:'Distinguished eye surgeon specializing in cataract, glaucoma, retinal diseases and LASIK.', symptoms:'eye pain,blurry vision,cataract,glaucoma,dry eyes,retina,diabetic eye', slots:['8:00 AM','9:30 AM','11:00 AM','2:00 PM'] },
    { id:9,  name:'Dr. Nalini Raj',       spec:'Psychiatrist',       hospital:'NIMHANS',               city:'Bangalore',  exp:11, rating:4.8, fee:1000, available:true,  img:'NR', bio:'Mental health specialist for depression, anxiety, OCD, and bipolar disorder. CBT certified.', symptoms:'anxiety,depression,stress,insomnia,panic attacks,OCD,bipolar,ADHD', slots:['10:00 AM','12:00 PM','3:00 PM','5:00 PM'] },
    { id:10, name:'Dr. Karthik Sundaram', spec:'ENT Specialist',     hospital:'Asha Hospital',         city:'Chennai',    exp:9,  rating:4.5, fee:650,  available:false, img:'KS', bio:'Otolaryngologist focusing on sinus, hearing disorders, head & neck surgery.', symptoms:'ear pain,sore throat,sinusitis,hearing loss,congestion,tonsils,vertigo', slots:['9:00 AM','11:00 AM'] },
    { id:11, name:'Dr. Mohan Raj',        spec:'General Physician',  hospital:'Primary Care Clinic',   city:'Chennai',    exp:8,  rating:4.4, fee:400,  available:true,  img:'MR', bio:'General practitioner providing primary care for acute and chronic illnesses. Preventive health specialist.', symptoms:'fever,cold,cough,body ache,weakness,flu,fatigue,general checkup', slots:['8:30 AM','10:00 AM','11:30 AM','2:00 PM','4:00 PM'] },
    { id:12, name:'Dr. Arun Balaji',      spec:'Nephrologist',       hospital:'VHS Hospital',          city:'Chennai',    exp:15, rating:4.7, fee:950,  available:true,  img:'AB', bio:'Kidney disease expert managing CKD, kidney stones, dialysis, and transplant follow-up.', symptoms:'kidney pain,frequent urination,swelling,high creatinine,dialysis,kidney stone', slots:['9:00 AM','11:00 AM','3:00 PM'] }
  ];

  const MEDICINES = [
    { id:1,  name:'Crocin',        generic:'Paracetamol',         cat:'Analgesic',               uses:'fever,headache,body ache,cold,flu',                                dosage:'500mg every 4-6 hrs',           price:15,  rx:false },
    { id:2,  name:'Sumatriptan',   generic:'Sumatriptan',         cat:'Migraine Relief',         uses:'migraine,severe headache,nausea,light sensitivity',                dosage:'50mg at onset, max 200mg/day',  price:180, rx:true  },
    { id:3,  name:'Salbutamol',    generic:'Salbutamol',          cat:'Bronchodilator',          uses:'asthma,COPD,shortness of breath,wheezing,breathlessness',          dosage:'2 puffs every 4-6 hrs',         price:120, rx:true  },
    { id:4,  name:'Omeprazole',    generic:'Omeprazole',          cat:'PPI',                     uses:'acidity,GERD,ulcer,heartburn,bloating,stomach pain',               dosage:'20-40mg before meals',          price:55,  rx:false },
    { id:5,  name:'Cetirizine',    generic:'Cetirizine HCl',      cat:'Antihistamine',           uses:'allergy,rash,itching,hay fever,hives,sneezing,runny nose',         dosage:'10mg once daily at night',      price:25,  rx:false },
    { id:6,  name:'Ibuprofen',     generic:'Ibuprofen',           cat:'NSAID',                   uses:'joint pain,arthritis,back pain,fever,inflammation,muscle pain',    dosage:'400mg 3x daily after food',     price:30,  rx:false },
    { id:7,  name:'Amoxicillin',   generic:'Amoxicillin',         cat:'Antibiotic',              uses:'bacterial infection,throat infection,ear infection,UTI,sinusitis',  dosage:'500mg 3x daily for 7 days',     price:65,  rx:true  },
    { id:8,  name:'Metformin',     generic:'Metformin HCl',       cat:'Antidiabetic',            uses:'type 2 diabetes,high blood sugar,excessive thirst,frequent urination',dosage:'500-2000mg daily with meals',  price:45,  rx:true  },
    { id:9,  name:'Levothyroxine', generic:'Levothyroxine Na',    cat:'Thyroid Hormone',         uses:'hypothyroidism,thyroid deficiency,fatigue,weight gain,thyroid',     dosage:'25-200mcg daily empty stomach', price:85,  rx:true  },
    { id:10, name:'Escitalopram',  generic:'Escitalopram',        cat:'SSRI',                    uses:'depression,anxiety,panic disorder,stress,insomnia,OCD',            dosage:'10-20mg once daily',            price:150, rx:true  },
    { id:11, name:'Amlodipine',    generic:'Amlodipine',          cat:'Calcium Channel Blocker', uses:'hypertension,chest pain,angina,high blood pressure,palpitations',  dosage:'5-10mg once daily',             price:40,  rx:true  },
    { id:12, name:'Diclofenac',    generic:'Diclofenac Sodium',   cat:'NSAID',                   uses:'joint pain,back pain,muscle pain,arthritis,sports injury,swelling', dosage:'50mg twice daily after food',   price:35,  rx:false },
    { id:13, name:'Ondansetron',   generic:'Ondansetron HCl',     cat:'Antiemetic',              uses:'nausea,vomiting,dizziness,motion sickness,chemotherapy',           dosage:'4-8mg 3x daily',                price:75,  rx:true  },
    { id:14, name:'Montelukast',   generic:'Montelukast Sodium',  cat:'Leukotriene Antagonist',  uses:'asthma prevention,allergic rhinitis,sneezing,wheezing,cough',      dosage:'10mg once daily in evening',    price:110, rx:true  },
    { id:15, name:'Norfloxacin',   generic:'Norfloxacin',         cat:'Antibiotic',              uses:'UTI,urinary infection,burning urination,frequent urination,kidney', dosage:'400mg twice daily for 7 days',  price:80,  rx:true  }
  ];

  // ── Reviews ──
  const REVIEWS = [
    { id:1, doctorId:1, user:'Ananya S.', rating:5, text:'Dr. Priya diagnosed my chronic migraine after 2 years of suffering. Finally have a proper treatment plan!', date:'2025-12-10', avatar:'AS' },
    { id:2, doctorId:1, user:'Ravi K.',   rating:4, text:'Very thorough examination. Explained everything clearly. Wait time was a bit long.', date:'2026-01-05', avatar:'RK' },
    { id:3, doctorId:2, user:'Preethi M.',rating:5, text:'Dr. Ramesh saved my life. Detected my blocked artery just in time. Highly recommend!', date:'2025-11-22', avatar:'PM' },
    { id:4, doctorId:2, user:'Sunil P.',  rating:5, text:'World-class cardiologist. The entire team at Fortis Malar is excellent.', date:'2026-02-14', avatar:'SP' },
    { id:5, doctorId:5, user:'Deepa R.',  rating:5, text:'My acne is completely clear after 3 months. Dr. Kavitha\'s treatment plan worked wonders!', date:'2026-01-20', avatar:'DR' },
    { id:6, doctorId:9, user:'Meena L.',  rating:5, text:'First time I\'ve felt truly heard by a doctor. Dr. Nalini\'s approach to therapy is incredible.', date:'2026-03-01', avatar:'ML' },
    { id:7, doctorId:6, user:'Arjun V.',  rating:4, text:'Great surgeon. My knee replacement surgery went very smoothly. Recovery was faster than expected.', date:'2026-02-08', avatar:'AV' },
  ];

  // ── Appointments ──
  const APPOINTMENTS = [
    { id:'APT001', patientName:'You', doctorId:1, date:'2026-04-20', time:'10:00 AM', status:'confirmed',  reason:'Recurring migraines', fee:800 },
    { id:'APT002', patientName:'You', doctorId:5, date:'2026-03-15', time:'9:00 AM',  status:'completed',  reason:'Skin rash follow-up',  fee:600 },
    { id:'APT003', patientName:'You', doctorId:11,date:'2026-04-02', time:'11:30 AM', status:'cancelled',  reason:'Fever and cold',       fee:400 },
    { id:'APT004', patientName:'You', doctorId:7, date:'2026-04-28', time:'11:00 AM', status:'pending',    reason:'Diabetes follow-up',   fee:750 },
  ];

  const NOTIFICATIONS = [
    { id:1, type:'appointment', msg:'Appointment with Dr. Priya Sharma confirmed for Apr 20 at 10:00 AM', time:'2h ago', read:false, icon:'📅', bg:'#e0fdf4' },
    { id:2, type:'reminder',    msg:'Reminder: Take Cetirizine 10mg tonight before bed', time:'5h ago', read:false, icon:'💊', bg:'#fef9c3' },
    { id:3, type:'result',      msg:'Your last appointment summary with Dr. Kavitha Nair is ready', time:'1d ago', read:true,  icon:'📋', bg:'#dbeafe' },
    { id:4, type:'review',      msg:'Please rate your experience with Dr. Mohan Raj', time:'2d ago', read:true,  icon:'⭐', bg:'#fef3c7' },
  ];

  // ── Auth state ──
  let currentUser = null;
  let isLoggedIn  = false;
  let searchHistory = [];

  // ── Score for vector-sim ──
  function score(item, q) {
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (!words.length) return 0;
    const text = [item.spec, item.bio, item.symptoms, item.uses, item.cat, item.name, item.generic]
      .filter(Boolean).join(' ').toLowerCase();
    let s = 0;
    words.forEach(w => { if (text.includes(w)) s++; });
    return s / words.length;
  }

  // ── Star HTML ──
  function starsHTML(rating, max = 5) {
    let html = '<span class="stars">';
    for (let i = 1; i <= max; i++) {
      html += `<span class="${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    html += '</span>';
    return html;
  }

  // ── Avatar HTML ──
  function avatarHTML(initials, color = '#0d9488', size = 40) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.35)}px;font-weight:700;flex-shrink:0;">${initials}</div>`;
  }

  function doctorAvatar(doc, size = 40) {
    const colors = ['#0d9488','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#10b981'];
    const color  = colors[doc.id % colors.length];
    return avatarHTML(doc.img, color, size);
  }

  function specColor(spec) {
    const m = { Neurologist:'badge-purple', Cardiologist:'badge-red', Pulmonologist:'badge-blue',
      Gastroenterologist:'badge-teal', Dermatologist:'badge-green', Orthopedist:'badge-amber',
      Endocrinologist:'badge-teal', Psychiatrist:'badge-purple', Ophthalmologist:'badge-blue',
      'ENT Specialist':'badge-navy', 'General Physician':'badge-green', Nephrologist:'badge-blue' };
    return m[spec] || 'badge-navy';
  }

  return { DOCTORS, MEDICINES, REVIEWS, APPOINTMENTS, NOTIFICATIONS,
           score, starsHTML, avatarHTML, doctorAvatar, specColor,
           get user() { return currentUser; },
           get loggedIn() { return isLoggedIn; },
           get history() { return searchHistory; },
           login(u) { currentUser = u; isLoggedIn = true; },
           logout() { currentUser = null; isLoggedIn = false; },
           addHistory(h) { searchHistory.unshift(h); if (searchHistory.length > 50) searchHistory.pop(); }
  };
})();