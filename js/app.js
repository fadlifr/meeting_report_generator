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

function createSplitReport(summary, notes) {
  const cleanSummary = (summary || '').trim();
  const cleanNotes = (notes || '').trim();
  const combined = cleanSummary && cleanNotes 
    ? `${cleanSummary}\n\n${cleanNotes}` 
    : (cleanSummary || cleanNotes || '');
  return {
    summary: cleanSummary,
    notes: cleanNotes,
    text: combined,
    toString: function() { return combined; }
  };
}

function pickVariant(variants, idx = 0, seed = 0) {
  if (!variants || variants.length === 0) return '';
  const i = Math.abs(((parseInt(idx) || 0) + (parseInt(seed) || 0)) % variants.length);
  return variants[i];
}

function isRobloxCourse(course) {
  if (!course) return false;
  const c = String(course).toLowerCase();
  return c.includes('roblox') || c.includes('lua');
}

function isExamOrProject(lessonNum, lessonTitle) {
  const num = parseInt(lessonNum, 10);
  const title = String(lessonTitle || '').toLowerCase();
  return (num === 8 || num === 16 || num === 24 || title.includes('exam') || title.includes('ujian') || title.includes('project') || title.includes('projek') || title.includes('challenge'));
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
      if (isRobloxCourse(course)) {
        if (!objectives || objectives.length === 0) return `membangun model 3D dan membuat script pada *Lesson ${lessonNum}* di course ${course}.`;
        return `mempraktikkan cara ${formatObjectives(objectives, 'id')}.`;
      }
      if (!objectives || objectives.length === 0) return `menyelesaikan seluruh langkah pada *Lesson ${lessonNum}* di course ${course}.`;
      return `mempraktikkan cara ${formatObjectives(objectives, 'id')}.`;
    },
    doneText: (nama, lessonTitle, action, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `Pada pertemuan hari ini, ${nama} menyelesaikan pembelajaran *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Selama kelas, ${nama} terampil membangun model 3D dan mandiri menulis script Lua dengan sedikit arahan. Kreativitas dan pemahamannya sangat hebat!`
          },
          {
            summary: `Dalam sesi ini, ${nama} berhasil menuntaskan projek dan script pada materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Teramati di kelas, ${nama} sangat cermat merancang objek 3D serta memprogram mekanisme interaktif di Roblox Studio. Problem-solving yang sangat matang!`
          },
          {
            summary: `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} menunjukkan dedikasi tinggi, menyusun struktur 3D dengan rapi dan memastikan seluruh script Lua berjalan lancar tanpa error!`
          },
          {
            summary: `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Di kelas, ${nama} tekun membangun dunia 3D dan menyusun baris kode script secara metodis. Hasil projek Roblox-nya sangat memuaskan!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} fokus menyusun _code_ tanpa banyak bantuan. ${nama} menambahkan ide kreatifnya ke dalam _project_. ${nama} sudah siap lanjut ke next lesson. Mantap ${nama}!`
        },
        {
          summary: `Di kelas hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} menambahkan ide kreatifnya ke dalam _project_. ${nama} sudah siap untuk mempelajari materi selanjutnya. Good progress ${nama}!`
        },
        {
          summary: `Di sesi kali ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} mengikuti setiap langkah dan tidak mudah menyerah. ${nama} sudah siap untuk mempelajari logika berpikir yang lebih kompleks. Terus pertahankan ${nama}!`
        },
        {
          summary: `Pada pertemuan hari ini, ${nama} menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} mengecek _project_-nya sampai semua fitur berjalan. ${nama} cepat memahami instruksi dan bekerja mandiri. ${nama} sudah siap untuk belajar topik baru. Bagus ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} menyelesaikan materi *${lessonTitle}* dengan baik. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} cepat memahami instruksi dan bekerja mandiri. ${nama} teliti dan bisa melakukan _debugging_ sendiri. ${nama} sudah siap lanjut ke next lesson. Good job ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} teliti dan bisa melakukan _debugging_ sendiri. ${nama} sudah siap untuk mempelajari materi selanjutnya. Keep it up ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    continuedDoneText: (nama, lessonTitle, action, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `Pada pertemuan hari ini, ${nama} melanjutkan dan berhasil menyelesaikan projek *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Di kelas, ${nama} dengan cekatan mengintegrasikan model 3D dengan script Lua, menuntaskan seluruh mekanisme game, dan menguji gameplay menyeluruh!`
          },
          {
            summary: `Dalam sesi ini, ${nama} menuntaskan kelanjutan projek *${lessonTitle}* dari minggu lalu. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} menunjukkan kegigihan hebat melintasi beberapa sesi, menyempurnakan tata letak 3D dan memeriksa setiap script hingga projek berjalan mulus!`
          },
          {
            summary: `Di pertemuan kali ini, ${nama} menuntaskan tahap akhir materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} teliti memeriksa kembali interaksi model 3D dan fungsi script, memastikan game berjalan lancar tanpa kendala. Siap untuk materi baru!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Di sesi kali ini, ${nama} berhasil menyelesaikan sisa _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} memperbaiki sendiri _bug_ yang tersisa. ${nama} menyambungkan _code_ minggu lalu dengan fitur baru. ${nama} sudah siap untuk mempelajari materi selanjutnya. Bagus ${nama}!`
        },
        {
          summary: `Di pertemuan hari ini, ${nama} berhasil menyelesaikan seluruh _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} menyambungkan _code_ minggu lalu dengan fitur baru. ${nama} sudah siap untuk mempelajari logika berpikir yang lebih kompleks. Good job ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} menyelesaikan _project_ *${lessonTitle}* yang dikerjakan sejak minggu lalu. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} cepat mengingat _project_ minggu lalu dan fokus menyelesaikannya. ${nama} sudah siap untuk belajar topik baru. Keep it up ${nama}!`
        },
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan bagian akhir dari materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} mengecek ulang _code_-nya sampai tidak ada _error_. ${nama} memperbaiki sendiri _bug_ yang tersisa. ${nama} sudah siap lanjut ke next lesson. Well done ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} melanjutkan *${lessonTitle}* sampai selesai. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} memperbaiki sendiri _bug_ yang tersisa. ${nama} menyambungkan _code_ minggu lalu dengan fitur baru. ${nama} sudah siap untuk mempelajari materi selanjutnya. Nice work ${nama}!`
        },
        {
          summary: `Di sesi kali ini, ${nama} berhasil menyelesaikan sisa _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} menyambungkan _code_ minggu lalu dengan fitur baru. ${nama} sudah siap untuk mempelajari logika berpikir yang lebih kompleks. Mantap ${nama}!`
        },
        {
          summary: `Di pertemuan hari ini, ${nama} berhasil menyelesaikan seluruh _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} cepat mengingat _project_ minggu lalu dan fokus menyelesaikannya. ${nama} sudah siap untuk belajar topik baru. Good progress ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} menyelesaikan _project_ *${lessonTitle}* yang dikerjakan sejak minggu lalu. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} mengecek ulang _code_-nya sampai tidak ada _error_. ${nama} memperbaiki sendiri _bug_ yang tersisa. ${nama} sudah siap lanjut ke next lesson. Terus pertahankan ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'ujian' : 'projek';
      const partial = getPartialObjectives(objectives);
      
      if (isRobloxCourse(course)) {
        const defaultAction = isExam ? 'merancang model 3D dan menyiapkan arena ujian di Roblox Studio' : 'membangun model 3D dan merancang tata letak arena di Roblox Studio';
        const actionDesc = (partial && partial.length > 0) ? `berlatih ${formatObjectives(partial, 'id')} di Roblox Studio` : defaultAction;
        const templates = {
          detail: [
            {
              summary: `Hari ini, ${nama} mulai mengerjakan *${lessonTitle}*. Pada sesi ini, ${nama} ${actionDesc}.`,
              notes: `Di kelas, ${nama} teliti merancang model 3D dengan detail yang rapi. Projek masih tahap pembangunan model, sehingga ${targetType} berlanjut minggu depan dan mulai membuat script.`
            },
            {
              summary: `Dalam sesi ini, ${nama} mengawali *${lessonTitle}* di Roblox Studio dengan ${actionDesc}.`,
              notes: `Teramati di kelas, ${nama} fokus merancang aset 3D secara presisi. Model dasar telah terbangun rapi, dan pembuatan script akan dimulai pada pertemuan berikutnya.`
            }
          ],
          focus: [
            {
              summary: `Hari ini, ${nama} mulai mempelajari *${lessonTitle}* dan ${actionDesc}.`,
              notes: `Di kelas, ${nama} antusias membangun objek 3D walau perhatiannya sesekali beralih layar. Dengan arahan guru, model tersusun baik dan script dimulai minggu depan.`
            },
            {
              summary: `Pada sesi hari ini, ${nama} memulai *${lessonTitle}* di Roblox Studio untuk ${actionDesc}.`,
              notes: `Teacher konsisten mengarahkan fokus ${nama} pada lembar kerja Roblox Studio. Model 3D sudah tertata rapi, dan penulisan script dilanjutkan pertemuan berikutnya.`
            }
          ],
          pace: [
            {
              summary: `Dalam kelas hari ini, ${nama} mengawali *${lessonTitle}* dengan ${actionDesc}.`,
              notes: `Di kelas, ${nama} merancang model 3D dengan ritme santai namun terarah. Pembangunan model berjalan lancar dan ${nama} akan mulai membuat script minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}* untuk ${actionDesc}.`,
              notes: `Suasana santai membuat ${nama} nyaman menyusun aset 3D di Roblox Studio. Tahap membangun model berjalan baik dan penulisan script berlanjut sesi depan.`
            }
          ],
          logic: [
            {
              summary: `Pada pertemuan kali ini, ${nama} mempelajari materi baru *${lessonTitle}* untuk ${actionDesc}.`,
              notes: `Teacher membimbing ${nama} langkah demi langkah dalam penataan posisi part dan grouping model 3D. Model sudah siap, dan pembuatan script dimulai minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} memulai langkah awal pada *${lessonTitle}* dengan ${actionDesc}.`,
              notes: `Menghadapi konsep perancangan 3D yang baru, ${nama} teliti menata model dengan bimbingan guru. Struktur arena sudah siap dan tahap scripting dimulai sesi depan.`
            }
          ],
          tired: [
            {
              summary: `Hari ini, ${nama} mulai mengerjakan *${lessonTitle}* di Roblox Studio dan berfokus pada ${actionDesc}.`,
              notes: `Teacher menyesuaikan ritme belajar agar tetap nyaman saat ${nama} merakit model 3D sepulang sekolah. Pembangunan model selesai baik dan script dimulai minggu depan.`
            },
            {
              summary: `Dalam sesi ini, ${nama} mengawali *${lessonTitle}* dengan ${actionDesc}.`,
              notes: `Ritme belajar disesuaikan dengan kondisi stamina ${nama} sepulang sekolah. Pembangunan aset 3D berjalan terarah, dan pembuatan script dilanjutkan minggu depan.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionDesc = (partial && partial.length > 0) ? `berlatih ${formatObjectives(partial, 'id')}` : 'membangun kerangka dasar logika projek';
      const templates = {
        detail: [
          {
            summary: `Hari ini, ${nama} memulai pembelajaran materi *${lessonTitle}*. Pada sesi ini, ${nama} ${actionDesc}.`,
            notes: `Di kelas, ${nama} menyusun kode projeknya secara cermat. Karena projek ini cukup padat dan kaya fitur, sisa pengerjaan akan dilanjutkan di pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi ini, ${nama} mengawali materi *${lessonTitle}* dengan ${actionDesc}.`,
            notes: `Teramati di kelas, ${nama} tekun menyusun blok kode awal. Bersama arahan teacher, fondasi proyek sudah terbangun baik dan akan dilanjutkan minggu depan.`
          }
        ],
        focus: [
          {
            summary: `Hari ini, ${nama} memulai pembelajaran pada materi *${lessonTitle}* dan ${actionDesc}.`,
            notes: `Di kelas, perhatian ${nama} sesekali teralihkan dari lembar koding. Teacher aktif mengarahkan kembali fokus ${nama} agar kodenya tersusun rapi. Sisa projek lanjut minggu depan.`
          },
          {
            summary: `Pada sesi hari ini, ${nama} mulai mempelajari *${lessonTitle}* untuk ${actionDesc}.`,
            notes: `Teramati di kelas, antusiasme ${nama} tinggi namun sesekali fokusnya terbagi. Bimbingan konsisten terus diberikan agar progres kodingnya selesai maksimal.`
          }
        ],
        pace: [
          {
            summary: `Dalam kelas hari ini, ${nama} memulai materi *${lessonTitle}* dengan ${actionDesc}.`,
            notes: `Di kelas, ${nama} tampak ceria dengan tempo santai namun terarah. Teacher mendampingi langkah demi langkah agar target kode tercapai. Sisa projek dilanjutkan pertemuan berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}* untuk ${actionDesc}.`,
            notes: `Suasana belajar menyenangkan membuat ${nama} menikmati sesi ini dengan ritme santai. Teacher terus memandu agar target kode utama selesai terstruktur.`
          }
        ],
        logic: [
          {
            summary: `Pada pertemuan kali ini, ${nama} mempelajari materi baru *${lessonTitle}* untuk ${actionDesc}.`,
            notes: `Di kelas, ${nama} menemui tantangan logika baru. Teacher mendampingi intensif agar konsep dipahami dengan matang. Sisa pengerjaan diselesaikan di sesi berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} memulai langkah awal pada *${lessonTitle}* dengan ${actionDesc}.`,
            notes: `Menghadapi logika baru yang cukup menantang, ${nama} belajar menganalisis alur program dengan seksama. Sisa fitur projek akan dituntaskan pertemuan berikutnya.`
          }
        ],
        tired: [
          {
            summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}* dan fokus pada ${actionDesc}.`,
            notes: `Di kelas, energi ${nama} sedikit menurun setelah aktivitas sekolah. Teacher menyesuaikan tempo agar belajar tetap nyaman. Sisa projek dilanjutkan pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi hari ini, ${nama} memulai materi *${lessonTitle}* dengan ${actionDesc}.`,
            notes: `Karena kondisi fisik yang lelah sepulang sekolah, teacher menyesuaikan ritme agar konsep tetap terserap tanpa tekanan. Langkah awal selesai dengan baik.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'ujian' : 'projek';
      const partial = getPartialObjectives(objectives);

      if (isRobloxCourse(course)) {
        const defaultAction2 = isExam ? 'menulis script Lua dan menguji mekanisme game ujian di Roblox Studio' : 'menulis script Lua dan memprogram mekanisme interaktif di Roblox Studio';
        const actionDesc = (partial && partial.length > 0) ? `melanjutkan ${formatObjectives(partial, 'id')} di Roblox Studio` : defaultAction2;
        const templates = {
          detail: [
            {
              summary: `Dalam sesi lanjutan *${lessonTitle}* ini, ${nama} meneruskan pengerjaan di Roblox Studio. ${nama} ${actionDesc}.`,
              notes: `Di kelas, ${nama} cermat menulis script Lua dan menguji mekanisme interaksi game. Pengujian akhir dan penyempurnaan akan dituntaskan pada pertemuan berikutnya.`
            },
            {
              summary: `Pada pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan pembuatan script projek dengan ${actionDesc}.`,
              notes: `Sebagian besar script interaktif dan event trigger sudah berfungsi. Pengujian menyeluruh dan finalisasi projek akan diselesaikan minggu depan.`
            }
          ],
          focus: [
            {
              summary: `Pada sesi kedua *${lessonTitle}* ini, ${nama} meneruskan penulisan script di Roblox Studio.`,
              notes: `Teacher aktif mendampingi fokus ${nama} saat menyusun kode script. Fungsi-fungsi utama sudah terhubung, dan pengujian akhir dilanjutkan minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* di Roblox Studio untuk ${actionDesc}.`,
              notes: `Dengan bimbingan terarah, ${nama} kembali fokus memprogram interaksi game. Mekanisme script sudah terbentuk, dan tahap akhir diselesaikan sesi berikutnya.`
            }
          ],
          pace: [
            {
              summary: `Dalam kelas hari ini, ${nama} melanjutkan projek *${lessonTitle}* dengan menulis script di Roblox Studio.`,
              notes: `Di kelas, ${nama} menyusun script Lua dengan ritme santai namun terarah. Logika utama game sudah berjalan, dan penyempurnaan tuntas minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} meneruskan *${lessonTitle}* di Roblox Studio untuk ${actionDesc}.`,
              notes: `Teacher memfasilitasi tempo belajar yang menyenangkan saat memprogram script. Mekanisme game sudah aktif dan pengujian tuntas di pertemuan berikutnya.`
            }
          ],
          logic: [
            {
              summary: `Pada sesi kelanjutan *${lessonTitle}* ini, ${nama} mendalami logika script Lua dan ${actionDesc}.`,
              notes: `Teacher mendampingi intensif pemahaman event trigger dan alur script Lua. Mekanisme projek berfungsi baik, dan tahap akhir dituntaskan minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* dengan ${actionDesc}.`,
              notes: `Mempelajari logika script dan pengkondisian bersama guru memperkuat pemahaman pemrograman ${nama}. Sisa pengujian game diselesaikan sesi berikutnya.`
            }
          ],
          tired: [
            {
              summary: `Hari ini, ${nama} meneruskan materi *${lessonTitle}* dengan berfokus pada penulisan script dasar di Roblox Studio.`,
              notes: `Teacher memfasilitasi ritme yang suportif agar penulisan script tetap terserap baik sepulang sekolah. Mekanisme dasar siap dan selesai minggu depan.`
            },
            {
              summary: `Dalam sesi kedua *${lessonTitle}* ini, ${nama} melanjutkan penulisan script game dengan bimbingan guru.`,
              notes: `Ritme belajar disesuaikan dengan energi ${nama} sepulang sekolah. Script interaktif berhasil diprogram dan pengujian final tuntas minggu depan.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionDesc = (partial && partial.length > 0) ? `menyusun kelanjutan ${formatObjectives(partial, 'id')}` : 'mengembangkan logika lanjutan pada projek';
      const templates = {
        detail: [
          {
            summary: `Pada pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan kode projeknya dari minggu lalu. ${nama} ${actionDesc}.`,
            notes: `Di kelas, ${nama} teliti memastikan setiap animasi dan respon program berjalan selaras. Tahap finalisasi dan pengujian akhir akan dituntaskan pada pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi lanjutan *${lessonTitle}* hari ini, ${nama} meneruskan pengembangan projeknya. ${nama} ${actionDesc}.`,
            notes: `Sebagian besar kode utama telah terbangun rapi. Mengingat detail projek yang cukup padat, tahap pengujian akhir akan dituntaskan pada pertemuan berikutnya.`
          }
        ],
        focus: [
          {
            summary: `Dalam sesi lanjutan materi *${lessonTitle}* ini, ${nama} meneruskan pengerjaan kode projeknya. ${nama} ${actionDesc}.`,
            notes: `Teacher terus mendampingi dan mengingatkan ${nama} menjaga fokus pada layar koding. Fitur penting sudah terpasang dan sisa projek dituntaskan di pertemuan berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} masuk ke pertemuan kedua untuk materi *${lessonTitle}*. ${nama} berhasil ${actionDesc}.`,
            notes: `Teacher terus memusatkan perhatian ${nama} agar konsisten menyelesaikan alur kode hingga tuntas tanpa terdistraksi. Tahap akhir diselesaikan minggu depan.`
          }
        ],
        pace: [
          {
            summary: `Di pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan pengembangan projeknya. ${nama} telah ${actionDesc}.`,
            notes: `Di kelas, ${nama} bekerja dengan ritme santai namun stabil. Sebagian besar projek telah terbangun dan tahap penuntasan siap diselesaikan pada pertemuan berikutnya.`
          },
          {
            summary: `Pada sesi ini, ${nama} meneruskan proyek *${lessonTitle}* dari minggu lalu dan ${actionDesc}.`,
            notes: `Teacher aktif mengarahkan alur kerja agar waktu kelas termanfaatkan efektif. Projek sudah mendekati tahap akhir dan tuntas di sesi berikutnya.`
          }
        ],
        logic: [
          {
            summary: `Pada sesi lanjutan materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan algoritma projeknya. ${nama} ${actionDesc}.`,
            notes: `${nama} mulai memahami logika bertingkat dengan bimbingan guru dan berhasil memperbaiki error. Seluruh fitur akhir siap diselesaikan di pertemuan selanjutnya.`
          },
          {
            summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* pada tahap logika lanjutan bersama teacher. ${nama} ${actionDesc}.`,
            notes: `Melalui pemecahan masalah langsung di kelas, pemahaman konseptual ${nama} berkembang jauh lebih matang. Tahap akhir akan diselesaikan minggu depan.`
          }
        ],
        tired: [
          {
            summary: `Hari ini, ${nama} meneruskan proyek materi *${lessonTitle}* yang sedang berjalan. ${nama} ${actionDesc}.`,
            notes: `Walaupun energi ${nama} terbatas sepulang sekolah, ${nama} tetap berkomitmen menyusun kode penting projeknya. Tahap akhir dijadwalkan pada pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi kedua *${lessonTitle}* ini, ${nama} melanjutkan bagian tengah projek dengan bimbingan guru.`,
            notes: `Teacher memfasilitasi ritme belajar yang suportif agar materi tetap terserap baik. Kerangka projek hampir tuntas dan selesai minggu depan.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0, course = '') => {
      // Alias backward compatibility
      return LANG_UI.id.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed, course);
    },
    oneAndHalfText: (nama, l1Num, l1Title, action1, l2Num, l2Title, obj2, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `Pada pertemuan hari ini, ${nama} menyelesaikan pembelajaran *${l1Title}* sekaligus memulai materi berikutnya di Roblox Studio. ${nama} ${ensurePeriod(action1)}`,
            notes: `Di kelas, ${nama} menyelesaikan model 3D dan script dengan cepat dan teliti, lalu memanfaatkan sisa waktu untuk mulai merancang projek Roblox berikutnya.`
          },
          {
            summary: `Dalam sesi ini, ${nama} menuntaskan seluruh materi *${l1Title}* di Roblox Studio, lalu langsung mengawali projek *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
            notes: `Teramati di kelas, ${nama} sangat antusias dan mampu menangkap instruksi baru dengan cepat saat memulai rancangan model 3D *${l2Title}*. Performa luar biasa!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan *${l1Title}* lebih cepat dan lanjut ke *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} bekerja mandiri dan cepat menyesuaikan diri dengan materi baru. Di pertemuan selanjutnya, ${nama} akan menyelesaikan *${l2Title}*. Well done ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} selesai *${l1Title}* dan sudah mulai *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} antusias dan cepat memahami instruksi baru. Di pertemuan berikutnya, ${nama} akan lanjut menyelesaikan *${l2Title}*. Nice work ${nama}!`
        },
        {
          summary: `Pada pertemuan hari ini, ${nama} menyelesaikan *${l1Title}* dan sudah mulai *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} bekerja cepat dan teliti. Minggu depan, ${nama} akan melanjutkan *${l2Title}*. Mantap ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} menyelesaikan *${l1Title}* dan mulai mengerjakan *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} bekerja mandiri dan cepat menyesuaikan diri dengan materi baru. Di pertemuan selanjutnya, ${nama} akan menyelesaikan *${l2Title}*. Good progress ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    doubleText: (nama, l1Num, l1Title, action1, l2Num, l2Title, action2, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `${nama} menyelesaikan 2 materi Roblox sekaligus pada pertemuan hari ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `Di kelas, ${nama} sangat produktif dan cekatan, membangun arena 3D serta memprogram script Lua pada kedua materi dengan rapi dan mandiri!`
          },
          {
            summary: `${nama} mencapai pencapaian luar biasa dengan menuntaskan 2 lesson Roblox hari ini (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `Teramati di kelas, ${nama} memiliki ketelitian tinggi dalam membangun model dan menguji script secara mandiri pada kedua projek tersebut.`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan 2 materi sekaligus (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} cepat memahami instruksi dan menyelesaikan challenge dengan runtut. ${nama} sudah siap untuk mempelajari logika berpikir yang lebih kompleks. Good progress ${nama}!`
        },
        {
          summary: `Di pertemuan hari ini, ${nama} berhasil menyelesaikan 2 materi (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} teliti dan bisa _debugging_ sendiri di kedua _project_. ${nama} sudah siap untuk belajar topik baru. Terus pertahankan ${nama}!`
        },
        {
          summary: `Di kelas hari ini, ${nama} menyelesaikan 2 lesson (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} fokus dan mengerjakan kedua _project_ dengan rapi. ${nama} sudah siap lanjut ke next lesson. Bagus ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} berhasil menyelesaikan 2 lesson (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} cepat memahami instruksi dan menyelesaikan challenge dengan runtut. ${nama} sudah siap untuk mempelajari materi selanjutnya. Good job ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
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
      if (isRobloxCourse(course)) {
        if (!objectives || objectives.length === 0) return `built 3D models and created scripts in *Lesson ${lessonNum}* for the ${course} course.`;
        return `practiced how to ${formatObjectives(objectives, 'en')}.`;
      }
      if (!objectives || objectives.length === 0) return `completed all steps in *Lesson ${lessonNum}* for the ${course} course.`;
      return `practiced how to ${formatObjectives(objectives, 'en')}.`;
    },
    doneText: (nama, lessonTitle, action, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `In today's session, ${nama} successfully completed *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} built 3D models skillfully and wrote Lua scripts independently with minimal guidance. Great creativity and technical execution!`
          },
          {
            summary: `In this session, ${nama} finished building and scripting the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Throughout class, ${nama} showed great precision in designing 3D assets and scripting interactive mechanics in Roblox Studio. Excellent work!`
          },
          {
            summary: `During today's class, ${nama} achieved all learning objectives for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} demonstrated strong dedication, carefully assembling 3D structures and verifying that all Lua scripts ran smoothly without bugs!`
          },
          {
            summary: `Today, ${nama} completed all instructions in *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} showed great persistence in Roblox Studio, designing 3D models and coding interactive scripts methodically. Well done!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `In class today, ${nama} completed all the goals of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} stayed focused and wrote the code with little help. ${nama} added creative ideas to the project. ${nama} is ready to learn the next topic. Good work, ${nama}!`
        },
        {
          summary: `Today, ${nama} completed *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} added creative ideas to the project. ${nama} followed every step and did not give up. ${nama} is ready for the next lesson. Good progress, ${nama}!`
        },
        {
          summary: `In this class, ${nama} finished *${lessonTitle}* with good results. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} followed every step and did not give up. ${nama} checked the project until everything worked. ${nama} is ready to learn a new topic. Keep learning, ${nama}!`
        },
        {
          summary: `In today's lesson, ${nama} reached all the goals of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} checked the project until everything worked. ${nama} is ready for more difficult lessons. Proud of you, ${nama}!`
        },
        {
          summary: `In today's session, ${nama} successfully finished *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} understood the instructions quickly and worked without help. ${nama} is ready to learn the next topic. Good job, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished *${lessonTitle}* well. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} was careful and fixed the errors in the code without help. ${nama} asked good questions about how the code works. ${nama} is ready for the next lesson. Keep it up, ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    continuedDoneText: (nama, lessonTitle, action, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `In today's session, ${nama} continued and successfully finalized the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} seamlessly connected 3D models with Lua scripts, finalizing all game mechanics and testing gameplay thoroughly. Outstanding result!`
          },
          {
            summary: `In this class, ${nama} concluded the ongoing project in *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} demonstrated great perseverance across sessions, perfecting 3D assets and debugging interactive scripts until the game ran flawlessly!`
          },
          {
            summary: `During today's lesson, ${nama} accomplished the final stage of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} diligently reviewed all 3D components and Lua scripts, verifying that every mechanism responded accurately without glitches!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `In this session, ${nama} finished the rest of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} fixed the remaining bugs without help. ${nama} connected last week's code with the new features. ${nama} is ready for the next lesson. Proud of you, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished all the remaining parts of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} connected last week's code with the new features. ${nama} quickly remembered last week's project and finished it. ${nama} is ready to learn a new topic. Good job, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished the project in *${lessonTitle}* that started last week. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} quickly remembered last week's project and finished it. ${nama} is ready for more difficult lessons. Keep it up, ${nama}!`
        },
        {
          summary: `In today's lesson, ${nama} finished the last part of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} checked the code again until there were no errors. ${nama} fixed the remaining bugs without help. ${nama} is ready to learn the next topic. Well done, ${nama}!`
        },
        {
          summary: `Today, ${nama} continued *${lessonTitle}* and finished it. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} fixed the remaining bugs without help. ${nama} connected last week's code with the new features. ${nama} is ready for the next lesson. Nice work, ${nama}!`
        },
        {
          summary: `In this session, ${nama} finished the rest of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} connected last week's code with the new features. ${nama} quickly remembered last week's project and finished it. ${nama} is ready to learn a new topic. Good work, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished all the remaining parts of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} quickly remembered last week's project and finished it. ${nama} is ready for more difficult lessons. Good progress, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished the project in *${lessonTitle}* that started last week. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} checked the code again until there were no errors. ${nama} fixed the remaining bugs without help. ${nama} is ready to learn the next topic. Keep learning, ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'exam' : 'project';
      const partial = getPartialObjectives(objectives);

      if (isRobloxCourse(course)) {
        const defaultAction = isExam ? 'reviewed materials and began 3D modeling for the exam in Roblox Studio' : 'focused on building 3D models and designing the environment in Roblox Studio';
        const actionDesc = (partial && partial.length > 0) ? `practiced how to ${formatObjectives(partial, 'en')} in Roblox Studio` : defaultAction;
        const templates = {
          detail: [
            {
              summary: `Today, ${nama} began working on *${lessonTitle}*. In this session, ${nama} ${actionDesc}.`,
              notes: `In class, ${nama} built the models carefully with close attention to detail. As the project is in the building stage, the ${targetType} continues next week and ${nama} will start scripting after that.`
            },
            {
              summary: `In this session, ${nama} started *${lessonTitle}* in Roblox Studio and ${actionDesc}.`,
              notes: `In class, ${nama} constructed 3D assets with great precision. As the project is in the building stage, the ${targetType} continues next week and scripting will begin after that.`
            }
          ],
          focus: [
            {
              summary: `Today, ${nama} started *${lessonTitle}* in Roblox Studio and ${actionDesc}.`,
              notes: `In class, ${nama} was excited to build 3D models, with the teacher actively directing focus to the workspace. The building stage went well, and scripting starts next week.`
            },
            {
              summary: `During today's class, ${nama} began *${lessonTitle}* and ${actionDesc}.`,
              notes: `The teacher kept ${nama} engaged on 3D asset building tasks. The models are well-aligned, and ${nama} will continue the ${targetType} and start scripting next session.`
            }
          ],
          pace: [
            {
              summary: `In today's session, ${nama} began *${lessonTitle}* and ${actionDesc}.`,
              notes: `In class, ${nama} designed 3D models at a relaxed and steady rhythm. The building stage is progressing well, and ${nama} will start scripting next week.`
            },
            {
              summary: `Today, ${nama} initiated *${lessonTitle}* in Roblox Studio and ${actionDesc}.`,
              notes: `With calm and steady guidance, ${nama} assembled 3D models smoothly. The ${targetType} remains in the building stage, and scripting will resume next class.`
            }
          ],
          logic: [
            {
              summary: `During today's class, ${nama} began *${lessonTitle}* in Roblox Studio and ${actionDesc}.`,
              notes: `The teacher guided ${nama} step-by-step on 3D spatial alignment and model grouping. The structure is established, and scripting will begin next class.`
            },
            {
              summary: `Today, ${nama} started *${lessonTitle}* and focused on ${actionDesc}.`,
              notes: `Facing new 3D design challenges, ${nama} learned to arrange models with teacher assistance. Building is underway, and scripting starts next week.`
            }
          ],
          tired: [
            {
              summary: `Today, ${nama} began *${lessonTitle}* in Roblox Studio and focused on ${actionDesc}.`,
              notes: `The learning pace was comfortably adapted while ${nama} assembled 3D models after school. Building is well on track, and scripting starts next week.`
            },
            {
              summary: `In this session, ${nama} started *${lessonTitle}* and ${actionDesc}.`,
              notes: `To manage after-school fatigue, teacher paced 3D modeling gently so ${nama} stayed engaged. Building went well, and scripting begins next meeting.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionDesc = (partial && partial.length > 0) ? `practiced how to ${formatObjectives(partial, 'en')}` : 'built foundational project algorithms';
      const templates = {
        detail: [
          {
            summary: `Today, ${nama} began working on *${lessonTitle}*. In this session, ${nama} ${actionDesc}.`,
            notes: `In class, ${nama} assembled code carefully with close attention to detail. Due to rich project features, remaining parts continue next week.`
          },
          {
            summary: `In this session, ${nama} started *${lessonTitle}* and ${actionDesc}.`,
            notes: `With teacher guidance, a solid initial project framework is in place. Code development will resume next week.`
          }
        ],
        focus: [
          {
            summary: `Today, ${nama} started learning *${lessonTitle}* and ${actionDesc}.`,
            notes: `In class, ${nama} had strong curiosity, though attention occasionally shifted to other apps. Guided by teacher, code progress continues next week.`
          },
          {
            summary: `During today's class, ${nama} initiated *${lessonTitle}* and ${actionDesc}.`,
            notes: `The teacher consistently guided ${nama} back to workspace tasks. Initial code is set and remaining features continue next session.`
          }
        ],
        pace: [
          {
            summary: `In today's session, ${nama} began *${lessonTitle}* and ${actionDesc}.`,
            notes: `In class, ${nama} was cheerful and maintained a relaxed yet steady work rhythm. The teacher provided clear guidance and steps resume next week.`
          },
          {
            summary: `Today, ${nama} started *${lessonTitle}* and ${actionDesc}.`,
            notes: `The teacher provided clear direction so essential project goals were met sequentially. Final steps continue next session.`
          }
        ],
        logic: [
          {
            summary: `During today's class, ${nama} explored the new topic *${lessonTitle}* and ${actionDesc}.`,
            notes: `The teacher provided intensive guidance to ensure ${nama} truly understood new coding logic before moving forward. Progress continues next class.`
          },
          {
            summary: `Today, ${nama} commenced *${lessonTitle}* and ${actionDesc}.`,
            notes: `Facing novel algorithmic challenges, ${nama} learned to analyze code logic with close assistance. Remaining steps resume next session.`
          }
        ],
        tired: [
          {
            summary: `Today, ${nama} commenced work on *${lessonTitle}* and focused on ${actionDesc}.`,
            notes: `The learning pace was comfortably adapted so ${nama} absorbed concepts without rushing. Rest of project resumes next meeting.`
          },
          {
            summary: `In this session, ${nama} started *${lessonTitle}* and ${actionDesc}.`,
            notes: `Due to fatigue after school, teacher adjusted pace so ${nama} could absorb concepts comfortably. Resuming next week!`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'exam' : 'project';
      const partial = getPartialObjectives(objectives);

      if (isRobloxCourse(course)) {
        const defaultAction2 = isExam ? 'wrote Lua scripts and tested exam game mechanics in Roblox Studio' : 'wrote Lua scripts and programmed interactive game mechanics in Roblox Studio';
        const actionDesc = (partial && partial.length > 0) ? `continued working on ${formatObjectives(partial, 'en')} in Roblox Studio` : defaultAction2;
        const templates = {
          detail: [
            {
              summary: `In this second session for *${lessonTitle}*, ${nama} continued developing the project in Roblox Studio. ${nama} ${actionDesc}.`,
              notes: `In class, ${nama} focused on writing Lua scripts carefully and testing game mechanics. Final script polish and gameplay verification will wrap up next class.`
            },
            {
              summary: `In this follow-up session for *${lessonTitle}*, ${nama} progressed with Lua scripting and ${actionDesc}.`,
              notes: `Most interactive scripts and event triggers are now in place. Final testing and project completion will wrap up in the next class.`
            }
          ],
          focus: [
            {
              summary: `In this follow-up session on *${lessonTitle}*, ${nama} continued writing Lua scripts in Roblox Studio.`,
              notes: `The teacher actively guided ${nama}'s focus during script creation. Key functions and event connections are running, with final testing next week.`
            },
            {
              summary: `Today, ${nama} resumed *${lessonTitle}* in Roblox Studio and ${actionDesc}.`,
              notes: `With teacher encouragement, ${nama} stayed on track while scripting game events. Interactive mechanics are set, and final testing wraps up next session.`
            }
          ],
          pace: [
            {
              summary: `In this follow-up class for *${lessonTitle}*, ${nama} continued scripting game interactions in Roblox Studio.`,
              notes: `In class, ${nama} enjoyed scripting at a steady, enjoyable rhythm. Core Lua mechanics are functioning, and final polish will finish next week.`
            },
            {
              summary: `Today, ${nama} proceeded with *${lessonTitle}* and ${actionDesc}.`,
              notes: `The teacher supported ${nama} in writing scripts steadily without pressure. The main gameplay scripts are in place, resuming next session.`
            }
          ],
          logic: [
            {
              summary: `During this continuation session for *${lessonTitle}*, ${nama} tackled advanced Lua scripts and ${actionDesc}.`,
              notes: `The teacher provided step-by-step guidance on script conditions and event triggers. Mechanics are working well, and final testing wraps up next class.`
            },
            {
              summary: `Today, ${nama} continued *${lessonTitle}* in Roblox Studio, working through ${actionDesc}.`,
              notes: `Analyzing Lua syntax and event connections with teacher guidance helped ${nama} grasp script logic thoroughly. Final details wrap up next week.`
            }
          ],
          tired: [
            {
              summary: `In this session, ${nama} continued *${lessonTitle}* and focused on essential Lua scripting in Roblox Studio.`,
              notes: `The teacher adjusted the pace to keep ${nama} comfortable while coding scripts after school. Core scripts are active, and final testing completes next meeting.`
            },
            {
              summary: `Today, ${nama} resumed *${lessonTitle}* and ${actionDesc}.`,
              notes: `Teacher paced the scripting session gently to maintain good understanding. The interactive code is running smoothly, wrapping up next week.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionDesc = (partial && partial.length > 0) ? `continued working on ${formatObjectives(partial, 'en')}` : 'developed advanced project logic';
      const templates = {
        detail: [
          {
            summary: `In this second session for *${lessonTitle}*, ${nama} continued developing the project code from last week. ${nama} ${actionDesc}.`,
            notes: `In class, ${nama} meticulously verified that all interactions responded accurately. Final testing and polish will wrap up next class.`
          },
          {
            summary: `In this follow-up session for *${lessonTitle}*, ${nama} progressed with project development and ${actionDesc}.`,
            notes: `Most core mechanisms are now in place, and final testing and completion will wrap up in the next class.`
          }
        ],
        focus: [
          {
            summary: `In this follow-up session on *${lessonTitle}*, ${nama} continued developing the project code. ${nama} completed key functions.`,
            notes: `The teacher actively kept attention directed at workspace whenever curiosity drifted. Key features are in place and finish next week.`
          },
          {
            summary: `Today, ${nama} entered the second meeting for *${lessonTitle}* and worked on ${actionDesc}.`,
            notes: `The teacher kept ${nama} on track to complete algorithms without getting sidetracked. Final completion is set for next week.`
          }
        ],
        pace: [
          {
            summary: `In this second meeting for *${lessonTitle}*, ${nama} continued building the project with ${actionDesc}.`,
            notes: `In class, ${nama} worked at a steady, enjoyable pace. Most core mechanisms are now in place, and completion is set for next meeting.`
          },
          {
            summary: `In this session, ${nama} resumed the project for *${lessonTitle}* and worked on ${actionDesc}.`,
            notes: `The teacher helped channel class time effectively to finish leftover logic. Project will be finalized in the upcoming meeting.`
          }
        ],
        logic: [
          {
            summary: `During this second session for *${lessonTitle}*, ${nama} continued assembling project algorithms with teacher guidance.`,
            notes: `${nama} began grasping multi-step logic with teacher support and resolved earlier hurdles. Final features wrap up in our next class.`
          },
          {
            summary: `Today, ${nama} advanced further into *${lessonTitle}*, tackling deeper logical requirements.`,
            notes: `Hands-on debugging deepened ${nama}'s algorithmic reasoning. The project will be finalized in the next session.`
          }
        ],
        tired: [
          {
            summary: `Today, ${nama} continued working on the ongoing project for *${lessonTitle}* and completed core functions.`,
            notes: `Although energy was limited after school, ${nama} remained committed to building key project scripts. Final wrap-up scheduled next week.`
          },
          {
            summary: `In this second session for *${lessonTitle}*, ${nama} worked through the middle phase of the project.`,
            notes: `The teacher facilitated a supportive rhythm to ensure strong conceptual grasp. Completion scheduled next week.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0, course = '') => {
      // Alias backward compatibility
      return LANG_UI.en.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed, course);
    },
    oneAndHalfText: (nama, l1Num, l1Title, action1, l2Num, l2Title, obj2, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `In today's session, ${nama} completed *${l1Title}* and immediately initiated the next topic in Roblox Studio. ${nama} ${ensurePeriod(action1)}`,
            notes: `In class, ${nama} completed 3D models and scripts with great speed and accuracy, using remaining time to start designing the next Roblox project layout.`
          },
          {
            summary: `In this session, ${nama} completed *${l1Title}* independently and immediately initiated the next project *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
            notes: `In class, ${nama} showed high enthusiasm and picked up new concepts rapidly, completing initial 3D models for *${l2Title}* with ease.`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `In class today, ${nama} finished *${l1Title}* early and then started *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} worked fast and carefully. ${nama} stayed focused and learned the new ideas quickly. Next week, ${nama} will continue *${l2Title}*. Well done, ${nama}!`
        },
        {
          summary: `In today's session, ${nama} finished *${l1Title}* and began *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} stayed focused and learned the new ideas quickly. Next time, ${nama} will continue with *${l2Title}*. Nice work, ${nama}!`
        },
        {
          summary: `In this class, ${nama} completed *${l1Title}* and started *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} worked without help and adapted quickly to the new lesson. In the next meeting, ${nama} will finish *${l2Title}*. Good work, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished *${l1Title}* and started *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} worked fast and carefully. ${nama} stayed focused and learned the new ideas quickly. Next week, ${nama} will continue *${l2Title}*. Good progress, ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    doubleText: (nama, l1Num, l1Title, action1, l2Num, l2Title, action2, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `${nama} completed 2 full Roblox lessons during today's class (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `In class, ${nama} showed exceptional productivity, building 3D environments and programming Lua scripts across both lessons smoothly without missing a detail!`
          },
          {
            summary: `${nama} achieved an exceptional milestone by finishing 2 full Roblox lessons today (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `In class, ${nama} demonstrated great skill in both 3D model construction and Lua scripting, finishing all interactive challenges with minimal guidance!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `In today's session, ${nama} completed 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} understood the instructions quickly and solved the challenges. ${nama} is ready to learn a new topic. Good progress, ${nama}!`
        },
        {
          summary: `In class today, ${nama} finished 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} was careful and fixed errors in both projects without help. ${nama} is ready for more difficult lessons. Keep learning, ${nama}!`
        },
        {
          summary: `In this meeting, ${nama} finished 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} stayed focused and finished both projects neatly. ${nama} is ready to learn the next topic. Proud of you, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} understood the instructions quickly and solved the challenges. ${nama} is ready for the next lesson. Good job, ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
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

  let result = null;
  if (s.status === 'done') {
    result = L.doneText(s.nama, l1Title, action1, idx, s.lesson, s.course);
  } else if (s.status === 'continued_done') {
    result = L.continuedDoneText(s.nama, l1Title, action1, idx, s.lesson, s.course);
  } else if (s.status === 'in_progress_1' || s.status === 'in_progress') {
    result = (L.inProgress1Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson, s.course);
  } else if (s.status === 'in_progress_2') {
    result = (L.inProgress2Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson, s.course);
  } else if (s.status === 'one_and_half') {
    result = L.oneAndHalfText(s.nama, s.lesson, l1Title, action1, s.lesson2, l2Title, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : [], idx, s.lesson, s.course);
  } else if (s.status === 'double') {
    const raw2 = (templateMap[s.course] && templateMap[s.course][s.lesson2])
      ? templateMap[s.course][s.lesson2]
      : '';
    const action2 = raw2
      ? extractAction(raw2, s.nama, sLang)
      : L.fallbackProgress(s.nama, s.lesson2, localizedCourse, l2Obj ? (sLang === 'en' && l2Obj.objectives_en ? l2Obj.objectives_en : (sLang === 'en' ? [] : l2Obj.objectives)) : []);
    result = L.doubleText(s.nama, s.lesson, l1Title, action1, s.lesson2, l2Title, action2, idx, s.lesson, s.course);
  }

  let summaryText = '';
  let notesText = '';
  let fullText = '';

  if (result && typeof result === 'object' && result.summary !== undefined) {
    summaryText = result.summary || '';
    notesText = result.notes || '';
    fullText = result.text || (summaryText && notesText ? `${summaryText}\n\n${notesText}` : (summaryText || notesText));
  } else {
    fullText = String(result || '');
    summaryText = fullText;
    notesText = '';
  }

  s.summary = summaryText;
  s.notes = notesText;
  s.progress = fullText;

  const sumEl = document.getElementById(`auto-summary-${idx}`);
  if (sumEl) sumEl.value = summaryText;
  const noteEl = document.getElementById(`auto-notes-${idx}`);
  if (noteEl) noteEl.value = notesText;
  updateNotesCounter(idx);

  autoUpdateTable();
  toast(L.toastGenerated, 'success');
}

function updateNotesCounter(idx) {
  const el = document.getElementById(`auto-notes-${idx}`);
  const counter = document.getElementById(`auto-notes-counter-${idx}`);
  if (!counter) return;
  const len = el ? el.value.length : 0;
  counter.textContent = `${len} / 200`;
  if (len > 200) {
    counter.className = 'cms-char-counter over';
    counter.title = 'Peringatan: Melebihi batas 200 karakter CMS';
  } else if (len >= 100) {
    counter.className = 'cms-char-counter optimal';
    counter.title = 'Panjang optimal untuk CMS (100-200 karakter)';
  } else {
    counter.className = 'cms-char-counter';
    counter.title = 'Batas maksimal 200 karakter CMS';
  }
}

function onStudentFieldInput(idx, field, val) {
  if (!autoStudents[idx]) return;
  autoStudents[idx][field] = val;
  const s = autoStudents[idx];
  const cleanSummary = (s.summary || '').trim();
  const cleanNotes = (s.notes || '').trim();
  s.progress = cleanSummary && cleanNotes ? `${cleanSummary}\n\n${cleanNotes}` : (cleanSummary || cleanNotes);
  if (field === 'notes') {
    updateNotesCounter(idx);
  }
  autoUpdateTable();
}

async function copyStudentField(idx, field) {
  if (!autoStudents[idx]) return;
  const s = autoStudents[idx];
  const isSummary = field === 'summary';
  const text = isSummary ? (s.summary || '') : (s.notes || '');
  const label = isSummary 
    ? (autoLang === 'id' ? 'Meeting Summary' : 'Meeting Summary')
    : (autoLang === 'id' ? 'Teacher Notes' : 'Teacher Notes');

  if (!text || !text.trim()) {
    toast(autoLang === 'id' ? `${label} masih kosong! Klik Generate terlebih dahulu.` : `${label} is empty! Please click Generate first.`, 'error');
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast(autoLang === 'id' ? `✓ ${label} berhasil disalin ke clipboard!` : `✓ ${label} copied to clipboard!`, 'success');
  } catch (err) {
    toast('Gagal menyalin: ' + err.message, 'error');
  }
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
  const sumEl = document.getElementById(`auto-summary-${idx}`);
  if(sumEl) autoStudents[idx].summary = sumEl.value;
  const noteEl = document.getElementById(`auto-notes-${idx}`);
  if(noteEl) autoStudents[idx].notes = noteEl.value;

  const cleanSummary = (autoStudents[idx].summary || '').trim();
  const cleanNotes = (autoStudents[idx].notes || '').trim();
  if (cleanSummary || cleanNotes) {
    autoStudents[idx].progress = cleanSummary && cleanNotes ? `${cleanSummary}\n\n${cleanNotes}` : (cleanSummary || cleanNotes);
  }
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

    // Partition s.progress into summary and notes if not partitioned yet
    if (!s.summary && !s.notes && s.progress) {
      const parts = s.progress.split(/\n\n+/);
      if (parts.length >= 2) {
        s.summary = parts[0].trim();
        s.notes = parts.slice(1).join('\n\n').trim();
      } else {
        s.summary = s.progress.trim();
        s.notes = '';
      }
    }

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

      <!-- CMS Split Output: Meeting Summary & Teacher Notes -->
      <div class="cms-split-container">
        <!-- Box 1: Meeting Summary -->
        <div class="cms-box cms-box-summary">
          <div class="cms-box-header">
            <div class="cms-box-title">
              <span class="cms-box-icon">📋</span>
              <span class="cms-box-label">Meeting Summary</span>
              <span class="cms-box-subtitle">${sLang === 'id' ? '(Materi & Projek)' : '(Lesson & Project)'}</span>
            </div>
            <button type="button" class="btn-copy-mini" onclick="copyStudentField(${i},'summary')" title="${sLang === 'id' ? 'Salin Meeting Summary' : 'Copy Meeting Summary'}">
              <span>📋</span> <span>${sLang === 'id' ? 'Copy Summary' : 'Copy Summary'}</span>
            </button>
          </div>
          <textarea id="auto-summary-${i}" class="cms-textarea" placeholder="${sLang === 'id' ? 'Ringkasan materi & capaian projek...' : 'Lesson summary & project objectives...'}" oninput="onStudentFieldInput(${i},'summary',this.value)">${escHtml(s.summary || '')}</textarea>
        </div>

        <!-- Box 2: Teacher Notes (Target max 200 chars for Timedoor CMS) -->
        <div class="cms-box cms-box-notes">
          <div class="cms-box-header">
            <div class="cms-box-title">
              <span class="cms-box-icon">📝</span>
              <span class="cms-box-label">Teacher Notes</span>
              <span class="cms-box-subtitle">${sLang === 'id' ? '(Observasi Siswa)' : '(Class Observation)'}</span>
            </div>
            <div class="cms-box-actions">
              <span class="cms-char-counter" id="auto-notes-counter-${i}">0 / 200</span>
              <button type="button" class="btn-copy-mini" onclick="copyStudentField(${i},'notes')" title="${sLang === 'id' ? 'Salin Teacher Notes ke CMS' : 'Copy Teacher Notes to CMS'}">
                <span>📋</span> <span>${sLang === 'id' ? 'Copy Notes' : 'Copy Notes'}</span>
              </button>
            </div>
          </div>
          <textarea id="auto-notes-${i}" class="cms-textarea" placeholder="${sLang === 'id' ? 'Catatan observasi guru di kelas (maks 200 karakter)...' : 'Teacher observation notes in class (max 200 chars)...'}" oninput="onStudentFieldInput(${i},'notes',this.value)">${escHtml(s.notes || '')}</textarea>
        </div>
      </div>`;
    c.appendChild(div);
    
    populateCourseDropdown(i);
    populateLessonDropdown(i);
    ['criteria', 'course', 'status', 'context', 'lesson', 'lesson2'].forEach(field => {
      setupCustomSelect(document.getElementById(`auto-${field}-${i}`));
    });
    updateNotesCounter(i);
  });
  autoUpdateTable();
}

function addAutoStudent(){
  autoStudents.forEach((_, idx) => syncStudentFromDOM(idx));
  autoStudents.push({nama:'',summary:'',notes:'',progress:'',criteria:'',course:'',lesson:'',lesson2:'',status:'done',context:'detail',lang:autoLang});
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
      if (s.status === 'done' || s.status === 'continued_done' || s.status === 'double') {
        statusText = autoLang === 'en' ? '(Completed)' : '(Selesai)';
      } else if (s.status === 'in_progress_1' || s.status === 'in_progress_2' || s.status === 'in_progress') {
        statusText = autoLang === 'en' ? '(In Progress)' : '(Belum Selesai)';
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
    {nama:'Student One',summary:'',notes:'',progress:'',criteria:'Pro',course:'Basic Website',lesson:'12',status:'done',lang:'en'},
    {nama:'Student Two',summary:'',notes:'',progress:'',criteria:'Kids',course:'Game Developer',lesson:'18',lesson2:'19',status:'double',lang:'en'}
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