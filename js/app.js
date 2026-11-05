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

function getPronouns(lang = 'en', gender = 'm') {
  const isFemale = gender === 'f';
  if (lang === 'id') {
    return { subj: 'ia', Subj: 'Ia', obj: 'ia', poss: 'nya', Poss: 'Ia' };
  }
  return isFemale
    ? { subj: 'she', Subj: 'She', obj: 'her', poss: 'her', Poss: 'Her', refl: 'herself' }
    : { subj: 'he', Subj: 'He', obj: 'him', poss: 'his', Poss: 'His', refl: 'himself' };
}

function inferGenderFromName(name) {
  if (!name || !name.trim()) return 'm';
  const first = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  if (!first) return 'm';
  const knownMale = new Set(['cedric','kevin','budi','rafi','arjuna','kenzo','darren','nathan','muhammad','mohammad','ahmad','reza','aditya','bima','daffa','fajar','rizky','rizki','joshua','jason','justin','brandon','ryan','rayhan','raihan','farhan','bagas','dimas','galih','gilang','satria','arya','aryo','diego','ezra','evan','ethan','lucas','lukas','liam','noah','oliver','william','james','benjamin','henry','alexander','michael','daniel','matthew','david','joseph','samuel','sebastian','jack','owen','gabriel','carter','jayden','luke','isaac','anthony','dylan','leo','lincoln','jaxon','asher','christopher','josiah','andrew','thomas','josh','christian','hunter','eli','jonathan','connor','landon','adrian','cameron','nolan','easton','jeremiah','robert','nicholas','austin','ian','adam','elijah','aaron','charles','caleb','cooper','gavin','chase','myles','tyler','zachary','xavier','declan','kyle','marco','dante','hugo','leon','max','theo','felix','oscar','arthur','louis','timothy','vincent','victor','kenneth','steven','stephen','edward','brian','ronald','tim','eric','erik','patrick','sean','shane','marcus','mark','paul','peter','philip','george','frank','scott','gregory','raymond','jerry','dennis','walter','harold','carl','douglas','roger','gerald','joe','albert','lawrence','willie','roy','ralph','eugene','russell','bobby','harry','logan','mason','jacob','jackson','aiden','elias','miles','devon','rafael','alvaro','arkan','azka','azzam','dzaki','zaki','farel','farrel','hafiz','haikal','ilham','irfan','iqbal','luthfi','naufal','pandu','raditya','rakha','rasya','rendi','reyhan','ridho','rifqi','salman','syafiq','taufik','wahyu','yusuf','zaidan','zidan']);
  if (knownMale.has(first)) return 'm';
  const knownFemale = new Set(['putri','sarah','sara','alya','chloe','kayla','nabila','siti','aisyah','michelle','jessica','alicia','amanda','amelia','anisa','annisa','aura','aurel','aurelia','azzahra','zahra','bella','bianca','bilqis','cahaya','callista','cantika','carissa','chelsea','cinta','citra','clara','clarissa','cynthia','dea','della','dewi','diana','dinda','diva','elena','elisa','elizabeth','elsa','emily','emma','eva','evelyn','fanny','farah','fatimah','febri','felicia','fiona','fitri','freya','gabriella','gita','grace','hana','hanna','hannah','hasna','helen','helena','indah','intan','irene','isabella','jasmine','jennifer','karen','karina','kartika','keisya','keysha','khansa','kirana','laura','leila','lidia','linda','lisa','luna','lydia','maria','marsha','maya','meisya','melati','melissa','mutiara','nadia','nadine','nadya','naomi','natasha','nathania','nayla','nisa','novia','nur','nurul','olivia','patricia','priscilla','queen','queenza','rachel','rahma','raisya','rani','rania','ratna','rebecca','regina','renata','ria','rina','risa','rosa','sabrina','safa','salma','salwa','samantha','sandra','saskia','shafa','shania','shannon','sheila','sherina','sheryl','silvia','sofia','sonia','sophia','sophie','stephanie','suci','syifa','talitha','tamara','tania','tara','tasya','tiara','tiffany','ulfa','valerie','vanessa','vania','vera','veronica','victoria','vina','vio','violet','vivi','vivian','wanda','widya','winda','yasmin','yasmine','yulia','yuni','zoe']);
  if (knownFemale.has(first)) return 'f';
  if (/(?:ia|ya|na|la|ra|sa|ta|da|fa|ha|ka|ma|pa|va|za|ah|ni|ri|si|ti|li|mi|fi|vi|yn|elle|ine|ette|een|ice|isya|sya)$/.test(first)) return 'f';
  return 'm';
}

