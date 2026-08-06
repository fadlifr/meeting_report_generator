// ============================================================
// APP LOGIC — Main Application Functions & Rendering
// Depends on: data.js, templates.js
// ============================================================

let isAutoFit = { manual: true, auto: true };

const PROPER_NOUNS_MAP = {};
[
  'Scratch', 'ScratchJr', 'Roblox', 'Python', 'OpenCV', 'Kodu', 'Delightex', 'DelightEx',
  'Cue', 'Dash', 'Micro:bit', 'Maqueen', 'Construct', 'Numpy', 'Tensorflow',
  'Discord', 'Google', 'Colab', 'Seaborn', 'Pandas', 'Plotly', 'React',
  'Native', 'Android', 'JavaScript', 'HTML', 'CSS', 'MIT', 'App', 'Inventor',
  'AI', 'VR', 'AR', '3D', 'RNG', 'GUI', 'UI', 'UX', 'IoT', 'API', 'OOP', 'SSD',
  'ANPR', 'OCR', 'KNN', 'NLP', 'NLTK', 'Canny', 'Mediapipe', 'Pygame', 'Netlify',
  'Construct', 'Merge', 'Cube', 'Edu', 'Osmo', 'Block', 'Blocks',
  'Bluetooth', 'Wifi', 'Internet', 'YouTube', 'Line', 'WhatsApp', 'Zoom'
].forEach(w => PROPER_NOUNS_MAP[w.toLowerCase()] = w);

function toSentenceCase(str) {
  if (!str) return str;
  let sentence = str.replace(/\b([A-Z][a-z]+)\b/g, (match) => {
    const lowerMatch = match.toLowerCase();
    return PROPER_NOUNS_MAP[lowerMatch] ? PROPER_NOUNS_MAP[lowerMatch] : lowerMatch;
  });
  if (sentence.length > 1 && sentence[0] === sentence[0].toUpperCase() && sentence[1] === sentence[1].toLowerCase()) {
    sentence = sentence.charAt(0).toLowerCase() + sentence.slice(1);
  }
  return sentence;
}

function getPartialObjectives(objectives) {
  if (!objectives || objectives.length === 0) return [];
  if (objectives.length === 1) return objectives;
  return objectives.slice(0, Math.ceil(objectives.length / 2));
}

function formatObjectives(objectives, lang) {
  if (!objectives || objectives.length === 0) return '';
  const obj = objectives.map(o => toSentenceCase(o));
  if (obj.length === 1) return obj[0];
  const last = obj.pop();
  const andWord = lang === 'en' ? 'and' : 'dan';
  return obj.join(', ') + `, ${andWord} ` + last;
}


function fitPreviewScale() {
  // Get width from the currently active tab so we can pre-scale the hidden tab
  let containerWidth = 0;
  const activeScroll = document.querySelector('.tab-content.active .preview-scroll');
  if (activeScroll) containerWidth = activeScroll.clientWidth;
  
  if (containerWidth === 0) {
    // Retry if width is 0 (happens on very early initial load)
    if (!fitPreviewScale.attempts) fitPreviewScale.attempts = 0;
    if (fitPreviewScale.attempts++ < 10) setTimeout(fitPreviewScale, 100);
    return;
  }
  fitPreviewScale.attempts = 0;

  ['manual', 'auto'].forEach(tab => {
    const previewId = tab === 'manual' ? 'report-preview' : 'auto-report-preview';
    const wrapperId = 'wrapper-' + tab;
    const scrollId = 'scroll-' + tab;
    const btnId = 'btn-zoom-' + tab;

    const el = document.getElementById(previewId);
    const wrapper = document.getElementById(wrapperId);
    const scroll = document.getElementById(scrollId);
    const btn = document.getElementById(btnId);

    if (!el || !wrapper || !scroll) return;

    const targetWidth = 1000;

    if (isAutoFit[tab]) {
      // Fit to container exactly (shrink or enlarge to fit width)
      const scale = containerWidth / targetWidth;
      el.style.transform = `scale(${scale})`;
      el.style.transformOrigin = 'top left';
      wrapper.style.height = Math.ceil(el.offsetHeight * scale) + 'px';
      wrapper.style.width = '100%';
      scroll.style.overflowX = 'hidden';
      if (btn) btn.innerHTML = '🔍 100% Size';
    } else {
      // 100% Size mode
      el.style.transform = 'none';
      wrapper.style.height = 'auto';
      wrapper.style.width = '1000px';
      scroll.style.overflowX = 'auto';
      if (btn) btn.innerHTML = '🔍 Fit to Screen';
    }
  });
}

function toggleZoomMode(tab) {
  isAutoFit[tab] = !isAutoFit[tab];
  fitPreviewScale();
}

window.addEventListener('resize', fitPreviewScale);

// Bulletproof scaling listener for when elements become visible or resize
const resizeObserver = new ResizeObserver(() => {
  fitPreviewScale();
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.preview-scroll').forEach(el => resizeObserver.observe(el));
  // Init photo grids so the "+" tile shows immediately
  renderManualPhotoInputs();
  renderAutoPhotoInputs();
});

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (window.event && window.event.target) window.event.target.classList.add('active');
  setTimeout(fitPreviewScale, 50);
}

// ============================================================
// UTILS
// ============================================================
const HARI_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const BULAN_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const HARI_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function formatDateLong(val, lang = 'en') {
  if(!val) return '—';
  const [y,m,d] = val.split('-').map(Number);
  const dt = new Date(y,m-1,d);
  if (lang === 'id') {
    return `${HARI_ID[dt.getDay()]}, ${d} ${BULAN_ID[m-1]} ${y}`;
  }
  return `${HARI_EN[dt.getDay()]}, ${d} ${BULAN_EN[m-1]} ${y}`;
}
function formatDate(s) {
  if(!s) return '—';
  const [y,m,d] = s.split('-');
  return `${d}-${m}-${y}`;
}
function formatDateFile(s, lang = 'id') {
  if(!s) return '';
  const [y,m,d] = s.split('-');
  const b = lang === 'en' ? BULAN_EN : BULAN_ID;
  return `${parseInt(d,10)}${b[parseInt(m,10)-1]}${y}`;
}
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatProgressHTML(text) {
  if (!text) return '<em style="color:#94a3b8">—</em>';
  let formatted = escHtml(text);
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}
function toast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 3000);
}

// ============================================================
// MANUAL TAB
// ============================================================
let students = [
  {nama:"Iron Man",progress:"Iron Man learned about creating AR games on Delightex with animal themes (*Lesson 14*). Also studied drone logic on Tynker.\n\nNote: Iron Man completed all tasks very well and is starting to understand loop concepts."},
  {nama:"Spider-Man",progress:"Spider-Man is currently working on *Lesson 14* (Introduction to Variables). Spider-Man understood the main concepts well and will continue in our next class."}
];
// Dynamic photo arrays (each entry: {src: dataURL})
let photoList = [];       // Manual tab
let autoPhotoList = [];   // Auto tab

