// ============================================================
// APP LOGIC — Main Application Functions & Rendering
// Depends on: data.js, templates.js
// ============================================================

let isAutoFit = true;

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

function extractAction(template, nama, lang) {
  if (!template) return '';
  let t = template.trim();
  if (lang === 'id') {
    t = t.replace(/^(?:Pada pertemuan ini|Dalam sesi ini|Di pertemuan kali ini|Pada sesi kali ini|Dalam pertemuan kali ini|Di sesi ini),?\s*\{nama\}\s*/i, '');
    t = t.replace(/^\{nama\}\s*/i, '');
  } else {
    t = t.replace(/^(?:In today's class|Today|In this session|In this class|In this final session|In this final class),?\s*\{nama\}\s*/i, '');
    t = t.replace(/^\{nama\}\s*/i, '');
  }
  t = t.replace(/\{nama\}/g, nama);
  if (t && t.length > 1) {
    const firstWord = t.split(/\s+/)[0];
    if (!/^[A-Z0-9]{2,}$/.test(firstWord)) {
      t = t.charAt(0).toLowerCase() + t.slice(1);
    }
  }
  return t;
}

function ensurePeriod(str) {
  if (!str) return '';
  return str.trim().replace(/\.+$/, '') + '.';
}

function pickVariant(variants, idx = 0, seed = 0) {
  if (!variants || variants.length === 0) return '';
  const i = Math.abs(((parseInt(idx) || 0) + (parseInt(seed) || 0)) % variants.length);
  return variants[i];
}


function fitPreviewScale() {
  const scroll = document.getElementById('scroll-auto');
  const el = document.getElementById('auto-report-preview');
  const wrapper = document.getElementById('wrapper-auto');
  const btn = document.getElementById('btn-zoom-auto');

  if (!el || !wrapper || !scroll) return;

  const containerWidth = scroll.clientWidth;
  if (containerWidth === 0) {
    if (!fitPreviewScale.attempts) fitPreviewScale.attempts = 0;
    if (fitPreviewScale.attempts++ < 10) setTimeout(fitPreviewScale, 100);
    return;
  }
  fitPreviewScale.attempts = 0;

  const targetWidth = 1000;

  if (isAutoFit) {
    const scale = containerWidth / targetWidth;
    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = 'top left';
    wrapper.style.height = Math.ceil(el.offsetHeight * scale) + 'px';
    wrapper.style.width = '100%';
    scroll.style.overflow = 'hidden';
    if (btn) btn.innerHTML = '🔍 100% Size';
  } else {
    el.style.transform = 'none';
    wrapper.style.height = 'auto';
    wrapper.style.width = '1000px';
    scroll.style.overflowX = 'auto';
    scroll.style.overflowY = 'hidden';
    if (btn) btn.innerHTML = '🔍 Fit to Screen';
  }
}

function toggleZoomMode(tab = 'auto') {
  isAutoFit = !isAutoFit;
  fitPreviewScale();
}

window.addEventListener('resize', fitPreviewScale);

// Bulletproof scaling listener for when elements become visible or resize
const resizeObserver = new ResizeObserver(() => {
  fitPreviewScale();
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.preview-scroll').forEach(el => resizeObserver.observe(el));
  renderAutoPhotoInputs();
});

function switchTab(tab) {
  // No-op kept for backwards compatibility
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

// Dynamic photo array (each entry: {src: dataURL})
let autoPhotoList = [];

// Smart photo processor: center-crops image to target aspect ratio (16:9)
// and scales down large camera images (max 1920px) to prevent stretch & ensure sharp, memory-lean rendering
function processPhotoFile(file, targetRatio = 16 / 9, maxDimension = 1920) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        if (!nw || !nh) {
          resolve(e.target.result);
          return;
        }

        // Calculate center-crop coordinates to match target aspect ratio (object-fit: cover)
        let sw, sh, sx, sy;
        const imgRatio = nw / nh;
        if (imgRatio > targetRatio) {
          // Image wider than target: crop sides
          sh = nh;
          sw = nh * targetRatio;
          sx = (nw - sw) / 2;
          sy = 0;
        } else {
          // Image taller than target (e.g. 4:3 from mobile camera): crop top & bottom
          sw = nw;
          sh = nw / targetRatio;
          sx = 0;
          sy = (nh - sh) / 2;
        }

        // Scale down if larger than maxDimension
        let dw = Math.round(sw);
        let dh = Math.round(sh);
        if (dw > maxDimension) {
          dh = Math.round((maxDimension / dw) * dh);
          dw = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = dw;
        canvas.height = dh;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const COURSE_LANG_MAP = {
  'Basic Website': { id: 'Website Basic', en: 'Website Development' },
  'Website Basic': { id: 'Website Basic', en: 'Website Development' },
  'Website Development': { id: 'Website Basic', en: 'Website Development' },
  'Frontend Development': { id: 'Frontend Development', en: 'Frontend Development' },
  'Backend Development': { id: 'Backend Development', en: 'Backend Development' },
  'Mobile App Development': { id: 'Mobile App Development', en: 'Mobile App Development' },
  'AI Development': { id: 'AI Development', en: 'AI Development' },
  '3D ANIMATOR': { id: '3D Animator', en: '3D Animator' }
};

function getLocalizedCourseName(courseName, lang = 'en') {
  if (!courseName) return '';
  const norm = courseName.trim();
  if (COURSE_LANG_MAP[norm] && COURSE_LANG_MAP[norm][lang]) {
    return COURSE_LANG_MAP[norm][lang];
  }
  return norm;
}

function getStudentCourse(s) {
  if (!s) return '';
  if (s.course && typeof s.course === 'string' && s.course.trim()) {
    return s.course.trim();
  }

  // Fallback: Infer from s.progress
  if (s.progress && typeof COURSE_DATA !== 'undefined') {
    const progLower = s.progress.toLowerCase();

    // 1. Check exact / case-insensitive course names from COURSE_DATA (longest first)
    const courseKeys = Object.keys(COURSE_DATA).sort((a, b) => b.length - a.length);
    for (const c of courseKeys) {
      if (progLower.includes(c.toLowerCase())) {
        return c;
      }
    }

    // 2. Check common variations and aliases
    const aliases = [
      { key: 'Interactive Mechanics on Roblox', terms: ['interactive mechanics on roblox', 'interactive mechanics', 'mechanics on roblox'] },
      { key: 'Code and Design with Roblox', terms: ['code and design with roblox', 'code and design'] },
      { key: 'Full Stack Programming on Roblox', terms: ['full stack programming on roblox', 'full stack programming', 'full stack on roblox'] },
      { key: 'Advanced Lua Programming on Roblox', terms: ['advanced lua programming on roblox', 'advanced lua programming', 'advanced lua'] },
      { key: 'Game Developer', terms: ['game developer', 'game dev'] },
      { key: 'Coding Explorer', terms: ['coding explorer'] },
      { key: 'Tech Explorer', terms: ['tech explorer'] },
      { key: 'Python Coder', terms: ['python coder'] },
      { key: 'Python Game Developer', terms: ['python game developer'] },
      { key: 'Python for AI', terms: ['python for ai', 'python ai'] },
      { key: 'IoT Robotic 2024', terms: ['iot robotic 2024', 'iot robotic'] },
      { key: 'IoT Smart City', terms: ['iot smart city'] },
      { key: 'Little Programmer', terms: ['little programmer'] },
      { key: '3D ANIMATOR', terms: ['3d animator', '3d animation'] },
      { key: 'Website Designer', terms: ['website designer'] },
      { key: 'Virtual World Maker', terms: ['virtual world maker'] },
      { key: 'Teens Programmer', terms: ['teens programmer'] },
      { key: 'JavaScript Developer', terms: ['javascript developer', 'javascript dev'] },
      { key: 'Web Developer Teens', terms: ['web developer teens', 'web developer'] },
      { key: 'Android Developer', terms: ['android developer'] },
      { key: 'Python for Data Science', terms: ['python for data science', 'data science'] },
      { key: 'AI Computer Vision', terms: ['ai computer vision', 'computer vision'] },
      { key: 'AI Machine Learning', terms: ['ai machine learning', 'machine learning'] },
      { key: 'Teens Design Basic', terms: ['teens design basic', 'design basic'] },
      { key: 'Branding', terms: ['branding'] },
      { key: 'Kids Animation Basic', terms: ['kids animation basic', 'kids animation'] },
      { key: 'Teens Animation', terms: ['teens animation'] },
      { key: 'Advanced Animation', terms: ['advanced animation'] },
      { key: 'UI/UX', terms: ['ui/ux', 'ui ux', 'uiux'] },
      { key: 'Basic Website', terms: ['basic website', 'website basic', 'website development', 'web development', 'web basic'] },
      { key: 'Frontend Development', terms: ['frontend development', 'frontend dev', 'frontend', 'javascript fundamental'] },
      { key: 'Backend Development', terms: ['backend development', 'backend dev', 'backend'] },
      { key: 'Mobile App Development', terms: ['mobile app development', 'mobile app', 'mobile development'] },
      { key: 'AI Development', terms: ['ai development', 'ai dev'] }
    ];

    for (const a of aliases) {
      for (const term of a.terms) {
        if (progLower.includes(term)) {
          return a.key;
        }
      }
    }

    // 3. Check unique lesson titles in COURSE_DATA
    for (const [cName, lessons] of Object.entries(COURSE_DATA)) {
      if (Array.isArray(lessons)) {
        for (const l of lessons) {
          if (l.title) {
            const cleanTitle = l.title.replace(/^Lesson\s*\d+\s*(?:-|:)\s*/i, '').trim();
            if (cleanTitle.length > 5 && progLower.includes(cleanTitle.toLowerCase())) {
              return cName;
            }
          }
        }
      }
    }
  }

  return '';
}

function getStudentLevel(s) {
  if (!s) return '';
  if (s.criteria && s.criteria.trim()) {
    const c = s.criteria.trim();
    if (c.toLowerCase() === 'junior') return 'Juniors';
    return c;
  }
  const course = getStudentCourse(s);
  if (course && typeof COURSE_MAP !== 'undefined') {
    for (const [lvl, list] of Object.entries(COURSE_MAP)) {
      if (Array.isArray(list)) {
        if (list.includes(course) || 
            (COURSE_LANG_MAP[course] && (list.includes(COURSE_LANG_MAP[course].en) || list.includes(COURSE_LANG_MAP[course].id)))) {
          if (lvl.toLowerCase() === 'junior') return 'Juniors';
          return lvl;
        }
      }
    }
  }
  return '';
}

function getLessonTag(s) {
  if (!s) return '';
  if (s.lesson) {
    if ((s.status === 'double' || s.status === 'one_and_half') && s.lesson2) {
      return `Lesson ${s.lesson} & ${s.lesson2}`;
    }
    return `Lesson ${s.lesson}`;
  }
  const match = (s.progress || '').match(/Lesson\s+(\d+(?:\s*(?:&|and|dan|,)\s*\d+)?)/i);
  if (match) {
    return match[0].replace(/\s*(?:and|dan)\s*/i, ' & ');
  }
  return '';
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
async function onAutoPhotoChange(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  toast('Processing photos...');
  try {
    for (const file of files) {
      const src = await processPhotoFile(file, 16 / 9);
      autoPhotoList.push({src});
    }
    renderAutoPhotoInputs();
    renderAutoPhotoPreview();
    toast('Photos added!', 'success');
  } catch (err) {
    toast('Error loading photos: ' + err.message, 'error');
  }
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
      // ABSOLUTE EXPORT ISOLATION: Ensure html2canvas clone is rendered in 100% light mode
      if (clonedDoc.documentElement) clonedDoc.documentElement.removeAttribute('data-theme');
      if (clonedDoc.body) clonedDoc.body.removeAttribute('data-theme');

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

        // Fix: html2canvas does not support CSS object-fit: cover on <img> tags.
        // Ensure any photo inside .rpt-photo-wrap is properly center-cropped to 16:9 before export.
        const origWraps = el ? el.querySelectorAll('.rpt-photo-wrap') : [];
        const clonedWraps = clonedEl.querySelectorAll('.rpt-photo-wrap');
        clonedWraps.forEach((cWrap, idx) => {
          const cImg = cWrap.querySelector('img');
          const oWrap = origWraps[idx];
          const oImg = oWrap ? oWrap.querySelector('img') : null;
          const imgToUse = oImg || cImg;
          if (!cImg || !imgToUse) return;

          const nw = imgToUse.naturalWidth || imgToUse.width;
          const nh = imgToUse.naturalHeight || imgToUse.height;
          if (!nw || !nh) return;

          const targetRatio = 16 / 9;
          const imgRatio = nw / nh;
          // If aspect ratio differs by > 1%, crop it onto a temporary canvas
          if (Math.abs(imgRatio - targetRatio) > 0.01) {
            let sw, sh, sx, sy;
            if (imgRatio > targetRatio) {
              sh = nh;
              sw = nh * targetRatio;
              sx = (nw - sw) / 2;
              sy = 0;
            } else {
              sw = nw;
              sh = nw / targetRatio;
              sx = 0;
              sy = (nh - sh) / 2;
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.round(sw);
            tempCanvas.height = Math.round(sh);
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(imgToUse, sx, sy, sw, sh, 0, 0, tempCanvas.width, tempCanvas.height);
            cImg.src = tempCanvas.toDataURL('image/jpeg', 0.95);
          }
        });
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

// Aliases for export functions
function downloadPNG() { return downloadAutoPNG(); }
function openWhatsApp() { return openAutoWhatsApp(); }
function copyWAMessage() { return copyAutoWAMessage(); }
function downloadPDF() { return downloadAutoPDF(); }

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
    tip: '<div class="how-to-title">💡 Cara Pakai (Alur Pembuatan):</div><ol class="how-to-steps"><li><strong>Class Information:</strong> Isi nama kelas & tanggal pertemuan.</li><li><strong>Report Language:</strong> Pilih bahasa untuk pesan WhatsApp (English / Indonesia).</li><li><strong>Documentation Photos:</strong> Upload 1–6 foto aktivitas kelas (otomatis di-crop 16:9).</li><li><strong>Data Siswa:</strong> Isi nama siswa, pilih level, course, lesson, dan status &rarr; klik <strong>⚡ Generate</strong> (bisa set bahasa ID/EN per siswa).</li><li><strong>Export & Share:</strong> Download gambar <strong>PNG</strong> / <strong>PDF</strong> atau klik <strong>Kirim ke WhatsApp</strong> untuk kirim ke orang tua.</li></ol>',
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
    statusInProgress1: '⏳ Belum Selesai (Pertemuan ke-1)',
    statusInProgress2: '🔄 Belum Selesai (Pertemuan ke-2)',
    statusContinuedDone: '🔄 Selesai Melanjutkan (Meeting ke-2/ke-3)',
    statusOneAndHalf: '🌖 Selesai 1.5 Lesson',
    statusDouble: '🚀 Selesai 2 Lesson',
    // Fallback statusInProgress for backward compatibility
    statusInProgress: '⏳ Belum Selesai (Pertemuan ke-1)',
    contextDetail: '🎯 Pengerjaan Detail & Teknis Banyak',
    contextFocus: '👀 Pendampingan Fokus Layar & Materi',
    contextPace: '☕ Ritme / Tempo Pengerjaan Santai',
    contextLogic: '💡 Bimbingan Konsep & Logika Baru',
    contextTired: '🔋 Penyesuaian Stamina Setelah Sekolah',
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
      if (!objectives || objectives.length === 0) return `menyelesaikan seluruh langkah pada *Lesson ${lessonNum}* di course ${course}.`;
      return `mempraktikkan cara ${formatObjectives(objectives, 'id')}.`;
    },
    doneText: (nama, lessonTitle, action, idx = 0, seed = 0) => {
      const variants = [
        `Pada pertemuan hari ini, ${nama} menyelesaikan pembelajaran *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Selama kelas berlangsung, ${nama} menunjukkan fokus yang sangat baik serta mampu menyusun logika kode secara mandiri tanpa banyak arahan. Pemahaman konsep ini sangat penting karena memperkuat fondasi berpikir komputasional dan pemecahan masalah secara terstruktur. Di pertemuan berikutnya, ${nama} sudah siap melangkah ke materi logika yang lebih menantang.`,
        `Dalam sesi ini, ${nama} berhasil menuntaskan projek pada materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Teramati di kelas, ${nama} memiliki ketelitian tinggi dan proaktif melakukan debugging secara mandiri ketika menemui error pada programnya. Latihan ini melatih daya analisis kritis siswa agar mampu mengidentifikasi akar masalah pada alur algoritma. Di rumah, ${nama} disarankan untuk mencoba memodifikasi atau memainkan ulang projeknya agar logika kode yang dipelajari semakin melekat kuat.`,
        `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} tampak sangat antusias dan berinisiatif menambahkan variasi elemen kreatif ke dalam projeknya di luar instruksi dasar. Eksplorasi ini sangat bermakna dalam mengasah kreativitas digital serta fleksibilitas berpikir saat mengimplementasikan logika program. Di sesi selanjutnya, kemampuan eksploratif ini akan terus diasah untuk membangun fitur yang lebih interaktif.`,
        `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Di kelas, ${nama} menunjukkan persistensi yang hebat dengan mengikuti setiap tahapan pembuatan kode secara terstruktur dan tidak mudah menyerah saat menghadapi tantangan. Penguasaan tahapan ini memberikan pemahaman mendalam tentang bagaimana instruksi terprogram dieksekusi oleh komputer secara presisi. Terus dukung semangat belajar ${nama} agar pencapaian belajarnya selalu optimal.`,
        `Dalam kelas hari ini, ${nama} menuntaskan proyek *${lessonTitle}* dengan hasil yang sangat baik. ${nama} ${ensurePeriod(action)} ${nama} aktif berdiskusi dan bertanya secara kritis terkait fungsi blok kode yang digunakan, membuktikan rasa ingin tahu yang tinggi terhadap materi. Memahami konsep ini membantu ${nama} menghubungkan berbagai komponen logika menjadi satu kesatuan program yang utuh. Modal pemahaman ini menjadi bekal yang sangat baik untuk menyambut materi baru minggu depan.`,
        `Pada sesi kali ini, ${nama} sukses menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} bekerja dengan cermat, memperhatikan detail algoritma, dan memastikan setiap fitur projek berfungsi dengan lancar sebelum beralih ke tahap berikutnya. Keberhasilan ini melatih kebiasaan coding yang bersih dan terstruktur sejak dini. Di pertemuan berikutnya, ${nama} dapat langsung melanjutkan ke level materi selanjutnya.`
      ];
      return pickVariant(variants, idx, seed);
    },
    continuedDoneText: (nama, lessonTitle, action, idx = 0, seed = 0) => {
      const variants = [
        `Pada pertemuan hari ini, ${nama} melanjutkan dan berhasil menyelesaikan projek *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Teramati di kelas, ${nama} mampu mengingat kembali alur proyek sebelumnya dengan cepat dan fokus menuntaskan bagian kode yang tersisa. Ketekunan ini sangat bermakna dalam melatih daya ingat prosedural dan konsistensi menyelesaikan tugas hingga tuntas. Dengan selesainya materi ini, ${nama} siap melangkah ke materi baru di pertemuan berikutnya.`,
        `Dalam sesi ini, ${nama} menuntaskan kelanjutan projek *${lessonTitle}* dari minggu lalu. ${nama} ${ensurePeriod(action)} ${nama} menunjukkan kemampuan problem-solving yang matang saat mengintegrasikan sisa komponen kode ke dalam kerangka projek yang sudah ada. Keberhasilan menuntaskan proyek multi-pertemuan ini membuktikan peningkatan ketahanan mental dan ketelitian siswa. Di rumah, ${nama} dapat mencoba membagikan hasil karya projeknya kepada keluarga.`,
        `Di pertemuan kali ini, ${nama} menuntaskan tahap akhir materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Selama kelas, ${nama} cermat memeriksa kembali fungsi kode secara menyeluruh dan memastikan seluruh mekanisme projek bekerja tanpa hambatan. Proses evaluasi mandiri ini sangat penting dalam membangun standar kerja yang berkualitas dan terukur dalam membuat program. Minggu depan, ${nama} dapat langsung memulai materi baru dengan penuh percaya diri.`,
        `Hari ini, ${nama} meneruskan pengerjaan *${lessonTitle}* hingga selesai sempurna. ${nama} ${ensurePeriod(action)} ${nama} bekerja dengan penuh konsentrasi, berinisiatif memperbaiki bug yang tersisa, dan berhasil menuntaskan seluruh tantangan projek. Sikap pantang menyerah ini menjadi modal berharga bagi perkembangan logika berpikirnya. Progres ini patut diapresiasi karena menunjukkan dedikasi belajar yang sangat positif.`,
        `Pada sesi kali ini, ${nama} menuntaskan sisa materi dan projek *${lessonTitle}* dengan sangat baik. ${nama} ${ensurePeriod(action)} ${nama} terlihat sangat fokus menghubungkan kode yang telah dibuat sebelumnya dengan fitur baru hari ini. Menyelesaikan projek bertahap ini melatih daya tahan belajar serta rasa tanggung jawab dalam menyelesaikan karya digital. Di pertemuan berikutnya, ${nama} siap menyambut topik baru.`,
        `Dalam pertemuan hari ini, ${nama} berhasil menyempurnakan keseluruhan projek *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} secara teliti menguji ulang interaksi program dan memastikan tidak ada error yang tertinggal. Kebiasaan menguji program ini sangat baik untuk menanamkan budaya coding yang rapi dan terverifikasi. Minggu depan, ${nama} dapat langsung beralih ke materi selanjutnya.`
      ];
      return pickVariant(variants, idx, seed);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0) => {
      const partial = getPartialObjectives(objectives);
      const actionDesc = (partial && partial.length > 0) ? `berlatih ${formatObjectives(partial, 'id')}` : 'membangun kerangka dasar logika projek';
      const templates = {
        detail: [
          `Hari ini, ${nama} memulai pembelajaran materi *${lessonTitle}*. Pada sesi ini, ${nama} ${actionDesc}. Di kelas, ${nama} menyusun kode projeknya secara cermat dan memperhatikan setiap detail teknis dengan baik. Karena projek ini memiliki komponen logika yang cukup padat dan memerlukan ketelitian tinggi, teacher mendampingi ${nama} memastikan setiap alurnya berjalan lancar. Pengerjaan sisa fitur projek akan dilanjutkan pada pertemuan berikutnya. Di rumah, Bapak/Ibu dapat menanyakan serunya projek yang sedang dibuat agar ${nama} semakin bersemangat saat lanjut koding minggu depan.`,
          `Dalam sesi ini, ${nama} mengawali materi *${lessonTitle}* dengan ${actionDesc}. Teramati di kelas, ${nama} tekun menyusun blok kode awal dan mengecek fungsi setiap elemen secara bertahap. Projek pada materi ini memiliki rancangan yang kaya fitur, sehingga membutuhkan waktu lebih untuk memastikan kodenya terstruktur rapi. Bersama arahan teacher, langkah awal projek telah terbangun dengan baik. Kelanjutan pengerjaan akan diteruskan pada pertemuan mendatang.`
        ],
        focus: [
          `Hari ini, ${nama} memulai pembelajaran pada materi *${lessonTitle}* dan ${actionDesc}. Di kelas, rasa ingin tahu ${nama} cukup besar terhadap hal-hal baru, sehingga perhatiannya sesekali teralihkan ke tab atau aplikasi lain di luar materi koding. Teacher secara aktif terus mendampingi dan mengarahkan kembali fokus ${nama} ke lembar kerja projek agar kodenya tersusun dengan baik. Progres projek telah mulai berjalan dan sisa materi akan dilanjutkan di pertemuan berikutnya. Di rumah, Bapak/Ibu dapat membantu mengingatkan agar ${nama} tetap fokus pada lembar kerja saat kelas berlangsung sehingga projeknya dapat tuntas maksimal.`,
          `Pada sesi hari ini, ${nama} mulai mempelajari *${lessonTitle}* untuk ${actionDesc}. Teramati di kelas, ${nama} memiliki antusiasme tinggi, namun sesekali fokusnya terbagi membuka aplikasi lain. Teacher secara konsisten membimbing dan mengingatkan ${nama} untuk tetap fokus pada instruksi projek. Fondasi awal projek sudah berhasil dibuat dan bagian yang tersisa akan dilanjutkan minggu depan. Dukungan Bapak/Ibu di rumah untuk mengingatkan pentingnya fokus saat sesi koding akan sangat membantu kelancaran belajarnya.`
        ],
        pace: [
          `Dalam kelas hari ini, ${nama} memulai materi *${lessonTitle}* dengan ${actionDesc}. Di kelas, ${nama} tampak ceria dan aktif berinteraksi dengan teman sekelas, sehingga tempo pengerjaannya berjalan santai namun tetap terarah. Teacher mendampingi ${nama} langkah demi langkah untuk menyusun kode projeknya serta memperbaiki kendala yang ditemui satu per satu. Tahap awal sudah terbentuk dan sisa projek akan dilanjutkan pada sesi berikutnya agar hasilnya lebih optimal. Di rumah, Bapak/Ibu dapat memberi dorongan semangat agar ritme belajarnya semakin produktif minggu depan.`,
          `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}* untuk ${actionDesc}. Teramati di kelas, suasana belajar yang menyenangkan membuat ${nama} menikmati sesi ini dengan ritme pengerjaan yang cukup santai. Teacher terus memandu agar ${nama} tetap menyelesaikan target kode utamanya secara runtut. Pengerjaan bagian akhir projek telah dijadwalkan untuk dilanjutkan pada pertemuan mendatang.`
        ],
        logic: [
          `Pada pertemuan kali ini, ${nama} mempelajari materi baru *${lessonTitle}* untuk ${actionDesc}. Di kelas, ${nama} menemui beberapa tantangan konsep dan alur logika baru pada projek ini. Teacher memberikan pendampingan intensif langkah demi langkah agar ${nama} benar-benar memahami cara kerja perintah kodingnya sebelum melangkah lebih jauh. Memahami dasar algoritma ini sangat penting agar ${nama} percaya diri menyusun sisa fiturnya. Kelanjutan pengerjaan kode akan diselesaikan pada sesi berikutnya.`,
          `Hari ini, ${nama} memulai langkah awal pada *${lessonTitle}* dengan ${actionDesc}. Menghadapi instruksi logika baru yang cukup menantang, ${nama} belajar menganalisis alur program dengan bimbingan seksama dari teacher. Proses ini sangat bermanfaat untuk melatih daya nalar dan pemecahan masalah secara terstruktur. Sisa fitur projek akan dituntaskan pada pertemuan berikutnya.`
        ],
        tired: [
          `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}* dan fokus pada ${actionDesc}. Di kelas, energi ${nama} tampak sedikit menurun setelah menjalani padatnya aktivitas sekolah sebelumnya, sehingga ritme belajarnya disesuaikan agar tetap nyaman dan tidak terburu-buru. Bersama arahan teacher, ${nama} tetap berusaha menyusun kerangka awal kode projeknya secara bertahap. Sisa pengerjaan projek telah dijadwalkan untuk dilanjutkan pada pertemuan berikutnya saat staminanya sudah kembali prima.`,
          `Dalam sesi hari ini, ${nama} memulai materi *${lessonTitle}* dengan ${actionDesc}. Karena kondisi fisik yang tampak lelah sepulang sekolah, teacher menyesuaikan tempo belajar agar ${nama} tetap bisa menyerap konsep koding tanpa tekanan. Langkah awal projek telah tersusun dengan aman dan akan dilanjutkan kembali minggu depan.`
        ]
      };
      const list = templates[context] || templates['detail'];
      return pickVariant(list, idx, seed);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0) => {
      const partial = getPartialObjectives(objectives);
      const actionDesc = (partial && partial.length > 0) ? `menyusun kelanjutan ${formatObjectives(partial, 'id')}` : 'mengembangkan logika lanjutan pada projek';
      const templates = {
        detail: [
          `Pada pertemuan kedua untuk materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan kode projeknya dari minggu lalu. ${nama} ${actionDesc} dan menambahkan mekanisme logika utama ke dalam program. Di kelas, ${nama} sangat berhati-hati dalam menata alur kode serta memperbaiki kendala teknis yang ditemui. Mengingat detail fitur yang dibangun cukup kompleks, proses ini membutuhkan waktu tambahan agar hasilnya rapi dan bebas bug. Tahap penyempurnaan akhir akan diselesaikan tuntas pada pertemuan ketiga minggu depan.`,
          `Dalam sesi lanjutan *${lessonTitle}* hari ini, ${nama} meneruskan pengembangan projeknya. ${nama} ${actionDesc} dan melengkapi struktur fungsi pada programnya. Teramati di kelas, ${nama} teliti memastikan setiap animasi dan respon program berjalan selaras. Sebagian besar kode utama telah terbangun dengan baik, dan tahap finalisasi serta pengujian akhir akan dituntaskan pada pertemuan berikutnya.`
        ],
        focus: [
          `Dalam sesi lanjutan materi *${lessonTitle}* ini, ${nama} meneruskan pengerjaan kode projeknya. ${nama} telah menyelesaikan sebagian fungsi inti projek, termasuk ${actionDesc}. Selama kelas, teacher terus mendampingi dan mengingatkan ${nama} untuk menjaga fokus pada layar koding ketika perhatiannya beralih ke tab atau aplikasi lain. Dengan pendampingan konsisten dari teacher, progres koding ${nama} tetap maju secara bertahap. Sisa penyelesaian dan pengujian akhir projek akan diselesaikan pada pertemuan berikutnya. Di rumah, mohon bantuan Bapak/Ibu untuk terus mengingatkan ${nama} agar fokus belajarnya tetap terjaga optimal.`,
          `Hari ini, ${nama} masuk ke pertemuan kedua untuk materi *${lessonTitle}*. ${nama} melanjutkan pembuatan program dan berhasil ${actionDesc}. Di kelas, teacher terus memusatkan perhatian ${nama} agar tetap konsisten menyelesaikan alur kode hingga tuntas tanpa terdistraksi. Berkat bimbingan langsung, fitur-fitur penting projek sudah terpasang dan tahap akhir penyelesaian akan dituntaskan pada sesi minggu depan.`
        ],
        pace: [
          `Di pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan pengembangan projeknya. ${nama} telah ${actionDesc} dan menyusun fungsi-fungsi penting pada program. Di kelas, ${nama} menikmati suasana belajar dengan tempo pengerjaan yang santai. Teacher terus memandu ${nama} untuk mengarahkan fokusnya menyelesaikan bagian kode yang krusial. Sebagian besar projek telah terbangun dan tahap penuntasan akhir siap diselesaikan pada pertemuan berikutnya.`,
          `Pada sesi ini, ${nama} meneruskan proyek *${lessonTitle}* dari minggu lalu. ${nama} ${actionDesc} dengan ritme pengerjaan yang stabil. Teacher aktif mengarahkan alur kerja agar waktu belajar termanfaatkan secara efektif untuk menyusun sisa mekanisme program. Projek sudah mendekati tahap akhir dan akan dituntaskan pada sesi berikutnya.`
        ],
        logic: [
          `Pada sesi lanjutan materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan algoritma projeknya. ${nama} ${actionDesc} dengan bimbingan intensif dari teacher. ${nama} mulai memahami logika bertingkat yang sebelumnya terasa menantang dan berhasil memperbaiki alur kode yang sempat keliru. Pemahaman ini memperkuat fondasi berpikir komputasionalnya secara nyata. Seluruh fitur akhir projek akan diselesaikan dan diuji coba pada pertemuan selanjutnya.`,
          `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* pada tahap logika lanjutan. ${nama} ${actionDesc} dan mendiskusikan pemecahan masalah pada fungsi kode yang rumit bersama teacher. Melalui proses ini, pemahaman konseptual ${nama} berkembang jauh lebih matang. Tahap akhir penggabungan seluruh fitur projek akan diselesaikan tuntas pada sesi berikutnya.`
        ],
        tired: [
          `Hari ini, ${nama} meneruskan proyek materi *${lessonTitle}* yang sedang berjalan. ${nama} ${actionDesc} dan melengkapi beberapa fungsi utama program. Menyadari kondisi ${nama} yang masih menyesuaikan energi setelah kegiatan harian sekolah, teacher mendampingi pengerjaan dengan ritme yang stabil agar materi tetap terserap baik. Kerangka projek sudah hampir tuntas dan akan diselesaikan secara penuh pada pertemuan berikutnya.`,
          `Dalam sesi kedua *${lessonTitle}* ini, ${nama} melanjutkan bagian tengah projek dengan bimbingan guru. Walaupun energi ${nama} tampak terbatas setelah seharian beraktivitas di sekolah, ${nama} tetap menunjukkan komitmen untuk menyusun kode penting pada projeknya. Tahap akhir penyelesaian projek dijadwalkan pada pertemuan berikutnya.`
        ]
      };
      const list = templates[context] || templates['detail'];
      return pickVariant(list, idx, seed);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0) => {
      // Alias backward compatibility
      return LANG_UI.id.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed);
    },
    oneAndHalfText: (nama, l1Num, l1Title, action1, l2Num, l2Title, obj2, idx = 0, seed = 0) => {
      const variants = [
        `Pada pertemuan hari ini, ${nama} menunjukkan performa belajar yang sangat produktif dengan menyelesaikan *${l1Title}* sekaligus memulai materi berikutnya. ${nama} ${ensurePeriod(action1)} Di kelas, ${nama} bekerja dengan tempo cepat dan teliti, sehingga waktu yang tersisa dapat dimanfaatkan untuk menyusun kerangka awal materi *${l2Title}*. Kemampuan beradaptasi dengan materi baru secara cepat ini menunjukkan pemahaman logika yang sudah terbentuk dengan sangat baik. Di pertemuan mendatang, ${nama} akan langsung melanjutkan penyelesaian materi *${l2Title}*.`,
        `Dalam sesi ini, ${nama} menuntaskan seluruh materi *${l1Title}* secara mandiri, lalu langsung mengawali projek *${l2Title}*. ${nama} ${ensurePeriod(action1)} Teramati di kelas, ${nama} sangat antusias dan mampu menangkap instruksi baru dengan cepat saat memulai rancangan dasar *${l2Title}*. Langkah awal ini memberi keunggulan waktu untuk eksplorasi lebih mendalam di pertemuan berikutnya. Terus jaga konsistensi belajar yang luar biasa ini.`,
        `Di pertemuan kali ini, ${nama} mencapai progres yang impresif dengan menyelesaikan materi *${l1Title}* lebih awal dan langsung melangkah ke *${l2Title}*. ${nama} ${ensurePeriod(action1)} Selama sesi berlangsung, ${nama} konsisten menunjukkan fokus tinggi dan kemandirian dalam menyusun logika dasar materi berikutnya. Kemampuan menghubungkan konsep antarmateri ini membuktikan fleksibilitas kognitif yang sangat baik. Minggu depan, ${nama} akan melanjutkan penuntasan materi *${l2Title}*.`,
        `Hari ini, ${nama} menunjukkan ritme belajar yang sangat efisien dengan menyelesaikan *${l1Title}* serta memulai tahapan awal *${l2Title}*. ${nama} ${ensurePeriod(action1)} ${nama} bekerja secara mandiri dan cepat beradaptasi dengan tantangan logika pada materi baru. Ketangkasan ini menunjukkan kematangan berpikir komputasional yang terus berkembang pesat. Pada pertemuan selanjutnya, ${nama} siap menyelesaikan projek *${l2Title}* hingga tuntas.`
      ];
      return pickVariant(variants, idx, seed);
    },
    doubleText: (nama, l1Num, l1Title, action1, l2Num, l2Title, action2, idx = 0, seed = 0) => {
      const variants = [
        `${nama} menunjukkan akselerasi belajar yang luar biasa dengan menyelesaikan 2 materi sekaligus pada pertemuan hari ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nDi kelas, ${nama} bekerja dengan konsentrasi tinggi, mandiri menyelesaikan kode, dan mampu mengaplikasikan instruksi dengan cepat tanpa mengurangi kualitas projek. Keberhasilan menuntaskan dua materi dalam satu sesi membuktikan pemahaman logika koding yang sangat kuat dan kesiapan menghadapi materi berikutnya dengan penuh percaya diri. Di pertemuan mendatang, ${nama} dapat langsung melangkah ke level selanjutnya.`,
        `${nama} mencapai pencapaian belajar yang impresif dengan menuntaskan 2 lesson secara tuntas hari ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nTeramati di kelas, ${nama} memiliki ketelitian tinggi dan proaktif melakukan debugging secara mandiri pada kedua projek tersebut. Penguasaan cepat ini memperkuat ketahanan mental dan daya analisis kritis siswa dalam menyusun algoritma yang lebih rumit. Di rumah, ${nama} disarankan untuk menunjukkan hasil karya projeknya kepada orang tua agar semakin termotivasi.`,
        `${nama} tampil sangat produktif dan antusias dengan menyelesaikan 2 materi sekaligus pada pertemuan ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\n${nama} mampu menyerap instruksi dengan cepat, menunjukkan pemikiran komputasional yang tajam, dan menyelesaikan setiap tantangan koding secara terstruktur. Keberhasilan ini menjadi fondasi yang kokoh untuk mengembangkan fitur projek yang lebih interaktif. Di pertemuan selanjutnya, potensi eksplorasi ${nama} akan terus diasah ke tingkat yang lebih tinggi.`,
        `Hari ini, ${nama} menunjukkan efisiensi belajar yang hebat dengan menguasai 2 topik pembelajaran penuh (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nDi kelas, ${nama} mempertahankan fokus yang prima serta mampu memprogram mekanisme projek dengan sangat rapi tanpa banyak bimbingan. Menuntaskan dua lesson dalam satu sesi membuktikan ketahanan berpikir dan kematangan logika coding ${nama} yang sangat membanggakan. Bekal pemahaman ini membuat ${nama} sangat siap menyambut materi baru pekan depan.`
      ];
      return pickVariant(variants, idx, seed);
    },
    waGreeting: (kelas, tgl) => `Selamat sore Parents 😊\n\nBerikut laporan Daily Journal belajar students hari ini:\n\n📌 *Kelas:* ${kelas}\n📅 *Tanggal:* ${tgl}`,
    waClose: 'Terima kasih atas perhatian dan dukungan Bapak/Ibu. Jika ada pertanyaan terkait kelas hari ini, silakan hubungi kami kapan saja 😊',
    pdfTitle: 'Daily Journal Siswa',
    pdfLabelKelas: 'Kelas: ', pdfOffsetKelas: 32,
    pdfLabelTanggal: 'Tanggal: ', pdfOffsetTanggal: 38,
    pdfColName: 'NAMA SISWA', pdfColProgress: 'PROGRESS HARI INI',
    pdfPhotoEmpty: (i) => `Foto ${i} belum diupload`,
    fileName: (kelas, tgl) => `Daily Journal_${kelas}_${tgl}`,
  },
  en: {
    cardTitle: 'Student Data & Generate Report',
    addBtn: '+ Add Student',
    waBtn: 'Send to WhatsApp',
    waTitle: 'WhatsApp Message Preview',
    tip: '<div class="how-to-title">💡 How to Use (Workflow):</div><ol class="how-to-steps"><li><strong>Class Information:</strong> Enter class name & session date.</li><li><strong>Report Language:</strong> Select WhatsApp message language (English / Indonesia).</li><li><strong>Documentation Photos:</strong> Upload 1–6 classroom activity photos (auto-cropped 16:9).</li><li><strong>Student Data:</strong> Enter student name, choose level, course, lesson, and status &rarr; click <strong>⚡ Generate</strong> (can toggle ID/EN per student).</li><li><strong>Export & Share:</strong> Download <strong>PNG</strong> / <strong>PDF</strong> or click <strong>Send to WhatsApp</strong> to share with parents.</li></ol>',
    previewLabel: 'Live Preview — Daily Journal',
    rptTitle: 'Student<br><span>Daily Journal</span>',
    labelKelas: 'Class',
    labelTanggal: 'Date',
    photo1: 'Photo 1', photo2: 'Photo 2',
    thName: 'Student Name', thProgress: "Today's Progress",
    critPlaceholder: '— Level —',
    coursePlaceholder: '— Course —',
    lessonPlaceholder: '— Lesson —',
    lesson2Placeholder: '— 2nd Lesson —',
    statusDone: '✓ Completed 1 Lesson',
    statusInProgress1: '⏳ In Progress (1st Meeting)',
    statusInProgress2: '🔄 In Progress (2nd Meeting)',
    statusContinuedDone: '🔄 Continued & Completed (2nd or 3rd Meeting)',
    statusOneAndHalf: '🌖 Completed 1.5 Lessons',
    statusDouble: '🚀 Completed 2 Lessons',
    // Fallback statusInProgress for backward compatibility
    statusInProgress: '⏳ In Progress (1st Meeting)',
    contextDetail: '🎯 Detailed & Heavy Technical Project',
    contextFocus: '👀 Guiding Screen Focus & Work Tab',
    contextPace: '☕ Relaxed & Steady Work Rhythm',
    contextLogic: '💡 Step-by-Step Logic Guidance',
    contextTired: '🔋 Pacing After-School Energy',
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
      if (!objectives || objectives.length === 0) return `completed all steps in *Lesson ${lessonNum}* for the ${course} course.`;
      return `practiced how to ${formatObjectives(objectives, 'en')}.`;
    },
    doneText: (nama, lessonTitle, action, idx = 0, seed = 0) => {
      const variants = [
        `In today's session, ${nama} successfully completed *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Throughout the class, ${nama} demonstrated great focus and was able to assemble code logic independently with minimal teacher guidance. Mastering this concept is crucial as it strengthens computational thinking and structured problem-solving skills. ${nama} is well-prepared to tackle more advanced logic challenges in the upcoming session.`,
        `In this session, ${nama} finished building the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)} In class, ${nama} displayed keen attention to detail and proactively investigated code errors, successfully debugging issues on their own. This experience nurtures critical analytical thinking by identifying root causes in algorithmic workflows. At home, ${nama} is encouraged to test and customize the project to reinforce the newly acquired concepts.`,
        `During today's class, ${nama} achieved all learning objectives for *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} was highly enthusiastic and took the initiative to add creative personal touches beyond the basic requirements. This explorative mindset is valuable for cultivating digital creativity and cognitive flexibility in programming. We will continue channeling this creativity into more interactive features in future meetings.`,
        `Today, ${nama} completed all instructions in *${lessonTitle}*. ${nama} ${ensurePeriod(action)} In the classroom, ${nama} demonstrated remarkable persistence, following every development step methodically without getting discouraged when facing difficulties. Mastering this step provides a clear understanding of how programmed commands are executed precisely by computers. Consistent encouragement at home will further bolster ${nama}'s confidence in coding.`,
        `In this class, ${nama} wrapped up *${lessonTitle}* with solid results. ${nama} ${ensurePeriod(action)} ${nama} proactively asked insightful questions about how the code blocks work, reflecting strong curiosity and active engagement. Understanding this foundation enables ${nama} to connect multiple logical mechanisms into a unified, functional program. This progress builds a solid launchpad for the next topic next week.`,
        `In today's lesson, ${nama} accomplished the goals of *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} worked with great diligence, double-checking algorithm conditions and ensuring each feature ran smoothly before concluding. This practice establishes clean, structured coding habits essential for long-term growth. In the upcoming session, ${nama} can readily proceed to the next curriculum milestone.`
      ];
      return pickVariant(variants, idx, seed);
    },
    continuedDoneText: (nama, lessonTitle, action, idx = 0, seed = 0) => {
      const variants = [
        `In today's session, ${nama} continued and successfully finalized the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)} In class, ${nama} quickly recalled previous project logic and stayed dedicated to finishing the remaining code blocks. This persistence is vital for building procedural memory and task-completion stamina in programming. Having concluded this topic, ${nama} is ready to embrace a new subject in the next session.`,
        `In this class, ${nama} concluded the ongoing project in *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} demonstrated mature problem-solving skills when integrating the final code components into the existing structure. Finishing a multi-session project proves their growing resilience and precision in software creation. At home, ${nama} can proudly showcase their completed digital creation to parents.`,
        `During today's lesson, ${nama} accomplished the final stage of *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} diligently reviewed all script interactions, verifying that every mechanism functioned seamlessly without glitches. This self-testing habit is essential for cultivating professional engineering quality from an early age. Next week, ${nama} will transition smoothly into the subsequent curriculum challenge.`,
        `Today, ${nama} resumed working on *${lessonTitle}* and brought it to completion. ${nama} ${ensurePeriod(action)} ${nama} worked with great concentration, proactively resolving leftover bugs and finalizing all project features. This determined mindset is a valuable asset for long-term analytical learning. We celebrate ${nama}'s sustained dedication in class today.`,
        `In this session, ${nama} successfully completed the continuation of *${lessonTitle}*. ${nama} ${ensurePeriod(action)} Throughout the session, ${nama} showed impressive focus while connecting previously built logic with new features. Successfully wrapping up a multi-step project reinforces confidence and independent coding execution. ${nama} is now fully prepared for the next exciting lesson.`,
        `Today, ${nama} finalized all remaining stages of *${lessonTitle}*. ${nama} ${ensurePeriod(action)} ${nama} methodically verified that every event trigger and game mechanism responded accurately. Mastering this completion phase instills systematic quality assurance habits. We look forward to seeing ${nama} tackle the upcoming lesson with this same enthusiasm.`
      ];
      return pickVariant(variants, idx, seed);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0) => {
      const partial = getPartialObjectives(objectives);
      const actionDesc = (partial && partial.length > 0) ? `practiced how to ${formatObjectives(partial, 'en')}` : 'built the foundational project structure and algorithms';
      const templates = {
        detail: [
          `Today, ${nama} began working on *${lessonTitle}*. In this session, ${nama} ${actionDesc}. In class, ${nama} assembled the project code carefully and paid close attention to technical details. Because this project contains substantial components that require thorough precision, the teacher guided ${nama} step-by-step to ensure each algorithm functioned properly. The remaining features will be completed in the next meeting. At home, parents are welcome to ask about the exciting project being built to keep ${nama} motivated for next week's session.`,
          `In this session, ${nama} started *${lessonTitle}* and ${actionDesc}. In the classroom, ${nama} diligently constructed the starting code blocks and verified each function step-by-step. With rich project features that require structured care, setting up the initial architecture cleanly is essential. With the teacher's guidance, a solid foundation is in place, and development will resume next week.`
        ],
        focus: [
          `Today, ${nama} started learning *${lessonTitle}* and ${actionDesc}. In class, ${nama} has strong curiosity, which occasionally led to exploring other browser tabs or applications outside the lesson. The teacher actively guided ${nama}'s focus back to the coding workspace so progress could continue steadily. The rest of the project will be continued in the upcoming session. Gentle reminders at home will help ${nama} maintain good focus during coding sessions to complete the project smoothly.`,
          `During today's class, ${nama} initiated *${lessonTitle}* and ${actionDesc}. ${nama} showed high energy in class, though attention occasionally shifted to other apps. The teacher consistently guided ${nama} back to the project tasks. The initial code blocks are successfully assembled, and the remaining features will be continued next week. Your encouragement at home regarding classroom focus will greatly support their ongoing progress.`
        ],
        pace: [
          `In today's session, ${nama} began *${lessonTitle}* and ${actionDesc}. In class, ${nama} was cheerful and engaged socially with peers, maintaining a relaxed yet steady work rhythm. The teacher guided ${nama} step-by-step in constructing the project code and resolving errors one by one. Project development will continue in the next meeting to achieve optimal results. Encouragement at home will help ${nama} stay enthusiastic and productive next week.`,
          `Today, ${nama} started *${lessonTitle}* and ${actionDesc}. In a fun and lively classroom atmosphere, ${nama} worked with a relaxed rhythm. The teacher provided clear direction so essential project goals were met sequentially. The final project steps will be continued in our next session.`
        ],
        logic: [
          `During today's class, ${nama} explored the new topic *${lessonTitle}* and ${actionDesc}. In the classroom, ${nama} encountered new logic structures that presented a good challenge. The teacher provided intensive, step-by-step guidance to ensure ${nama} truly understood how each programming command operates before moving forward. Grasping this foundation ensures confidence when completing the rest of the features in our next class.`,
          `Today, ${nama} commenced *${lessonTitle}* and ${actionDesc}. Facing novel algorithmic challenges, ${nama} learned to analyze code logic with close teacher assistance. This process strengthens computational problem-solving resilience. The remaining milestones will be completed in the upcoming session.`
        ],
        tired: [
          `Today, ${nama} commenced work on *${lessonTitle}* and focused on ${actionDesc}. In class, ${nama}'s energy was slightly lower after a busy school day, so the learning pace was comfortably adapted to maintain understanding without rushing. With the teacher's guidance, ${nama} steadily built the initial code structure. The rest of the project is scheduled to continue in the next session once energy is fully restored.`,
          `In this session, ${nama} started *${lessonTitle}* and ${actionDesc}. Due to tiredness after a long school day, the teacher adjusted the pace so ${nama} could absorb coding concepts comfortably. The initial project framework is securely built and will resume next week.`
        ]
      };
      const list = templates[context] || templates['detail'];
      return pickVariant(list, idx, seed);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0) => {
      const partial = getPartialObjectives(objectives);
      const actionDesc = (partial && partial.length > 0) ? `continued working on ${formatObjectives(partial, 'en')}` : 'developed advanced project logic';
      const templates = {
        detail: [
          `In this second session for *${lessonTitle}*, ${nama} continued developing the project code from last week. ${nama} ${actionDesc} and integrated core logic mechanisms into the program. In class, ${nama} was thorough in arranging the code flow and troubleshooting technical hurdles. Due to the rich features in this project, extra development time ensures clean and error-free code. The final polish and testing will be completed in the third meeting next week.`,
          `In this follow-up session for *${lessonTitle}*, ${nama} progressed with project development. ${nama} ${actionDesc} and completed key functional structures. In class, ${nama} meticulously verified that all interactions responded accurately. Most core mechanisms are now in place, and final testing will be wrapped up in the next class.`
        ],
        focus: [
          `In this follow-up session on *${lessonTitle}*, ${nama} continued developing the project code. ${nama} completed key functions, including ${actionDesc}. Throughout the class, the teacher provided close guidance to help ${nama} keep attention directed at the coding workspace whenever curiosity drifted to other tabs. With consistent guidance, ${nama}'s project progress advanced steadily. Finalizing and testing the project will be completed in the next session. Continued reminders at home regarding screen focus will help ensure optimal learning.`,
          `Today, ${nama} entered the second meeting for *${lessonTitle}*. ${nama} continued building the program and successfully ${actionDesc}. In class, the teacher kept ${nama} on track to complete algorithms without getting sidetracked. Thanks to direct mentoring, vital project features are operational, and final completion is set for next week.`
        ],
        pace: [
          `In this second meeting for *${lessonTitle}*, ${nama} continued building the project. ${nama} ${actionDesc} and assembled essential program features. In class, ${nama} enjoyed the interactive learning atmosphere at a comfortable, steady pace. The teacher actively guided ${nama} to focus energy on key code milestones. The project has reached its concluding phase and will be wrapped up in the next class.`,
          `In this session, ${nama} resumed the project for *${lessonTitle}* from last week. ${nama} worked on ${actionDesc} with a steady rhythm. The teacher helped channel class time effectively to finish leftover logic. The project is nearing completion and will be finalized in the upcoming meeting.`
        ],
        logic: [
          `During this second session for *${lessonTitle}*, ${nama} continued assembling the project algorithms. ${nama} ${actionDesc} with dedicated guidance from the teacher. ${nama} began grasping multi-step logic that was previously challenging and resolved earlier coding hurdles. This practice steadily strengthens computational thinking. The remaining features and testing will be completed in the upcoming meeting.`,
          `Today, ${nama} advanced further into *${lessonTitle}*, tackling deeper logical requirements. ${nama} ${actionDesc} and collaborated with the teacher on debugging complex functions. This hands-on problem solving deepened ${nama}'s algorithmic reasoning. The project will be finalized in the next session.`
        ],
        tired: [
          `Today, ${nama} continued working on the ongoing project for *${lessonTitle}*. ${nama} ${actionDesc} and built several main functions. Recognizing that ${nama} was pacing energy after a full day of school, the teacher facilitated a steady, supportive rhythm to ensure strong conceptual grasp. The project framework is nearly complete and will be finalized in the next session.`,
          `In this second session for *${lessonTitle}*, ${nama} worked through the middle phase of the project with teacher support. Although energy was limited after regular school, ${nama} remained committed to building key project scripts. Final project completion is scheduled for next week.`
        ]
      };
      const list = templates[context] || templates['detail'];
      return pickVariant(list, idx, seed);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0) => {
      // Alias backward compatibility
      return LANG_UI.en.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed);
    },
    oneAndHalfText: (nama, l1Num, l1Title, action1, l2Num, l2Title, obj2, idx = 0, seed = 0) => {
      const variants = [
        `In today's session, ${nama} demonstrated remarkable productivity by completing *${l1Title}* and getting a head start on the next topic. ${nama} ${ensurePeriod(action1)} Working with great pace and precision in class, ${nama} utilized the remaining time to construct the initial foundation for *${l2Title}*. This rapid adaptation to new programming concepts proves that their computational logic is maturing exceptionally well. In the upcoming session, ${nama} will seamlessly continue and finalize *${l2Title}*.`,
        `In this session, ${nama} completed *${l1Title}* independently and immediately initiated the next project *${l2Title}*. ${nama} ${ensurePeriod(action1)} In class, ${nama} showed high enthusiasm and picked up new concepts rapidly, completing the initial setup for *${l2Title}* with ease. This head start provides extra time for deeper creative experimentation in the next meeting. We look forward to continuing this wonderful learning momentum next week.`,
        `During today's class, ${nama} accomplished an impressive learning milestone by finishing *${l1Title}* ahead of schedule and transitioning straight into *${l2Title}*. ${nama} ${ensurePeriod(action1)} Throughout the class, ${nama} remained dedicated, solving code challenges smoothly and quickly adapting to the new project structure of *${l2Title}*. This agility highlights strong analytical confidence and mental flexibility. ${nama} will resume and finalize *${l2Title}* in our next session.`,
        `Today, ${nama} displayed exceptional learning efficiency by completing *${l1Title}* and embarking on *${l2Title}*. ${nama} ${ensurePeriod(action1)} ${nama} maintained sharp focus throughout, allowing ample time to explore the initial mechanisms of *${l2Title}*. Grasping concepts across multiple topics in a single session demonstrates growing mastery of programming fundamentals. In the upcoming class, ${nama} will build upon this foundation to wrap up *${l2Title}*.`
      ];
      return pickVariant(variants, idx, seed);
    },
    doubleText: (nama, l1Num, l1Title, action1, l2Num, l2Title, action2, idx = 0, seed = 0) => {
      const variants = [
        `${nama} demonstrated outstanding learning pace by completing 2 full lessons in today's session (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nThroughout the class, ${nama} worked with immense focus, solved code challenges independently, and applied complex instructions swiftly without sacrificing project quality. Finishing two distinct topics in a single meeting reflects strong computational mastery and readiness for advanced challenges ahead. In the upcoming session, ${nama} can confidently proceed to the next milestone.`,
        `${nama} achieved an exceptional milestone by successfully finishing 2 full lessons today (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nIn the classroom, ${nama} showed high persistence and great attention to detail, debugging code errors autonomously across both projects. This rapid progression showcases mature algorithmic thinking and excellent problem-solving resilience. At home, parents are encouraged to celebrate this achievement and test the completed projects together with ${nama}.`,
        `${nama} displayed impressive efficiency and enthusiasm, completing 2 complete lessons in today's session (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\n${nama} actively engaged with every coding challenge, demonstrating sharp analytical logic and executing multi-step algorithms smoothly. Mastering the content of two lessons in one sitting provides a solid foundation for more complex programming concepts. We will continue challenging ${nama}'s creative logic in the upcoming meeting.`,
        `Today, ${nama} showed remarkable learning agility by mastering 2 full lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}\n\nIn class, ${nama} demonstrated steady concentration and a strong grasp of code mechanics, completing all project requirements with minimal guidance. Completing double topics in one session proves that ${nama} has developed great cognitive stamina and structured thinking. ${nama} is well-prepared to take on the next curriculum level next week.`
      ];
      return pickVariant(variants, idx, seed);
    },
    waGreeting: (kelas, tgl) => `Good afternoon parents, ✨\n\nHere is a quick Daily Journal update on our students' learning in today's class:\n\n📌 *Class:* ${kelas}\n📅 *Date:* ${tgl}`,
    waClose: 'Thank you for your continued support! If you have any questions about today\'s lesson, feel free to reach out.\n\nHave a wonderful day! 😊',
    pdfTitle: 'Student Daily Journal',
    pdfLabelKelas: 'Class: ', pdfOffsetKelas: 26,
    pdfLabelTanggal: 'Date: ', pdfOffsetTanggal: 28,
    pdfColName: 'STUDENT NAME', pdfColProgress: "TODAY'S PROGRESS",
    pdfPhotoEmpty: (i) => `Photo ${i} not uploaded`,
    fileName: (kelas, tgl) => `Daily Journal_${kelas}_${tgl}`,
  }
};

const DAILY_GUIDE_TEXTS = {
  id: {
    title: '💡 Cara Pakai',
    steps: `<ol class="how-to-steps"><li><strong>Kelas & WA:</strong> Isi kelas & tgl, tentukan bahasa pesan WA.</li><li><strong>Foto:</strong> Upload 1–6 foto dokumentasi (auto 16:9).</li><li><strong>Siswa:</strong> Masukkan nama, materi & klik <strong>⚡ Generate</strong>.</li><li><strong>Export:</strong> Download <strong>PNG/PDF</strong> atau <strong>Kirim ke WA</strong>.</li></ol>`
  },
  en: {
    title: '💡 How to Use',
    steps: `<ol class="how-to-steps"><li><strong>Class & WA:</strong> Fill class & date, choose WA message language.</li><li><strong>Photos:</strong> Upload 1–6 activity photos (auto-cropped 16:9).</li><li><strong>Students:</strong> Enter name, lesson & click <strong>⚡ Generate</strong>.</li><li><strong>Export:</strong> Download <strong>PNG/PDF</strong> or <strong>Send to WhatsApp</strong>.</li></ol>`
  }
};

function setDailyGuideLang(lang) {
  const titleEl = document.getElementById('daily-guide-title');
  const contentEl = document.getElementById('daily-guide-content');
  const btnId = document.getElementById('daily-guide-btn-id');
  const btnEn = document.getElementById('daily-guide-btn-en');
  if (btnId) btnId.classList.toggle('active', lang === 'id');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (titleEl && DAILY_GUIDE_TEXTS[lang]) titleEl.textContent = DAILY_GUIDE_TEXTS[lang].title;
  if (contentEl && DAILY_GUIDE_TEXTS[lang]) contentEl.innerHTML = DAILY_GUIDE_TEXTS[lang].steps;
}

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
  setDailyGuideLang(lang);
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

function setupCustomSelect(selectEl) {
  if (!selectEl) return;
  if (!window._cSelectListenerAdded) {
    window._cSelectListenerAdded = true;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.c-select')) {
        document.querySelectorAll('.c-select.open').forEach(el => el.classList.remove('open'));
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.c-select.open').forEach(el => el.classList.remove('open'));
      }
    });
  }

  let wrap = selectEl.nextElementSibling;
  const isWrap = wrap && wrap.classList && wrap.classList.contains('c-select');
  if (!isWrap) {
    wrap = document.createElement('div');
    wrap.className = 'c-select';
    wrap.dataset.for = selectEl.id;
    if (selectEl.style.flex) wrap.style.flex = selectEl.style.flex;
    wrap.style.minWidth = '0';
    wrap.innerHTML = `
      <button type="button" class="c-select-trigger">
        <span class="c-select-text"></span>
        <svg class="c-select-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="c-select-dropdown">
        <div class="c-select-options"></div>
      </div>
    `;
    selectEl.classList.add('c-select-native-hidden');
    selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);

    const trigger = wrap.querySelector('.c-select-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = wrap.classList.contains('open');
      document.querySelectorAll('.c-select.open').forEach(el => el.classList.remove('open'));
      if (!wasOpen) {
        wrap.classList.add('open');
      }
    });
  }

  wrap.style.display = selectEl.style.display === 'none' ? 'none' : (selectEl.style.flex ? 'flex' : 'block');

  const triggerText = wrap.querySelector('.c-select-text');
  const optionsContainer = wrap.querySelector('.c-select-options');
  optionsContainer.innerHTML = '';

  const opts = Array.from(selectEl.options);
  let selectedText = '';

  opts.forEach(opt => {
    const isSelected = opt.selected;
    if (isSelected) {
      selectedText = opt.textContent;
    }
    const item = document.createElement('div');
    item.className = 'c-select-option' + (isSelected ? ' selected' : '') + (opt.disabled ? ' disabled' : '');
    item.dataset.value = opt.value;
    item.textContent = opt.textContent;
    item.title = opt.title || opt.textContent;

    if (!opt.disabled) {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.value = opt.value;
        wrap.classList.remove('open');
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    optionsContainer.appendChild(item);
  });

  const selectedOpt = opts.find(o => o.selected) || opts[0];
  const selectedLabel = selectedOpt ? selectedOpt.textContent : '';
  triggerText.textContent = selectedLabel;
  const triggerBtn = wrap.querySelector('.c-select-trigger');
  if (triggerBtn) {
    triggerBtn.title = selectedLabel;
  }
}