function extractAction(template, nama, lang, gender = 'm', seed = 0) {
  if (!template) return '';
  const p = getPronouns(lang, gender);
  const sIdx = Math.abs(parseInt(seed) || 0);
  let t = template.trim();
  if (lang === 'id') {
    t = t.replace(/^(?:Pada pertemuan ini|Dalam sesi ini|Di pertemuan kali ini|Pada sesi kali ini|Dalam pertemuan kali ini|Di sesi ini),?\s*\{nama\}\s*/i, '');
    t = t.replace(/^\{nama\}\s*/i, '');
    const idAlso = ['. Selain itu, ia juga ', ', serta ia juga ', '. Di samping itu, ia juga '];
    const idNext = ['. Selanjutnya, ia ', '. Selain itu, ia ', ', kemudian ia '];
    t = t.replace(/\.\s*Selain itu,\s*\{nama\}\s+juga\s+/gi, idAlso[sIdx % idAlso.length]);
    t = t.replace(/\.\s*Tak hanya itu,\s*\{nama\}\s+juga\s+/gi, sIdx % 2 === 0 ? '. Tak hanya itu, ia juga ' : '. Di samping itu, ia juga ');
    t = t.replace(/\.\s*\{nama\}\s+juga\s+/gi, idAlso[sIdx % idAlso.length]);
    t = t.replace(/\.\s*\{nama\}\s+/gi, idNext[sIdx % idNext.length]);
    t = t.replace(/\{nama\}/g, 'ia');
    return finalizeActionCase(t);
  }
  t = t.replace(/^(?:In today's class|Today|In this session|In this class|In this final session|In this final class),?\s*\{nama\}\s*/i, '');
  t = t.replace(/^\{nama\}\s*/i, '');
  t = t.replace(/\btheir\s+(?!boat\b)/gi, `${p.poss} `);
  const enAlso = [`, and ${p.subj} also `, `. In addition, ${p.subj} `, `. Alongside that, ${p.subj} also `];
  const enThen = [`, and then ${p.subj} `, `. After that, ${p.subj} `, `. From there, ${p.subj} `];
  const enNext = [`. After that, ${p.subj} `, `, and ${p.subj} then `, `. Additionally, ${p.subj} `, `. Along the way, ${p.subj} `];
  t = t.replace(/\.\s*\{nama\}\s+also\s+/gi, enAlso[sIdx % enAlso.length]);
  t = t.replace(/\.\s*\{nama\}\s+was\s+also\s+/gi, sIdx % 2 === 0 ? `, and ${p.subj} was also ` : `. In addition, ${p.subj} was also `);
  t = t.replace(/\.\s*\{nama\}\s+then\s+/gi, enThen[sIdx % enThen.length]);
  t = t.replace(/!\s*\{nama\}\s+/gi, `! In this activity, ${p.subj} `);
  t = t.replace(/\.\s*\{nama\}\s+/gi, enNext[sIdx % enNext.length]);
  t = t.replace(/\{nama\}/g, p.subj);
  return finalizeActionCase(t);
}

function finalizeActionCase(t) {
  if (!t) return '';
  let _unused = (template = '', lang = '', nama = '') => {
  let t = template.trim();
  if (lang === 'id') {
    t = t.replace(/^(?:Pada pertemuan ini|Dalam sesi ini|Di pertemuan kali ini|Pada sesi kali ini|Dalam pertemuan kali ini|Di sesi ini),?\s*\{nama\}\s*/i, '');
    t = t.replace(/^\{nama\}\s*/i, '');
  } else {
    t = t.replace(/^(?:In today's class|Today|In this session|In this class|In this final session|In this final class),?\s*\{nama\}\s*/i, '');
    t = t.replace(/^\{nama\}\s*/i, '');
  }
  };
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
  const trimmed = str.trim().replace(/!\.+$/, '!').replace(/\.+$/, '');
  if (/[!?]$/.test(trimmed)) return trimmed;
  return trimmed + '.';
}

function getPartialAction(action, nama) {
  if (!action) return '';
  const escapedNama = (nama || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const splitRegex = new RegExp(`(?:\\.\\s+(?=(?:Selain itu,\\s*|Tak hanya itu,\\s*|Di samping itu,\\s*|Selanjutnya,\\s*|In addition,\\s*|After that,\\s*|Alongside that,\\s*|Additionally,\\s*|Along the way,\\s*|From there,\\s*)?(?:ia|he|she|${escapedNama})\\b)|,\\s+(?:and\\s+(?:then\\s+)?(?:he|she)\\b|serta\\s+ia\\b|kemudian\\s+ia\\b))`, 'i');
  const parts = action.split(splitRegex);
  return ensurePeriod(parts[0]);
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
  if (autoStudents.length === 0 && typeof window.initApp === 'function') window.initApp();
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
const ITALIC_MARKER_RE = /(^|[^A-Za-z0-9_])_([^_\n]+?)_(?![A-Za-z0-9_])/g;
function stripItalicMarkers(text) {
  return String(text || '').replace(ITALIC_MARKER_RE, '$1$2');
}
function formatProgressHTML(text) {
  if (!text) return '<em style="color:#94a3b8">—</em>';
  let formatted = escHtml(text);
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(ITALIC_MARKER_RE, '$1<em>$2</em>');
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
    generateBtn: '⚡ Generate Teacher Notes',
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
            notes: `Selama kelas, ${nama} terampil membangun model 3D dan mandiri menulis script Lua dengan sedikit arahan. Kreativitas dan pemahamannya berkembang dengan baik. Good job ${nama}!`
          },
          {
            summary: `Dalam sesi ini, ${nama} berhasil menuntaskan projek dan script pada materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Di kelas, ${nama} cermat merancang objek 3D serta memprogram mekanisme interaktif di Roblox Studio. Kemampuan menyelesaikan masalahnya sudah baik. Keep it up ${nama}!`
          },
          {
            summary: `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Di kelas, ${nama} fokus menyusun struktur 3D dengan rapi dan memastikan seluruh script Lua berjalan lancar tanpa error. Good job ${nama}!`
          },
          {
            summary: `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `Di kelas, ${nama} tekun membangun dunia 3D dan menyusun baris kode script secara runtut. Di rumah, orang tua bisa meminta ${nama} menunjukkan hasil projeknya. Keep it up ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `Di kelas, ${nama} teliti dan bisa memperbaiki sendiri saat ada susunan _code_ yang kurang tepat. Di rumah, orang tua bisa meminta ${nama} menunjukkan _project_ yang dibuat hari ini. Good job ${nama}!`
        },
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} tampak antusias dan menambahkan ide kreatifnya sendiri ke dalam _project_. Minggu depan, kreativitas ini akan dilanjutkan ke materi baru. Keep it up ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `Di kelas, ${nama} mengikuti setiap langkah pembuatan _code_ dengan baik dan tidak mudah menyerah saat ada tantangan. Terus pertahankan semangatnya, ${nama}!`
        },
        {
          summary: `Di kelas hari ini, ${nama} berhasil menyelesaikan _project_ *${lessonTitle}* dengan baik. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} aktif bertanya tentang fungsi _code_ yang digunakan, tandanya rasa ingin tahunya tinggi. Ini jadi bekal yang bagus untuk materi baru minggu depan. Keep it up ${nama}!`
        },
        {
          summary: `Di sesi kali ini, ${nama} berhasil menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} bekerja dengan teliti, memperhatikan urutan _code_, dan memastikan setiap bagian _project_ berjalan lancar. Minggu depan siap lanjut ke materi baru. Good job ${nama}!`
        },
        {
          summary: `Pada pertemuan hari ini, ${nama} menyelesaikan materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `Selama kelas, ${nama} fokus dan bisa menyusun logika _code_ sendiri tanpa banyak bantuan. Minggu depan kita siap lanjut ke materi yang lebih menantang. Keep it up ${nama}!`
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
            notes: `${nama} tekun menyelesaikan projek ini dari sesi sebelumnya, merapikan tata letak 3D, dan memeriksa setiap script hingga berjalan lancar. Keep it up ${nama}!`
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
          summary: `Hari ini, ${nama} menyelesaikan _project_ *${lessonTitle}* yang dikerjakan sejak minggu lalu. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} menyelesaikan sisa _code_ dan menggabungkannya ke _project_ dengan baik. Di rumah, orang tua bisa meminta ${nama} menceritakan cara kerja _project_-nya. Good job ${nama}!`
        },
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan bagian akhir dari materi *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `Di kelas, ${nama} mengecek ulang fungsi _code_ dan memastikan semua bagian _project_ berjalan dengan baik. Minggu depan kita siap mulai materi baru. Keep it up ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} melanjutkan *${lessonTitle}* sampai selesai. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} fokus bekerja, memperbaiki sendiri _error_ yang tersisa, dan menyelesaikan seluruh bagian _project_ dengan baik. Pertahankan semangat belajarnya. Good job ${nama}!`
        },
        {
          summary: `Di sesi kali ini, ${nama} berhasil menyelesaikan sisa _project_ *${lessonTitle}* dengan baik. ${nama} ${ensurePeriod(action)}`,
          notes: `Di kelas, ${nama} fokus menyambungkan _code_ minggu lalu dengan fitur baru hari ini sampai tuntas. Di pertemuan berikutnya kita siap belajar topik baru. Keep it up ${nama}!`
        },
        {
          summary: `Di pertemuan hari ini, ${nama} berhasil menyelesaikan seluruh _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} mencoba ulang _project_-nya dengan teliti dan memastikan tidak ada _error_ yang tertinggal. Minggu depan bisa langsung lanjut ke materi berikutnya. Good job ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} melanjutkan dan berhasil menyelesaikan _project_ *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `Di kelas, ${nama} cepat mengingat kembali alur _project_ minggu lalu dan fokus menyelesaikan sisa _code_-nya. Minggu depan siap lanjut ke materi baru. Keep it up ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '', action = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'ujian' : 'projek';
      const partial = getPartialObjectives(objectives);
      const partialAction = getPartialAction(action, nama);

      if (isRobloxCourse(course)) {
        const defaultAction = isExam ? 'merancang model 3D dan menyiapkan arena ujian di Roblox Studio' : 'membangun model 3D dan merancang tata letak arena di Roblox Studio';
        const actionSentence = partialAction || ((partial && partial.length > 0) ? `berlatih ${formatObjectives(partial, 'id')} di Roblox Studio.` : `${defaultAction}.`);
        const templates = {
          detail: [
            {
              summary: `Hari ini, ${nama} mulai mengerjakan *${lessonTitle}*. Pada sesi ini, ${nama} ${actionSentence}`,
              notes: `Di kelas, ${nama} teliti merancang model 3D dengan detail yang rapi. Projek masih tahap pembangunan model, sehingga ${targetType} berlanjut minggu depan dan mulai membuat script.`
            },
            {
              summary: `Dalam sesi ini, ${nama} mengawali *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teramati di kelas, ${nama} fokus merancang aset 3D secara presisi. Model dasar telah terbangun rapi, dan pembuatan script akan dimulai pada pertemuan berikutnya.`
            }
          ],
          focus: [
            {
              summary: `Hari ini, ${nama} mulai mempelajari *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Di kelas, ${nama} antusias membangun objek 3D walau perhatiannya sesekali beralih layar. Dengan arahan guru, model tersusun baik dan script dimulai minggu depan.`
            },
            {
              summary: `Pada sesi hari ini, ${nama} memulai *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher konsisten mengarahkan fokus ${nama} pada lembar kerja Roblox Studio. Model 3D sudah tertata rapi, dan penulisan script dilanjutkan pertemuan berikutnya.`
            }
          ],
          pace: [
            {
              summary: `Dalam kelas hari ini, ${nama} mengawali *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Di kelas, ${nama} merancang model 3D dengan ritme santai namun terarah. Pembangunan model berjalan lancar dan ${nama} akan mulai membuat script minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Suasana santai membuat ${nama} nyaman menyusun aset 3D di Roblox Studio. Tahap membangun model berjalan baik dan penulisan script berlanjut sesi depan.`
            }
          ],
          logic: [
            {
              summary: `Pada pertemuan kali ini, ${nama} mempelajari materi baru *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Teacher membimbing ${nama} langkah demi langkah dalam penataan posisi part dan grouping model 3D. Model sudah siap, dan pembuatan script dimulai minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} memulai langkah awal pada *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Menghadapi konsep perancangan 3D yang baru, ${nama} teliti menata model dengan bimbingan guru. Struktur arena sudah siap dan tahap scripting dimulai sesi depan.`
            }
          ],
          tired: [
            {
              summary: `Hari ini, ${nama} mulai mengerjakan *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher menyesuaikan ritme belajar agar tetap nyaman saat ${nama} merakit model 3D sepulang sekolah. Pembangunan model selesai baik dan script dimulai minggu depan.`
            },
            {
              summary: `Dalam sesi ini, ${nama} mengawali *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Ritme belajar disesuaikan dengan kondisi stamina ${nama} sepulang sekolah. Pembangunan aset 3D berjalan terarah, dan pembuatan script dilanjutkan minggu depan.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionSentence = partialAction || ((partial && partial.length > 0) ? `berlatih ${formatObjectives(partial, 'id')}.` : 'membangun kerangka dasar logika projek.');
      const templates = {
        detail: [
          {
            summary: `Hari ini, ${nama} memulai pembelajaran materi *${lessonTitle}*. Pada sesi ini, ${nama} ${actionSentence}`,
            notes: `Di kelas, ${nama} menyusun kode projeknya secara cermat. Karena projek ini cukup padat dan kaya fitur, sisa pengerjaan akan dilanjutkan di pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi ini, ${nama} mengawali materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Teramati di kelas, ${nama} tekun menyusun blok kode awal. Bersama arahan teacher, fondasi proyek sudah terbangun baik dan akan dilanjutkan minggu depan.`
          }
        ],
        focus: [
          {
            summary: `Hari ini, ${nama} memulai pembelajaran pada materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Di kelas, perhatian ${nama} sesekali teralihkan dari lembar koding. Teacher aktif mengarahkan kembali fokus ${nama} agar kodenya tersusun rapi. Sisa projek lanjut minggu depan.`
          },
          {
            summary: `Pada sesi hari ini, ${nama} mulai mempelajari *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Teramati di kelas, antusiasme ${nama} tinggi namun sesekali fokusnya terbagi. Bimbingan konsisten terus diberikan agar progres kodingnya selesai maksimal.`
          }
        ],
        pace: [
          {
            summary: `Dalam kelas hari ini, ${nama} memulai materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Di kelas, ${nama} tampak ceria dengan tempo santai namun terarah. Teacher mendampingi langkah demi langkah agar target kode tercapai. Sisa projek dilanjutkan pertemuan berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Suasana belajar menyenangkan membuat ${nama} menikmati sesi ini dengan ritme santai. Teacher terus memandu agar target kode utama selesai terstruktur.`
          }
        ],
        logic: [
          {
            summary: `Pada pertemuan kali ini, ${nama} mempelajari materi baru *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Di kelas, ${nama} menemui tantangan logika baru. Teacher mendampingi bertahap agar konsepnya dipahami dengan baik. Sisa pengerjaan diselesaikan di sesi berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} memulai langkah awal pada *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Menghadapi logika baru yang cukup menantang, ${nama} belajar menganalisis alur program dengan seksama. Sisa fitur projek akan dituntaskan pertemuan berikutnya.`
          }
        ],
        tired: [
          {
            summary: `Hari ini, ${nama} mulai mengerjakan materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Di kelas, energi ${nama} sedikit menurun setelah aktivitas sekolah. Teacher menyesuaikan tempo agar belajar tetap nyaman. Sisa projek dilanjutkan pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi hari ini, ${nama} memulai materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Karena kondisi fisik yang lelah sepulang sekolah, teacher menyesuaikan ritme agar konsep tetap terserap tanpa tekanan. Langkah awal selesai dengan baik.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '', action = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'ujian' : 'projek';
      const partial = getPartialObjectives(objectives);
      const partialAction = getPartialAction(action, nama);

      if (isRobloxCourse(course)) {
        const defaultAction2 = isExam ? 'menulis script Lua dan menguji mekanisme game ujian di Roblox Studio' : 'menulis script Lua dan memprogram mekanisme interaktif di Roblox Studio';
        const actionSentence = partialAction || ((partial && partial.length > 0) ? `melanjutkan ${formatObjectives(partial, 'id')} di Roblox Studio.` : `${defaultAction2}.`);
        const templates = {
          detail: [
            {
              summary: `Dalam sesi lanjutan *${lessonTitle}* ini, ${nama} meneruskan pengerjaan di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Di kelas, ${nama} cermat menulis script Lua dan menguji mekanisme interaksi game. Pengujian akhir dan penyempurnaan akan dituntaskan pada pertemuan berikutnya.`
            },
            {
              summary: `Pada pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan pembuatan script projek. ${nama} ${actionSentence}`,
              notes: `Sebagian besar script interaktif dan event trigger sudah berfungsi. Pengujian menyeluruh dan finalisasi projek akan diselesaikan minggu depan.`
            }
          ],
          focus: [
            {
              summary: `Pada sesi kedua *${lessonTitle}* ini, ${nama} meneruskan penulisan script di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher aktif mendampingi fokus ${nama} saat menyusun kode script. Fungsi-fungsi utama sudah terhubung, dan pengujian akhir dilanjutkan minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Dengan bimbingan terarah, ${nama} kembali fokus memprogram interaksi game. Mekanisme script sudah terbentuk, dan tahap akhir diselesaikan sesi berikutnya.`
            }
          ],
          pace: [
            {
              summary: `Dalam kelas hari ini, ${nama} melanjutkan projek *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Di kelas, ${nama} menyusun script Lua dengan ritme santai namun terarah. Logika utama game sudah berjalan, dan penyempurnaan tuntas minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} meneruskan *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher memfasilitasi tempo belajar yang menyenangkan saat memprogram script. Mekanisme game sudah aktif dan pengujian tuntas di pertemuan berikutnya.`
            }
          ],
          logic: [
            {
              summary: `Pada sesi kelanjutan *${lessonTitle}* ini, ${nama} mendalami logika script Lua. ${nama} ${actionSentence}`,
              notes: `Teacher mendampingi pemahaman event trigger dan alur script Lua secara bertahap. Mekanisme projek berfungsi baik, dan tahap akhir dituntaskan minggu depan.`
            },
            {
              summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Mempelajari logika script dan pengkondisian bersama guru memperkuat pemahaman pemrograman ${nama}. Sisa pengujian game diselesaikan sesi berikutnya.`
            }
          ],
          tired: [
            {
              summary: `Hari ini, ${nama} meneruskan materi *${lessonTitle}* di Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher memfasilitasi ritme yang suportif agar penulisan script tetap terserap baik sepulang sekolah. Mekanisme dasar siap dan selesai minggu depan.`
            },
            {
              summary: `Dalam sesi kedua *${lessonTitle}* ini, ${nama} melanjutkan penulisan script game. ${nama} ${actionSentence}`,
              notes: `Ritme belajar disesuaikan dengan energi ${nama} sepulang sekolah. Script interaktif berhasil diprogram dan pengujian final tuntas minggu depan.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionSentence = partialAction || ((partial && partial.length > 0) ? `menyusun kelanjutan ${formatObjectives(partial, 'id')}.` : 'mengembangkan logika lanjutan pada projek.');
      const templates = {
        detail: [
          {
            summary: `Pada pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan kode projeknya dari minggu lalu. ${nama} ${actionSentence}`,
            notes: `Di kelas, ${nama} teliti memastikan setiap animasi dan respon program berjalan selaras. Tahap finalisasi dan pengujian akhir akan dituntaskan pada pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi lanjutan *${lessonTitle}* hari ini, ${nama} meneruskan pengembangan projeknya. ${nama} ${actionSentence}`,
            notes: `Sebagian besar kode utama telah terbangun rapi. Mengingat detail projek yang cukup padat, tahap pengujian akhir akan dituntaskan pada pertemuan berikutnya.`
          }
        ],
        focus: [
          {
            summary: `Dalam sesi lanjutan materi *${lessonTitle}* ini, ${nama} meneruskan pengerjaan kode projeknya. ${nama} ${actionSentence}`,
            notes: `Teacher terus mendampingi dan mengingatkan ${nama} menjaga fokus pada layar koding. Fitur penting sudah terpasang dan sisa projek dituntaskan di pertemuan berikutnya.`
          },
          {
            summary: `Hari ini, ${nama} masuk ke pertemuan kedua untuk materi *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Teacher terus memusatkan perhatian ${nama} agar konsisten menyelesaikan alur kode hingga tuntas tanpa terdistraksi. Tahap akhir diselesaikan minggu depan.`
          }
        ],
        pace: [
          {
            summary: `Di pertemuan kedua materi *${lessonTitle}* ini, ${nama} melanjutkan pengembangan projeknya. ${nama} ${actionSentence}`,
            notes: `Di kelas, ${nama} bekerja dengan ritme santai namun stabil. Sebagian besar projek telah terbangun dan tahap penuntasan siap diselesaikan pada pertemuan berikutnya.`
          },
          {
            summary: `Pada sesi ini, ${nama} meneruskan proyek *${lessonTitle}* dari minggu lalu. ${nama} ${actionSentence}`,
            notes: `Teacher aktif mengarahkan alur kerja agar waktu kelas termanfaatkan efektif. Projek sudah mendekati tahap akhir dan tuntas di sesi berikutnya.`
          }
        ],
        logic: [
          {
            summary: `Pada sesi lanjutan materi *${lessonTitle}* ini, ${nama} melanjutkan penyusunan algoritma projeknya. ${nama} ${actionSentence}`,
            notes: `${nama} mulai memahami logika bertingkat dengan bimbingan guru dan berhasil memperbaiki error. Seluruh fitur akhir siap diselesaikan di pertemuan selanjutnya.`
          },
          {
            summary: `Hari ini, ${nama} melanjutkan materi *${lessonTitle}* pada tahap logika lanjutan bersama teacher. ${nama} ${actionSentence}`,
            notes: `Melalui latihan langsung di kelas, pemahaman logika ${nama} berkembang dengan baik. Tahap akhir akan diselesaikan minggu depan.`
          }
        ],
        tired: [
          {
            summary: `Hari ini, ${nama} meneruskan proyek materi *${lessonTitle}* yang sedang berjalan. ${nama} ${actionSentence}`,
            notes: `Walaupun energi ${nama} terbatas sepulang sekolah, ${nama} tetap berkomitmen menyusun kode penting projeknya. Tahap akhir dijadwalkan pada pertemuan berikutnya.`
          },
          {
            summary: `Dalam sesi kedua *${lessonTitle}* ini, ${nama} melanjutkan bagian tengah projek dengan bimbingan guru. ${nama} ${actionSentence}`,
            notes: `Teacher memfasilitasi ritme belajar yang suportif agar materi tetap terserap baik. Kerangka projek hampir tuntas dan selesai minggu depan.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0, course = '', action = '') => {
      // Alias backward compatibility
      return LANG_UI.id.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed, course, action);
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
            notes: `Di kelas, ${nama} antusias dan cepat memahami instruksi baru saat mulai merancang model 3D untuk *${l2Title}*. Keep it up ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Hari ini, ${nama} menyelesaikan materi *${l1Title}* dengan mandiri, lalu langsung mulai mengerjakan *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} antusias dan cepat memahami instruksi baru saat mulai mengerjakan *${l2Title}*. Terus pertahankan semangat belajarnya ya. Keep it up ${nama}!`
        },
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan materi *${l1Title}* lebih cepat dan langsung lanjut ke *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `Di kelas, ${nama} tetap fokus dan mengerjakan bagian awal materi berikutnya dengan mandiri. Minggu depan kita akan melanjutkan *${l2Title}*. Good job ${nama}!`
        },
        {
          summary: `Hari ini, ${nama} menyelesaikan *${l1Title}* dan mulai mengerjakan *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} bekerja mandiri dan cepat menyesuaikan diri dengan materi baru. Di pertemuan selanjutnya, kita akan menyelesaikan _project_ *${l2Title}*. Keep it up ${nama}!`
        },
        {
          summary: `Pada pertemuan hari ini, ${nama} menyelesaikan *${l1Title}* dan sudah mulai mengerjakan *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} bekerja cepat dan teliti, sehingga ada waktu untuk mulai mengerjakan *${l2Title}*. Sisa _project_ akan dilanjutkan di pertemuan berikutnya. Good job ${nama}!`
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
            notes: `Di kelas, ${nama} produktif dan cekatan membangun arena 3D serta memprogram script Lua pada kedua materi dengan rapi dan mandiri. Good job ${nama}!`
          },
          {
            summary: `Hari ini, ${nama} berhasil menuntaskan 2 lesson Roblox sekaligus (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `Di kelas, ${nama} teliti dalam membangun model dan menguji script secara mandiri pada kedua projek tersebut. Keep it up ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Hari ini, ${nama} berhasil menyelesaikan 2 lesson sekaligus (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `Di kelas, ${nama} teliti dan bisa memperbaiki sendiri saat ada susunan _code_ yang kurang tepat. Di rumah, orang tua bisa meminta ${nama} menunjukkan _project_ yang dibuat hari ini. Good job ${nama}!`
        },
        {
          summary: `Di pertemuan kali ini, ${nama} menyelesaikan 2 materi sekaligus (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} cepat memahami instruksi dan menyelesaikan setiap tantangan _coding_ dengan runtut. Di pertemuan selanjutnya kita siap lanjut ke materi baru. Keep it up ${nama}!`
        },
        {
          summary: `Di kelas hari ini, ${nama} menyelesaikan 2 lesson (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `Di kelas, ${nama} tetap fokus dan mengerjakan kedua _project_ dengan rapi tanpa banyak bantuan. Minggu depan kita sudah siap untuk materi baru. Good job ${nama}!`
        },
        {
          summary: `Di pertemuan hari ini, ${nama} berhasil menyelesaikan 2 materi (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `Di kelas, ${nama} bekerja dengan fokus, menyusun _code_ sendiri, dan menjaga hasil kedua _project_ tetap rapi. Minggu depan siap lanjut ke materi baru. Keep it up ${nama}!`
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
    generateBtn: '⚡ Generate Teacher Notes',
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
            notes: `In class, ${nama} built the 3D models neatly and wrote the Lua scripts independently with little help. Feel free to ask ${nama} to show you the project at home. Good job, ${nama}!`
          },
          {
            summary: `In this session, ${nama} finished building and scripting the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} carefully designed the 3D objects and wrote the scripts for the game mechanics in Roblox Studio. Next week, we are ready for a new topic. Keep it up, ${nama}!`
          },
          {
            summary: `During today's class, ${nama} achieved all learning objectives for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} stayed focused, arranged the 3D objects neatly, and made sure all Lua scripts ran smoothly without errors. Good job, ${nama}!`
          },
          {
            summary: `Today, ${nama} completed all instructions in *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `In class, ${nama} worked steadily in Roblox Studio, designing 3D models and writing the scripts step by step. At home, you can ask ${nama} about today's game. Keep it up, ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Today, ${nama} finished the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `In class, ${nama} worked carefully and fixed any errors in the code independently. At home, feel free to ask ${nama} to show you the project we made today. Good job, ${nama}!`
        },
        {
          summary: `In class today, ${nama} completed all the goals of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} was enthusiastic in class and added creative ideas to the project. Next time, we will continue with a new topic. Keep it up, ${nama}!`
        },
        {
          summary: `Today, ${nama} completed *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `In class, ${nama} followed every coding step well and did not give up on tricky parts. At home, you can ask ${nama} to tell you about the project we made today. Good job, ${nama}!`
        },
        {
          summary: `In this class, ${nama} finished *${lessonTitle}* with great results. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} asked good questions about how the code works and showed curiosity during class. This is a good foundation for our new topic next week. Keep it up, ${nama}!`
        },
        {
          summary: `In today's lesson, ${nama} reached all the goals of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} worked carefully, checked the code steps, and made sure every part of the project ran smoothly. Next meeting, we can move on to a new topic. Good job, ${nama}!`
        },
        {
          summary: `In today's session, ${nama} successfully finished *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} stayed focused and put the code together with little help from the teacher. Next meeting, we are ready to move on to the next lesson. Keep it up, ${nama}!`
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
            notes: `In class, ${nama} connected the 3D models with the Lua scripts and tested the gameplay from start to finish. At home, feel free to ask ${nama} to show you the finished game!`
          },
          {
            summary: `In this class, ${nama} concluded the ongoing project in *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} worked steadily across sessions, finishing the 3D layout and fixing the scripts until the game ran smoothly. Good job, ${nama}!`
          },
          {
            summary: `During today's lesson, ${nama} accomplished the final stage of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
            notes: `${nama} checked the 3D objects and Lua scripts carefully to make sure everything worked properly. Next week, we are ready for a new lesson. Keep it up, ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Today, ${nama} finished the project in *${lessonTitle}* that started last week. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} completed the remaining code and connected all parts of the project well. At home, you can ask ${nama} to show you how the finished project works. Good job, ${nama}!`
        },
        {
          summary: `In today's lesson, ${nama} finished the last part of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `In class, ${nama} checked all the code again to make sure everything ran smoothly without any issues. Next week, we are ready to start a new lesson. Keep it up, ${nama}!`
        },
        {
          summary: `Today, ${nama} continued *${lessonTitle}* and finished it. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} stayed focused, fixed the remaining bugs, and finished all parts of the project. At home, feel free to ask ${nama} to show you the finished project. Good job, ${nama}!`
        },
        {
          summary: `In this session, ${nama} finished the rest of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `In class, ${nama} stayed focused while connecting last week's code with today's new features. Everything is complete and ready for the next lesson. Keep it up, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished all the remaining parts of *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `${nama} tested the project step by step and made sure everything worked properly. Next week, we can move on to the next lesson with confidence. Good job, ${nama}!`
        },
        {
          summary: `Today, ${nama} continued and finished the project for *${lessonTitle}*. ${nama} ${ensurePeriod(action)}`,
          notes: `In class, ${nama} quickly remembered last week's project and focused on finishing the remaining code. Next week, we are ready for a new lesson. Keep it up, ${nama}!`
        }
      ];
      const chosen = pickVariant(variants, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress1Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '', action = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'exam' : 'project';
      const partial = getPartialObjectives(objectives);
      const partialAction = getPartialAction(action, nama);

      if (isRobloxCourse(course)) {
        const defaultAction = isExam ? 'reviewed materials and began 3D modeling for the exam in Roblox Studio.' : 'focused on building 3D models and designing the environment in Roblox Studio.';
        const actionSentence = partialAction || ((partial && partial.length > 0) ? `practiced how to ${formatObjectives(partial, 'en')} in Roblox Studio.` : defaultAction);
        const templates = {
          detail: [
            {
              summary: `Today, ${nama} began working on *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} built the models carefully with close attention to detail. As the project is in the building stage, the ${targetType} continues next week and ${nama} will start scripting after that.`
            },
            {
              summary: `In this session, ${nama} started *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} constructed the 3D assets carefully and neatly. As the project is in the building stage, the ${targetType} continues next week and scripting will begin after that.`
            }
          ],
          focus: [
            {
              summary: `Today, ${nama} started *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} was excited to build 3D models, with the teacher actively directing focus to the workspace. The building stage went well, and scripting starts next week.`
            },
            {
              summary: `During today's class, ${nama} began *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `The teacher kept ${nama} engaged on 3D asset building tasks. The models are well-aligned, and ${nama} will continue the ${targetType} and start scripting next session.`
            }
          ],
          pace: [
            {
              summary: `In today's session, ${nama} began *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} designed 3D models at a relaxed and steady rhythm. The building stage is progressing well, and ${nama} will start scripting next week.`
            },
            {
              summary: `Today, ${nama} initiated *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `With calm and steady guidance, ${nama} assembled 3D models smoothly. The ${targetType} remains in the building stage, and scripting will resume next class.`
            }
          ],
          logic: [
            {
              summary: `During today's class, ${nama} began *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The teacher guided ${nama} step-by-step on 3D spatial alignment and model grouping. The structure is established, and scripting will begin next class.`
            },
            {
              summary: `Today, ${nama} started *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `Facing new 3D design challenges, ${nama} learned to arrange models with teacher assistance. Building is underway, and scripting starts next week.`
            }
          ],
          tired: [
            {
              summary: `Today, ${nama} began *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The learning pace was comfortably adapted while ${nama} assembled 3D models after school. Building is well on track, and scripting starts next week.`
            },
            {
              summary: `In this session, ${nama} started *${lessonTitle}*. ${nama} ${actionSentence}`,
              notes: `To manage after-school fatigue, teacher paced 3D modeling gently so ${nama} stayed engaged. Building went well, and scripting begins next meeting.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionSentence = partialAction || ((partial && partial.length > 0) ? `practiced how to ${formatObjectives(partial, 'en')}.` : 'built foundational project algorithms.');
      const templates = {
        detail: [
          {
            summary: `Today, ${nama} began working on *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `In class, ${nama} assembled code carefully with close attention to detail. Due to rich project features, remaining parts continue next week.`
          },
          {
            summary: `In this session, ${nama} started *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `With teacher guidance, a solid initial project framework is in place. Code development will resume next week.`
          }
        ],
        focus: [
          {
            summary: `Today, ${nama} started learning *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `In class, ${nama} showed curiosity, though attention occasionally shifted to other apps. Guided by teacher, code progress continues next week.`
          },
          {
            summary: `During today's class, ${nama} initiated *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The teacher consistently guided ${nama} back to workspace tasks. Initial code is set and remaining features continue next session.`
          }
        ],
        pace: [
          {
            summary: `In today's session, ${nama} began *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `In class, ${nama} was cheerful and maintained a relaxed yet steady work rhythm. The teacher provided clear guidance and steps resume next week.`
          },
          {
            summary: `Today, ${nama} started *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The teacher provided clear direction so essential project goals were met sequentially. Final steps continue next session.`
          }
        ],
        logic: [
          {
            summary: `During today's class, ${nama} explored the new topic *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The teacher provided step-by-step guidance so ${nama} understood the new coding logic before moving forward. Progress continues next class.`
          },
          {
            summary: `Today, ${nama} commenced *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Facing novel algorithmic challenges, ${nama} learned to analyze code logic with close assistance. Remaining steps resume next session.`
          }
        ],
        tired: [
          {
            summary: `Today, ${nama} commenced work on *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The learning pace was comfortably adapted so ${nama} absorbed concepts without rushing. Rest of project resumes next meeting.`
          },
          {
            summary: `In this session, ${nama} started *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Due to fatigue after school, teacher adjusted pace so ${nama} could absorb concepts comfortably. Resuming next week!`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgress2Text: (nama, lessonNum, lessonTitle, objectives, context = 'detail', idx = 0, seed = 0, course = '', action = '') => {
      const isExam = isExamOrProject(lessonNum, lessonTitle);
      const targetType = isExam ? 'exam' : 'project';
      const partial = getPartialObjectives(objectives);
      const partialAction = getPartialAction(action, nama);

      if (isRobloxCourse(course)) {
        const defaultAction2 = isExam ? 'wrote Lua scripts and tested exam game mechanics in Roblox Studio.' : 'wrote Lua scripts and programmed interactive game mechanics in Roblox Studio.';
        const actionSentence = partialAction || ((partial && partial.length > 0) ? `continued working on ${formatObjectives(partial, 'en')} in Roblox Studio.` : defaultAction2);
        const templates = {
          detail: [
            {
              summary: `In this second session for *${lessonTitle}*, ${nama} continued developing the project in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} focused on writing Lua scripts carefully and testing game mechanics. Final script polish and gameplay verification will wrap up next class.`
            },
            {
              summary: `In this follow-up session for *${lessonTitle}*, ${nama} progressed with Lua scripting in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Most interactive scripts and event triggers are now in place. Final testing and project completion will wrap up in the next class.`
            }
          ],
          focus: [
            {
              summary: `In this follow-up session on *${lessonTitle}*, ${nama} continued writing Lua scripts in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The teacher actively guided ${nama}'s focus during script creation. Key functions and event connections are running, with final testing next week.`
            },
            {
              summary: `Today, ${nama} resumed *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `With teacher encouragement, ${nama} stayed on track while scripting game events. Interactive mechanics are set, and final testing wraps up next session.`
            }
          ],
          pace: [
            {
              summary: `In this follow-up class for *${lessonTitle}*, ${nama} continued scripting game interactions in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `In class, ${nama} enjoyed scripting at a steady, enjoyable rhythm. Core Lua mechanics are functioning, and final polish will finish next week.`
            },
            {
              summary: `Today, ${nama} proceeded with *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The teacher supported ${nama} in writing scripts steadily without pressure. The main gameplay scripts are in place, resuming next session.`
            }
          ],
          logic: [
            {
              summary: `During this continuation session for *${lessonTitle}*, ${nama} tackled advanced Lua scripts in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The teacher provided step-by-step guidance on script conditions and event triggers. Mechanics are working well, and final testing wraps up next class.`
            },
            {
              summary: `Today, ${nama} continued *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Analyzing Lua syntax and event connections with teacher guidance helped ${nama} grasp script logic thoroughly. Final details wrap up next week.`
            }
          ],
          tired: [
            {
              summary: `In this session, ${nama} continued *${lessonTitle}* and focused on essential Lua scripting in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `The teacher adjusted the pace to keep ${nama} comfortable while coding scripts after school. Core scripts are active, and final testing completes next meeting.`
            },
            {
              summary: `Today, ${nama} resumed *${lessonTitle}* in Roblox Studio. ${nama} ${actionSentence}`,
              notes: `Teacher paced the scripting session gently to maintain good understanding. The interactive code is running smoothly, wrapping up next week.`
            }
          ]
        };
        const list = templates[context] || templates['detail'];
        const chosen = pickVariant(list, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }

      const actionSentence = partialAction || ((partial && partial.length > 0) ? `continued working on ${formatObjectives(partial, 'en')}.` : 'developed advanced project logic.');
      const templates = {
        detail: [
          {
            summary: `In this second session for *${lessonTitle}*, ${nama} continued developing the project code from last week. ${nama} ${actionSentence}`,
            notes: `In class, ${nama} carefully checked that all parts of the project worked properly. Final testing and polish will wrap up next class.`
          },
          {
            summary: `In this follow-up session for *${lessonTitle}*, ${nama} progressed with project development. ${nama} ${actionSentence}`,
            notes: `Most core mechanisms are now in place, and final testing and completion will wrap up in the next class.`
          }
        ],
        focus: [
          {
            summary: `In this follow-up session on *${lessonTitle}*, ${nama} continued developing the project code. ${nama} ${actionSentence}`,
            notes: `The teacher actively kept attention directed at workspace whenever curiosity drifted. Key features are in place and finish next week.`
          },
          {
            summary: `Today, ${nama} entered the second meeting for *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The teacher kept ${nama} on track to complete algorithms without getting sidetracked. Final completion is set for next week.`
          }
        ],
        pace: [
          {
            summary: `In this second meeting for *${lessonTitle}*, ${nama} continued building the project. ${nama} ${actionSentence}`,
            notes: `In class, ${nama} worked at a steady, enjoyable pace. Most core mechanisms are now in place, and completion is set for next meeting.`
          },
          {
            summary: `In this session, ${nama} resumed the project for *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `The teacher helped channel class time effectively to finish leftover logic. Project will be finalized in the upcoming meeting.`
          }
        ],
        logic: [
          {
            summary: `During this second session for *${lessonTitle}*, ${nama} continued assembling project algorithms with teacher guidance. ${nama} ${actionSentence}`,
            notes: `${nama} began grasping multi-step logic with teacher support and resolved earlier hurdles. Final features wrap up in our next class.`
          },
          {
            summary: `Today, ${nama} advanced further into *${lessonTitle}*, tackling deeper logical requirements. ${nama} ${actionSentence}`,
            notes: `Hands-on debugging deepened ${nama}'s algorithmic reasoning. The project will be finalized in the next session.`
          }
        ],
        tired: [
          {
            summary: `Today, ${nama} continued working on the ongoing project for *${lessonTitle}*. ${nama} ${actionSentence}`,
            notes: `Although energy was limited after school, ${nama} remained committed to building key project scripts. Final wrap-up scheduled next week.`
          },
          {
            summary: `In this second session for *${lessonTitle}*, ${nama} worked through the middle phase of the project. ${nama} ${actionSentence}`,
            notes: `The teacher facilitated a supportive rhythm to ensure strong conceptual grasp. Completion scheduled next week.`
          }
        ]
      };
      const list = templates[context] || templates['detail'];
      const chosen = pickVariant(list, idx, seed);
      return createSplitReport(chosen.summary, chosen.notes);
    },
    inProgressText: (nama, lessonNum, lessonTitle, objectives, idx = 0, seed = 0, course = '', action = '') => {
      // Alias backward compatibility
      return LANG_UI.en.inProgress1Text(nama, lessonNum, lessonTitle, objectives, 'detail', idx, seed, course, action);
    },
    oneAndHalfText: (nama, l1Num, l1Title, action1, l2Num, l2Title, obj2, idx = 0, seed = 0, course = '') => {
      if (isRobloxCourse(course)) {
        const robloxVariants = [
          {
            summary: `In today's session, ${nama} completed *${l1Title}* and immediately initiated the next topic in Roblox Studio. ${nama} ${ensurePeriod(action1)}`,
            notes: `In class, ${nama} completed the 3D models and scripts quickly and neatly, using the remaining time to start designing the next Roblox project layout.`
          },
          {
            summary: `In this session, ${nama} completed *${l1Title}* independently and immediately initiated the next project *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
            notes: `In class, ${nama} was enthusiastic and understood the new concepts quickly, completing the initial 3D models for *${l2Title}* smoothly.`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Today, ${nama} finished *${l1Title}* independently and then started *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} was excited, understood the new instructions quickly, and completed the first part of *${l2Title}* with ease. Keep it up, ${nama}!`
        },
        {
          summary: `In class today, ${nama} finished *${l1Title}* early and moved on to *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `In class, ${nama} stayed focused and started working on the new project smoothly. Next meeting, we will continue and finish *${l2Title}*. Good job, ${nama}!`
        },
        {
          summary: `Today, ${nama} finished *${l1Title}* and started *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} stayed focused in class, leaving extra time to begin *${l2Title}*. In the next class, we will continue and complete this project. Keep it up, ${nama}!`
        },
        {
          summary: `In today's session, ${nama} finished *${l1Title}* and got a head start on *${l2Title}*. ${nama} ${ensurePeriod(action1)}`,
          notes: `${nama} worked quickly and carefully, using the remaining time to start building *${l2Title}*. Next meeting, we will wrap up the rest of the project. Good job, ${nama}!`
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
            notes: `In class, ${nama} worked productively, building the 3D environments and writing the Lua scripts for both lessons neatly. Good job, ${nama}!`
          },
          {
            summary: `${nama} finished 2 full Roblox lessons today (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
            notes: `In class, ${nama} did well in both 3D model building and Lua scripting, finishing the tasks for both lessons with little help. Keep it up, ${nama}!`
          }
        ];
        const chosen = pickVariant(robloxVariants, idx, seed);
        return createSplitReport(chosen.summary, chosen.notes);
      }
      const variants = [
        {
          summary: `Today, ${nama} finished 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `In class, ${nama} worked carefully and fixed any code errors independently. At home, you can ask ${nama} to show you what we built in class today. Good job, ${nama}!`
        },
        {
          summary: `In today's session, ${nama} completed 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} worked through every coding challenge and followed the steps well. In the next meeting, we will continue with more fun challenges. Keep it up, ${nama}!`
        },
        {
          summary: `Great news! ${nama} finished 2 lessons today (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `In class, ${nama} stayed focused and completed both projects neatly with little help. Next week, we are ready to move on to the next lesson. Good job, ${nama}!`
        },
        {
          summary: `In this meeting, ${nama} finished 2 lessons (*Lesson ${l1Num}* & *Lesson ${l2Num}*):\n\n• *${l1Title}*: ${nama} ${ensurePeriod(action1)}\n• *${l2Title}*: ${nama} ${ensurePeriod(action2)}`,
          notes: `${nama} stayed focused, solved the coding challenges independently, and kept both projects neat. Next meeting, we can move on to a new topic. Keep it up, ${nama}!`
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
  const courseList = (typeof COURSE_MAP !== 'undefined' && s.criteria && COURSE_MAP[s.criteria])
    ? COURSE_MAP[s.criteria]
    : ((typeof COURSE_MAP !== 'undefined' && (s.criteria === 'Juniors' || s.criteria === 'Junior')) ? (COURSE_MAP['Juniors'] || COURSE_MAP['Junior']) : null);
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

  if (typeof COURSE_DATA !== 'undefined' && s.course && COURSE_DATA[s.course] && COURSE_DATA[s.course].length > 0) {
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
  } else if (typeof COURSE_DATA !== 'undefined' && s.course && COURSE_DATA[s.course] && COURSE_DATA[s.course].length === 0) {
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
  setTimeout(() => autoGenerateSummary(idx, true, true), 0);
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
  setTimeout(() => autoGenerateSummary(idx, false, true), 0);
  setupCustomSelect(selectEl);
}

function onLessonChange(idx, selectEl) {
  autoStudents[idx].lesson = selectEl.value;
  setTimeout(() => autoGenerateSummary(idx, true), 0);
  setupCustomSelect(selectEl);
  autoUpdateTable();
}

function onLesson2Change(idx, selectEl) {
  autoStudents[idx].lesson2 = selectEl.value;
  setTimeout(() => autoGenerateSummary(idx, true), 0);
  setupCustomSelect(selectEl);
  autoUpdateTable();
}

function buildMeetingSummary(idx, seed = 0) {
  const s = autoStudents[idx];
  if (!s || !s.course || !s.lesson) return '';
  if ((s.status === 'double' || s.status === 'one_and_half') && !s.lesson2) return '';
  if (typeof COURSE_DATA === 'undefined' || !COURSE_DATA[s.course] || COURSE_DATA[s.course].length === 0) return '';

  const sLang = s.lang || autoLang;
  const sGender = s.gender || inferGenderFromName(s.nama);
  const p = getPronouns(sLang, sGender);
  const L = LANG_UI[sLang];
  const nama = (s.nama && s.nama.trim()) ? s.nama.trim() : (sLang === 'id' ? 'Siswa' : 'Student');

  const courseList = COURSE_DATA[s.course];
  const l1Obj = courseList ? courseList.find(item => item.num == s.lesson) : null;
  const l2Obj = (courseList && s.lesson2) ? courseList.find(item => item.num == s.lesson2) : null;

  const l1Title = l1Obj ? ((sLang === 'id' && l1Obj.title_id) ? l1Obj.title_id : (l1Obj.title_en || l1Obj.title)) : `Lesson ${s.lesson}`;
  const l2Title = l2Obj ? ((sLang === 'id' && l2Obj.title_id) ? l2Obj.title_id : (l2Obj.title_en || l2Obj.title)) : `Lesson ${s.lesson2}`;

  const templateMap = sLang === 'en' ? TEMPLATES_EN : TEMPLATES;
  const raw1 = (templateMap && templateMap[s.course] && templateMap[s.course][s.lesson])
    ? templateMap[s.course][s.lesson]
    : '';
  const localizedCourse = getLocalizedCourseName(s.course, sLang);
  const obj1 = l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [];
  const action1 = raw1
    ? ensurePeriod(extractAction(raw1, nama, sLang, sGender, seed))
    : ensurePeriod(L.fallbackProgress(nama, s.lesson, localizedCourse, obj1));
  const partial1 = getPartialAction(action1, nama);
  const isRoblox = isRobloxCourse(s.course);

  if (sLang === 'id') {
    if (s.status === 'done') {
      const variants = isRoblox ? [
        `Pada pertemuan hari ini, ${nama} menyelesaikan materi *${l1Title}*, di mana ia ${action1}`,
        `Dalam sesi ini, ${nama} berhasil menuntaskan _project_ dan _script_ pada *${l1Title}*. Selama kelas berlangsung, ia ${action1}`,
        `Di pertemuan kali ini, ${nama} menyelesaikan seluruh target materi *${l1Title}*, yang mana ia ${action1}`,
        `Hari ini, ${nama} berhasil merampungkan *${l1Title}* di Roblox Studio. Pada sesi ini, ia ${action1}`
      ] : [
        `Hari ini, ${nama} berhasil menyelesaikan materi *${l1Title}*, di mana ia ${action1}`,
        `Di pertemuan kali ini, ${nama} menuntaskan seluruh target pada *${l1Title}*. Selama sesi ini, ia ${action1}`,
        `Pada kelas hari ini, ${nama} menyelesaikan _project_ *${l1Title}*, yang mana ia ${action1}`,
        `Dalam sesi pembelajaran hari ini, ${nama} berhasil merampungkan materi *${l1Title}*. Pada pertemuan ini, ia ${action1}`,
        `Di sesi kali ini, ${nama} menuntaskan tahapan pembelajaran pada *${l1Title}*, di mana ia ${action1}`,
        `Pada pertemuan hari ini, ${nama} menyelesaikan materi *${l1Title}* dengan baik. Sepanjang kelas, ia ${action1}`
      ];
      return pickVariant(variants, 0, seed);
    }
    if (s.status === 'continued_done') {
      const variants = isRoblox ? [
        `Pada pertemuan hari ini, ${nama} melanjutkan dan menuntaskan _project_ *${l1Title}*, di mana ia ${action1}`,
        `Dalam sesi ini, ${nama} merampungkan kelanjutan _project_ *${l1Title}* dari minggu lalu. Selama pembelajaran ini, ia ${action1}`,
        `Di pertemuan kali ini, ${nama} menyelesaikan tahap akhir *${l1Title}* di Roblox Studio, yang mana ia ${action1}`
      ] : [
        `Hari ini, ${nama} menyelesaikan _project_ *${l1Title}* yang dimulai minggu lalu, di mana ia ${action1}`,
        `Di pertemuan kali ini, ${nama} menuntaskan bagian akhir dari materi *${l1Title}*. Dalam rangkaian materi ini, ia ${action1}`,
        `Hari ini, ${nama} melanjutkan pengerjaan *${l1Title}* sampai selesai, yang mana ia ${action1}`,
        `Di sesi kali ini, ${nama} berhasil merampungkan sisa _project_ *${l1Title}*. Selama mempelajari topik ini, ia ${action1}`,
        `Pada pertemuan hari ini, ${nama} menyelesaikan seluruh bagian akhir *${l1Title}*, di mana ia ${action1}`,
        `Hari ini, ${nama} meneruskan dan menuntaskan _project_ *${l1Title}* dari sesi sebelumnya. Pada materi ini, ia ${action1}`
      ];
      return pickVariant(variants, 0, seed);
    }
    if (s.status === 'in_progress_1' || s.status === 'in_progress') {
      const act = partial1 || action1;
      const variants = [
        `Hari ini, ${nama} mulai mempelajari materi *${l1Title}*, di mana ia ${act}`,
        `Dalam sesi ini, ${nama} mengawali pengerjaan *${l1Title}*. Pada tahap awal ini, ia ${act}`,
        `Pada pertemuan hari ini, ${nama} memulai langkah pertama untuk *${l1Title}*. Selama sesi berlangsung, ia ${act}`,
        `Di kelas hari ini, ${nama} mulai mengerjakan _project_ *${l1Title}*, yang mana ia ${act}`,
        `Hari ini, ${nama} memasuki pertemuan pertama materi *${l1Title}*. Di sesi pembuka ini, ia ${act}`,
        `Pada sesi kali ini, ${nama} mulai mengeksplorasi *${l1Title}*, di mana ia ${act}`
      ];
      return pickVariant(variants, 0, seed);
    }
    if (s.status === 'in_progress_2') {
      const act = partial1 || action1;
      const variants = [
        `Pada pertemuan kedua materi *${l1Title}* ini, ${nama} melanjutkan _project_-nya dari minggu lalu, di mana ia ${act}`,
        `Dalam sesi lanjutan *${l1Title}* hari ini, ${nama} meneruskan tahap pengembangan _project_. Pada sesi ini, ia ${act}`,
        `Hari ini, ${nama} kembali melanjutkan pengerjaan *${l1Title}* yang sedang berjalan, yang mana ia ${act}`,
        `Di pertemuan kedua untuk *${l1Title}* ini, ${nama} menyambung progres minggu lalu. Selama kelas berlangsung, ia ${act}`,
        `Pada sesi kali ini, ${nama} meneruskan bagian tengah dari _project_ *${l1Title}*, di mana ia ${act}`,
        `Hari ini, ${nama} melanjutkan tahap berikutnya pada materi *${l1Title}*. Dalam prosesnya, ia ${act}`
      ];
      return pickVariant(variants, 0, seed);
    }
    if (s.status === 'one_and_half') {
      const variants = [
        `Hari ini, ${nama} menyelesaikan materi *${l1Title}*, di mana ia ${action1} Setelah itu, ia memanfaatkan sisa waktu untuk mulai mengerjakan *${l2Title}*.`,
        `Di pertemuan kali ini, ${nama} menuntaskan *${l1Title}* lebih awal lalu mulai mempelajari *${l2Title}*. Pada materi pertama, ia ${action1}`,
        `Hari ini, ${nama} berhasil merampungkan *${l1Title}*, yang mana ia ${action1} Selanjutnya, ia langsung mengawali tahap pertama pada *${l2Title}*.`,
        `Pada sesi hari ini, ${nama} menyelesaikan *${l1Title}* sekaligus mencicil bagian awal *${l2Title}*. Selama materi utama, ia ${action1}`,
        `Dalam kelas hari ini, ${nama} menuntaskan seluruh tahapan *${l1Title}*, di mana ia ${action1} Kemudian, ia mulai menyusun bagian pembuka *${l2Title}*.`,
        `Pada pertemuan kali ini, ${nama} menyelesaikan *${l1Title}* dengan lancar dan lanjut membuka materi *${l2Title}*. Di topik pertama, ia ${action1}`
      ];
      return pickVariant(variants, 0, seed);
    }
    if (s.status === 'double') {
      const raw2 = (templateMap && templateMap[s.course] && templateMap[s.course][s.lesson2]) ? templateMap[s.course][s.lesson2] : '';
      const obj2 = l2Obj ? (l2Obj.objectives || []) : [];
      const action2 = raw2
        ? ensurePeriod(extractAction(raw2, nama, sLang, sGender, seed + 1))
        : ensurePeriod(L.fallbackProgress(nama, s.lesson2, localizedCourse, obj2));
      const variants = [
        `Hari ini, ${nama} berhasil menyelesaikan 2 lesson sekaligus (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${nama} ${action1}\n• *${l2Title}*: Selanjutnya, ia ${action2}`,
        `Di pertemuan kali ini, ${nama} menuntaskan 2 materi sekaligus (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: Ia ${action1}\n• *${l2Title}*: Setelah itu, ia ${action2}`,
        `Di kelas hari ini, ${nama} menyelesaikan 2 lesson (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${nama} ${action1}\n• *${l2Title}*: Berikutnya, ia juga ${action2}`,
        `Pada sesi hari ini, ${nama} berhasil merampungkan 2 materi (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: Ia ${action1}\n• *${l2Title}*: Selain itu, ia ${action2}`
      ];
      return pickVariant(variants, 0, seed);
    }
    return '';
  }

  // English (EN) Meeting Summary Variations
  if (s.status === 'done') {
    const variants = isRoblox ? [
      `In today's session, ${nama} completed *${l1Title}*, where ${p.subj} ${action1}`,
      `During today's class, ${nama} finished building and scripting the project for *${l1Title}*. Throughout the session, ${p.subj} ${action1}`,
      `Today, ${nama} achieved all the learning objectives for *${l1Title}*, in which ${p.subj} ${action1}`,
      `In this session, ${nama} completed all steps in *${l1Title}* in Roblox Studio. Along the way, ${p.subj} ${action1}`
    ] : [
      `Today, ${nama} completed *${l1Title}*, where ${p.subj} ${action1}`,
      `In today's class, ${nama} finished the project for *${l1Title}*. During the session, ${p.subj} ${action1}`,
      `Today, ${nama} achieved all the learning goals for *${l1Title}*. Throughout the lesson, ${p.subj} ${action1}`,
      `In this session, ${nama} finished *${l1Title}*, in which ${p.subj} ${action1}`,
      `Today, ${nama} worked through and completed *${l1Title}*. In this lesson, ${p.subj} ${action1}`,
      `In today's lesson, ${nama} successfully wrapped up *${l1Title}*. Along the way, ${p.subj} ${action1}`
    ];
    return pickVariant(variants, 0, seed);
  }
  if (s.status === 'continued_done') {
    const variants = isRoblox ? [
      `In today's session, ${nama} continued and finalized the project for *${l1Title}*, where ${p.subj} ${action1}`,
      `In this class, ${nama} concluded the ongoing Roblox project in *${l1Title}*. Across the lesson, ${p.subj} ${action1}`,
      `During today's lesson, ${nama} completed the final stage of *${l1Title}*, in which ${p.subj} ${action1}`
    ] : [
      `Today, ${nama} finished the project in *${l1Title}* that started last week, where ${p.subj} ${action1}`,
      `In today's lesson, ${nama} completed the remaining part of *${l1Title}*. Across this topic, ${p.subj} ${action1}`,
      `Today, ${nama} resumed *${l1Title}* from our previous session and finished it, in which ${p.subj} ${action1}`,
      `In this session, ${nama} wrapped up the rest of *${l1Title}*. Throughout the lesson, ${p.subj} ${action1}`,
      `Today, ${nama} finalized all remaining steps for *${l1Title}*, where ${p.subj} ${action1}`,
      `In today's class, ${nama} picked up where ${p.subj} left off last week and completed *${l1Title}*. Along the way, ${p.subj} ${action1}`
    ];
    return pickVariant(variants, 0, seed);
  }
  if (s.status === 'in_progress_1' || s.status === 'in_progress') {
    const act = partial1 || action1;
    const variants = [
      `Today, ${nama} started working on *${l1Title}*, where ${p.subj} ${act}`,
      `In today's session, ${nama} began *${l1Title}*. For the first part of the project, ${p.subj} ${act}`,
      `Today, ${nama} was introduced to *${l1Title}* and started the opening stage, in which ${p.subj} ${act}`,
      `In this class, ${nama} began the first meeting for *${l1Title}*. During the session, ${p.subj} ${act}`,
      `Today, ${nama} kicked off the project for *${l1Title}*. In this initial stage, ${p.subj} ${act}`,
      `During today's lesson, ${nama} started exploring *${l1Title}*, where ${p.subj} ${act}`
    ];
    return pickVariant(variants, 0, seed);
  }
  if (s.status === 'in_progress_2') {
    const act = partial1 || action1;
    const variants = [
      `In this second session for *${l1Title}*, ${nama} continued developing ${p.poss} project from last week, where ${p.subj} ${act}`,
      `Today, ${nama} resumed the ongoing project for *${l1Title}*. During this follow-up session, ${p.subj} ${act}`,
      `In today's class, ${nama} entered the second meeting for *${l1Title}* and continued the next stage, in which ${p.subj} ${act}`,
      `During this follow-up lesson on *${l1Title}*, ${nama} built upon last week's progress. Specifically, ${p.subj} ${act}`,
      `Today, ${nama} continued working through the middle phase of *${l1Title}*, where ${p.subj} ${act}`,
      `In this session, ${nama} picked up ${p.poss} ongoing work on *${l1Title}*. Throughout the class, ${p.subj} ${act}`
    ];
    return pickVariant(variants, 0, seed);
  }
  if (s.status === 'one_and_half') {
    const variants = [
      `Today, ${nama} completed *${l1Title}*, where ${p.subj} ${action1} With the remaining time, ${p.subj} also started working on *${l2Title}*.`,
      `In today's class, ${nama} finished *${l1Title}* early and moved on to *${l2Title}*. During the first lesson, ${p.subj} ${action1}`,
      `Today, ${nama} wrapped up *${l1Title}*, in which ${p.subj} ${action1} After finishing that, ${p.subj} got a head start on the first part of *${l2Title}*.`,
      `In this session, ${nama} completed all the steps in *${l1Title}* and began *${l2Title}*. Specifically, ${p.subj} ${action1}`,
      `Today, ${nama} finished *${l1Title}*, where ${p.subj} ${action1} ${p.Subj} then used the extra time in class to begin *${l2Title}*.`,
      `During today's lesson, ${nama} completed *${l1Title}* and started the opening stage of *${l2Title}*. Throughout the main lesson, ${p.subj} ${action1}`
    ];
    return pickVariant(variants, 0, seed);
  }
  if (s.status === 'double') {
    const raw2 = (templateMap && templateMap[s.course] && templateMap[s.course][s.lesson2]) ? templateMap[s.course][s.lesson2] : '';
    const obj2 = l2Obj ? (l2Obj.objectives_en || []) : [];
    const action2 = raw2
      ? ensurePeriod(extractAction(raw2, nama, sLang, sGender, seed + 1))
      : ensurePeriod(L.fallbackProgress(nama, s.lesson2, localizedCourse, obj2));
    const variants = [
      `Today, ${nama} finished 2 lessons (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${nama} ${action1}\n• *${l2Title}*: ${p.Subj} then ${action2}`,
      `In today's session, ${nama} completed 2 lessons (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${p.Subj} ${action1}\n• *${l2Title}*: After that, ${p.subj} ${action2}`,
      `During today's class, ${nama} worked through and finished 2 lessons (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${nama} ${action1}\n• *${l2Title}*: Next, ${p.subj} ${action2}`,
      `In this meeting, ${nama} completed 2 full lessons (*Lesson ${s.lesson}* & *Lesson ${s.lesson2}*):\n\n• *${l1Title}*: ${p.Subj} ${action1}\n• *${l2Title}*: ${p.Subj} also ${action2}`
    ];
    return pickVariant(variants, 0, seed);
  }
  return '';
}

function getStandaloneTeacherNotesPool(lang, nama, p) {
  if (lang === 'id') {
    return {
      done: [
        `Di kelas, ${nama} mengikuti langkah _coding_ dengan runtut dan memperbaiki sendiri _error_ kecil. Di rumah, silakan minta ia menunjukkan _project_ hari ini. Good job, ${nama}!`,
        `${nama} fokus menyusun _code_ dan menguji _project_-nya sampai berjalan lancar. Di pertemuan berikutnya, kita siap lanjut ke materi baru. Keep it up, ${nama}!`,
        `Hari ini, ${nama} aktif bertanya saat mencoba fungsi _code_ baru dan merapikan tampilan _project_-nya. Di rumah, orang tua bisa menanyakan cara kerjanya. Well done, ${nama}!`,
        `Selama sesi, ${nama} menyambungkan setiap blok _code_ sesuai urutan dengan sedikit arahan. Minggu depan ia sudah siap masuk ke materi berikutnya. Nice work, ${nama}!`,
        `${nama} menyimak penjelasan dengan baik dan menambahkan ide kreatifnya pada _project_ hari ini. Di rumah, silakan minta ia memperlihatkan hasil karyanya. Keep it up, ${nama}!`,
        `Di kelas, ${nama} mengecek ulang setiap langkah _code_ dan menyelesaikan bagian yang menantang dengan tenang. Pertemuan depan kita lanjut ke topik baru. Good job, ${nama}!`,
        `${nama} memahami konsep hari ini dengan baik dan langsung menerapkannya hingga _project_ selesai. Di rumah, orang tua bisa mengajak ia bercerita tentang karyanya. Keep it up, ${nama}!`,
        `Selama kelas, ${nama} bekerja dengan tempo yang stabil dan memastikan semua fitur berfungsi sebelum selesai. Minggu depan kita siap masuk ke lesson baru. Well done, ${nama}!`,
        `${nama} memperhatikan arahan dan menulis susunan _code_ secara rapi dari awal sampai akhir. Di rumah, orang tua bisa melihat _project_ yang ia buat hari ini. Good job, ${nama}!`,
        `Saat uji coba, ${nama} menemukan beberapa _bug_ dan berhasil memperbaikinya dengan sedikit panduan. Pemahaman ini menjadi bekal baik untuk minggu depan. Nice work, ${nama}!`,
        `Di kelas, ${nama} aktif mencoba perintah _coding_ baru dan menyelesaikan seluruh tugas _project_ tepat waktu. Di rumah, silakan tanya fitur apa yang ia buat. Keep it up, ${nama}!`,
        `${nama} menata alur logika programnya secara runtut dan memastikan tidak ada langkah yang terlewat. Di pertemuan selanjutnya kita akan lanjut ke topik baru. Good job, ${nama}!`,
        `Selama pembelajaran, ${nama} berlatih menerapkan konsep baru dengan sabar hingga programnya berjalan baik. Di rumah, silakan minta ia mencoba _project_-nya. Well done, ${nama}!`,
        `${nama} menjaga fokusnya saat merakit _code_ dan memeriksa hasil akhirnya dengan teliti. Ia sudah siap melanjutkan ke materi berikutnya pada sesi mendatang. Nice work, ${nama}!`,
        `Di kelas, ${nama} menyelesaikan setiap tahapan _coding_ secara berurutan dan memahami fungsi _code_ yang ditulisnya. Di rumah, silakan tanya cerita belajarnya. Keep it up, ${nama}!`
      ],
      continued_done: [
        `${nama} mengingat kembali alur _code_ minggu lalu dengan baik dan menyelesaikan sisa _project_-nya. Di rumah, silakan minta ia menunjukkan hasil akhirnya. Good job, ${nama}!`,
        `Di kelas, ${nama} langsung melanjutkan bagian yang tersisa dan menguji semua fitur sampai berjalan lancar. Minggu depan kita siap mulai materi baru. Keep it up, ${nama}!`,
        `Hari ini, ${nama} memperbaiki sisa _bug_ dari pertemuan sebelumnya dan merampungkan seluruh bagian _project_. Di rumah, silakan tanya cara kerja _project_-nya. Well done, ${nama}!`,
        `${nama} fokus menyambungkan fitur baru hari ini dengan _code_ yang sudah dibuat minggu lalu. Seluruh tahapan sudah tuntas dan ia siap lanjut ke topik baru. Nice work, ${nama}!`,
        `Selama sesi, ${nama} memeriksa kembali _code_ awalnya dengan teliti lalu menambahkan bagian penutupnya. Di rumah, orang tua bisa melihat hasil _project_ hari ini. Good job, ${nama}!`,
        `${nama} bekerja dengan tenang untuk menuntaskan sisa _project_ dan memastikan setiap interaksi berjalan baik. Pertemuan depan kita siap masuk ke lesson baru. Keep it up, ${nama}!`,
        `Di kelas, ${nama} mengikuti instruksi tahap akhir secara runtut dan merapikan tampilan _project_-nya. Di rumah, silakan minta ia mencoba _project_ tersebut bersama. Well done, ${nama}!`,
        `Hari ini, ${nama} menguji keseluruhan program dari awal hingga akhir dan menyesuaikan detailnya secara mandiri. Minggu depan ia siap mempelajari materi baru. Nice work, ${nama}!`,
        `Setelah mereview singkat progres minggu lalu, ${nama} dapat menyusun bagian akhir _code_ dengan lancar. Di rumah, silakan tanya fitur yang ia tambahkan hari ini. Good job, ${nama}!`,
        `Di kelas, ${nama} sabar memperbaiki bagian akhir _code_ saat uji coba hingga semuanya berjalan baik. Di pertemuan selanjutnya kita siap beralih ke materi baru. Keep it up, ${nama}!`,
        `${nama} menyelesaikan sisa tugas _project_ secara berurutan dan memastikan tidak ada _error_ yang tertinggal. Di rumah, silakan minta ia menunjukkan hasilnya. Well done, ${nama}!`,
        `Selama sesi hari ini, ${nama} menghubungkan _code_ lanjutan dengan rapi dan memeriksa hasil akhirnya. Minggu depan kita bisa langsung masuk ke lesson berikutnya. Good job, ${nama}!`,
        `${nama} cepat mengingat struktur _project_ sebelumnya dan menuntaskan tahap akhir dengan sedikit arahan. Di rumah, silakan tanya bagian mana yang ia sukai. Keep it up, ${nama}!`,
        `Di kelas, ${nama} mengecek setiap fungsi _code_ saat merampungkan tahap penutup _project_ ini. Ia sudah siap untuk lanjut ke topik baru pada sesi mendatang. Nice work, ${nama}!`,
        `Hari ini, ${nama} melengkapi bagian terakhir pada _code_-nya dan melakukan uji coba penuh hingga tuntas. Di rumah, orang tua bisa melihat _project_ yang ia selesaikan. Keep it up, ${nama}!`
      ],
      in_progress_1: [
        `Di kelas, ${nama} menyusun _code_ tahap awal secara bertahap dan teliti. Karena fitur _project_ ini cukup banyak, sisa pengerjaannya dilanjutkan minggu depan. Good effort, ${nama}!`,
        `Hari ini, ${nama} membangun kerangka dasar _project_ dengan rapi. Mengingat tahapan teknisnya cukup panjang, bagian berikutnya kita lanjutkan pertemuan depan. Keep it up, ${nama}!`,
        `${nama} mengerjakan bagian awal _project_ dan menguji setiap langkahnya sebelum lanjut. Sisa fitur pada materi ini akan diteruskan pada sesi berikutnya. Nice work, ${nama}!`,
        `Di kelas, perhatian ${nama} sesekali teralihkan, namun dengan arahan teacher ia berhasil menyelesaikan bagian awal _code_. Sisa _project_ lanjut minggu depan. Keep it up, ${nama}!`,
        `${nama} beberapa kali diingatkan agar tetap fokus pada layar kerja, dan bagian dasar _project_ sudah selesai dibuat. Tahap selanjutnya diteruskan sesi depan. Good effort, ${nama}!`,
        `Dengan pendampingan teacher untuk menjaga fokus pada langkah materi, ${nama} dapat menyusun _code_ pembuka dengan baik. Sisa _project_ dilanjutkan minggu depan. Keep it up, ${nama}!`,
        `Di kelas, ${nama} bekerja dengan tempo santai dan stabil agar memahami setiap instruksi. Bagian awal sudah selesai dan akan dilanjutkan minggu depan. Good job, ${nama}!`,
        `${nama} mengecek setiap langkah dengan perlahan dan teliti saat membangun fondasi _project_ hari ini. Sisa tahapan _coding_ akan diteruskan pertemuan berikutnya. Keep it up, ${nama}!`,
        `Hari ini, ${nama} mengikuti materi dengan ritme yang nyaman dan merampungkan tahap awal secara rapi. Kelanjutan _project_ akan dikerjakan pada sesi mendatang. Nice work, ${nama}!`,
        `Karena materi hari ini mengenalkan logika _coding_ baru, teacher mendampingi ${nama} berlatih bertahap hingga paham. Pengerjaan _project_ lanjut minggu depan. Good effort, ${nama}!`,
        `Di kelas, ${nama} meluangkan waktu memahami cara kerja blok logika baru bersama teacher. Setelah konsep dasarnya jelas, _project_ akan diteruskan sesi depan. Keep it up, ${nama}!`,
        `${nama} belajar memahami alur logika program yang baru dan berhasil menyusun bagian awal _code_-nya. Sisa fitur akan kita lanjutkan di pertemuan berikutnya. Well done, ${nama}!`,
        `${nama} tampak sedikit lelah sepulang sekolah, sehingga ritme belajar disesuaikan saat ia menyelesaikan bagian awal _project_. Sisa materi lanjut minggu depan. Good effort, ${nama}!`,
        `Meski energinya sedikit menurun setelah sekolah, ${nama} tetap mengikuti arahan dan menyelesaikan _code_ pembuka. Tahap berikutnya dilanjutkan pertemuan depan. Keep it up, ${nama}!`,
        `Teacher menyesuaikan tempo belajar hari ini agar ${nama} tetap nyaman menyerap materi tanpa terburu-buru. Bagian awal sudah siap dan lanjut sesi berikutnya. Nice work, ${nama}!`
      ],
      in_progress_2: [
        `Di kelas, ${nama} melanjutkan penambahan fitur utama dan memastikan setiap bagian terhubung baik. Tahap uji coba akhir akan dituntaskan pertemuan depan. Good job, ${nama}!`,
        `${nama} menunjukkan progres yang stabil pada bagian tengah _code_ hari ini. Sebagian besar logika utama sudah siap dan tinggal diselesaikan minggu depan. Keep it up, ${nama}!`,
        `Hari ini, ${nama} menyambungkan beberapa fungsi baru ke _project_ minggu lalu dengan teliti. Tinggal sedikit penyesuaian akhir yang dirampungkan sesi depan. Nice work, ${nama}!`,
        `Dengan arahan untuk tetap fokus pada layar kerja, ${nama} berhasil melanjutkan pembuatan fitur utama _project_ hari ini. Tahap akhirnya kita selesaikan minggu depan. Keep it up, ${nama}!`,
        `Teacher mendampingi ${nama} menjaga fokus selama sesi sehingga bagian inti _code_ dapat disusun dengan baik. Penyelesaian akhir dilanjutkan pertemuan depan. Good effort, ${nama}!`,
        `${nama} menunjukkan progres yang baik saat fokus mengikuti tahapan _coding_, dan sebagian besar _project_ sudah berjalan. Bagian penutupnya kita tuntaskan sesi depan. Keep it up, ${nama}!`,
        `Di kelas, ${nama} mengerjakan tahapan lanjutan dengan tempo yang tenang dan stabil. Sebagian besar _project_ sudah terbentuk dan siap dituntaskan minggu depan. Good job, ${nama}!`,
        `${nama} menguji setiap tambahan _code_ secara perlahan dan teliti saat melanjutkan _project_ hari ini. Sisa detail akhirnya akan diselesaikan pertemuan berikutnya. Keep it up, ${nama}!`,
        `Hari ini, ${nama} menjaga ritme kerja yang nyaman saat menyambung _code_ dari minggu lalu. _Project_ sudah hampir selesai dan akan dirampungkan sesi depan. Nice work, ${nama}!`,
        `Dengan bimbingan bertahap pada bagian logika lanjutan, ${nama} berhasil memperbaiki _error_ sebelumnya. Tahap penyelesaian akhir akan dilanjutkan minggu depan. Good effort, ${nama}!`,
        `Di kelas, ${nama} berlatih melakukan _debugging_ bersama teacher hingga fitur utamanya berjalan. Pengujian akhir _project_ akan kita tuntaskan sesi berikutnya. Keep it up, ${nama}!`,
        `Pemahaman ${nama} terhadap hubungan antar-blok _code_ makin baik hari ini dan mekanisme utamanya sudah berfungsi. Bagian penutup akan diselesaikan sesi depan. Well done, ${nama}!`,
        `Walaupun sedikit lelah sepulang sekolah, ${nama} tetap berusaha melanjutkan _code_ utama dengan progres yang baik. Tahap penyempurnaan akhir lanjut minggu depan. Good effort, ${nama}!`,
        `Teacher menjaga tempo belajar yang nyaman hari ini agar ${nama} tetap bisa melanjutkan _project_ sepulang sekolah. Bagian terakhir dituntaskan pertemuan depan. Keep it up, ${nama}!`,
        `Meski staminanya berkurang setelah sekolah, ${nama} tetap mengikuti sesi dan menghubungkan fitur penting _project_-nya. Tahap akhir dilanjutkan minggu depan. Nice work, ${nama}!`
      ],
      one_and_half: [
        `Di kelas, ${nama} menyelesaikan materi pertama dengan lancar lalu memanfaatkan sisa waktu untuk mulai mengerjakan materi berikutnya. Sisanya lanjut minggu depan. Good job, ${nama}!`,
        `${nama} tetap fokus hingga _project_ pertama tuntas lebih awal, sehingga ia bisa mulai mencicil topik selanjutnya. Pertemuan depan kita lanjutkan sisa _project_-nya. Keep it up, ${nama}!`,
        `Hari ini, ${nama} cepat memahami instruksi dan langsung masuk ke tahap awal materi kedua. Di rumah, orang tua bisa menanyakan _project_ yang ia buat hari ini. Well done, ${nama}!`,
        `${nama} mengerjakan materi pertama secara teliti dengan sedikit bantuan dan sudah memulai bagian awal materi berikutnya. Minggu depan kita tuntaskan _project_ kedua. Nice work, ${nama}!`,
        `Selama sesi, ${nama} menguji _project_ pertamanya sampai berjalan baik sebelum mulai menyusun kerangka materi kedua. Pertemuan depan kita lanjutkan dari tahap ini. Keep it up, ${nama}!`,
        `${nama} mengikuti setiap langkah _coding_ secara berurutan sehingga masih ada waktu untuk mengeksplorasi awal materi baru. Di rumah, silakan lihat hasil karyanya. Good job, ${nama}!`,
        `Di kelas, ${nama} menyelesaikan tantangan di materi pertama dengan tenang dan beralih dengan baik ke materi kedua. Sisa pengerjaannya akan diteruskan sesi depan. Keep it up, ${nama}!`,
        `Hari ini, ${nama} menjaga ritme kerja yang stabil sehingga dapat merampungkan satu _project_ penuh dan membuka materi berikutnya. Minggu depan kita selesaikan sisanya. Well done, ${nama}!`,
        `${nama} cepat beradaptasi saat masuk ke topik kedua dan menyusun _code_ awalnya dengan rapi. Di rumah, silakan minta ia memperlihatkan _project_ yang sudah selesai. Good job, ${nama}!`,
        `Di kelas, ${nama} memperbaiki sendiri _error_ kecil pada _project_ pertama dan mulai mengerjakan materi kedua dengan baik. Kelanjutannya diteruskan minggu depan. Keep it up, ${nama}!`,
        `${nama} menjaga fokusnya dari awal hingga akhir sesi, menuntaskan materi utama hari ini sekaligus memulai lesson berikutnya. Pertemuan depan kita lengkapi sisanya. Nice work, ${nama}!`,
        `Selama pembelajaran, ${nama} menata _code_ _project_ pertama dengan rapi dan membuat langkah awal yang baik di materi kedua. Di rumah, silakan tanya cerita belajarnya. Good job, ${nama}!`,
        `${nama} merampungkan seluruh tugas di materi pertama tepat waktu dan lanjut mencoba bagian pembuka _project_ berikutnya. Minggu depan kita lanjutkan kembali. Keep it up, ${nama}!`,
        `Di kelas, ${nama} menerapkan konsep hari ini dengan baik pada _project_ pertama lalu mulai menyiapkan kerangka materi kedua. Sisa tahapannya berlanjut sesi depan. Well done, ${nama}!`,
        `Hari ini, ${nama} bekerja cukup mandiri saat menuntaskan topik pertama dan mengawali materi selanjutnya. Di rumah, silakan minta ia menceritakan karya hari ini. Keep it up, ${nama}!`
      ],
      double: [
        `Di kelas, ${nama} bekerja teliti dan memperbaiki sendiri susunan _code_ yang kurang tepat di kedua materi. Di rumah, silakan minta ia menunjukkan _project_ hari ini. Good job, ${nama}!`,
        `${nama} tetap fokus sepanjang sesi dan menyelesaikan kedua _project_ dengan rapi tanpa banyak bantuan. Minggu depan kita sudah siap lanjut ke materi baru. Keep it up, ${nama}!`,
        `Hari ini, ${nama} mengikuti tahapan pada kedua materi dengan baik dan menguji setiap _project_ hingga berjalan lancar. Di rumah, silakan tanya tentang karyanya. Well done, ${nama}!`,
        `${nama} memahami instruksi dengan cepat sehingga dapat menuntaskan dua lesson penuh dalam satu pertemuan. Di sesi berikutnya kita akan lanjut ke topik baru. Nice work, ${nama}!`,
        `Di kelas, ${nama} menjaga ritme kerja yang stabil dan menyusun blok _code_ kedua _project_ sesuai urutan. Di rumah, orang tua bisa menanyakan cara kerja _project_-nya. Keep it up, ${nama}!`,
        `Selama sesi berlangsung, ${nama} beralih dari materi pertama ke materi kedua dengan lancar dan menyelesaikan tugas _coding_-nya. Minggu depan kita masuk ke lesson baru. Good job, ${nama}!`,
        `${nama} menyimak penjelasan dengan baik dan langsung menerapkan konsep baru pada kedua _project_ hari ini. Di rumah, silakan minta ia mencoba _project_-nya bersama. Keep it up, ${nama}!`,
        `Hari ini, ${nama} memeriksa _code_-nya secara bertahap di kedua lesson dan memperbaiki _bug_ kecil saat uji coba. Ia sudah siap untuk mengikuti materi minggu depan. Well done, ${nama}!`,
        `Di kelas, ${nama} menata alur kerjanya dengan rapi dan merampungkan seluruh tugas untuk dua materi tepat waktu. Di rumah, silakan tanya _project_ mana yang ia sukai. Good job, ${nama}!`,
        `${nama} menunjukkan fokus dan kemandirian yang baik saat merakit _code_ untuk dua lesson hari ini. Pada pertemuan mendatang kita siap melangkah ke materi berikutnya. Keep it up, ${nama}!`,
        `Selama kelas, ${nama} aktif berdiskusi dan memastikan setiap fitur pada kedua _project_ berfungsi sesuai target. Di rumah, silakan minta ia memperlihatkan hasilnya. Nice work, ${nama}!`,
        `${nama} memanfaatkan waktu kelas dengan efektif hari ini hingga _project_ pertama dan kedua selesai dengan rapi. Pertemuan depan kita akan lanjut ke topik baru. Good job, ${nama}!`,
        `Di kelas, ${nama} mempraktikkan perintah _coding_ baru pada dua materi sekaligus dan mengecek hasil akhirnya. Di rumah, silakan tanya apa saja yang ia pelajari. Keep it up, ${nama}!`,
        `Hari ini, ${nama} menyelesaikan tantangan _coding_ di kedua lesson dengan sabar dan hanya butuh sedikit arahan. Minggu depan ia siap mempelajari topik selanjutnya. Well done, ${nama}!`,
        `${nama} mengikuti alur logika pada kedua materi dengan baik dan menuntaskan dua _project_ dari awal sampai akhir. Di rumah, silakan minta ia menunjukkan karyanya. Keep it up, ${nama}!`
      ]
    };
  }

  return {
    done: [
      `In class, ${nama} followed the steps well and fixed small code errors independently. At home, feel free to ask ${p.obj} to show you today's project. Good job, ${nama}!`,
      `${nama} stayed focused during class and tested ${p.poss} code carefully until it ran smoothly. Next meeting, we are ready to move on to a new topic. Keep it up, ${nama}!`,
      `Today, ${nama} asked good questions about the new blocks and put the project together neatly. At home, you can ask ${p.obj} how today's project works. Well done, ${nama}!`,
      `In class, ${nama} connected each part of the code in the right order with little help. ${p.Subj} is ready to continue to the next lesson next week. Nice work, ${nama}!`,
      `${nama} paid attention to the instructions and added ${p.poss} own creative ideas to the project. At home, feel free to ask ${p.obj} to show you what we built. Keep it up, ${nama}!`,
      `During class, ${nama} checked ${p.poss} code step by step and solved the tricky parts calmly. Next week, we will move on to the next lesson. Good job, ${nama}!`,
      `${nama} understood today's coding concept well and applied it directly to finish the project. At home, you can ask ${p.obj} to tell you about today's work. Nice effort, ${nama}!`,
      `In class, ${nama} worked at a steady pace and made sure every feature worked before wrapping up. We are ready for a new topic next session. Keep up the good work, ${nama}!`,
      `${nama} listened carefully to the explanation and wrote the code neatly from start to finish. At home, feel free to ask ${p.obj} to try the project with you. Well done, ${nama}!`,
      `Today, ${nama} spotted a few bugs during testing and corrected them with minimal guidance. ${p.Subj} has a good grasp of this topic for next week. Good work, ${nama}!`,
      `In class, ${nama} tried the new coding commands actively and completed all project tasks on time. At home, you can ask ${p.obj} what ${p.subj} created today. Keep it up, ${nama}!`,
      `${nama} organized ${p.poss} workspace neatly and followed the logic flow from beginning to end. Next meeting, we will build on this in a new lesson. Good job, ${nama}!`,
      `During the lesson, ${nama} practiced the new steps patiently until the program responded properly. At home, feel free to ask ${p.obj} to show you today's result. Nice work, ${nama}!`,
      `${nama} showed good focus while assembling the code and tested the final output carefully. ${p.Subj} is ready to start the next lesson at our next meeting. Well done, ${nama}!`,
      `In class, ${nama} completed each coding task in sequence and explained how ${p.poss} project worked. At home, you can ask ${p.obj} to share what we learned today. Keep it up, ${nama}!`
    ],
    continued_done: [
      `${nama} remembered last week's logic well and connected the remaining code to finish the project. At home, feel free to ask ${p.obj} to show you the result. Good job, ${nama}!`,
      `In class, ${nama} picked up right where ${p.subj} left off and tested every feature until it ran smoothly. Next week, we are ready to start a new lesson. Keep it up, ${nama}!`,
      `Today, ${nama} fixed the remaining bugs from our previous session and completed all parts of the project. At home, you can ask ${p.obj} how the project works. Well done, ${nama}!`,
      `${nama} stayed focused while combining today's new features with last week's code. Everything is complete, and ${p.subj} is ready for the next topic. Nice work, ${nama}!`,
      `During class, ${nama} reviewed ${p.poss} earlier code carefully and added the final steps with little help. At home, feel free to ask ${p.obj} to show you today's work. Good job, ${nama}!`,
      `${nama} worked steadily to finish the rest of the project and checked that all interactions worked properly. Next meeting, we will move on to a new topic. Keep it up, ${nama}!`,
      `In class, ${nama} followed the final instructions step by step and wrapped up the project neatly. At home, you can ask ${p.obj} to try the finished project with you. Nice effort, ${nama}!`,
      `Today, ${nama} tested the full program from start to finish and adjusted a few details independently. ${p.Subj} is ready to begin the next lesson next week. Well done, ${nama}!`,
      `${nama} connected the final code blocks smoothly after a quick review of last week's progress. At home, feel free to ask ${p.obj} about the features ${p.subj} added today. Good work, ${nama}!`,
      `In class, ${nama} showed good patience while troubleshooting the last part of the code until it worked. We are ready to start a new lesson next session. Keep it up, ${nama}!`,
      `${nama} completed the remaining project tasks in order and made sure no errors were left behind. At home, you can ask ${p.obj} to demonstrate today's finished work. Good job, ${nama}!`,
      `During today's session, ${nama} linked the new code with ${p.poss} previous work and verified the final output. Next meeting, we can move forward to the next lesson. Keep it up, ${nama}!`,
      `${nama} recalled the project structure quickly and finished the closing steps with minimal guidance. At home, feel free to ask ${p.obj} what ${p.subj} enjoyed building. Nice work, ${nama}!`,
      `In class, ${nama} checked each function carefully as ${p.subj} completed the final stage of the project. ${p.Subj} is well prepared for our new topic next week. Well done, ${nama}!`,
      `Today, ${nama} put the finishing touches on ${p.poss} code and ran a full test to confirm everything worked. At home, you can ask ${p.obj} to show you the project. Keep it up, ${nama}!`
    ],
    in_progress_1: [
      `In class, ${nama} built the initial code step by step with close attention to detail. Since this project has many features, we will continue the rest next week. Good effort, ${nama}!`,
      `${nama} set up the main structure of the project carefully today. Because there are several technical steps involved, ${p.subj} will continue the next part next class. Keep it up, ${nama}!`,
      `Today, ${nama} worked on the core setup and tested each part before moving forward. We will continue building the remaining features in the next session. Nice work, ${nama}!`,
      `In class, ${nama} was curious about the tools, and with reminders to stay on the coding tab, ${p.subj} finished the initial setup. We will continue next week. Keep it up, ${nama}!`,
      `${nama} needed a few gentle prompts to keep ${p.poss} focus on the screen today, and ${p.subj} completed the starting code well. The rest of the project continues next session. Good effort, ${nama}!`,
      `With teacher guidance to stay focused on the current step, ${nama} put together the first part of the project. We will continue the remaining tasks next meeting. Nice try today, ${nama}!`,
      `In class, ${nama} worked at a calm, steady pace to make sure ${p.subj} understood each instruction. The first half is ready, and we will continue next week. Keep it up, ${nama}!`,
      `${nama} took ${p.poss} time checking each step carefully as ${p.subj} built the foundation of the project. We will pick up the remaining steps in our next meeting. Good job, ${nama}!`,
      `Today, ${nama} followed the lesson at a comfortable rhythm and completed the opening stage neatly. The rest of the project will be continued next class. Nice work, ${nama}!`,
      `Because today's lesson introduced new coding logic, we practiced it step by step until ${nama} understood the flow. We will continue the project next week. Good effort, ${nama}!`,
      `In class, ${nama} took time to learn how the new code blocks work with teacher guidance. Now that the basics are clear, ${p.subj} will continue the project next session. Keep it up, ${nama}!`,
      `${nama} practiced breaking down the new logic rules today and built the first part of the code. We will continue applying this in our next meeting. Well done, ${nama}!`,
      `${nama} seemed a bit tired after school today, so we adjusted the pace while ${p.subj} completed the initial project setup. We will continue the rest next week. Good effort, ${nama}!`,
      `Even with lower energy after school, ${nama} followed along and finished the starting section of the code. We will continue the remaining steps next meeting. Keep it up, ${nama}!`,
      `We kept a comfortable learning pace today so ${nama} could absorb the material without feeling rushed. The project is off to a good start and continues next class. Nice work, ${nama}!`
    ],
    in_progress_2: [
      `In class, ${nama} continued adding the main features and checked that each part worked together. Final testing and polish will wrap up in our next meeting. Good job, ${nama}!`,
      `${nama} made steady progress on the middle part of the code today. The main logic is now in place, and ${p.subj} will finish the remaining steps next week. Keep it up, ${nama}!`,
      `Today, ${nama} connected several new functions to last week's project carefully. Only the final adjustments remain for our next session. Nice work, ${nama}!`,
      `With reminders to stay focused on the workspace, ${nama} continued building the main features of the project today. We will wrap up the final stage next week. Keep it up, ${nama}!`,
      `In class, the teacher helped keep ${nama} on track whenever ${p.poss} attention drifted, allowing ${p.obj} to finish the core code. Final completion is set for next meeting. Good effort, ${nama}!`,
      `${nama} made good progress once ${p.subj} focused on the coding steps, getting the main features working. We will finish the last part in our next class. Nice effort, ${nama}!`,
      `In class, ${nama} worked through the follow-up steps at a comfortable, steady pace. The main part of the project is ready, and ${p.subj} will complete it next week. Good job, ${nama}!`,
      `${nama} took time to test each addition carefully as ${p.subj} continued the project today. The remaining details will be finished in our next session. Keep it up, ${nama}!`,
      `Today, ${nama} maintained a calm work rhythm while building on last week's code. The project is nearly done and will wrap up next meeting. Nice work, ${nama}!`,
      `With step-by-step guidance on the harder logic sections, ${nama} resolved earlier errors and moved the project forward. We will finish the final part next week. Good effort, ${nama}!`,
      `In class, ${nama} practiced debugging the multi-step code with the teacher and got the main features running. Final testing will continue in our next session. Keep it up, ${nama}!`,
      `${nama} gained a better grasp of how the code connects today and completed the core mechanics. The closing steps will be wrapped up next meeting. Well done, ${nama}!`,
      `Although ${nama} was a bit tired after school, ${p.subj} kept working on the main code and made solid progress. We will finish the final touches next week. Good effort, ${nama}!`,
      `We kept a supportive pace today so ${nama} could continue building the project comfortably after school. The last stage will be completed next session. Keep it up, ${nama}!`,
      `Even with lower energy today, ${nama} stayed engaged and connected the key features of ${p.poss} project. Final testing and wrap-up will continue next class. Nice work, ${nama}!`
    ],
    one_and_half: [
      `In class, ${nama} finished the first lesson smoothly and used the remaining time to start the next project. We will continue the rest of it next week. Good job, ${nama}!`,
      `${nama} stayed focused and completed the first project early, giving ${p.obj} time to begin the next topic. Next meeting, ${p.subj} will continue building it. Keep it up, ${nama}!`,
      `Today, ${nama} understood the instructions quickly and moved right into the opening steps of the second lesson. At home, you can ask ${p.obj} about today's projects. Well done, ${nama}!`,
      `${nama} worked carefully through the first lesson with little help and got a good head start on the next one. We will wrap up the second project next class. Nice work, ${nama}!`,
      `During class, ${nama} tested ${p.poss} first project carefully before starting the initial setup for the next lesson. Next week, we will continue from where ${p.subj} left off. Keep it up, ${nama}!`,
      `${nama} followed each coding step in order, allowing extra time to explore the beginning of the next topic. At home, feel free to ask ${p.obj} what ${p.subj} built today. Good job, ${nama}!`,
      `In class, ${nama} solved the coding tasks in the first lesson calmly and transitioned smoothly into the second lesson. We will finish the remaining part next session. Nice effort, ${nama}!`,
      `Today, ${nama} kept a steady work pace, finishing one full project and setting up the foundation for the next. ${p.Subj} will complete the rest in our next meeting. Well done, ${nama}!`,
      `${nama} adapted quickly when we introduced the second topic and completed its starting code neatly. At home, you can ask ${p.obj} to show you today's finished project. Good work, ${nama}!`,
      `In class, ${nama} fixed small code errors independently on the first project and began the next lesson with confidence. We will continue the second project next week. Keep it up, ${nama}!`,
      `${nama} showed good focus from start to finish, wrapping up today's main lesson and starting the next one. Next meeting, we will complete the remaining features. Good job, ${nama}!`,
      `During the session, ${nama} organized ${p.poss} code neatly on the first project and made a solid start on the second topic. At home, feel free to ask ${p.obj} about today's class. Nice work, ${nama}!`,
      `${nama} completed all tasks for the first lesson on time and eagerly started the opening part of the next project. We will pick it up again next week. Keep up the good work, ${nama}!`,
      `In class, ${nama} applied today's concepts well to finish the first project and began setting up the next lesson. The remaining steps will continue next session. Well done, ${nama}!`,
      `Today, ${nama} worked with good independence to finish the first topic and start the next one. At home, you can ask ${p.obj} to explain what we created today. Keep it up, ${nama}!`
    ],
    double: [
      `In class, ${nama} worked carefully and fixed any code errors independently across both lessons. At home, you can ask ${p.obj} to show you what we built today. Good job, ${nama}!`,
      `${nama} stayed focused throughout the session and completed both projects neatly with little help. Next week, we are ready to move on to the next lesson. Keep it up, ${nama}!`,
      `Today, ${nama} followed the steps for both topics well and tested each project to make sure it ran smoothly. At home, feel free to ask ${p.obj} about today's work. Well done, ${nama}!`,
      `${nama} understood the instructions quickly, allowing ${p.obj} to finish two full lessons in one session. Next meeting, we will continue with a new topic. Nice work, ${nama}!`,
      `In class, ${nama} kept a steady pace and connected the code blocks for both projects in the right order. At home, you can ask ${p.obj} how today's projects work. Keep it up, ${nama}!`,
      `During the session, ${nama} transitioned smoothly from the first topic to the second and solved the coding tasks calmly. We are ready for the next lesson next week. Good job, ${nama}!`,
      `${nama} paid close attention to the explanations and applied the new concepts directly in both projects. At home, feel free to ask ${p.obj} to try the projects with you. Nice effort, ${nama}!`,
      `Today, ${nama} checked ${p.poss} code step by step on both lessons and corrected small bugs during testing. ${p.Subj} is well prepared for next week's topic. Well done, ${nama}!`,
      `In class, ${nama} organized ${p.poss} workspace neatly and finished all tasks for both lessons on time. At home, you can ask ${p.obj} which project ${p.subj} enjoyed building today. Good work, ${nama}!`,
      `${nama} showed good focus and independence while putting together the code for two lessons today. Next session, we will move forward to a new lesson. Keep up the good work, ${nama}!`,
      `During class, ${nama} asked helpful questions and made sure every feature in both projects worked properly. At home, feel free to ask ${p.obj} to show you today's results. Good job, ${nama}!`,
      `${nama} managed ${p.poss} class time well today, completing the first project and wrapping up the second one neatly. We will continue with the next topic next meeting. Keep it up, ${nama}!`,
      `In class, ${nama} practiced the new coding commands across two lessons and verified the output of each project. At home, you can ask ${p.obj} what ${p.subj} learned today. Nice work, ${nama}!`,
      `Today, ${nama} worked through the coding challenges in both lessons patiently and finished them with minimal guidance. ${p.Subj} is ready for our next topic next week. Well done, ${nama}!`,
      `${nama} followed the logic flow of both lessons clearly and completed the two projects from start to finish. At home, feel free to ask ${p.obj} to demonstrate today's projects. Keep it up, ${nama}!`
    ]
  };
}

function buildTeacherNotes(idx, seed = 0) {
  const s = autoStudents[idx];
  if (!s) return '';
  const sLang = s.lang || autoLang;
  const sGender = s.gender || inferGenderFromName(s.nama);
  const p = getPronouns(sLang, sGender);
  const nama = (s.nama && s.nama.trim()) ? s.nama.trim() : (sLang === 'id' ? 'Siswa' : 'Student');
  const pool = getStandaloneTeacherNotesPool(sLang, nama, p);
  const statusKey = (s.status === 'in_progress') ? 'in_progress_1' : (s.status || 'done');
  const list = pool[statusKey] || pool.done;
  return pickVariant(list, 0, seed);
}

function buildStudentSplitResult(idx, seed) {
  return {
    summary: buildMeetingSummary(idx, seed),
    notes: buildTeacherNotes(idx, seed)
  };
}

function pickRandomSummarySeed(idx) {
  const s = autoStudents[idx];
  const currentVal = (s && s.summary) ? s.summary.trim() : '';
  const usedSeeds = new Set();
  autoStudents.forEach((other, j) => {
    if (j !== idx && other && other.summarySeed !== undefined) {
      usedSeeds.add(other.summarySeed % 6);
    }
  });
  const candidates = [0, 1, 2, 3, 4, 5];
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const cand of candidates) {
    if (usedSeeds.has(cand)) continue;
    const res = buildMeetingSummary(idx, cand);
    if (res && res.trim() !== currentVal) return cand;
  }
  for (const cand of candidates) {
    const res = buildMeetingSummary(idx, cand);
    if (res && res.trim() !== currentVal) return cand;
  }
  return candidates[0];
}

function pickRandomNotesSeed(idx, preferContext = false) {
  const s = autoStudents[idx];
  const currentVal = (s && s.notes) ? s.notes.trim() : '';
  const usedSeeds = new Set();
  autoStudents.forEach((other, j) => {
    if (j !== idx && other && other.notesSeed !== undefined) {
      usedSeeds.add(other.notesSeed % 15);
    }
  });

  const shuffle = (arr) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let candidates = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  const isProg = s && (s.status === 'in_progress_1' || s.status === 'in_progress_2' || s.status === 'in_progress');
  if (isProg && preferContext) {
    const ctxMap = { detail: [0, 1, 2], focus: [3, 4, 5], pace: [6, 7, 8], logic: [9, 10, 11], tired: [12, 13, 14] };
    const primary = shuffle(ctxMap[s.context || 'detail'] || [0, 1, 2]);
    const rest = candidates.filter(c => !primary.includes(c));
    candidates = primary.concat(rest);
  }

  for (const cand of candidates) {
    if (usedSeeds.has(cand)) continue;
    const res = buildTeacherNotes(idx, cand);
    if (res && res.trim() !== currentVal) return cand;
  }
  for (const cand of candidates) {
    const res = buildTeacherNotes(idx, cand);
    if (res && res.trim() !== currentVal) return cand;
  }
  return candidates[0];
}

function autoGenerateSummary(idx, pickNewRandom = false, alsoRefreshNotes = false) {
  syncStudentFromDOM(idx);
  const s = autoStudents[idx];
  if (!s) return false;
  if (!s.genderManual && s.nama) {
    s.gender = inferGenderFromName(s.nama);
  }
  if (s.course && s.lesson && !((s.status === 'double' || s.status === 'one_and_half') && !s.lesson2)) {
    if (pickNewRandom || s.summarySeed === undefined) {
      s.summarySeed = pickRandomSummarySeed(idx);
    }
    const sumText = buildMeetingSummary(idx, s.summarySeed);
    if (sumText) {
      s.summary = sumText;
      const sumEl = document.getElementById(`auto-summary-${idx}`);
      if (sumEl) sumEl.value = s.summary;
    }
  }

  if (alsoRefreshNotes && s.notesSeed !== undefined && s.notes) {
    const noteText = buildTeacherNotes(idx, s.notesSeed);
    if (noteText) {
      s.notes = noteText;
      const noteEl = document.getElementById(`auto-notes-${idx}`);
      if (noteEl) noteEl.value = s.notes;
      updateNotesCounter(idx);
    }
  }

  const cleanSummary = (s.summary || '').trim();
  const cleanNotes = (s.notes || '').trim();
  s.progress = cleanSummary && cleanNotes ? `${cleanSummary}\n\n${cleanNotes}` : (cleanSummary || cleanNotes);
  autoUpdateTable();
  return true;
}

function updateGenderToggleUI(idx) {
  const s = autoStudents[idx];
  if (!s) return;
  const g = s.gender || 'm';
  const btnM = document.getElementById(`auto-gender-m-${idx}`);
  const btnF = document.getElementById(`auto-gender-f-${idx}`);
  if (btnM) btnM.classList.toggle('active', g === 'm');
  if (btnF) btnF.classList.toggle('active', g === 'f');
}

function setStudentGender(idx, gender) {
  if (!autoStudents[idx]) return;
  syncStudentFromDOM(idx);
  autoStudents[idx].gender = gender;
  autoStudents[idx].genderManual = true;
  updateGenderToggleUI(idx);
  autoGenerateSummary(idx, false, true);
}

function onStudentNameInput(idx, val) {
  if (!autoStudents[idx]) return;
  autoStudents[idx].nama = val;
  if (!autoStudents[idx].genderManual) {
    autoStudents[idx].gender = inferGenderFromName(val);
    updateGenderToggleUI(idx);
  }
  if ((autoStudents[idx].course && autoStudents[idx].lesson) || autoStudents[idx].notesSeed !== undefined) {
    autoGenerateSummary(idx, false, true);
  } else {
    autoUpdateTable();
  }
}

function generateTeacherNotes(idx) {
  syncStudentFromDOM(idx);
  const s = autoStudents[idx];
  const sLang = s.lang || autoLang;
  const L = LANG_UI[sLang];

  if (!s.nama || !s.nama.trim()) { toast(L.errName, 'error'); return; }
  if (!s.course) { toast(L.errCourse, 'error'); return; }
  if (!s.lesson) {
    if (typeof COURSE_DATA !== 'undefined' && COURSE_DATA[s.course] && COURSE_DATA[s.course].length === 0) {
      toast(sLang === 'id' ? 'Course ini belum memiliki data lesson otomatis. Silakan tulis progress langsung di kotak teks.' : 'This course has no automated lessons yet. Please write progress directly in the text area.', 'error');
      return;
    }
    toast(L.errLesson, 'error'); return;
  }
  if ((s.status === 'double' || s.status === 'one_and_half') && !s.lesson2) { toast(L.errLesson2, 'error'); return; }

  if (!s.genderManual && s.nama) {
    s.gender = inferGenderFromName(s.nama);
    updateGenderToggleUI(idx);
  }

  // Ensure Meeting Summary is populated if empty, without changing an already-generated summary
  if (!s.summary || s.summarySeed === undefined) {
    autoGenerateSummary(idx, true, false);
  }

  // Independently pick a random Teacher Notes variant out of the 15 standalone variations
  s.notesSeed = pickRandomNotesSeed(idx, true);
  const noteText = buildTeacherNotes(idx, s.notesSeed);
  if (noteText) {
    s.notes = noteText;
    const noteEl = document.getElementById(`auto-notes-${idx}`);
    if (noteEl) noteEl.value = s.notes;
    updateNotesCounter(idx);
  }

  const cleanSummary = (s.summary || '').trim();
  const cleanNotes = (s.notes || '').trim();
  s.progress = cleanSummary && cleanNotes ? `${cleanSummary}\n\n${cleanNotes}` : (cleanSummary || cleanNotes);
  autoUpdateTable();
  toast(L.toastGenerated, 'success');
}

function generateProgress(idx) {
  return generateTeacherNotes(idx);
}
function _legacyGenerateProgress_unused(idx) {
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
    result = (L.inProgress1Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson, s.course, action1);
  } else if (s.status === 'in_progress_2') {
    result = (L.inProgress2Text || L.inProgressText)(s.nama, s.lesson, l1Title, l1Obj ? (sLang === 'en' && l1Obj.objectives_en ? l1Obj.objectives_en : (sLang === 'en' ? [] : l1Obj.objectives)) : [], s.context || 'detail', idx, s.lesson, s.course, action1);
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
  autoGenerateSummary(idx, false, true);
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
        <input type="text" id="auto-name-${i}" placeholder="${L.studentPlaceholder}" value="${escHtml(s.nama)}" oninput="onStudentNameInput(${i},this.value)">
        <div class="student-lang-toggle" title="Pronoun (He / She)">
          <button type="button" id="auto-gender-m-${i}" class="student-lang-btn ${(s.gender||inferGenderFromName(s.nama))==='m'?'active':''}" onclick="setStudentGender(${i},'m')">He</button>
          <button type="button" id="auto-gender-f-${i}" class="student-lang-btn ${(s.gender||inferGenderFromName(s.nama))==='f'?'active':''}" onclick="setStudentGender(${i},'f')">She</button>
        </div>
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
          <button type="button" class="btn-generate" onclick="generateTeacherNotes(${i})" style="margin-top:4px;">${L.generateBtn}</button>
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
    if(!s.nama && !s.progress && !s.criteria && !s.course && !s.lesson) return;

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
  if (tbody && !tbody.children.length) {
    const emptyHint = autoLang === 'id'
      ? 'Data & laporan progress siswa akan tampil di sini setelah Anda mengisi nama siswa dan klik Generate...'
      : 'Student learning progress will appear here once you enter a student name and click Generate...';
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'rpt-student-card';
    emptyDiv.innerHTML = `
      <div class="card-status-col">
        <div class="timeline-node"><span class="timeline-dot dot-done"></span></div>
      </div>
      <div class="card-name-col">
        <span class="student-name-text"><em style="color:#94a3b8">—</em></span>
      </div>
      <div class="card-lesson-col">
        <span class="lesson-pill" style="opacity:0.6;">—</span>
      </div>
      <div class="card-progress-col">
        <em style="color:#94a3b8">${emptyHint}</em>
      </div>
    `;
    tbody.appendChild(emptyDiv);
    fitPreviewScale();
  }
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
    const plainText = stripItalicMarkers((s.progress||'—').replace(/\*/g,''));
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

  // Init auto tab with 1 empty student card by default
  autoStudents = [
    {nama:'',summary:'',notes:'',progress:'',criteria:'',course:'',lesson:'',lesson2:'',status:'done',context:'detail',lang:'en'}
  ];
  setLang('en');
  autoUpdatePreview();
  isAutoFit = true;
  const kelasInput = document.getElementById('auto-kelas');
  if (kelasInput) kelasInput.value = '';
  fitPreviewScale();
  setTimeout(fitPreviewScale, 100);
  setTimeout(fitPreviewScale, 300);

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