// ---- Manual Photo Management ----
function renderManualPhotoInputs() {
  const container = document.getElementById('manual-photo-inputs');
  if (!container) return;
  container.innerHTML = '';

  // Hidden multi-file input
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'file';
  hiddenInput.accept = 'image/*';
  hiddenInput.multiple = true;
  hiddenInput.id = 'manual-file-hidden';
  hiddenInput.style.display = 'none';
  hiddenInput.addEventListener('change', onManualPhotoChange);
  container.appendChild(hiddenInput);

  // Photo grid
  const grid = document.createElement('div');
  grid.className = 'photo-grid-upload';
  grid.dataset.count = photoList.length; // for CSS dynamic columns

  photoList.forEach((p, i) => {
    if (!p.src) return;
    const thumb = document.createElement('div');
    thumb.className = 'photo-grid-thumb';
    thumb.innerHTML = `
      <img src="${p.src}" alt="Photo ${i+1}">
      <button type="button" class="btn-del-overlay" onclick="removeManualPhoto(${i})" title="Remove">✕</button>
    `;
    grid.appendChild(thumb);
  });

  // Add tile
  const addTile = document.createElement('div');
  addTile.className = 'photo-grid-add';
  addTile.title = 'Add photos';
  addTile.innerHTML = '<span class="photo-grid-add-icon">+</span><span>Add Photo</span>';
  addTile.addEventListener('click', () => document.getElementById('manual-file-hidden').click());
  grid.appendChild(addTile);

  container.appendChild(grid);
}
function addManualPhoto() {
  // Trigger the hidden input (kept for btn-add-photo button compatibility)
  const input = document.getElementById('manual-file-hidden');
  if (input) { input.click(); } else {
    renderManualPhotoInputs();
    setTimeout(() => document.getElementById('manual-file-hidden')?.click(), 50);
  }
}
function onManualPhotoChange(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      photoList.push({src: ev.target.result});
      loaded++;
      if (loaded === files.length) {
        renderManualPhotoInputs();
        renderManualPhotoPreview();
      }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = ''; // reset so same files can be re-selected
}
function removeManualPhoto(i) {
  photoList.splice(i, 1);
  renderManualPhotoInputs();
  renderManualPhotoPreview();
  toast('Photo removed', 'success');
}
function renderManualPhotoPreview() {
  const section = document.getElementById('manual-photo-section');
  const grid = document.getElementById('manual-photos-grid');
  if (!section || !grid) return;
  const uploaded = photoList.filter(p => p.src);
  if (uploaded.length === 0) {
    section.style.display = 'none';
    grid.innerHTML = '';
    fitPreviewScale();
    return;
  }
  section.style.display = 'flex';
  grid.innerHTML = '';
  grid.dataset.count = uploaded.length; // for CSS dynamic grid layout
  uploaded.forEach((p, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'rpt-photo-wrap has-photo';
    wrap.innerHTML = `<img src="${p.src}" alt="Photo ${i+1}">`;
    grid.appendChild(wrap);
  });
  fitPreviewScale();
}

function buildWAMessage(){
  const tgl = document.getElementById('input-tanggal').value;
  const kelas = document.getElementById('input-kelas').value || '—';
  const studentLines = students.map(s=>`*${s.nama}*\n${s.progress}`).join('\n\n');
  return `Good afternoon parents, ✨\n\nHere is a quick update on our students' progress in today's class:\n\n📌 *Class:* ${kelas}\n📅 *Date:* ${formatDateLong(tgl, 'en')}\n\n${studentLines}\n\nThank you for your continued support! If you have any questions about today's lesson, feel free to reach out.\n\nHave a wonderful day! 😊`;
}
function updateWAPreview(){
  document.getElementById('wa-bubble-text').textContent = buildWAMessage();
}
function updatePreview(){
  const kelas = document.getElementById('input-kelas').value || '—';
  const tgl = document.getElementById('input-tanggal').value;
  document.getElementById('prev-kelas').textContent = kelas;
  document.getElementById('prev-tanggal').textContent = formatDate(tgl);
  updateWAPreview();
  if (typeof updateMascots === 'function') updateMascots();
}
function getLessonTag(s) {
  if (!s) return '';
  if (s.lesson) {
    if ((s.status === 'double' || s.status === 'one_and_half') && s.lesson2) {
      return `Lesson ${s.lesson} & ${s.lesson2}`;
    }
    return `Lesson ${s.lesson}`;
  }
  const match = (s.progress || '').match(/Lesson\s+(\d+(?:\s*(?:&|and|,)\s*\d+)?)/i);
  return match ? match[0] : '';
}

function renderTable(){
  const tbody = document.getElementById('prev-tbody');
  tbody.innerHTML = '';
  students.forEach(s => {
    if(!s.nama && !s.progress) return;
    
    // Status dot: green = done, yellow = in progress / absent
    const isInProgress = /in progress|working on|belum|excused|absent/i.test(s.progress || '');
    const dotClass = isInProgress ? 'dot-progress' : 'dot-done';
    
    const lessonTag = getLessonTag(s);
    
    const div = document.createElement('div');
    div.className = 'rpt-student-card';
    div.innerHTML = `
      <div class="card-status-col">
        <div class="timeline-node"><span class="timeline-dot ${dotClass}"></span></div>
      </div>
      <div class="card-name-col">
        <span class="student-name-text">${escHtml(s.nama) || '<em style="color:#94a3b8">—</em>'}</span>
      </div>
      <div class="card-lesson-col">
        ${lessonTag ? `<span class="lesson-pill">${escHtml(lessonTag)}</span>` : ''}
      </div>
      <div class="card-progress-col">
        ${formatProgressHTML(s.progress)}
      </div>
    `;
    tbody.appendChild(div);
  });
  fitPreviewScale();
}
function renderInputs(){
  const c = document.getElementById('students-container');
  c.innerHTML = '';
  students.forEach((s,i) => {
    const div = document.createElement('div');
    div.className = 'student-card';
    div.innerHTML = `
      <div class="student-card-header">
        <div class="student-num">${i+1}</div>
        <input type="text" placeholder="Student name…" value="${escHtml(s.nama)}" oninput="students[${i}].nama=this.value;renderTable()">
        <button class="btn-del" onclick="removeStudent(${i})" title="Remove">×</button>
      </div>
      <textarea placeholder="Progress details or notes…" oninput="students[${i}].progress=this.value;renderTable()">${escHtml(s.progress)}</textarea>`;
    c.appendChild(div);
  });
  renderTable();
}
function addStudent(){
  students.push({nama:'',progress:''});
  renderInputs();
  const cards = document.querySelectorAll('#students-container .student-card');
  if(cards.length) cards[cards.length-1].scrollIntoView({behavior:'smooth',block:'nearest'});
}
function removeStudent(i){
  if(students.length<=1){toast('Minimum 1 student required.','error');return;}
  students.splice(i,1);
  renderInputs();
}
// ---- Auto Photo Management ----
function renderAutoPhotoInputs() {
  const container = document.getElementById('auto-photo-inputs');
  if (!container) return;
  container.innerHTML = '';

  // Hidden multi-file input
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'file';
  hiddenInput.accept = 'image/*';
  hiddenInput.multiple = true;
  hiddenInput.id = 'auto-file-hidden';
  hiddenInput.style.display = 'none';
  hiddenInput.addEventListener('change', onAutoPhotoChange);
  container.appendChild(hiddenInput);

  // Photo grid
  const grid = document.createElement('div');
  grid.className = 'photo-grid-upload';
  grid.dataset.count = autoPhotoList.length; // for CSS dynamic columns

  autoPhotoList.forEach((p, i) => {
    if (!p.src) return;
    const label = autoLang === 'id' ? `Foto ${i + 1}` : `Photo ${i + 1}`;
    const thumb = document.createElement('div');
    thumb.className = 'photo-grid-thumb';
    thumb.innerHTML = `
      <img src="${p.src}" alt="${label}">
      <button type="button" class="btn-del-overlay" onclick="removeAutoPhoto(${i})" title="Remove">✕</button>
    `;
    grid.appendChild(thumb);
  });

  // Add tile
  const addTile = document.createElement('div');
  addTile.className = 'photo-grid-add';
  addTile.title = 'Add photos';
  addTile.innerHTML = '<span class="photo-grid-add-icon">+</span><span>Add Photo</span>';
  addTile.addEventListener('click', () => document.getElementById('auto-file-hidden').click());
  grid.appendChild(addTile);

  container.appendChild(grid);
}
function addAutoPhoto() {
  const input = document.getElementById('auto-file-hidden');
  if (input) { input.click(); } else {
    renderAutoPhotoInputs();
    setTimeout(() => document.getElementById('auto-file-hidden')?.click(), 50);
  }
}
function onAutoPhotoChange(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      autoPhotoList.push({src: ev.target.result});
      loaded++;
      if (loaded === files.length) {
        renderAutoPhotoInputs();
        renderAutoPhotoPreview();
      }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}