function populateCourseDropdown(idx) {
  const courseSelect = document.getElementById(`auto-course-${idx}`);
  if (!courseSelect) return;
  const s = autoStudents[idx];
  const sLang = s.lang || autoLang;
  courseSelect.innerHTML = `<option value="">${LANG_UI[sLang].coursePlaceholder}</option>`;
  const courseList = (s.criteria && COURSE_MAP[s.criteria])
    ? COURSE_MAP[s.criteria]
    : ((s.criteria === 'Juniors' || s.criteria === 'Junior') ? (COURSE_MAP['Juniors'] || COURSE_MAP['Junior']) : null);
  if (courseList) {
    courseList.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = getLocalizedCourseName(c, sLang);
      if (c === s.course) opt.selected = true;
      courseSelect.appendChild(opt);
    });
  }
  setupCustomSelect(courseSelect);
}

function populateLessonDropdown(idx) {
  const lessonSelect = document.getElementById(`auto-lesson-${idx}`);
  const lesson2Select = document.getElementById(`auto-lesson2-${idx}`);
  if (!lessonSelect) return;
  const s = autoStudents[idx];
  const sLang = s.lang || autoLang;
  
  lessonSelect.innerHTML = `<option value="">${LANG_UI[sLang].lessonPlaceholder}</option>`;
  if (lesson2Select) {
    lesson2Select.innerHTML = `<option value="">${LANG_UI[sLang].lesson2Placeholder}</option>`;
    lesson2Select.style.display = (s.status === 'double' || s.status === 'one_and_half') ? 'block' : 'none';
  }
  
  if (s.course && COURSE_DATA[s.course] && COURSE_DATA[s.course].length > 0) {
    COURSE_DATA[s.course].forEach(l => {
      const lTitle = (sLang === 'id' && l.title_id) ? l.title_id : (l.title_en || l.title);
      const opt1 = document.createElement('option');
      opt1.value = l.num; opt1.textContent = `${lTitle}`;
      if (String(l.num) === String(s.lesson)) opt1.selected = true;
      lessonSelect.appendChild(opt1);
      
      if (lesson2Select) {
        const opt2 = document.createElement('option');
        opt2.value = l.num; opt2.textContent = `${lTitle}`;
        if (String(l.num) === String(s.lesson2)) opt2.selected = true;
        lesson2Select.appendChild(opt2);
      }
    });
  } else if (s.course && COURSE_DATA[s.course] && COURSE_DATA[s.course].length === 0) {
    const noOpt = document.createElement('option');
    noOpt.value = "";
    noOpt.textContent = sLang === 'id' ? "(Ketik progress manual)" : "(Type progress manually)";
    noOpt.disabled = true;
    lessonSelect.appendChild(noOpt);
  }
  setupCustomSelect(lessonSelect);
  if (lesson2Select) setupCustomSelect(lesson2Select);
}