function removeAutoPhoto(i) {
  autoPhotoList.splice(i, 1);
  renderAutoPhotoInputs();
  renderAutoPhotoPreview();
  toast('Photo removed', 'success');
}
function renderAutoPhotoPreview() {
  const section = document.getElementById('auto-photo-section');
  const grid = document.getElementById('auto-photos-grid');
  if (!section || !grid) return;
  const uploaded = autoPhotoList.filter(p => p.src);
  if (uploaded.length === 0) {
    section.style.display = 'none';
    grid.innerHTML = '';
    fitPreviewScale();
    return;
  }
  section.style.display = 'flex';
  grid.innerHTML = '';
  grid.dataset.count = uploaded.length; // for CSS dynamic grid layout
  uploaded.forEach((p, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'rpt-photo-wrap has-photo';
    wrap.innerHTML = `<img src="${p.src}" alt="Photo ${i+1}">`;
    grid.appendChild(wrap);
  });
  fitPreviewScale();
}

// Canvas capture helper
async function captureImage(elementId) {
  const el = document.getElementById(elementId);
  const originalOverflow = el.style.overflow;
  el.style.overflow = 'visible';
  
  const canvas = await html2canvas(el, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.transform = 'none';
        clonedEl.style.width = '1000px';
        clonedEl.style.minWidth = '1000px';
        if (clonedEl.parentElement) {
          clonedEl.parentElement.style.height = 'auto';
          clonedEl.parentElement.style.width = '1000px';
          clonedEl.parentElement.style.overflow = 'visible';
        }
      }
    }
  });
  
  el.style.overflow = originalOverflow;
  return canvas;
}

// Compress canvas to JPEG blob for small file size
function canvasToJpegBlob(canvas, quality = 0.82) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

async function downloadPNG(){
  const btn=document.getElementById('btn-png'); btn.disabled=true; btn.textContent='Processing...';
  toast('Creating image...');
  try{
    const canvas = await captureImage('report-preview');
    const blob = await canvasToJpegBlob(canvas, 0.82);
    const link = document.createElement('a');
    const kelas = document.getElementById('input-kelas').value.replace(/\s+/g,'_')||'Report';
    const rawTgl = document.getElementById('input-tanggal').value;
    const tanggalFile = formatDateFile(rawTgl, autoLang);
    link.download=`Meeting Report_${kelas}_${tanggalFile}.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    toast('Downloaded! (compressed JPEG)','success');
  }catch(err){toast('Failed: '+err.message,'error');}
  finally{btn.disabled=false; btn.textContent='Download PNG';}
}
async function openWhatsApp(){
  const btn=document.getElementById('btn-wa'); btn.disabled=true; btn.textContent='Preparing...';
  try{
    const canvas = await captureImage('report-preview');
    const blob = await canvasToJpegBlob(canvas, 0.82);
    const link = document.createElement('a');
    const kelas = document.getElementById('input-kelas').value.replace(/\s+/g,'_')||'Report';
    const tanggal = formatDate(document.getElementById('input-tanggal').value);
    link.download=`Meeting Report_${kelas}_${tanggal}.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    await new Promise(r=>setTimeout(r,800));
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(buildWAMessage()),'_blank');
    toast('Done!','success');
  }catch(err){toast('Failed: '+err.message,'error');}
  finally{btn.disabled=false; btn.textContent='Send to WhatsApp';}
}
async function copyWAMessage() {
  try {
    await navigator.clipboard.writeText(buildWAMessage());
    toast('WhatsApp message copied!', 'success');
  } catch(e) {
    const ta = document.createElement('textarea');
    ta.value = buildWAMessage();
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('WhatsApp message copied!', 'success');
  }
}
async function downloadPDF(){
  const btn=document.getElementById('btn-pdf'); btn.disabled=true; btn.textContent='Processing...';
  toast('Creating PDF...');
  try{
    const kelas=document.getElementById('input-kelas').value||'—';
    const tanggal=formatDate(document.getElementById('input-tanggal').value);
    await buildAndSavePDF({
      kelas, tanggal,
      photoStore: photoList.filter(p => p.src).map(p => p.src),
      students,
      labels: {
        title: 'Student Progress Report',
        labelKelas: 'Class: ', offsetKelas: 30,
        labelTanggal: 'Date: ', offsetTanggal: 34,
        colName: 'STUDENT NAME', colProgress: "TODAY'S PROGRESS",
        photoEmpty: (i) => `Foto ${i} belum diupload`,
        fileName: `Meeting_Report_${kelas.replace(/\s+/g,'_')}_${formatDateFile(document.getElementById('input-tanggal').value, autoLang)}`
      }
    });
    toast('PDF downloaded!','success');
  }catch(err){toast('Failed: '+err.message,'error');}
  finally{btn.disabled=false; btn.textContent='Export PDF';}
}

// ============================================================
// AUTO TAB
// ============================================================
let autoStudents = [];
let autoLang = 'en'; // Default English

const LANG_UI = {
  id: {
    cardTitle: 'Data Siswa & Generate Laporan',
    addBtn: '+ Tambah Siswa',
    waBtn: 'Kirim ke WhatsApp',
    waTitle: 'Preview Pesan WhatsApp',
    tip: '<strong>Cara pakai:</strong> Masukkan nama siswa → pilih kriteria, course, dan status lesson → klik ⚡ Generate untuk auto-generate teks progress.',
    previewLabel: 'Live Preview — Report',
    rptTitle: 'Laporan Progress<br><span>Siswa</span>',
    labelKelas: 'Kelas',
    labelTanggal: 'Tanggal',
    photo1: 'Foto 1', photo2: 'Foto 2',
    thName: 'Nama Siswa', thProgress: 'Progress Hari Ini',
    critPlaceholder: '— Kriteria —',
    coursePlaceholder: '— Course —',
    lessonPlaceholder: '— Lesson —',
    lesson2Placeholder: '— Lesson ke-2 —',
    statusDone: '✓ Selesai 1 Lesson',
    statusInProgress: '⏳ Belum Selesai (1 Lesson In Progress)',
    statusOneAndHalf: '🌖 Selesai 1.5 Lesson (1 Selesai + 1 Lanjut)',
    statusDouble: '🚀 Selesai 2 Lesson',
    generateBtn: '⚡ Generate Progress',
    studentPlaceholder: 'Nama siswa…',
    progressPlaceholder: 'Progress akan ter-generate otomatis, atau ketik manual…',
    toastGenerated: '✓ Progress berhasil di-generate!',
    errName: 'Masukkan nama siswa dulu!',
    errCourse: 'Pilih course terlebih dahulu!',
    errLesson: 'Pilih lesson terlebih dahulu!',
    errLesson2: 'Pilih lesson ke-2 terlebih dahulu!',
    errMinStudent: 'Minimum 1 siswa.',
    fallbackProgress: (nama, lessonNum, course, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} telah menyelesaikan *Lesson ${lessonNum}* pada course ${course}.`;
      return `Pada pertemuan ini, ${nama} telah menyelesaikan *Lesson ${lessonNum}*. ${nama} berhasil ${formatObjectives(objectives, 'id')}.`;
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} sedang mempelajari *${lessonTitle}*. ${nama} telah memahami konsep dasarnya dan akan melanjutkan penyelesaian projek pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} sedang mempelajari *${lessonTitle}*. Pada sesi ini, ${nama} sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Sisa materi dan project akan dilanjutkan pada pertemuan berikutnya.`;
    },
    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *${l2Title}*, yang akan dilanjutkan pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *${l2Title}* dan sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Materi ini akan dilanjutkan pada pertemuan berikutnya.`;
    },
    doubleText: (nama, l1Num, t1, l2Num, t2) => `${nama} telah menyelesaikan 2 lesson pada pertemuan hari ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*).\n\n• *Lesson ${l1Num}*: ${t1}\n• *Lesson ${l2Num}*: ${t2}`,
    waGreeting: (kelas, tgl) => `Selamat siang Bapak/Ibu Parents, ✨\n\nBerikut adalah laporan ringkas mengenai aktivitas dan perkembangan belajar anak-anak pada pertemuan kelas hari ini:\n\n📌 *Kelas:* ${kelas}\n📅 *Tanggal:* ${tgl}`,
    waClose: 'Terima kasih atas perhatian dan dukungan Bapak/Ibu. Jika ada pertanyaan mengenai materi hari ini, jangan ragu untuk menghubungi kami.\n\nSemoga harinya menyenangkan! 😊',
    pdfTitle: 'Laporan Progress Siswa',
    pdfLabelKelas: 'Kelas: ', pdfOffsetKelas: 32,
    pdfLabelTanggal: 'Tanggal: ', pdfOffsetTanggal: 38,
    pdfColName: 'NAMA SISWA', pdfColProgress: 'PROGRESS HARI INI',
    pdfPhotoEmpty: (i) => `Foto ${i} belum diupload`,
    fileName: (kelas, tgl) => `Meeting Report_${kelas}_${tgl}`,
  },
  en: {
    cardTitle: 'Student Data & Generate Report',
    addBtn: '+ Add Student',
    waBtn: 'Send to WhatsApp',
    waTitle: 'WhatsApp Message Preview',
    tip: '<strong>How to use:</strong> Enter student name → choose level, course, and lesson status → click ⚡ Generate to auto-create progress text.',
    previewLabel: 'Live Preview — Report',
    rptTitle: 'Student<br><span>Progress Report</span>',
    labelKelas: 'Class',
    labelTanggal: 'Date',
    photo1: 'Photo 1', photo2: 'Photo 2',
    thName: 'Student Name', thProgress: "Today's Progress",
    critPlaceholder: '— Level —',
    coursePlaceholder: '— Course —',
    lessonPlaceholder: '— Lesson —',
    lesson2Placeholder: '— 2nd Lesson —',
    statusDone: '✓ Completed 1 Lesson',
    statusInProgress: '⏳ In Progress (1 Unfinished Lesson)',
    statusOneAndHalf: '🌖 Completed 1.5 Lessons (1 Finished + 1 In Progress)',
    statusDouble: '🚀 Completed 2 Lessons',
    generateBtn: '⚡ Generate Report',
    studentPlaceholder: 'Student name…',
    progressPlaceholder: 'Progress will be auto-generated, or type manually…',
    toastGenerated: '✓ Progress generated!',
    errName: 'Please enter the student name first!',
    errCourse: 'Please select a course first!',
    errLesson: 'Please select a lesson first!',
    errLesson2: 'Please select the 2nd lesson first!',
    errMinStudent: 'Minimum 1 student.',
    fallbackProgress: (nama, lessonNum, course, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} completed *Lesson ${lessonNum}* in the ${course} course today.`;
      return `In today's session, ${nama} completed *Lesson ${lessonNum}*. ${nama} successfully learned to ${formatObjectives(objectives, 'en')}.`;
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} is currently working on *${lessonTitle}*. ${nama} has understood the core concepts and will continue the project in the next session.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} is currently working on *${lessonTitle}*. In this session, ${nama} has started learning how to ${formatObjectives(partial, 'en')}. The remaining materials and project will be continued in the next session.`;
    },
    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *${l2Title}*, which will be continued in the next session.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *${l2Title}* and has begun learning how to ${formatObjectives(partial, 'en')}. This will be continued in the next session.`;
    },
    doubleText: (nama, l1Num, t1, l2Num, t2) => `${nama} completed 2 lessons in today's session (*Lesson ${l1Num}* & *Lesson ${l2Num}*).\n\n• *Lesson ${l1Num}*: ${t1}\n• *Lesson ${l2Num}*: ${t2}`,
    waGreeting: (kelas, tgl) => `Good afternoon parents, ✨\n\nHere is a quick update on our students' progress in today's class:\n\n📌 *Class:* ${kelas}\n📅 *Date:* ${tgl}`,
    waClose: 'Thank you for your continued support! If you have any questions about today\'s lesson, feel free to reach out.\n\nHave a wonderful day! 😊',
    pdfTitle: 'Student Progress Report',
    pdfLabelKelas: 'Class: ', pdfOffsetKelas: 26,
    pdfLabelTanggal: 'Date: ', pdfOffsetTanggal: 28,
    pdfColName: 'STUDENT NAME', pdfColProgress: "TODAY'S PROGRESS",
    pdfPhotoEmpty: (i) => `Photo ${i} not uploaded`,
    fileName: (kelas, tgl) => `Meeting Report_${kelas}_${tgl}`,
  }
};