function onCriteriaChange(idx, selectEl) {
  autoStudents[idx].criteria = selectEl.value;
  autoStudents[idx].course = '';
  autoStudents[idx].lesson = '';
  autoStudents[idx].lesson2 = '';
  setupCustomSelect(selectEl);
  populateCourseDropdown(idx);
  populateLessonDropdown(idx);
  autoUpdateTable();
}

function onCourseChange(idx, selectEl) {
  autoStudents[idx].course = selectEl.value;
  autoStudents[idx].lesson = '';
  autoStudents[idx].lesson2 = '';
  setupCustomSelect(selectEl);
  populateLessonDropdown(idx);
  autoUpdateTable();
}

function onStatusChange(idx, selectEl) {
  const status = selectEl.value;
  autoStudents[idx].status = status;
  setupCustomSelect(selectEl);
  const lesson2Select = document.getElementById(`auto-lesson2-${idx}`);
  if (lesson2Select) {
    lesson2Select.style.display = (status === 'double' || status === 'one_and_half') ? 'block' : 'none';
    setupCustomSelect(lesson2Select);
  }
  const contextRow = document.getElementById(`auto-context-row-${idx}`);
  const contextSelect = document.getElementById(`auto-context-${idx}`);
  if (contextRow && contextSelect) {
    const isProg = (status === 'in_progress_1' || status === 'in_progress_2' || status === 'in_progress');
    contextRow.style.display = isProg ? 'flex' : 'none';
    contextSelect.style.display = isProg ? 'block' : 'none';
    setupCustomSelect(contextSelect);
  }
  autoUpdateTable();
}