function setLang(lang){
  autoLang = lang;
  document.getElementById('lang-btn-id').classList.toggle('active', lang==='id');
  document.getElementById('lang-btn-en').classList.toggle('active', lang==='en');
  const L = LANG_UI[lang];
  
  const studentCardTitle = document.getElementById('auto-student-card-title');
  if(studentCardTitle) studentCardTitle.textContent = L.cardTitle;
  const autoAddBtn = document.getElementById('auto-add-btn');
  if(autoAddBtn) autoAddBtn.textContent = L.addBtn;
  const autoWaBtn = document.getElementById('abtn-wa');
  if(autoWaBtn) autoWaBtn.textContent = L.waBtn;
  const autoWaTitle = document.getElementById('auto-wa-title');
  if(autoWaTitle) autoWaTitle.textContent = L.waTitle;
  const autoTipBox = document.getElementById('auto-tip-box');
  if(autoTipBox) autoTipBox.innerHTML = L.tip;
  const autoPreviewLabel = document.getElementById('auto-preview-label-text');
  if(autoPreviewLabel) autoPreviewLabel.textContent = L.previewLabel;
  const autoRptTitle = document.getElementById('auto-rpt-title');
  if(autoRptTitle) autoRptTitle.innerHTML = L.rptTitle;
  const autoLabelKelas = document.getElementById('auto-label-kelas');
  if(autoLabelKelas) autoLabelKelas.textContent = L.labelKelas;
  const autoLabelTanggal = document.getElementById('auto-label-tanggal');
  if(autoLabelTanggal) autoLabelTanggal.textContent = L.labelTanggal;
  // Re-render photo inputs with updated language labels
  renderAutoPhotoInputs();
  
  const photoSecTitle = document.getElementById('auto-photo-sec-title');
  if(photoSecTitle) photoSecTitle.textContent = lang === 'id' ? 'Foto Dokumentasi Kegiatan' : 'Classroom Activity Snapshots';
  const progressSecTitle = document.getElementById('auto-progress-sec-title');
  if(progressSecTitle) progressSecTitle.textContent = lang === 'id' ? 'Progress & Perkembangan Siswa' : 'Student Learning & Progress';
  
  const autoLegendDone = document.getElementById('auto-legend-done');
  if(autoLegendDone) autoLegendDone.textContent = lang === 'id' ? 'Selesai Lesson' : 'Completed Lesson';
  const autoLegendProg = document.getElementById('auto-legend-prog');
  if(autoLegendProg) autoLegendProg.textContent = lang === 'id' ? 'Dalam Proses' : 'In Progress';
  
  renderAutoInputs();
}

function populateCourseDropdown(idx) {
  const courseSelect = document.getElementById(`auto-course-${idx}`);
  if (!courseSelect) return;
  const s = autoStudents[idx];
  courseSelect.innerHTML = `<option value="">${LANG_UI[autoLang].coursePlaceholder}</option>`;
  if (s.criteria && COURSE_MAP[s.criteria]) {
    COURSE_MAP[s.criteria].forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      if (c === s.course) opt.selected = true;
      courseSelect.appendChild(opt);
    });
  }
}

function populateLessonDropdown(idx) {
  const lessonSelect = document.getElementById(`auto-lesson-${idx}`);
  const lesson2Select = document.getElementById(`auto-lesson2-${idx}`);
  if (!lessonSelect) return;
  const s = autoStudents[idx];
  
  lessonSelect.innerHTML = `<option value="">${LANG_UI[autoLang].lessonPlaceholder}</option>`;
  if (lesson2Select) {
    lesson2Select.innerHTML = `<option value="">${LANG_UI[autoLang].lesson2Placeholder}</option>`;
    lesson2Select.style.display = (s.status === 'double' || s.status === 'one_and_half') ? 'block' : 'none';
  }
  
  if (s.course && COURSE_DATA[s.course]) {
    COURSE_DATA[s.course].forEach(l => {
      const opt1 = document.createElement('option');
      opt1.value = l.num; opt1.textContent = `${l.title}`;
      if (String(l.num) === String(s.lesson)) opt1.selected = true;
      lessonSelect.appendChild(opt1);
      
      if (lesson2Select) {
        const opt2 = document.createElement('option');
        opt2.value = l.num; opt2.textContent = `${l.title}`;
        if (String(l.num) === String(s.lesson2)) opt2.selected = true;
        lesson2Select.appendChild(opt2);
      }
    });
  }
}

function onCriteriaChange(idx, selectEl) {
  autoStudents[idx].criteria = selectEl.value;
  autoStudents[idx].course = '';
  autoStudents[idx].lesson = '';
  autoStudents[idx].lesson2 = '';
  populateCourseDropdown(idx);
  populateLessonDropdown(idx);
  autoUpdateTable();
}

function onCourseChange(idx, selectEl) {
  autoStudents[idx].course = selectEl.value;
  autoStudents[idx].lesson = '';
  autoStudents[idx].lesson2 = '';
  populateLessonDropdown(idx);
  autoUpdateTable();
}

function onStatusChange(idx, selectEl) {
  const status = selectEl.value;
  autoStudents[idx].status = status;
  const lesson2Select = document.getElementById(`auto-lesson2-${idx}`);
  if (lesson2Select) {
    lesson2Select.style.display = (status === 'double' || status === 'one_and_half') ? 'block' : 'none';
  }
  autoUpdateTable();
}

function onLessonChange(idx, selectEl) {
  autoStudents[idx].lesson = selectEl.value;
  autoUpdateTable();
}

function onLesson2Change(idx, selectEl) {
  autoStudents[idx].lesson2 = selectEl.value;
  autoUpdateTable();
}

function generateProgress(idx) {
  syncStudentFromDOM(idx);
  const s = autoStudents[idx];
  const sLang = s.lang || autoLang;
  const L = LANG_UI[sLang];

  if (!s.nama || !s.nama.trim()) { toast(L.errName, 'error'); return; }
  if (!s.course) { toast(L.errCourse, 'error'); return; }
  if (!s.lesson) { toast(L.errLesson, 'error'); return; }
  if ((s.status === 'double' || s.status === 'one_and_half') && !s.lesson2) { toast(L.errLesson2, 'error'); return; }

  const courseList = COURSE_DATA[s.course];
  const l1Obj = courseList ? courseList.find(item => item.num == s.lesson) : null;
  const l2Obj = (courseList && s.lesson2) ? courseList.find(item => item.num == s.lesson2) : null;

  let text = '';
  const templateMap = sLang === 'en' ? TEMPLATES_EN : TEMPLATES;
  const t1 = (templateMap[s.course] && templateMap[s.course][s.lesson])
    ? templateMap[s.course][s.lesson].replace(/{nama}/g, s.nama)
    : L.fallbackProgress(s.nama, s.lesson, s.course, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : []);

  if (s.status === 'done') {
    text = t1;
  } else if (s.status === 'in_progress') {
    const lessonTitle = l1Obj ? l1Obj.title : `Lesson ${s.lesson}`;
    text = L.inProgressText(s.nama, s.lesson, lessonTitle, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : []);
  } else if (s.status === 'one_and_half') {
    const l2Title = l2Obj ? l2Obj.title : `Lesson ${s.lesson2}`;
    text = L.oneAndHalfText(s.nama, s.lesson, t1, s.lesson2, l2Title, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : []);
  } else if (s.status === 'double') {
    const t2 = (templateMap[s.course] && templateMap[s.course][s.lesson2])
      ? templateMap[s.course][s.lesson2].replace(/{nama}/g, s.nama)
      : L.fallbackProgress(s.nama, s.lesson2, s.course, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : []);
    text = L.doubleText(s.nama, s.lesson, t1, s.lesson2, t2);
  }

  s.progress = text;
  const progEl = document.getElementById(`auto-progress-${idx}`);
  if (progEl) progEl.value = text;
  autoUpdateTable();
  toast(L.toastGenerated, 'success');
}

function syncStudentFromDOM(idx) {
  if (!autoStudents[idx]) return;
  const nameEl = document.getElementById(`auto-name-${idx}`);
  if(nameEl) autoStudents[idx].nama = nameEl.value;
  const critEl = document.getElementById(`auto-criteria-${idx}`);
  if(critEl) autoStudents[idx].criteria = critEl.value;
  const courseEl = document.getElementById(`auto-course-${idx}`);
  if(courseEl) autoStudents[idx].course = courseEl.value;
  const lessonEl = document.getElementById(`auto-lesson-${idx}`);
  if(lessonEl) autoStudents[idx].lesson = lessonEl.value;
  const lesson2El = document.getElementById(`auto-lesson2-${idx}`);
  if(lesson2El) autoStudents[idx].lesson2 = lesson2El.value;
  const statusEl = document.getElementById(`auto-status-${idx}`);
  if(statusEl) autoStudents[idx].status = statusEl.value;
  const progEl = document.getElementById(`auto-progress-${idx}`);
  if(progEl) autoStudents[idx].progress = progEl.value;
}

function setStudentLang(idx, lang) {
  if (!autoStudents[idx]) return;
  syncStudentFromDOM(idx);
  autoStudents[idx].lang = lang;
  renderAutoInputs();
}

function renderAutoInputs(){
  const L = LANG_UI[autoLang];
  const c = document.getElementById('auto-students-container');
  c.innerHTML = '';
  autoStudents.forEach((s,i) => {
    const sLang = s.lang || autoLang;
    const sStatus = s.status || 'done';
    s.lang = sLang;
    s.status = sStatus;

    const div = document.createElement('div');
    div.className = 'student-card';
    div.innerHTML = `
      <div class="student-card-header">
        <div class="student-num">${i+1}</div>
        <input type="text" id="auto-name-${i}" placeholder="${L.studentPlaceholder}" value="${escHtml(s.nama)}" oninput="autoStudents[${i}].nama=this.value;autoUpdateTable()">
        <div class="student-lang-toggle" title="Student Report Language">
          <button type="button" class="student-lang-btn ${sLang==='id'?'active':''}" onclick="setStudentLang(${i},'id')">ID</button>
          <button type="button" class="student-lang-btn ${sLang==='en'?'active':''}" onclick="setStudentLang(${i},'en')">EN</button>
        </div>
        <button class="btn-del" onclick="removeAutoStudent(${i})" title="Remove">×</button>
      </div>
      <div class="auto-gen-row">
        <div class="auto-gen-selectors" style="flex-wrap:wrap;">
          <select id="auto-criteria-${i}" onchange="onCriteriaChange(${i},this)" style="flex:1;min-width:100px;">
            <option value="">${L.critPlaceholder}</option>
            <option value="Junior" ${s.criteria==='Junior'?'selected':''}>Junior</option>
            <option value="Kids" ${s.criteria==='Kids'?'selected':''}>Kids</option>
            <option value="Teens" ${s.criteria==='Teens'?'selected':''}>Teens</option>
          </select>
          <select id="auto-course-${i}" onchange="onCourseChange(${i},this)" style="flex:1.8;min-width:130px;">
            <option value="">${L.coursePlaceholder}</option>
          </select>
          <select id="auto-status-${i}" onchange="onStatusChange(${i},this)" style="flex:1.4;min-width:140px;">
            <option value="done" ${sStatus==='done'?'selected':''}>${L.statusDone}</option>
            <option value="in_progress" ${sStatus==='in_progress'?'selected':''}>${L.statusInProgress}</option>
            <option value="one_and_half" ${sStatus==='one_and_half'?'selected':''}>${L.statusOneAndHalf}</option>
            <option value="double" ${sStatus==='double'?'selected':''}>${L.statusDouble}</option>
          </select>
        </div>
        <div class="auto-gen-selectors" style="margin-top:4px;">
          <select id="auto-lesson-${i}" style="flex:1" onchange="onLessonChange(${i},this)">
            <option value="">${L.lessonPlaceholder}</option>
          </select>
          <select id="auto-lesson2-${i}" style="flex:1; display:${(sStatus==='double'||sStatus==='one_and_half')?'block':'none'}" onchange="onLesson2Change(${i},this)">
            <option value="">${L.lesson2Placeholder}</option>
          </select>
        </div>
        <button class="btn-generate" onclick="generateProgress(${i})" style="margin-top:4px;">${L.generateBtn}</button>
      </div>
      <textarea id="auto-progress-${i}" placeholder="${L.progressPlaceholder}" oninput="autoStudents[${i}].progress=this.value;autoUpdateTable()" style="min-height:100px">${escHtml(s.progress)}</textarea>`;
    c.appendChild(div);
    
    populateCourseDropdown(i);
    populateLessonDropdown(i);
  });
  autoUpdateTable();
}

function addAutoStudent(){
  autoStudents.forEach((_, idx) => syncStudentFromDOM(idx));
  autoStudents.push({nama:'',progress:'',criteria:'',course:'',lesson:'',lesson2:'',status:'done',lang:autoLang});
  renderAutoInputs();
  const cards = document.querySelectorAll('#auto-students-container .student-card');
  if(cards.length) cards[cards.length-1].scrollIntoView({behavior:'smooth',block:'nearest'});
}

function removeAutoStudent(i){
  const L = LANG_UI[autoLang];
  if(autoStudents.length<=1){toast(L.errMinStudent,'error');return;}
  autoStudents.splice(i,1);
  renderAutoInputs();
}

function autoUpdateTable(){
  const tbody = document.getElementById('aprev-tbody');
  tbody.innerHTML = '';
  autoStudents.forEach(s => {
    if(!s.nama && !s.progress) return;
    
    // Status dot color
    const isDone = s.status === 'done' || s.status === 'double';
    const dotClass = isDone ? 'dot-done' : 'dot-progress';
    
    const lessonTag = getLessonTag(s);
    
    const div = document.createElement('div');
    div.className = 'rpt-student-card';
    div.innerHTML = `
      <div class="card-status-col">
        <div class="timeline-node"><span class="timeline-dot ${dotClass}"></span></div>
      </div>
      <div class="card-name-col">
        <span class="student-name-text">${escHtml(s.nama) || '<em style="color:#94a3b8">—</em>'}</span>
      </div>
      <div class="card-lesson-col">
        ${lessonTag ? `<span class="lesson-pill">${escHtml(lessonTag)}</span>` : ''}
      </div>
      <div class="card-progress-col">
        ${formatProgressHTML(s.progress)}
      </div>
    `;
    tbody.appendChild(div);
  });
  autoUpdateWA();
  fitPreviewScale();
  if (typeof updateMascots === 'function') updateMascots();
}

function autoUpdatePreview(){
  const kelas = document.getElementById('auto-kelas').value || '-';
  const tgl = document.getElementById('auto-tanggal').value;
  document.getElementById('aprev-kelas').textContent = kelas;
  document.getElementById('aprev-tanggal').textContent = formatDate(tgl);
  autoUpdateWA();
  updateMascots();
}