function onContextChange(idx, selectEl) {
  if (!autoStudents[idx]) return;
  autoStudents[idx].context = selectEl.value;
  setupCustomSelect(selectEl);
}

function onLessonChange(idx, selectEl) {
  autoStudents[idx].lesson = selectEl.value;
  setupCustomSelect(selectEl);
  autoUpdateTable();
}

function onLesson2Change(idx, selectEl) {
  autoStudents[idx].lesson2 = selectEl.value;
  setupCustomSelect(selectEl);
  autoUpdateTable();
}

function generateProgress(idx) {
  syncStudentFromDOM(idx);
  const s = autoStudents[idx];
  const sLang = s.lang || autoLang;
  const L = LANG_UI[sLang];

  if (!s.nama || !s.nama.trim()) { toast(L.errName, 'error'); return; }
  if (!s.course) { toast(L.errCourse, 'error'); return; }
  if (!s.lesson) {
    if (COURSE_DATA[s.course] && COURSE_DATA[s.course].length === 0) {
      toast(sLang === 'id' ? 'Course ini belum memiliki data lesson otomatis. Silakan tulis progress langsung di kotak teks.' : 'This course has no automated lessons yet. Please write progress directly in the text area.', 'error');
      return;
    }
    toast(L.errLesson, 'error'); return;
  }
  if ((s.status === 'double' || s.status === 'one_and_half') && !s.lesson2) { toast(L.errLesson2, 'error'); return; }

  const courseList = COURSE_DATA[s.course];
  const l1Obj = courseList ? courseList.find(item => item.num == s.lesson) : null;
  const l2Obj = (courseList && s.lesson2) ? courseList.find(item => item.num == s.lesson2) : null;

  const l1Title = l1Obj ? ((sLang === 'id' && l1Obj.title_id) ? l1Obj.title_id : (l1Obj.title_en || l1Obj.title)) : `Lesson ${s.lesson}`;
  const l2Title = l2Obj ? ((sLang === 'id' && l2Obj.title_id) ? l2Obj.title_id : (l2Obj.title_en || l2Obj.title)) : `Lesson ${s.lesson2}`;

  const templateMap = sLang === 'en' ? TEMPLATES_EN : TEMPLATES;
  const raw1 = (templateMap[s.course] && templateMap[s.course][s.lesson])
    ? templateMap[s.course][s.lesson]
    : '';
  const localizedCourse = getLocalizedCourseName(s.course, sLang);
  const action1 = raw1
    ? extractAction(raw1, s.nama, sLang)
    : L.fallbackProgress(s.nama, s.lesson, localizedCourse, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : []);

  let text = '';
  if (s.status === 'done') {
    text = L.doneText(s.nama, l1Title, action1, idx, s.lesson);
  } else if (s.status === 'continued_done') {
    text = L.continuedDoneText(s.nama, l1Title, action1, idx, s.lesson);
  } else if (s.status === 'in_progress_1' || s.status === 'in_progress') {
    text = (L.inProgress1Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson);
  } else if (s.status === 'in_progress_2') {
    text = (L.inProgress2Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson);
  } else if (s.status === 'one_and_half') {
    text = L.oneAndHalfText(s.nama, s.lesson, l1Title, action1, s.lesson2, l2Title, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : [], idx, s.lesson);
  } else if (s.status === 'double') {
    const raw2 = (templateMap[s.course] && templateMap[s.course][s.lesson2])
      ? templateMap[s.course][s.lesson2]
      : '';
    const action2 = raw2
      ? extractAction(raw2, s.nama, sLang)
      : L.fallbackProgress(s.nama, s.lesson2, localizedCourse, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : []);
    text = L.doubleText(s.nama, s.lesson, l1Title, action1, s.lesson2, l2Title, action2, idx, s.lesson);
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
  const contextEl = document.getElementById(`auto-context-${idx}`);
  if(contextEl) autoStudents[idx].context = contextEl.value;
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
    const sContext = s.context || 'detail';
    s.lang = sLang;
    s.status = sStatus;
    s.context = sContext;

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
        <div class="auto-gen-selectors">
          <select id="auto-criteria-${i}" onchange="onCriteriaChange(${i},this)" style="flex:1;min-width:0;">
            <option value="">${L.critPlaceholder}</option>
            <option value="Juniors" ${s.criteria==='Juniors'||s.criteria==='Junior'?'selected':''}>Juniors</option>
            <option value="Kids" ${s.criteria==='Kids'?'selected':''}>Kids</option>
            <option value="Teens" ${s.criteria==='Teens'?'selected':''}>Teens</option>
            <option value="Design" ${s.criteria==='Design'?'selected':''}>Design</option>
            <option value="Pro" ${s.criteria==='Pro'?'selected':''}>Pro</option>
          </select>
          <select id="auto-course-${i}" onchange="onCourseChange(${i},this)" style="flex:1.8;min-width:0;">
            <option value="">${L.coursePlaceholder}</option>
          </select>
        </div>
        <div class="auto-gen-selectors" style="margin-top:4px;">
          <select id="auto-status-${i}" onchange="onStatusChange(${i},this)" style="flex:1;min-width:0;">
            <option value="done" ${sStatus==='done'?'selected':''}>${L.statusDone}</option>
            <option value="in_progress_1" ${(sStatus==='in_progress_1'||sStatus==='in_progress')?'selected':''}>${L.statusInProgress1}</option>
            <option value="in_progress_2" ${sStatus==='in_progress_2'?'selected':''}>${L.statusInProgress2}</option>
            <option value="continued_done" ${sStatus==='continued_done'?'selected':''}>${L.statusContinuedDone}</option>
            <option value="one_and_half" ${sStatus==='one_and_half'?'selected':''}>${L.statusOneAndHalf}</option>
            <option value="double" ${sStatus==='double'?'selected':''}>${L.statusDouble}</option>
          </select>
        </div>
        <div class="auto-gen-selectors" id="auto-context-row-${i}" style="margin-top:4px;display:${(sStatus==='in_progress_1'||sStatus==='in_progress_2'||sStatus==='in_progress')?'flex':'none'};">
          <select id="auto-context-${i}" onchange="onContextChange(${i},this)" style="flex:1;min-width:0;">
            <option value="detail" ${(sContext==='detail'||!sContext)?'selected':''}>${L.contextDetail}</option>
            <option value="focus" ${sContext==='focus'?'selected':''}>${L.contextFocus}</option>
            <option value="pace" ${sContext==='pace'?'selected':''}>${L.contextPace}</option>
            <option value="logic" ${sContext==='logic'?'selected':''}>${L.contextLogic}</option>
            <option value="tired" ${sContext==='tired'?'selected':''}>${L.contextTired}</option>
          </select>
        </div>
        <div class="auto-gen-selectors" style="margin-top:4px;">
          <select id="auto-lesson-${i}" style="flex:1;min-width:0;" onchange="onLessonChange(${i},this)">
            <option value="">${L.lessonPlaceholder}</option>
          </select>
          <select id="auto-lesson2-${i}" style="flex:1;min-width:0; display:${(sStatus==='double'||sStatus==='one_and_half')?'block':'none'}" onchange="onLesson2Change(${i},this)">
            <option value="">${L.lesson2Placeholder}</option>
          </select>
        </div>
        <button class="btn-generate" onclick="generateProgress(${i})" style="margin-top:4px;">${L.generateBtn}</button>
      </div>
      <textarea id="auto-progress-${i}" placeholder="${L.progressPlaceholder}" oninput="autoStudents[${i}].progress=this.value;autoUpdateTable()" style="min-height:100px">${escHtml(s.progress)}</textarea>`;
    c.appendChild(div);
    
    populateCourseDropdown(i);
    populateLessonDropdown(i);
    ['criteria', 'course', 'status', 'context', 'lesson', 'lesson2'].forEach(field => {
      setupCustomSelect(document.getElementById(`auto-${field}-${i}`));
    });
  });
  autoUpdateTable();
}

function addAutoStudent(){
  autoStudents.forEach((_, idx) => syncStudentFromDOM(idx));
  autoStudents.push({nama:'',progress:'',criteria:'',course:'',lesson:'',lesson2:'',status:'done',context:'detail',lang:autoLang});
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
  autoStudents.forEach((s, idx) => {
    syncStudentFromDOM(idx);
    if(!s.nama && !s.progress) return;
    
    // Status dot color
    const isDone = s.status === 'done' || s.status === 'double' || s.status === 'continued_done';
    const dotClass = isDone ? 'dot-done' : 'dot-progress';
    
    const lessonTag = getLessonTag(s);
    const courseName = getStudentCourse(s);
    const sLang = s.lang || autoLang;
    const localizedCourse = getLocalizedCourseName(courseName, sLang);
    const levelName = getStudentLevel(s);
    const levelKey = (levelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
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
        ${levelName ? `<span class="card-level-badge level-${levelKey}">${escHtml(levelName)}</span>` : ''}
        ${localizedCourse ? `<div class="card-course-title">${escHtml(localizedCourse)}</div>` : ''}
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
  if (criteria === 'Junior' || criteria === 'Juniors') mascotSrc = 'img/cobee4.png';
  if (criteria === 'Kids') mascotSrc = 'img/cobee5.png';
  if (criteria === 'Design') mascotSrc = 'img/cobee9.png';
  if (criteria === 'Pro') mascotSrc = 'img/cobee10.png';
  
  const m2 = document.getElementById('auto-mascot');
  if (m2) m2.src = mascotSrc;
}

function buildAutoWAMessage(){
  const L = LANG_UI[autoLang];
  const tgl = document.getElementById('auto-tanggal').value;
  const kelas = document.getElementById('auto-kelas').value || '-';
  const studentLines = autoStudents.map(s => {
    if(!s.nama && !s.progress) return '';
    
    let shortSummary = s.progress || '-';
    const courseName = getStudentCourse(s);
    const localizedCourse = getLocalizedCourseName(courseName, autoLang);
    const lessonTag = getLessonTag(s);
    const levelName = getStudentLevel(s);
    const levelPrefix = levelName ? `${levelName} • ` : '';
    
    if (courseName && s.lesson) {
      const courseList = (typeof COURSE_DATA !== 'undefined') ? COURSE_DATA[courseName] : null;
      const l1Obj = courseList ? courseList.find(item => item.num == s.lesson) : null;
      
      let statusText = '';
      if (s.status === 'done' || s.status === 'continued_done') {
        statusText = autoLang === 'en' ? '(Completed)' : '(Selesai)';
      } else if (s.status === 'in_progress_1' || s.status === 'in_progress') {
        statusText = autoLang === 'en' ? '(In Progress - 1st Meeting)' : '(Belum Selesai - Pertemuan ke-1)';
      } else if (s.status === 'in_progress_2') {
        statusText = autoLang === 'en' ? '(In Progress - 2nd Meeting)' : '(Belum Selesai - Pertemuan ke-2)';
      } else if (s.status === 'double') {
        statusText = autoLang === 'en' ? '(Completed)' : '(Selesai)';
      }
      
      const coursePrefix = localizedCourse ? `${levelPrefix}${localizedCourse} - ` : (levelPrefix ? `${levelPrefix}` : '');
      if (s.status === 'double' && s.lesson2) {
        shortSummary = `${coursePrefix}Lesson ${s.lesson} & ${s.lesson2} ${statusText}`;
      } else if (s.status === 'one_and_half' && s.lesson2) {
        const l1Status = autoLang === 'en' ? 'Completed' : 'Selesai';
        const l2Status = autoLang === 'en' ? 'In Progress' : 'Sedang Dikerjakan';
        shortSummary = `${coursePrefix}Lesson ${s.lesson} (${l1Status}) & Lesson ${s.lesson2} (${l2Status})`;
      } else if (l1Obj) {
        const rawTitle = (autoLang === 'id' && l1Obj.title_id) ? l1Obj.title_id : (l1Obj.title_en || l1Obj.title);
        let cleanTitle = rawTitle.replace(/^Lesson\s*\d+\s*(?:-|:)\s*/i, '');
        shortSummary = `${coursePrefix}Lesson ${s.lesson}: ${cleanTitle} ${statusText}`;
      }
    } else if (courseName && lessonTag) {
      shortSummary = `${levelPrefix}${localizedCourse || courseName} - ${lessonTag}`;
    }
    
    return `*${s.nama||'-'}*\n${shortSummary}`;
  }).filter(Boolean).join('\n\n');
  return `${L.waGreeting(kelas, formatDateLong(tgl, autoLang))}\n\n${studentLines}\n\n${L.waClose}`;
}

function autoUpdateWA(){
  const bubble = document.getElementById('auto-wa-bubble');
  if (!bubble) return;
  const msg = buildAutoWAMessage();
  if (bubble.tagName === 'TEXTAREA' || bubble.tagName === 'INPUT') {
    bubble.value = msg;
  } else {
    bubble.textContent = msg;
  }
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
  
  const TABLE_X=MARGIN,TABLE_W=W-MARGIN*2,COL_NAME_W=38,COL_LESSON_W=48;
  let rowY=photoSectionBottom+8;const HEADER_H=9;
  doc.setFillColor(...G_DARK);doc.roundedRect(TABLE_X,rowY,TABLE_W,HEADER_H,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...WHITE);
  doc.text('STATUS',TABLE_X+4,rowY+6);
  doc.text(labels.colName,TABLE_X+18,rowY+6);
  doc.text('COURSE & LESSON',TABLE_X+18+COL_NAME_W,rowY+6);
  doc.text(labels.colProgress,TABLE_X+18+COL_NAME_W+COL_LESSON_W,rowY+6);
  rowY+=HEADER_H;
  
  doc.setFont('helvetica','normal');doc.setFontSize(9);
  students.forEach((s,idx)=>{
    if(!s.nama&&!s.progress)return;
    const plainText = (s.progress||'—').replace(/\*/g,'');
    const lines=doc.splitTextToSize(plainText,TABLE_W-COL_NAME_W-COL_LESSON_W-24);
    
    const courseName = getStudentCourse(s);
    const sLang = s.lang || autoLang;
    const localizedCourse = getLocalizedCourseName(courseName, sLang);
    const lessonTag = getLessonTag(s);
    const levelName = getStudentLevel(s);
    const courseLines = localizedCourse ? doc.splitTextToSize(localizedCourse, COL_LESSON_W - 8) : [];
    const levelH = levelName ? 4.2 : 0;
    const courseBoxH = (courseName && courseLines.length > 0) ? (courseLines.length * 3.8 + 2.5) : 0;
    const minH = Math.max(12, levelH + courseBoxH + (lessonTag ? 8 : 4));
    const cellH = Math.max(minH, lines.length * 5 + 8);
    
    if(rowY+cellH>H-20){doc.addPage();rowY=20;}
    if(idx%2===0){doc.setFillColor(...G_LIGHT);doc.rect(TABLE_X,rowY,TABLE_W,cellH,'F');}
    doc.setDrawColor(226,232,240);doc.setLineWidth(0.2);doc.line(TABLE_X,rowY+cellH,TABLE_X+TABLE_W,rowY+cellH);
    
    // Status dot
    const isDone = s.status === 'done' || s.status === 'double' || s.status === 'continued_done' || !/in progress|working on|sedang mempelajari|belum|absent/i.test(s.progress||'');
    doc.setFillColor(...(isDone ? [22,163,74] : [245,158,11]));
    doc.circle(TABLE_X+8,rowY+7,2.5,'F');
    
    // Student Name
    doc.setFont('helvetica','bold');doc.setTextColor(...G_DARK);
    doc.text(s.nama||'—',TABLE_X+18,rowY+6.5);
    
    // Course & Lesson
    let curY = rowY + 5.2;
    if (levelName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      let lvlColor = [100, 116, 139];
      if (/junior/i.test(levelName)) lvlColor = [124, 58, 237];
      else if (/kids/i.test(levelName)) lvlColor = [37, 99, 235];
      else if (/teens/i.test(levelName)) lvlColor = [217, 119, 6];
      else if (/design/i.test(levelName)) lvlColor = [219, 39, 119];
      else if (/pro/i.test(levelName)) lvlColor = [13, 148, 136];
      doc.setTextColor(...lvlColor);
      doc.text(levelName.toUpperCase(), TABLE_X + 18 + COL_NAME_W, curY);
      curY += 3.8;
    }
    if (courseName && courseLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      let maxLineW = 0;
      courseLines.forEach(cl => {
        const lw = doc.getTextWidth(cl);
        if (lw > maxLineW) maxLineW = lw;
      });
      const boxW = Math.min(COL_LESSON_W - 4, maxLineW + 4);
      const boxH = courseLines.length * 3.8 + 2;
      
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.roundedRect(TABLE_X + 18 + COL_NAME_W, curY - 2.8, boxW, boxH, 1, 1, 'FD');
      
      doc.setTextColor(15, 23, 42);
      doc.text(courseLines, TABLE_X + 20 + COL_NAME_W, curY);
      curY += boxH + 1.8;
    }
    if(lessonTag){
      doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(21,128,61);
      doc.setFillColor(240,253,244);
      doc.setDrawColor(187, 247, 208);
      doc.setLineWidth(0.2);
      const pillW = doc.getTextWidth(lessonTag) + 5;
      doc.roundedRect(TABLE_X+18+COL_NAME_W, curY - 2.8, pillW, 4.5, 1.2, 1.2, 'FD');
      doc.text(lessonTag, TABLE_X + 20 + COL_NAME_W, curY);
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
    const isExam = (l1 == 8 || l1 == 16 || l1 == 24 || l1 == 32 || l2 == 8 || l2 == 16 || l2 == 24 || l2 == 32);
    const isFinished = s.status !== 'in_progress' && s.status !== 'in_progress_1' && s.status !== 'in_progress_2';
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
    const waEl = document.getElementById('auto-wa-bubble');
    const waMsg = (waEl && (waEl.value !== undefined ? waEl.value : waEl.textContent)) || buildAutoWAMessage();
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(waMsg),'_blank');
    toast('Done!','success');
  }catch(err){toast('Error: '+err.message,'error');}
  finally{btn.disabled=false;btn.textContent=L.waBtn;}
  });
}

async function copyAutoWAMessage() {
  const waEl = document.getElementById('auto-wa-bubble');
  const waMsg = (waEl && (waEl.value !== undefined ? waEl.value : waEl.textContent)) || buildAutoWAMessage();
  try {
    await navigator.clipboard.writeText(waMsg);
    toast(autoLang === 'en' ? 'WhatsApp message copied!' : 'Pesan WhatsApp disalin!', 'success');
  } catch(e) {
    const ta = document.createElement('textarea');
    ta.value = waMsg;
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

  const tglInput = document.getElementById('auto-tanggal');
  if (tglInput) tglInput.value = todayVal;

  // Init auto tab with sample students matching user's courses
  autoStudents = [
    {nama:'Student One',progress:'',criteria:'Pro',course:'Basic Website',lesson:'12',status:'done',lang:'en'},
    {nama:'Student Two',progress:'',criteria:'Kids',course:'Game Developer',lesson:'18',lesson2:'19',status:'double',lang:'en'}
  ];
  setLang('en');
  if (typeof generateProgress === 'function') {
    generateProgress(0);
    generateProgress(1);
  }
  autoUpdatePreview();
  setTimeout(fitPreviewScale, 100);

  // Sync theme toggle state on UI
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme);
};

// ============================================================
// THEME SWITCHER (DARK / LIGHT MODE)
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (document.body) {
    document.body.setAttribute('data-theme', theme);
  }
  try { localStorage.setItem('td_mrg_theme', theme); } catch(e){}
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = (theme === 'dark') 
      ? '☀️ <span class="theme-btn-text">Light Mode</span>' 
      : '🌙 <span class="theme-btn-text">Dark Mode</span>';
    btn.title = (theme === 'dark') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || (document.body && document.body.getAttribute('data-theme')) || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;

// Initial sync
(function() {
  try {
    const saved = localStorage.getItem('td_mrg_theme') || 'light';
    applyTheme(saved);
  } catch(e) {}
})();