function updateMascots() {
  let criteria = 'Teens'; // default
  
  if (typeof autoStudents !== 'undefined' && autoStudents.length > 0 && autoStudents[0].criteria) {
     criteria = autoStudents[0].criteria;
  }
  
  let mascotSrc = 'img/cobee2.png'; // Teens (Default)
  if (criteria === 'Junior') mascotSrc = 'img/cobee4.png';
  if (criteria === 'Kids') mascotSrc = 'img/cobee5.png';
  
  const m1 = document.getElementById('manual-mascot');
  const m2 = document.getElementById('auto-mascot');
  if (m1) m1.src = mascotSrc;
  if (m2) m2.src = mascotSrc;
}

function buildAutoWAMessage(){
  const L = LANG_UI[autoLang];
  const tgl = document.getElementById('auto-tanggal').value;
  const kelas = document.getElementById('auto-kelas').value || '-';
  const studentLines = autoStudents.map(s => {
    if(!s.nama && !s.progress) return '';
    
    let shortSummary = s.progress || '-';
    if (s.course && s.lesson) {
      const courseList = COURSE_DATA[s.course];
      const l1Obj = courseList ? courseList.find(item => item.num == s.lesson) : null;
      
      const isDone = (s.status === 'done' || s.status === 'double');
      const statusText = isDone ? (autoLang==='en'?'(Completed)':'(Selesai)') : (autoLang==='en'?'(In Progress)':'(Sedang Dikerjakan)');
      
      if ((s.status === 'double' || s.status === 'one_and_half') && s.lesson2) {
         shortSummary = `Lesson ${s.lesson} & ${s.lesson2} ${statusText}`;
      } else if (l1Obj) {
         let cleanTitle = l1Obj.title.replace(/^Lesson\s*\d+\s*(?:-|:)\s*/i, '');
         shortSummary = `Lesson ${s.lesson}: ${cleanTitle} ${statusText}`;
      }
    }
    
    return `*${s.nama||'-'}*\n${shortSummary}`;
  }).filter(Boolean).join('\n\n');
  return `${L.waGreeting(kelas, formatDateLong(tgl, autoLang))}\n\n${studentLines}\n\n${L.waClose}`;
}

function autoUpdateWA(){
  document.getElementById('auto-wa-bubble').textContent = buildAutoWAMessage();
}

// Shared PDF builder — used by both manual and auto tab
async function buildAndSavePDF({kelas, tanggal, photoStore, students, labels}) {
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  const G_DARK=[20,83,45],G_MED=[22,163,74],G_LIGHT=[240,253,244],SLATE=[30,41,59],WHITE=[255,255,255],MUTED=[100,116,139];
  doc.setFillColor(...WHITE);doc.rect(0,0,W,H,'F');
  
  // Header card
  doc.setFillColor(...G_DARK);doc.roundedRect(14,12,W-28,26,4,4,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(...WHITE);doc.text(labels.title,22,27);
  doc.setFillColor(255,255,255,50);doc.roundedRect((W-50)/2,16,50,18,3,3,'F');
  doc.setFontSize(9);doc.setTextColor(...WHITE);doc.text('Timedoor Academy',W/2,27,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(240,253,244);doc.text(labels.labelKelas + kelas,W-22,23,{align:'right'});
  doc.text(labels.labelTanggal + tanggal,W-22,30,{align:'right'});
  
  // Photos section — dynamic array
  const MARGIN=14,GAP=8,PHOTO_Y=44;
  const photoSrcs = Array.isArray(photoStore) ? photoStore : Object.values(photoStore).filter(Boolean);
  let photoSectionBottom = PHOTO_Y;
  if (photoSrcs.length > 0) {
    const count = photoSrcs.length;
    const totalGap = GAP * (count - 1);
    const PW = (W - MARGIN * 2 - totalGap) / count;
    const PH = Math.round(PW * (9 / 16));
    photoSrcs.forEach((src, idx) => {
      const px = MARGIN + idx * (PW + GAP);
      const fmt = src.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(src, fmt, px, PHOTO_Y, PW, PH);
    });
    photoSectionBottom = PHOTO_Y + PH;
  }
  
  const TABLE_X=MARGIN,TABLE_W=W-MARGIN*2,COL_NAME_W=44,COL_LESSON_W=32;
  let rowY=photoSectionBottom+8;const HEADER_H=9;
  doc.setFillColor(...G_DARK);doc.roundedRect(TABLE_X,rowY,TABLE_W,HEADER_H,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...WHITE);
  doc.text('STATUS',TABLE_X+4,rowY+6);
  doc.text(labels.colName,TABLE_X+18,rowY+6);
  doc.text('LESSON',TABLE_X+18+COL_NAME_W,rowY+6);
  doc.text(labels.colProgress,TABLE_X+18+COL_NAME_W+COL_LESSON_W,rowY+6);
  rowY+=HEADER_H;
  
  doc.setFont('helvetica','normal');doc.setFontSize(9);
  students.forEach((s,idx)=>{
    if(!s.nama&&!s.progress)return;
    const plainText = (s.progress||'—').replace(/\*/g,'');
    const lines=doc.splitTextToSize(plainText,TABLE_W-COL_NAME_W-COL_LESSON_W-24);
    const cellH=Math.max(12,lines.length*5+8);
    if(rowY+cellH>H-20){doc.addPage();rowY=20;}
    if(idx%2===0){doc.setFillColor(...G_LIGHT);doc.rect(TABLE_X,rowY,TABLE_W,cellH,'F');}
    doc.setDrawColor(226,232,240);doc.setLineWidth(0.2);doc.line(TABLE_X,rowY+cellH,TABLE_X+TABLE_W,rowY+cellH);
    
    // Status dot
    const isDone = s.status === 'done' || s.status === 'double' || !/in progress|working on|belum|absent/i.test(s.progress||'');
    doc.setFillColor(...(isDone ? [22,163,74] : [245,158,11]));
    doc.circle(TABLE_X+8,rowY+7,2.5,'F');
    
    // Student Name
    doc.setFont('helvetica','bold');doc.setTextColor(...G_DARK);
    doc.text(s.nama||'—',TABLE_X+18,rowY+6.5);
    
    // Lesson Pill
    const lessonTag = getLessonTag(s);
    if(lessonTag){
      doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(21,128,61);
      doc.setFillColor(240,253,244);
      doc.roundedRect(TABLE_X+18+COL_NAME_W,rowY+3.5,doc.getTextWidth(lessonTag)+6,5,1.5,1.5,'F');
      doc.text(lessonTag,TABLE_X+21+COL_NAME_W,rowY+7);
      doc.setFontSize(9);
    }
    
    // Progress
    doc.setFont('helvetica','normal');doc.setTextColor(...SLATE);doc.text(lines,TABLE_X+18+COL_NAME_W+COL_LESSON_W,rowY+6.5);
    rowY+=cellH;
  });
  
  doc.setDrawColor(...G_MED);doc.setLineWidth(0.5);
  doc.roundedRect(TABLE_X,photoSectionBottom+8,TABLE_W,rowY-(photoSectionBottom+8),2,2,'S');
  doc.save(`${labels.fileName.replace(/\s+/g,'_')}.pdf`);
}

let examReminderShown = false;
let pendingExamStudents = [];
let pendingAction = null;

function checkExamReminder(callback) {
  if (examReminderShown) {
    callback();
    return;
  }
  
  pendingExamStudents = autoStudents.filter(s => {
    const l1 = parseInt(s.lesson) || 0;
    const l2 = parseInt(s.lesson2) || 0;
    const isExam = (l1 == 8 || l1 == 16 || l1 == 24 || l2 == 8 || l2 == 16 || l2 == 24);
    const isFinished = s.status !== 'in_progress';
    return isExam && isFinished;
  });
  
  if (pendingExamStudents.length > 0) {
    pendingAction = callback;
    const ul = document.getElementById('exam-student-names');
    ul.innerHTML = '';
    pendingExamStudents.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.nama || 'Unnamed Student'} (Lesson ${s.lesson})`;
      ul.appendChild(li);
    });
    document.getElementById('exam-reminder-modal').style.display = 'flex';
  } else {
    callback();
  }
}

function sendWAReminder() {
  const names = pendingExamStudents.map(s => s.nama || 'Unnamed').join(', ');
  const text = encodeURIComponent(`⚠️ *PENGINGAT UJIAN*\n\nJangan lupa membuat dan mengirimkan Exam Report untuk siswa berikut:\n- ${names}\n\nTarget maksimal 5 hari dari hari ini.`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function addGCalReminder() {
  const tglInput = document.getElementById('auto-tanggal').value;
  const baseDate = tglInput ? new Date(tglInput) : new Date();
  
  // Add 3 days and set time to 20:00 (8 PM)
  baseDate.setDate(baseDate.getDate() + 3);
  baseDate.setHours(20, 0, 0, 0);
  
  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
  const dd = String(baseDate.getDate()).padStart(2, '0');
  
  const endDate = new Date(baseDate);
  endDate.setHours(21); // End at 21:00 (9 PM)
  endDate.setMinutes(0);
  const endYyyy = endDate.getFullYear();
  const endMm = String(endDate.getMonth() + 1).padStart(2, '0');
  const endDd = String(endDate.getDate()).padStart(2, '0');
  const endHH = String(endDate.getHours()).padStart(2, '0');
  const endMin = String(endDate.getMinutes()).padStart(2, '0');
  
  const dateString = `${yyyy}${mm}${dd}T200000/${endYyyy}${endMm}${endDd}T210000`;
  
  const names = pendingExamStudents.map(s => s.nama || 'Unnamed').join(', ');
  const title = encodeURIComponent(`📝 Deadline Exam Report: ${names}`);
  const details = encodeURIComponent(`Pengingat otomatis untuk pembuatan Exam Report.\nSiswa: ${names}`);
  const recur = encodeURIComponent('RRULE:FREQ=DAILY;INTERVAL=3;COUNT=2');
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateString}&recur=${recur}`;
  window.open(url, '_blank');
}

function closeExamReminder() {
  examReminderShown = true;
  document.getElementById('exam-reminder-modal').style.display = 'none';
  if (pendingAction) {
    pendingAction();
    pendingAction = null;
  }
}

function downloadAutoPNG(){
  checkExamReminder(async () => {
  const btn=document.getElementById('abtn-png'); btn.disabled=true; btn.textContent='Processing...';
  toast('Creating image...');
  try{
    const canvas = await captureImage('auto-report-preview');
    const blob = await canvasToJpegBlob(canvas, 0.82);
    const link = document.createElement('a');
    const L = LANG_UI[autoLang];
    const kelas = document.getElementById('auto-kelas').value.replace(/\s+/g,'_')||'Report';
    const tanggal = formatDate(document.getElementById('auto-tanggal').value);
    link.download=`${L.fileName(kelas, tanggal)}.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    toast('Downloaded! (compressed JPEG)','success');
  }catch(err){toast('Error: '+err.message,'error');}
  finally{btn.disabled=false;btn.textContent='Download PNG';}
  });
}

function openAutoWhatsApp(){
  checkExamReminder(async () => {
  const L = LANG_UI[autoLang];
  const btn=document.getElementById('abtn-wa'); btn.disabled=true; btn.textContent='Preparing...';
  try{
    const canvas = await captureImage('auto-report-preview');
    const blob = await canvasToJpegBlob(canvas, 0.82);
    const link = document.createElement('a');
    const kelas = document.getElementById('auto-kelas').value.replace(/\s+/g,'_')||'Report';
    const tanggal = formatDate(document.getElementById('auto-tanggal').value);
    link.download=`${L.fileName(kelas, tanggal)}.jpg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    await new Promise(r=>setTimeout(r,800));
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(buildAutoWAMessage()),'_blank');
    toast('Done!','success');
  }catch(err){toast('Error: '+err.message,'error');}
  finally{btn.disabled=false;btn.textContent=L.waBtn;}
  });
}

async function copyAutoWAMessage() {
  try {
    await navigator.clipboard.writeText(buildAutoWAMessage());
    toast(autoLang === 'en' ? 'WhatsApp message copied!' : 'Pesan WhatsApp disalin!', 'success');
  } catch(e) {
    const ta = document.createElement('textarea');
    ta.value = buildAutoWAMessage();
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast(autoLang === 'en' ? 'WhatsApp message copied!' : 'Pesan WhatsApp disalin!', 'success');
  }
}

function downloadAutoPDF(){
  checkExamReminder(async () => {
  const btn=document.getElementById('abtn-pdf'); btn.disabled=true; btn.textContent='Processing...';
  toast('Creating PDF...');
  try{
    const L = LANG_UI[autoLang];
    const kelas=document.getElementById('auto-kelas').value||'—';
    const tanggal=formatDate(document.getElementById('auto-tanggal').value);
    await buildAndSavePDF({
      kelas, tanggal,
      photoStore: autoPhotoList.filter(p => p.src).map(p => p.src),
      students: autoStudents,
      labels: {
        title: L.pdfTitle,
        labelKelas: L.pdfLabelKelas, offsetKelas: L.pdfOffsetKelas,
        labelTanggal: L.pdfLabelTanggal, offsetTanggal: L.pdfOffsetTanggal,
        colName: L.pdfColName, colProgress: L.pdfColProgress,
        photoEmpty: L.pdfPhotoEmpty,
        fileName: L.fileName(kelas.replace(/\s+/g,'_'), formatDateFile(document.getElementById('auto-tanggal').value, autoLang))
      }
    });
    toast('PDF downloaded!','success');
  }catch(err){toast('PDF Error: '+err.message,'error');}
  finally{btn.disabled=false;btn.textContent='Export PDF';}
  });
}

// ============================================================
// INIT
// ============================================================
window.initApp = function() {
  const _t = new Date();
  const _mm = String(_t.getMonth()+1).padStart(2,'0');
  const _dd = String(_t.getDate()).padStart(2,'0');
  const todayVal = _t.getFullYear()+'-'+_mm+'-'+_dd;

  document.getElementById('input-tanggal').value = todayVal;
  document.getElementById('auto-tanggal').value = todayVal;

  renderInputs();
  updatePreview();

  // Init auto tab with sample student in English
  autoStudents = [
    {nama:'Batman',progress:'',criteria:'Teens',course:'Game Developer',lesson:'12',status:'done',lang:'en'},
    {nama:'Superman',progress:'',criteria:'Teens',course:'Game Developer',lesson:'13',status:'in progress',lang:'en'}
  ];
  setLang('en');
  autoUpdatePreview();
  setTimeout(fitPreviewScale, 100);
};