// ============================================================
// EXAM REPORT GENERATOR (LMS Student Progress Report)
// Timedoor Academy 8-Lesson Cycle Exam & Progress Report
// ============================================================

// Safe HTML Escape
const esc = (typeof escHtml === 'function')
  ? escHtml
  : (s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));

function showToast(msg, type = 'info') {
  if (typeof toast === 'function') {
    toast(msg, type);
  } else {
    console.log(`[Toast ${type}]: ${msg}`);
  }
}

// Global default language for Exam Report
let examLang = 'id';

// Helper to normalize course names
function normalizeCourseName(c) {
  return String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Known course total lesson counts (fallback if COURSE_DATA not loaded)
const KNOWN_COURSE_LESSONS = {
  '3danimator': 24,
  'websitedesigner': 16,
  'virtualworldmaker': 24,
  'littleprogrammer': 24,
  'codingexplorer': 32,
  'techexplorer': 24,
  'gamedeveloper': 24,
  'codeanddesignwithroblox': 24,
  'interactivemechanicsonroblox': 24,
  'fullstackprogrammingonroblox': 24,
  'advancedluaprogrammingonroblox': 24,
  'pythoncoder': 16,
  'pythongamedeveloper': 16,
  'pythonforai': 16,
  'iotrobotic2024': 16,
  'iotsmartcity': 24,
  'teensprogrammer': 24,
  'javascriptdeveloper': 16,
  'webdeveloperteens': 24,
  'androiddeveloper': 16,
  'pythonfordatascience': 16,
  'aimachinelearning': 16,
  'aicomputervision': 16,
  'teensdesignbasic': 16,
  'branding': 24,
  'kidsanimationbasic': 32,
  'teensanimation': 24,
  'advancedanimation': 24,
  'uiux': 24,
  'basicwebsite': 16,
  'websitedevelopment': 16,
  'frontenddevelopment': 32,
  'backenddevelopment': 32,
  'mobileappdevelopment': 48,
  'aidevelopment': 48
};

// Grade conversion according to Timedoor rubric:
// A: 86 - 100 (Very Good / Sangat Baik)
// B: 75 - 85  (Good / Baik)
// C: 60 - 74  (Fair / Cukup)
// D: 50 - 59  (Bad / Kurang)
// E: <= 49    (Fail / Perlu Pengulangan)
function calculateGrade(score) {
  const s = parseFloat(score);
  if (isNaN(s)) {
    return { grade: '—', label: '—', label_id: '—', color: '#94a3b8', bg: '#f1f5f9', border: '#cbd5e1' };
  }
  if (s >= 86) {
    return { grade: 'A', label: 'Very Good', label_id: 'Sangat Baik', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  } else if (s >= 75) {
    return { grade: 'B', label: 'Good', label_id: 'Baik', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  } else if (s >= 60) {
    return { grade: 'C', label: 'Fair', label_id: 'Cukup', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  } else if (s >= 50) {
    return { grade: 'D', label: 'Bad', label_id: 'Kurang', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
  } else {
    return { grade: 'E', label: 'Fail', label_id: 'Perlu Pengulangan', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  }
}

// Generate report periods based on course curriculum
function getCoursePeriods(courseName) {
  const norm = normalizeCourseName(courseName);

  // Special single report cases (only 1x in meeting 16):
  // Python Game Developer (Kids) & Android Developer (Teens)
  if (norm.includes('pythongame') || (norm.includes('android') && !norm.includes('mobileapp'))) {
    return [
      { id: 'report_1', label: 'Report 1 (Lesson 1 - 16)', label_id: 'Rapor 1 (Lesson 1 - 16)', from: 1, to: 16 }
    ];
  }

  let totalLessons = 24;
  if (typeof COURSE_DATA !== 'undefined' && COURSE_DATA[courseName] && COURSE_DATA[courseName].length > 0) {
    totalLessons = COURSE_DATA[courseName].length;
  } else if (KNOWN_COURSE_LESSONS[norm]) {
    totalLessons = KNOWN_COURSE_LESSONS[norm];
  }

  const cycle = 8;
  const count = Math.max(1, Math.ceil(totalLessons / cycle));
  const periods = [];

  for (let i = 1; i <= count; i++) {
    const from = (i - 1) * cycle + 1;
    const to = Math.min(i * cycle, totalLessons);
    periods.push({
      id: `report_${i}`,
      label: `Report ${i} (Lesson ${from} - ${to})`,
      label_id: `Rapor ${i} (Lesson ${from} - ${to})`,
      from,
      to
    });
  }

  return periods;
}

// Helper to get all learning objectives for a specific period
function getPeriodCurriculumDetails(course, from, to, lang = 'id') {
  const cData = typeof COURSE_DATA !== 'undefined' ? COURSE_DATA[course] : null;
  if (!cData) return { allObjectivesList: [], lessonTitles: [] };
  
  const allObjectivesList = [];
  const lessonTitles = [];

  for (let i = from; i <= to; i++) {
    const lData = cData.find(l => l.num === i);
    if (lData) {
      let t = lData.title || `Lesson ${i}`;
      t = t.replace(/^Lesson\s*\d+\s*[-:]?\s*/i, '').trim();
      
      const objs = (lang === 'en' && lData.objectives_en && lData.objectives_en.length > 0) 
        ? lData.objectives_en 
        : (lData.objectives || []);
        
      if (objs.length > 0) {
        allObjectivesList.push({
          num: i,
          title: t,
          objectives: objs
        });
      }
      lessonTitles.push(t);
    }
  }

  return { allObjectivesList, lessonTitles };
}

// Get dynamic categories for a course and report period
function getCourseCategories(courseName, periodId = 'report_1') {
  const norm = normalizeCourseName(courseName);

  // 1. Website Designer (Junior) - 4 categories
  if (norm.includes('websitedesigner')) {
    return [
      { key: 'comp_lit', name: 'Computer & Literacy Concept' },
      { key: 'code_prac', name: 'Coding Concept & Practice' },
      { key: 'creative', name: 'Creativity' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 2. 3D ANIMATOR (Junior)
  if (norm.includes('3danimator')) {
    return [
      { key: 'comp_lit', name: 'Computer & Literacy Concept' },
      { key: 'code_prac', name: 'Coding Concept & Practice' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 3. Virtual World Maker & Little Programmer (Junior)
  if (norm.includes('virtualworld') || norm.includes('littleprogrammer')) {
    return [
      { key: 'code_lit', name: 'Coding and Literacy Concept' },
      { key: 'code_app', name: 'Coding Application' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 4. Code & Design with Roblox (Kids)
  if (norm.includes('codeanddesignwithroblox') || norm.includes('codedesignroblox') || (norm.includes('roblox') && norm.includes('design'))) {
    if (periodId === 'report_1') {
      return [
        { key: 'design_prac', name: 'Design Concepts & Practice' },
        { key: 'code_prac', name: 'Coding Concepts & Practice' },
        { key: 'char', name: 'Character' }
      ];
    }
    return [
      { key: 'dig_lit', name: 'Digital & Studio Literacy' },
      { key: 'design_prac', name: 'Design Concepts & Practice' },
      { key: 'code_prac', name: 'Coding Concepts & Practice' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 5. Other Roblox Courses: Interactive Mechanics, Full Stack, Advanced Lua
  if (norm.includes('roblox')) {
    return [
      { key: 'design_prac', name: 'Design Concepts & Practice' },
      { key: 'code_prac', name: 'Coding Concepts & Practice' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 6. Tech Explorer (Kids)
  if (norm.includes('techexplorer')) {
    return [
      { key: 'code_lit', name: 'Coding Literacy and Concept' },
      { key: 'code_dig', name: 'Coding & Digital Creation' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 7. Teens Websites Developer / Web Developer Teens, Python for Data Science, AI Machine Learning, AI Computer Vision
  if (norm.includes('webdeveloper') || norm.includes('datascience') || norm.includes('machinelearning') || norm.includes('computervision')) {
    return [
      { key: 'concept', name: 'Coding Concept' },
      { key: 'code_app', name: 'Coding Application' },
      { key: 'char', name: 'Character' }
    ];
  }

  // 8. Standard Kids & Teens Courses (Coding Explorer, Game Developer, Python Coder, Python Game Developer, Python for AI, Teens Programmer, JavaScript Developer, Android Developer, etc.)
  return [
    { key: 'code_lit', name: 'Coding Literacy and Concept' },
    { key: 'code_app', name: 'Coding Application' },
    { key: 'char', name: 'Character' }
  ];
}

// ============================================================
// TEACHER'S NOTE TEMPLATE ENGINE (offline, tanpa AI API)
// ------------------------------------------------------------
// Score tiers (1 template per tier, per category, ID & EN):
//   C1: <= 67 (incl. D/E)   C2: 68-74
//   B1: 75-78   B2: 79-82   B3: 83-85
//   A1: 86-90   A2: 91-95   A3: 96-100
// Variasi saat Generate/Regenerate berasal dari: pemilihan topik
// lesson secara acak, tips sesuai level, penutup acak, dan
// kalibrasi panjang otomatis (350-500 karakter).
// Tokens: {N}/{n} subject (nama / You / Kamu), {cN} ", Nama" di penutup,
// {course}, {range}, {topics}, {projects}, {exam}, {score}, {tip}, {close}
// ============================================================

const NOTE_MIN_CHARS = 350;
const NOTE_MAX_CHARS = 500;

const NOTE_TIERS = [
  { id: 'C1', band: 'C', min: 0, max: 67 },
  { id: 'C2', band: 'C', min: 68, max: 74 },
  { id: 'B1', band: 'B', min: 75, max: 78 },
  { id: 'B2', band: 'B', min: 79, max: 82 },
  { id: 'B3', band: 'B', min: 83, max: 85 },
  { id: 'A1', band: 'A', min: 86, max: 90 },
  { id: 'A2', band: 'A', min: 91, max: 95 },
  { id: 'A3', band: 'A', min: 96, max: 100 }
];

function getScoreTier(score) {
  const s = Math.round(parseFloat(score));
  if (isNaN(s)) return NOTE_TIERS[4];
  return NOTE_TIERS.find(t => s >= t.min && s <= t.max) || (s > 100 ? NOTE_TIERS[7] : NOTE_TIERS[0]);
}

const NOTE_TEMPLATES = {
  // ---------------- CODING: CONCEPT / LITERACY (ujian teori) ----------------
  coding_concept: {
    id: {
      C1: "Di {range}, {n} mulai mengenal materi {course} seperti {topics}. Nilai ujian teori {n} {score}, dan beberapa konsep memang masih perlu diulang. Hal ini wajar karena materinya cukup banyak dan masih baru. {tip} {close}",
      C2: "Selama {range}, {n} belajar {topics}. Di ujian teori, {n} mendapat nilai {score}. Sebagian konsep sudah mulai dipahami, hanya saja {n} masih ragu saat harus menjelaskan alurnya sendiri. Ini proses yang biasa dan akan membaik dengan latihan. {tip} {close}",
      B1: "{N} sudah mengikuti materi {range} dengan baik, mencakup {topics}. Nilai ujian teori {n} {score}. Konsep dasarnya sudah dipahami, tapi beberapa detail kecil kadang masih tertukar. {tip} {close}",
      B2: "Di {range}, {n} mempelajari {topics} dan bisa mengikuti penjelasan di kelas dengan cukup lancar. Pada ujian teori {n} meraih nilai {score}. Masih ada satu dua konsep yang perlu dimantapkan supaya tidak lupa di materi berikutnya. {tip} {close}",
      B3: "{N} memahami materi {range} dengan baik, terutama {topics}. Nilai ujian teori {score} menunjukkan pemahaman yang sudah cukup matang, tinggal sedikit lagi untuk mencapai hasil maksimal. {tip} {close}",
      A1: "{N} menguasai materi {range} dengan baik, seperti {topics}. Di ujian teori {n} mendapat nilai {score} dan bisa menjelaskan kembali konsep yang dipelajari dengan bahasa sendiri. {tip} {close}",
      A2: "Pemahaman {n} di {range} sangat baik. Materi seperti {topics} bisa diikuti dengan cepat, dan nilai ujian teori {n} mencapai {score}. {N} juga sering menjawab pertanyaan di kelas dengan tepat. {tip} {close}",
      A3: "Hasil yang sangat memuaskan di {range}! {N} memahami {topics} dengan sangat baik dan meraih nilai {score} di ujian teori. Konsep yang baru diajarkan bisa langsung dipahami tanpa banyak pengulangan. {tip} {close}"
    },
    en: {
      C1: "During {range}, {n} started learning {course} topics such as {topics}. {N} scored {score} on the theory exam, and some concepts still need more review. That is expected, since there was quite a lot of new material. {tip} {close}",
      C2: "Throughout {range}, {n} learned about {topics}. On the theory exam, {n} scored {score}. Some concepts are starting to click, but explaining the steps without help still takes some effort. This will get easier with practice. {tip} {close}",
      B1: "{N} followed the {range} material well, covering {topics}. With a theory exam score of {score}, the basics are clearly understood, although a few small details still get mixed up sometimes. {tip} {close}",
      B2: "In {range}, {n} studied {topics} and could follow the class explanations quite smoothly. {N} scored {score} on the theory exam. One or two concepts still need some reinforcement so they stay fresh for the next topics. {tip} {close}",
      B3: "{N} understood the {range} material well, especially {topics}. A theory exam score of {score} shows a good grasp of the concepts, and only a little more polish is needed to reach the top. {tip} {close}",
      A1: "{N} handled the {range} material very well, including {topics}. On the theory exam, {n} scored {score} and could explain the concepts back in simple words. {tip} {close}",
      A2: "{N} showed a strong understanding in {range}. Topics like {topics} were picked up quickly, and the theory exam score reached {score}. In class, {n} often answered questions correctly. {tip} {close}",
      A3: "An excellent result for {range}! {N} understood {topics} really well and scored {score} on the theory exam. New concepts could be picked up right away without much repetition. {tip} {close}"
    }
  },

  // ---------------- CODING: APPLICATION / PRACTICE (project + coding exam) ----------------
  coding_application: {
    id: {
      C1: "Dalam praktik, {n} mengerjakan project seperti {projects}. Di {exam}, {n} mendapat nilai {score} dan masih butuh banyak bantuan untuk menyusun kodenya. Wajar kalau di tahap ini program sering belum jalan sesuai harapan. {tip} {close}",
      C2: "{N} sudah mencoba membuat {projects} di kelas. Pada {exam}, nilai {n} {score}. Beberapa bagian sudah bisa dikerjakan sendiri, tapi saat ada error {n} masih perlu dibimbing untuk mencari penyebabnya. {tip} {close}",
      B1: "{N} berhasil menyelesaikan project seperti {projects}. Di {exam}, {n} meraih nilai {score}. Programnya sudah berjalan, walaupun kadang masih perlu diingatkan langkah-langkahnya. {tip} {close}",
      B2: "Project {projects} dikerjakan {n} dengan cukup rapi. Pada {exam}, nilainya {score}. Ketika menemukan error, {n} mulai bisa mencari sendiri bagian yang salah. Tinggal kecepatannya yang perlu dilatih. {tip} {close}",
      B3: "{N} mampu mengerjakan {projects} hampir sepenuhnya secara mandiri. Pada {exam}, {n} mendapat nilai {score} dengan program yang sudah berjalan baik. Sedikit lagi ketelitian, hasilnya bisa lebih maksimal. {tip} {close}",
      A1: "{N} menyelesaikan project {projects} dengan baik dan mandiri. Di {exam}, {n} meraih nilai {score}. Kodenya tersusun rapi dan bisa dijelaskan kembali saat ditanya. {tip} {close}",
      A2: "Kemampuan praktik {n} sangat baik. Project seperti {projects} selesai lebih cepat dari target, dan di {exam} {n} meraih nilai {score}. Error kecil pun bisa diperbaiki sendiri tanpa banyak bantuan. {tip} {close}",
      A3: "Praktik coding {n} di periode ini sangat menonjol. {N} menyelesaikan {projects} dengan hasil yang rapi dan kreatif, lalu meraih nilai {score} di {exam}. {N} bahkan sering menambahkan ide sendiri ke dalam project. {tip} {close}"
    },
    en: {
      C1: "In practice sessions, {n} worked on projects like {projects}. For {exam}, {n} scored {score} and still needed a lot of help putting the code together. At this stage it is normal for programs not to run as expected yet. {tip} {close}",
      C2: "{N} tried building {projects} in class. For {exam}, {n} scored {score}. Some parts could be done independently, but when errors came up, {n} still needed guidance to find the cause. {tip} {close}",
      B1: "{N} completed projects such as {projects}. For {exam}, {n} scored {score}. The programs ran well, although some steps still needed a reminder now and then. {tip} {close}",
      B2: "{N} worked through {projects} quite neatly. The score for {exam} was {score}. When errors appeared, {n} started finding the problem without help. Speed is the next thing to work on. {tip} {close}",
      B3: "{N} could complete {projects} almost fully independently. For {exam}, {n} scored {score} with a program that ran well. A bit more attention to detail will push the results even higher. {tip} {close}",
      A1: "{N} completed {projects} well and independently. For {exam}, {n} scored {score}. The code was well organized, and {n} could explain how it works when asked. {tip} {close}",
      A2: "{N} showed very strong practical skills. Projects like {projects} were finished ahead of time, and {n} scored {score} on {exam}. Small errors were usually fixed without much help. {tip} {close}",
      A3: "The practical work this term stood out. {N} completed {projects} neatly and creatively, then scored {score} on {exam}. {N} often added personal ideas to the projects as well. {tip} {close}"
    }
  },

  // ---------------- DESIGN: CONCEPT ----------------
  design_concept: {
    id: {
      C1: "Di {range}, {n} mulai mengenal materi {course} seperti {topics}. Nilai ujian teori {n} {score}, dan beberapa istilah desain masih perlu diulang. Wajar, karena banyak istilah baru yang dikenalkan di periode ini. {tip} {close}",
      C2: "Selama {range}, {n} belajar {topics}. Di ujian teori, {n} mendapat nilai {score}. Konsep dasarnya mulai dipahami, tapi {n} masih ragu saat harus menjelaskan alasan di balik pilihan desainnya. {tip} {close}",
      B1: "{N} mengikuti materi {range} dengan baik, mencakup {topics}. Nilai ujian teori {n} {score}. Prinsip dasarnya sudah dipahami, hanya beberapa istilah kadang masih tertukar. {tip} {close}",
      B2: "Di {range}, {n} mempelajari {topics} dan cukup lancar mengikuti diskusi di kelas. Pada ujian teori {n} meraih nilai {score}. Beberapa prinsip masih perlu dimantapkan agar bisa dipakai dengan tepat di project berikutnya. {tip} {close}",
      B3: "{N} memahami materi {range} dengan baik, terutama {topics}. Nilai ujian teori {score} menunjukkan pemahaman yang sudah cukup matang. Sedikit lagi pendalaman, hasilnya bisa maksimal. {tip} {close}",
      A1: "{N} menguasai materi {range} dengan baik, seperti {topics}. Di ujian teori {n} mendapat nilai {score} dan bisa menjelaskan alasan di balik pilihan desainnya dengan jelas. {tip} {close}",
      A2: "Pemahaman {n} di {range} sangat baik. Materi seperti {topics} cepat dipahami, dan nilai ujian teori {n} mencapai {score}. Saat diskusi, {n} sering memberi masukan desain yang tepat. {tip} {close}",
      A3: "Hasil yang sangat memuaskan di {range}! {N} memahami {topics} dengan sangat baik dan meraih nilai {score} di ujian teori. Prinsip desain yang baru diajarkan bisa langsung diterapkan. {tip} {close}"
    },
    en: {
      C1: "During {range}, {n} started learning {course} topics such as {topics}. {N} scored {score} on the theory exam, and some design terms still need more review. That is expected, as many new terms were introduced this term. {tip} {close}",
      C2: "Throughout {range}, {n} learned about {topics}. On the theory exam, {n} scored {score}. The basic ideas are starting to make sense, but explaining the reasons behind design choices still takes some effort. {tip} {close}",
      B1: "{N} followed the {range} material well, covering {topics}. With a theory exam score of {score}, the main principles are understood, though a few terms still get mixed up. {tip} {close}",
      B2: "In {range}, {n} studied {topics} and kept up well during class discussions. {N} scored {score} on the theory exam. A few principles still need reinforcement so they can be applied correctly in the next projects. {tip} {close}",
      B3: "{N} understood the {range} material well, especially {topics}. A theory exam score of {score} shows a good grasp of the principles, and only a little more depth is needed to reach the top. {tip} {close}",
      A1: "{N} handled the {range} material very well, including {topics}. On the theory exam, {n} scored {score} and could clearly explain the reasons behind each design choice. {tip} {close}",
      A2: "{N} showed a strong understanding in {range}. Topics like {topics} were picked up quickly, and the theory exam score reached {score}. During discussions, {n} often gave useful design feedback. {tip} {close}",
      A3: "An excellent result for {range}! {N} understood {topics} really well and scored {score} on the theory exam. New design principles could be applied right away. {tip} {close}"
    }
  },

  // ---------------- DESIGN: APPLICATION / PRACTICE ----------------
  design_application: {
    id: {
      C1: "Dalam praktik, {n} mengerjakan tugas desain seperti {projects}. Di {exam}, {n} mendapat nilai {score} dan masih butuh banyak arahan untuk menyusun komposisinya. Wajar kalau hasil awal masih perlu beberapa kali revisi. {tip} {close}",
      C2: "{N} sudah mencoba membuat {projects} di kelas. Pada {exam}, nilai {n} {score}. Beberapa bagian sudah bisa dikerjakan sendiri, tapi pemilihan warna dan tata letak masih perlu dibimbing. {tip} {close}",
      B1: "{N} berhasil menyelesaikan tugas seperti {projects}. Di {exam}, {n} meraih nilai {score}. Hasil desainnya sudah sesuai arahan, walaupun detail kecil kadang masih terlewat. {tip} {close}",
      B2: "Tugas {projects} dikerjakan {n} dengan cukup rapi. Pada {exam}, nilainya {score}. {N} mulai bisa merevisi desain sendiri setelah diberi masukan. Tinggal konsistensi gayanya yang perlu dilatih. {tip} {close}",
      B3: "{N} mampu mengerjakan {projects} hampir sepenuhnya secara mandiri. Pada {exam}, {n} mendapat nilai {score} dengan hasil yang sudah enak dilihat. Sedikit lagi ketelitian di detail, hasilnya bisa lebih maksimal. {tip} {close}",
      A1: "{N} menyelesaikan {projects} dengan baik dan mandiri. Di {exam}, {n} meraih nilai {score}. Komposisi dan pilihan warnanya rapi, dan {n} bisa menjelaskan konsep desainnya saat ditanya. {tip} {close}",
      A2: "Kemampuan praktik desain {n} sangat baik. Tugas seperti {projects} selesai lebih cepat dari target, dan di {exam} {n} meraih nilai {score}. Masukan dari teacher bisa langsung diterapkan dengan tepat. {tip} {close}",
      A3: "Karya {n} di periode ini sangat menonjol. {N} menyelesaikan {projects} dengan hasil yang rapi dan kreatif, lalu meraih nilai {score} di {exam}. {N} juga sering menambahkan ide visual sendiri. {tip} {close}"
    },
    en: {
      C1: "In practice sessions, {n} worked on design tasks like {projects}. For {exam}, {n} scored {score} and still needed a lot of direction to arrange the composition. It is normal for early designs to need several revisions. {tip} {close}",
      C2: "{N} tried creating {projects} in class. For {exam}, {n} scored {score}. Some parts could be done independently, but choosing colors and layout still needed guidance. {tip} {close}",
      B1: "{N} completed tasks such as {projects}. For {exam}, {n} scored {score}. The designs followed the brief, although small details were sometimes missed. {tip} {close}",
      B2: "{N} worked through {projects} quite neatly. The score for {exam} was {score}. After receiving feedback, {n} started revising designs independently. Keeping a consistent style is the next thing to practice. {tip} {close}",
      B3: "{N} could complete {projects} almost fully independently. For {exam}, {n} scored {score} with results that looked clean. A bit more attention to detail will push the results even higher. {tip} {close}",
      A1: "{N} completed {projects} well and independently. For {exam}, {n} scored {score}. The composition and color choices were neat, and {n} could explain the design concept when asked. {tip} {close}",
      A2: "{N} showed very strong design skills. Tasks like {projects} were finished ahead of time, and {n} scored {score} on {exam}. Feedback from the teacher was applied quickly and accurately. {tip} {close}",
      A3: "The design work this term stood out. {N} completed {projects} neatly and creatively, then scored {score} on {exam}. {N} often added personal visual ideas as well. {tip} {close}"
    }
  },

  // ---------------- CREATIVITY (Website Designer, dll) ----------------
  creative: {
    id: {
      C1: "Dari sisi kreativitas, {n} masih cenderung mengikuti contoh dari teacher saat mengerjakan project seperti {projects}. Wajar di tahap ini, karena {n} masih membiasakan diri dengan tools-nya. {tip} {close}",
      C2: "{N} mulai mencoba sedikit perubahan pada project seperti {projects}, misalnya mengganti warna atau karakter. Ide {n} sebenarnya sudah ada, hanya perlu lebih berani dituangkan. {tip} {close}",
      B1: "{N} sudah mulai menambahkan ide sendiri ke dalam project seperti {projects}, walaupun masih sederhana. Kadang waktu habis di tahap mendesain, jadi perlu belajar membagi waktu. {tip} {close}",
      B2: "Kreativitas {n} mulai terlihat dari pilihan warna dan tata letak di project {projects}. {N} cukup percaya diri mencoba ide baru setelah diberi contoh. {tip} {close}",
      B3: "{N} punya ide-ide yang menarik dan mampu menuangkannya ke dalam {projects} dengan cukup rapi. Sedikit lagi keberanian bereksperimen akan membuat hasilnya makin unik. {tip} {close}",
      A1: "{N} kreatif dalam mendesain project seperti {projects}. Ide-ide yang dituangkan menarik dan sesuai dengan tema yang diberikan. {tip} {close}",
      A2: "Kreativitas {n} sangat baik. Project seperti {projects} punya ciri khas sendiri, dan {n} senang menambahkan detail di luar instruksi. {tip} {close}",
      A3: "Kreativitas {n} sangat menonjol di periode ini. Project seperti {projects} dibuat dengan ide yang unik dan detail yang rapi, sampai sering menjadi inspirasi bagi teman-teman di kelas. {tip} {close}"
    },
    en: {
      C1: "In terms of creativity, {n} still tended to follow the teacher's example closely when working on projects like {projects}. That is normal at this stage while getting used to the tools. {tip} {close}",
      C2: "{N} started making small changes to projects like {projects}, such as changing colors or characters. The ideas are there, they just need to be expressed more boldly. {tip} {close}",
      B1: "{N} started adding personal ideas to projects like {projects}, though they were still simple. Sometimes too much time went into the design stage, so time management needs some practice. {tip} {close}",
      B2: "Creativity showed in the color and layout choices {n} made in {projects}. {N} felt confident trying new ideas after seeing an example. {tip} {close}",
      B3: "{N} came up with interesting ideas and turned them into fairly neat work in {projects}. Being a little braver with experiments will make the results even more unique. {tip} {close}",
      A1: "{N} showed good creativity in projects like {projects}. The ideas were interesting and matched the given theme. {tip} {close}",
      A2: "{N} showed very strong creativity. Projects like {projects} had a personal touch, and {n} enjoyed adding details beyond the instructions. {tip} {close}",
      A3: "Creativity really stood out this term. Projects like {projects} came with unique ideas and neat details, often inspiring classmates as well. {tip} {close}"
    }
  },

  // ---------------- CHARACTER (semua level) ----------------
  character: {
    id: {
      C1: "Di kelas, {n} masih sering kehilangan fokus dan butuh diingatkan untuk menyelesaikan tugas. Ini hal yang biasa dan bisa dilatih pelan-pelan. Saat sudah tertarik dengan materinya, {n} sebenarnya bisa mengikuti dengan baik. {tip} {close}",
      C2: "{N} cukup antusias di awal kelas, tapi fokusnya kadang turun di tengah sesi. {N} juga masih malu bertanya saat mengalami kesulitan. Dengan sedikit dorongan, hal ini pasti bisa membaik. {tip} {close}",
      B1: "{N} mengikuti kelas dengan sikap yang baik dan sopan. Tugas umumnya diselesaikan, walaupun kadang perlu diingatkan agar tidak terburu-buru. {N} juga mulai berani bertanya saat ada yang belum jelas. {tip} {close}",
      B2: "{N} cukup aktif di kelas dan mau mencoba saat diberi tantangan. Sesekali fokus {n} teralihkan, tapi bisa kembali setelah diingatkan. Sikap {n} terhadap teman dan teacher juga baik. {tip} {close}",
      B3: "{N} menunjukkan sikap belajar yang baik. {N} datang siap belajar, mengikuti instruksi dengan tertib, dan mau mencoba lagi saat hasilnya belum sesuai. Sedikit lebih berani berpendapat akan membuat {n} makin berkembang. {tip} {close}",
      A1: "{N} rajin dan bertanggung jawab di kelas. Tugas selalu diselesaikan dengan sungguh-sungguh, dan {n} tidak ragu bertanya saat menemui kesulitan. {tip} {close}",
      A2: "{N} sangat antusias dan fokus selama kelas. Saat menemui kesulitan, {n} mencoba mencari solusinya dulu sebelum bertanya. {N} juga senang membantu teman yang sedang kesulitan. {tip} {close}",
      A3: "Sikap belajar {n} patut dicontoh. {N} selalu fokus, mandiri, dan pantang menyerah saat menghadapi tantangan. Di kelas, {n} sering menjadi penyemangat bagi teman-teman yang lain. {tip} {close}"
    },
    en: {
      C1: "In class, {n} often lost focus and needed reminders to finish tasks. This is common and can be trained step by step. When the topic felt interesting, {n} could actually follow along well. {tip} {close}",
      C2: "{N} started classes with good energy, but focus tended to drop in the middle of the session. {N} also felt shy asking for help when stuck. With a little encouragement, this will surely improve. {tip} {close}",
      B1: "{N} joined classes with a good and polite attitude. Tasks were usually completed, although {n} sometimes needed a reminder not to rush. {N} also started asking questions when something felt unclear. {tip} {close}",
      B2: "{N} took part actively in class and showed willingness to try new challenges. Attention drifted now and then, but {n} could refocus after a reminder. {N} also treated classmates and the teacher kindly. {tip} {close}",
      B3: "{N} showed a good learning attitude. {N} came ready to learn, followed instructions well, and kept trying when the result did not work out at first. Speaking up a bit more in class will help {n} grow further. {tip} {close}",
      A1: "{N} showed diligence and responsibility in class. Tasks were always done seriously, and {n} never hesitated to ask questions when facing difficulties. {tip} {close}",
      A2: "{N} stayed very enthusiastic and focused during class. When facing a problem, {n} tried to find the solution first before asking. {N} also liked helping classmates who were stuck. {tip} {close}",
      A3: "{N} set a great example in class. {N} stayed focused, worked independently, and never gave up when facing challenges. {N} also often motivated classmates during activities. {tip} {close}"
    }
  }
};

// Tips perbaikan (dipakai tier C & B), disesuaikan level siswa
const NOTE_TIPS = {
  junior: {
    id: [
      "Latihan singkat 10 menit di rumah bersama orang tua, misalnya mengulang animasi dari kelas, akan sangat membantu.",
      "Mengulang kembali satu project dari kelas di rumah, cukup 10 menit saja, bisa membantu {n} makin lancar."
    ],
    en: [
      "A short 10-minute practice at home with a parent, such as replaying the class animation, will help a lot.",
      "Redoing one class project at home for about 10 minutes can help {n} become more fluent."
    ]
  },
  kids: {
    id: [
      "Review materi 10-15 menit sebelum kelas akan membantu {n} lebih cepat nyambung dengan materi baru.",
      "Coba ulangi satu latihan dari kelas di rumah setiap minggu supaya konsepnya makin nempel."
    ],
    en: [
      "Reviewing the material for 10-15 minutes before class will help {n} connect with new topics faster.",
      "Redoing one class exercise at home each week will help these concepts stick."
    ]
  },
  teens: {
    id: [
      "Membiasakan menulis ulang kode dari kelas tanpa melihat contoh, sekitar 15 menit beberapa kali seminggu, akan sangat membantu.",
      "Mencoba membuat program kecil sendiri di rumah akan melatih {n} memahami alur kode dengan lebih cepat."
    ],
    en: [
      "Rewriting class code without looking at the example, about 15 minutes a few times a week, will help a lot.",
      "Building a small program at home will train {n} to follow the code flow faster."
    ]
  },
  pro: {
    id: [
      "Meluangkan 20-30 menit di luar kelas untuk mengulang materi dan mencoba variasi kode sendiri akan mempercepat progres.",
      "Mencatat error yang sering muncul beserta solusinya bisa jadi referensi yang berguna untuk sesi berikutnya."
    ],
    en: [
      "Setting aside 20-30 minutes outside class to revisit the material and try small code variations will speed things up.",
      "Keeping a short note of common errors and how they were fixed makes a handy reference for the next sessions."
    ]
  },
  design: {
    id: [
      "Mencoba membuat satu sketsa atau desain kecil di rumah setiap minggu akan membantu {n} makin percaya diri.",
      "Melihat contoh karya desainer lain lalu mencoba meniru gayanya bisa jadi latihan yang menyenangkan."
    ],
    en: [
      "Making one small sketch or design at home each week will help {n} grow more confident.",
      "Looking at other designers' work and trying to recreate the style is a fun way to practice."
    ]
  }
};

// Saran tantangan lanjutan (dipakai tier A)
const NOTE_STRETCH = {
  junior: {
    id: [
      "Di rumah, {n} bisa diajak bercerita tentang animasi yang dibuat di kelas supaya makin percaya diri.",
      "Untuk tantangan berikutnya, {n} bisa mencoba menambah karakter atau gerakan baru di project-nya."
    ],
    en: [
      "At home, {n} can be invited to talk about the animation made in class, which builds confidence.",
      "As a next step, {n} can try adding new characters or movements to the project."
    ]
  },
  kids: {
    id: [
      "Tantangan berikutnya, {n} bisa mencoba menambahkan fitur sendiri di luar instruksi kelas.",
      "{N} juga sudah siap membantu teman yang masih kesulitan, dan ini bagus untuk memperdalam pemahaman."
    ],
    en: [
      "As a next challenge, {n} can try adding personal features beyond the class instructions.",
      "{N} can also help classmates who are stuck, which is a great way to deepen understanding."
    ]
  },
  teens: {
    id: [
      "Langkah berikutnya, {n} bisa mencoba merapikan kode agar lebih efisien dan mudah dibaca.",
      "{N} bisa mulai mencoba project pribadi kecil untuk mengasah kreativitas di luar materi kelas."
    ],
    en: [
      "As a next step, {n} can work on making the code cleaner and more efficient.",
      "{N} can start a small personal project to stretch creativity beyond the class material."
    ]
  },
  pro: {
    id: [
      "Langkah selanjutnya, {n} bisa mulai membaca dokumentasi resmi untuk menemukan pendekatan lain.",
      "{N} juga bisa mulai menyusun portofolio dari project yang sudah dibuat."
    ],
    en: [
      "As a next step, {n} can start reading the official documentation to discover other approaches.",
      "{N} can also start building a portfolio from the projects completed so far."
    ]
  },
  design: {
    id: [
      "Langkah berikutnya, {n} bisa mencoba gaya visual baru agar karyanya makin berkarakter.",
      "{N} juga bisa mulai mengumpulkan karya terbaik menjadi portofolio kecil."
    ],
    en: [
      "As a next step, {n} can experiment with new visual styles to give the work more character.",
      "{N} can also start gathering the best pieces into a small portfolio."
    ]
  }
};

// Kalimat khusus absensi (kategori Character). Alasan absen TIDAK disebutkan.
const NOTE_ATTENDANCE_TIPS = {
  valid_absence: {
    id: [
      "Setelah beberapa kali berhalangan hadir, recap singkat 5 menit di awal sesi akan membantu {n} cepat nyambung lagi dengan materi.",
      "Untuk sesi yang terlewat, mengulang materi sebentar sebelum kelas sudah cukup membantu {n} mengejar ketinggalan."
    ],
    en: [
      "After missing a few sessions, a quick 5-minute recap at the start of class will help {n} catch up with the material.",
      "For the sessions that were missed, a short review before class will be enough to help {n} catch up."
    ]
  },
  unexcused: {
    id: [
      "Kehadiran yang lebih rutin dan jadwal latihan mingguan yang tetap akan sangat membantu {n} menjaga progres.",
      "Hadir lebih konsisten di setiap sesi akan membuat {n} lebih mudah mengikuti materi yang terus berlanjut."
    ],
    en: [
      "More regular attendance and a fixed weekly practice time will really help {n} keep up the progress.",
      "Attending more consistently will make it easier for {n} to follow the material as it builds up."
    ]
  }
};

const NOTE_CHAR_TRAITS = {
  creative: {
    id: ["Selain itu, {n} sangat kreatif dan suka bereksperimen memodifikasi projek di luar instruksi yang diberikan.", "Teacher juga melihat {n} punya kreativitas tinggi dan senang menambahkan idenya sendiri pada hasil akhir projek."],
    en: ["In addition, {n} is highly creative and loves experimenting to modify projects beyond the given instructions.", "The teacher also noticed that {n} is very creative and enjoys adding personal ideas to the final project."]
  },
  active: {
    id: ["Selain itu, {n} sangat aktif, punya inisiatif tinggi, serta berani bertanya saat sesi kelas.", "Teacher sangat mengapresiasi keaktifan {n} di kelas yang sering berinisiatif dan antusias dalam berdiskusi."],
    en: ["In addition, {n} is very active, highly proactive, and confident in asking questions during class.", "The teacher really appreciates {n}'s active participation, showing initiative and enthusiasm in class discussions."]
  },
  focus: {
    id: ["Teacher juga salut karena {n} mampu fokus bekerja mandiri dan pantang menyerah saat memecahkan error.", "Ketekunan {n} sangat baik, terlihat dari fokusnya saat bekerja sendiri dan kemauannya mencoba lagi saat ada bug."],
    en: ["The teacher is also impressed that {n} stays focused working independently and never gives up when solving errors.", "{N}'s persistence is great, shown by the strong focus while working and the willingness to keep trying when facing bugs."]
  },
  shy: {
    id: ["Ke depannya, sedikit dorongan agar {n} lebih berani mengekspresikan ide dan bertanya akan membuat potensinya makin bersinar.", "Teacher yakin {n} sebenarnya paham, hanya butuh dorongan agar lebih percaya diri untuk mengutarakan pendapat di kelas."],
    en: ["Moving forward, a little encouragement for {n} to express ideas and ask questions will help that potential shine even more.", "The teacher believes {n} understands the material well and just needs a little push to be more confident in speaking up."]
  },
  distracted: {
    id: ["Latihan perlahan untuk menjaga konsentrasi dari awal hingga akhir sesi akan sangat membantu {n} menangkap materi secara utuh.", "Ke depannya, membiasakan agar tidak mudah terdistraksi di tengah kelas akan membantu {n} menyelesaikan projek lebih cepat."],
    en: ["Practicing to maintain concentration from start to finish will really help {n} grasp the full material.", "Going forward, practicing not to get easily distracted mid-class will help {n} finish projects much faster."]
  }
};

const NOTE_CLOSINGS = {
  A: {
    id: ["Good job{cN}, pertahankan!", "Mantap{cN}, terus semangat ya!", "Pertahankan semangatnya{cN}!"],
    en: ["Great job{cN}!", "Keep it up{cN}!", "Well done{cN}, keep going!"]
  },
  B: {
    id: ["Semangat terus{cN}!", "Ayo terus berlatih{cN}!", "Kerja bagus{cN}, terus semangat!"],
    en: ["Keep it up{cN}!", "Nice work{cN}, keep practicing!", "Keep going{cN}!"]
  },
  C: {
    id: ["Semangat terus{cN}, pelan-pelan pasti bisa!", "Ayo kita terus berlatih bersama{cN}!", "Teacher yakin {n} bisa!"],
    en: ["Keep going{cN}, step by step!", "Let's keep practicing together{cN}!", "I believe {n} can do it!"]
  }
};

// Kalimat tambahan bila note masih di bawah 350 karakter
const NOTE_EXTRAS = {
  concept: {
    id: ["Materi berikutnya akan dibangun dari konsep-konsep ini, jadi pemahaman yang kuat sekarang akan sangat membantu.", "Konsep di periode ini akan sering dipakai lagi di lesson-lesson selanjutnya."],
    en: ["The next topics build on these concepts, so a strong understanding now will help a lot.", "These concepts will come up again often in the upcoming lessons."]
  },
  application: {
    id: ["Setiap project yang selesai jadi bekal penting untuk tantangan di level berikutnya.", "Project di periode ini juga bisa jadi bahan latihan yang bagus untuk diulang di rumah."],
    en: ["Every finished project is a useful step toward the challenges ahead.", "The projects from this term are also good material to practice again at home."]
  },
  creative: {
    id: ["Setiap ide yang dicoba, sekecil apa pun, akan memperkaya gaya {n} sendiri.", "Project di periode ini bisa jadi awal yang bagus untuk portofolio kecil."],
    en: ["Every idea tried, however small, will help {n} build a personal style.", "The projects from this term make a nice start for a small portfolio."]
  },
  character: {
    id: ["Usaha yang ditunjukkan di setiap sesi sangat teacher hargai.", "Teacher senang melihat perkembangan sikap belajar {n} di periode ini."],
    en: ["The effort shown in every session is truly appreciated.", "It has been great to see this learning attitude grow throughout the term."]
  }
};

function noteShuffle(arr) {
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Ambil n item acak tapi tetap urut sesuai urutan lesson
function noteSampleOrdered(arr, n) {
  if (!arr || arr.length <= n) return (arr || []).slice();
  const idx = noteShuffle(arr.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
  return idx.map(i => arr[i]);
}

function noteJoinList(items, lang) {
  const list = (items || []).filter(Boolean);
  const and = lang === 'id' ? 'dan' : 'and';
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} ${and} ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, ${and} ${list[list.length - 1]}`;
}

function cleanLessonTitleForNote(raw) {
  let t = String(raw || '').replace(/^Lesson\s*\d+\s*(?:-|:|–)\s*/i, '').trim();
  t = t.replace(/^(?:What\s+(?:is|are)\s+(?:an?\s+)?|Introduction\s+(?:to|of)\s+|Intro\s+to\s+|Getting\s+Started\s+with\s+|Let'?s\s+)/i, '');
  t = t.replace(/[?!.]+$/g, '').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const NOTE_EXAM_RE = /\b(?:exam|ujian|challenge|overview|review|quiz|kuis|test)\b/i;
const NOTE_PROJECT_RE = /project|projek|game|maker|app\b|animation|animasi|bot\b|design|world|scene|web|site|mechanic|story|quiz|logo|poster|mascot|portfolio|landing|clone/i;

// Materi spesifik dari kurikulum (topik konsep, project, nama ujian)
function getNoteMaterials(courseName, fromLesson, toLesson, lang) {
  const result = { concepts: [], projects: [], exam: '' };
  const lessons = (typeof COURSE_DATA !== 'undefined' && COURSE_DATA[courseName])
    ? COURSE_DATA[courseName].filter(l => l.num >= fromLesson && l.num <= toLesson)
    : [];

  const others = [];
  lessons.forEach(l => {
    const raw = (lang === 'id' && l.title_id) ? l.title_id : (l.title_en || l.title || '');
    const title = cleanLessonTitleForNote(raw);
    if (!title) return;
    if (NOTE_EXAM_RE.test(title)) {
      if (!result.exam) result.exam = title;
    } else if (NOTE_PROJECT_RE.test(title)) {
      if (!result.projects.includes(title)) result.projects.push(title);
      others.push(title);
    } else {
      if (!result.concepts.includes(title)) result.concepts.push(title);
      others.push(title);
    }
  });

  if (result.concepts.length === 0) result.concepts = others.slice();
  if (result.projects.length === 0) result.projects = others.slice(-3);

  if (result.concepts.length === 0) {
    result.concepts = [lang === 'id' ? 'konsep dasar dan logika' : 'core concepts and logic'];
  }
  if (result.projects.length === 0) {
    result.projects = [lang === 'id' ? 'latihan project di kelas' : 'the class practice projects'];
  }

  let exam = result.exam.replace(/^(?:Overview|Review)\s*(?:&|and)\s*/i, '').trim();
  if (!exam || /^(?:overview|review)$/i.test(exam)) {
    exam = lang === 'id' ? 'ujian akhir periode ini' : 'the end-of-term exam';
  } else if (lang === 'en' && /exam|test|quiz/i.test(exam) && !/^the\s/i.test(exam)) {
    exam = 'the ' + exam;
  }
  result.exam = exam;
  return result;
}

function getNoteLevelGroup(criteria) {
  const c = String(criteria || '').toLowerCase();
  if (c.startsWith('junior')) return 'junior';
  if (c === 'teens') return 'teens';
  if (c === 'design') return 'design';
  if (c === 'pro') return 'pro';
  return 'kids';
}

// Tentukan jenis note dari kategori LMS
function resolveNoteType(category, criteria) {
  const key = category.key;
  const name = String(category.name || '').toLowerCase();
  const isDesignLevel = String(criteria || '').toLowerCase() === 'design';
  const domain = isDesignLevel ? 'design' : 'coding';

  if (key === 'char' || name.includes('character')) return { type: 'character', tpl: 'character' };
  if (key === 'creative' || name.includes('creativ')) return { type: 'creative', tpl: 'creative' };
  if (key === 'design_prac' || key === 'design_app') return { type: 'application', tpl: 'design_application' };
  if (key === 'design_concept') return { type: 'concept', tpl: 'design_concept' };
  if (['comp_lit', 'code_lit', 'concept', 'dig_lit'].includes(key)) return { type: 'concept', tpl: `${domain}_concept` };
  if (['code_app', 'code_prac', 'code_dig'].includes(key)) return { type: 'application', tpl: `${domain}_application` };
  if (name.includes('application') || name.includes('practice') || name.includes('creation')) return { type: 'application', tpl: `${domain}_application` };
  return { type: 'concept', tpl: `${domain}_concept` };
}

function fillNoteTokens(text, tokens) {
  let out = text;
  for (let pass = 0; pass < 3 && /\{\w+\}/.test(out); pass++) {
    out = out.replace(/\{(\w+)\}/g, (m, k) => (tokens[k] !== undefined ? tokens[k] : m));
  }
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}

// Generate Note for a specific category using the offline template engine
function generateSingleNote(category, student, lang = 'en') {
  const sName = student.nama && student.nama.trim() ? student.nama.trim() : (lang === 'id' ? 'Siswa' : 'Student');
  const course = student.course || 'Coding';
  const periods = getCoursePeriods(course);
  const periodObj = periods.find(p => p.id === (student.period || 'report_1')) || periods[0] || { from: 1, to: 8 };
  const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(course, lang) : course;
  const isAdult = student.audience === 'adult';
  const attendance = student.attendance || 'normal';
  const score = Math.round(parseFloat(student.scores[category.key]));
  const scoreVal = isNaN(score) ? 85 : score;

  const tier = getScoreTier(scoreVal);
  const noteType = resolveNoteType(category, student.criteria);
  const tplSet = NOTE_TEMPLATES[noteType.tpl] || NOTE_TEMPLATES.coding_concept;
  const L = lang === 'id' ? 'id' : 'en';
  const template = tplSet[L][tier.id];

  const levelGroup = getNoteLevelGroup(student.criteria);
  const tipGroup = (noteType.tpl.startsWith('design') || noteType.type === 'creative') ? 'design' : levelGroup;

  let tipPool;
  if (noteType.type === 'character' && NOTE_ATTENDANCE_TIPS[attendance]) {
    tipPool = NOTE_ATTENDANCE_TIPS[attendance][L];
  } else if (noteType.type === 'character' && student.charTrait && student.charTrait !== 'default' && NOTE_CHAR_TRAITS[student.charTrait]) {
    tipPool = NOTE_CHAR_TRAITS[student.charTrait][L];
  } else if (tier.band === 'A') {
    tipPool = NOTE_STRETCH[tipGroup][L];
  } else {
    tipPool = NOTE_TIPS[tipGroup][L];
  }
  const closePool = NOTE_CLOSINGS[tier.band][L];
  const extraPool = NOTE_EXTRAS[noteType.type][L];

  const materials = getNoteMaterials(course, periodObj.from, periodObj.to, L);
  const conceptSample = noteSampleOrdered(materials.concepts, 3);
  const projectSample = noteSampleOrdered(materials.projects, 2);

  const baseTokens = {
    N: isAdult ? (L === 'id' ? 'Kamu' : 'You') : sName,
    n: isAdult ? (L === 'id' ? 'kamu' : 'you') : sName,
    cN: isAdult ? '' : `, ${sName}`,
    course: localizedCourse,
    range: `Lesson ${periodObj.from}-${periodObj.to}`,
    exam: materials.exam,
    score: String(scoreVal)
  };

  // Coba kombinasi (jumlah topik, tip, penutup, kalimat tambahan) lalu pilih acak yang 350-500 karakter
  const valid = [];
  let best = null;
  let bestDist = Infinity;
  const tips = noteShuffle(tipPool);
  const closes = noteShuffle(closePool);
  const extras = noteShuffle(extraPool);

  for (const k of [3, 2, 1]) {
    for (const pk of [2, 1]) {
      for (const tip of tips) {
        for (const close of closes) {
          for (const extra of ['', extras[0]]) {
            const tokens = Object.assign({}, baseTokens, {
              topics: noteJoinList(conceptSample.slice(0, k), L),
              projects: noteJoinList(projectSample.slice(0, pk), L),
              tip: extra ? `${tip} ${extra}` : tip,
              close
            });
            const text = fillNoteTokens(template, tokens);
            const len = text.length;
            if (len >= NOTE_MIN_CHARS && len <= NOTE_MAX_CHARS) {
              if (!valid.includes(text)) valid.push({ text, k, pk });
            }
            const dist = len < NOTE_MIN_CHARS ? NOTE_MIN_CHARS - len : (len > NOTE_MAX_CHARS ? len - NOTE_MAX_CHARS : 0);
            if (dist < bestDist) { bestDist = dist; best = text; }
          }
        }
      }
    }
  }

  if (valid.length > 0) {
    // Utamakan note yang menyebut topik/project paling spesifik (lebih banyak)
    const maxRich = Math.max(...valid.map(v => v.k + v.pk));
    const rich = valid.filter(v => v.k + v.pk === maxRich);
    return rich[Math.floor(Math.random() * rich.length)].text;
  }
  return best || '';
}


// Generate all notes for a student
function generateStudentExamNotes(student) {
  const lang = student.lang || examLang || 'id';
  const categories = getCourseCategories(student.course, student.period);
  const notes = {};

  categories.forEach(cat => {
    notes[cat.key] = generateSingleNote(cat, student, lang);
  });

  return notes;
}

// ============================================================
// STATE AND CONTROLLER
// ============================================================
let examStudents = [
  {
    nama: 'Arsen',
    criteria: 'Juniors',
    course: '3D ANIMATOR',
    period: 'report_1',
    lang: 'id',
    audience: 'parent',
    attendance: 'normal',
    scores: {
      comp_lit: 90,
      code_prac: 90,
      char: 90
    },
    notes: {}
  }
];

// Ensure student object has required scores & notes initialized
function ensureStudentCategories(s) {
  const cats = getCourseCategories(s.course, s.period);
  if (!s.scores) s.scores = {};
  if (!s.notes) s.notes = {};
  if (!s.audience) s.audience = 'parent';
  if (!s.attendance) s.attendance = 'normal';

  cats.forEach((cat, idx) => {
    if (s.scores[cat.key] === undefined || s.scores[cat.key] === '') {
      // Default initial score
      s.scores[cat.key] = idx === 0 ? 86 : (idx === 1 ? 85 : 80);
    }
    if (s.notes[cat.key] === undefined) {
      s.notes[cat.key] = '';
    }
  });
}

// Audience toggle handler (Parent vs Adult Student)
function setExamStudentAudience(idx, aud) {
  examStudents[idx].audience = aud;
  renderExamInputs();
  renderExamPreview();
}

// Attendance change handler
function onExamAttendanceChange(idx, val) {
  examStudents[idx].attendance = val;
}

// Render student inputs in the sidebar
function renderExamInputs() {
  const container = document.getElementById('exam-students-container');
  if (!container) return;
  container.innerHTML = '';

  examStudents.forEach((s, i) => {
    const sLang = s.lang || examLang;
    s.lang = sLang;
    ensureStudentCategories(s);

    const periods = getCoursePeriods(s.course);
    const categories = getCourseCategories(s.course, s.period);

    const card = document.createElement('div');
    card.className = 'student-card exam-student-card';
    card.id = `exam-student-card-${i}`;

    let scoreRowsHtml = '';
    categories.forEach(cat => {
      const scoreVal = s.scores[cat.key] !== undefined ? s.scores[cat.key] : 85;
      const g = calculateGrade(scoreVal);
      scoreRowsHtml += `
        <div class="exam-score-row">
          <div class="exam-score-label">
            <span class="score-cat-title">${esc(cat.name)}</span>
            <span class="score-grade-badge" id="exam-badge-${cat.key}-${i}" style="color:${g.color}">
              ${g.grade} (${sLang === 'id' ? g.label_id : g.label})
            </span>
          </div>
          <div class="exam-score-input-wrap">
            <input type="number" min="0" max="100" class="exam-score-input"
              id="exam-score-${cat.key}-${i}"
              value="${esc(scoreVal)}"
              oninput="onExamScoreInput(${i}, '${cat.key}', this.value)"
              placeholder="0-100">
          </div>
        </div>
      `;
    });

    const hasChar = categories.some(c => c.key === 'char' || c.type === 'character');
    if (hasChar) {
      const traitVal = s.charTrait || 'default';
      scoreRowsHtml += `
        <div class="exam-score-row" style="margin-top: 10px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px; border: 1px dashed rgba(0,0,0,0.1);">
          <div class="exam-score-label" style="margin-bottom: 6px;">
            <span class="score-cat-title" style="font-size: 0.85rem;">📝 ${sLang === 'id' ? 'Highlight Karakter' : 'Character Highlight'}</span>
          </div>
          <select class="trait-dropdown" style="width: 100%; padding: 6px; font-size: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);" 
            onchange="examStudents[${i}].charTrait = this.value; renderExamPreview()">
            <option value="default" ${traitVal === 'default' ? 'selected' : ''}>${sLang === 'id' ? '(Default) Sesuai Nilai' : '(Default) Based on Score'}</option>
            <option value="creative" ${traitVal === 'creative' ? 'selected' : ''}>${sLang === 'id' ? 'Kreatif & Eksploratif' : 'Creative & Explorative'}</option>
            <option value="active" ${traitVal === 'active' ? 'selected' : ''}>${sLang === 'id' ? 'Aktif & Inisiatif Tinggi' : 'Highly Active & Proactive'}</option>
            <option value="focus" ${traitVal === 'focus' ? 'selected' : ''}>${sLang === 'id' ? 'Fokus & Mandiri (Pantang Menyerah)' : 'Focused & Independent'}</option>
            <option value="shy" ${traitVal === 'shy' ? 'selected' : ''}>${sLang === 'id' ? 'Butuh Dorongan Percaya Diri' : 'Needs Confidence Boost'}</option>
            <option value="distracted" ${traitVal === 'distracted' ? 'selected' : ''}>${sLang === 'id' ? 'Mudah Terdistraksi' : 'Easily Distracted'}</option>
          </select>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="student-card-header">
        <div class="student-num">${i + 1}</div>
        <input type="text" id="exam-name-${i}" placeholder="${sLang === 'id' ? 'Nama Siswa' : 'Student Name'}" value="${esc(s.nama)}" oninput="examStudents[${i}].nama=this.value;renderExamPreview()">

        <div class="student-lang-toggle" title="Report Language">
          <button type="button" class="student-lang-btn ${sLang === 'id' ? 'active' : ''}" onclick="setExamStudentLang(${i},'id')">ID</button>
          <button type="button" class="student-lang-btn ${sLang === 'en' ? 'active' : ''}" onclick="setExamStudentLang(${i},'en')">EN</button>
        </div>
        <button class="btn-del" onclick="removeExamStudent(${i})" title="Remove">×</button>
      </div>

      <div class="auto-gen-row">
        <div class="auto-gen-selectors">
          <select id="exam-criteria-${i}" onchange="onExamCriteriaChange(${i},this)" style="flex:1;min-width:0;">
            <option value="">— Level —</option>
            <option value="Juniors" ${s.criteria === 'Juniors' || s.criteria === 'Junior' ? 'selected' : ''}>Juniors</option>
            <option value="Kids" ${s.criteria === 'Kids' ? 'selected' : ''}>Kids</option>
            <option value="Teens" ${s.criteria === 'Teens' ? 'selected' : ''}>Teens</option>
            <option value="Design" ${s.criteria === 'Design' ? 'selected' : ''}>Design</option>
            <option value="Pro" ${s.criteria === 'Pro' ? 'selected' : ''}>Pro</option>
          </select>
          <select id="exam-course-${i}" onchange="onExamCourseChange(${i},this)" style="flex:1.8;min-width:0;">
            <option value="">— Course —</option>
          </select>
        </div>

        <div class="auto-gen-selectors" style="margin-top:4px;">
          <select id="exam-period-${i}" onchange="onExamPeriodChange(${i},this)" style="flex:1;min-width:0;">
            ${periods.map(p => `<option value="${p.id}" ${s.period === p.id ? 'selected' : ''}>${sLang === 'id' ? p.label_id : p.label}</option>`).join('')}
          </select>
        </div>



        <!-- Dynamic Category Scores -->
        <div class="exam-scores-box" id="exam-scores-box-${i}">
          ${scoreRowsHtml}
        </div>

        <button class="btn-generate" onclick="generateStudentExamReport(${i})" style="margin-top:6px;">
          ⚡ ${sLang === 'id' ? 'Generate Exam Report' : 'Generate Exam Report'}
        </button>
      </div>
    `;

    container.appendChild(card);
    populateExamCourseDropdown(i);

    // Setup custom select styling
    ['criteria', 'course', 'period'].forEach(field => {
      if (typeof setupCustomSelect === 'function') {
        setupCustomSelect(document.getElementById(`exam-${field}-${i}`));
      }
    });
  });

  renderExamPreview();
}

function populateExamCourseDropdown(idx) {
  const select = document.getElementById(`exam-course-${idx}`);
  if (!select) return;
  const s = examStudents[idx];
  const sLang = s.lang || examLang;

  select.innerHTML = '<option value="">— Course —</option>';
  const courseList = (s.criteria && typeof COURSE_MAP !== 'undefined' && COURSE_MAP[s.criteria])
    ? COURSE_MAP[s.criteria]
    : ((s.criteria === 'Juniors' || s.criteria === 'Junior') && typeof COURSE_MAP !== 'undefined' ? (COURSE_MAP['Juniors'] || COURSE_MAP['Junior']) : null);

  if (courseList) {
    courseList.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(c, sLang) : c;
      if (c === s.course) opt.selected = true;
      select.appendChild(opt);
    });
  }

  if (typeof setupCustomSelect === 'function') {
    setupCustomSelect(select);
  }
}

function onExamCriteriaChange(idx, selectEl) {
  examStudents[idx].criteria = selectEl.value;
  // Automatically select first course in that level
  const list = (typeof COURSE_MAP !== 'undefined' && COURSE_MAP[selectEl.value])
    ? COURSE_MAP[selectEl.value]
    : ((selectEl.value === 'Juniors' || selectEl.value === 'Junior') && typeof COURSE_MAP !== 'undefined' ? (COURSE_MAP['Juniors'] || COURSE_MAP['Junior']) : []);
  examStudents[idx].course = list && list.length > 0 ? list[0] : '';
  examStudents[idx].period = 'report_1';
  ensureStudentCategories(examStudents[idx]);
  renderExamInputs();
}

function onExamCourseChange(idx, selectEl) {
  examStudents[idx].course = selectEl.value;
  examStudents[idx].period = 'report_1';
  ensureStudentCategories(examStudents[idx]);
  renderExamInputs();
}

function onExamPeriodChange(idx, selectEl) {
  examStudents[idx].period = selectEl.value;
  ensureStudentCategories(examStudents[idx]);
  renderExamInputs();
}

function onExamScoreInput(idx, catKey, val) {
  const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
  examStudents[idx].scores[catKey] = num;
  const s = examStudents[idx];
  const sLang = s.lang || examLang;
  const g = calculateGrade(num);

  const badge = document.getElementById(`exam-badge-${catKey}-${idx}`);
  if (badge) {
    badge.textContent = `${g.grade} (${sLang === 'id' ? g.label_id : g.label})`;
    badge.style.color = g.color;
  }
}

function setExamStudentLang(idx, lang) {
  examStudents[idx].lang = lang;
  renderExamInputs();
}

function addExamStudent() {
  const newStudent = {
    nama: '',
    criteria: 'Juniors',
    course: '3D ANIMATOR',
    period: 'report_1',
    lang: examLang,
    audience: 'parent',
    attendance: 'normal',
    scores: {},
    notes: {}
  };
  ensureStudentCategories(newStudent);
  examStudents.push(newStudent);
  renderExamInputs();
  const cards = document.querySelectorAll('#exam-students-container .student-card');
  if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeExamStudent(idx) {
  if (examStudents.length <= 1) {
    showToast(examLang === 'id' ? 'Minimal harus ada 1 siswa.' : 'Minimum 1 student is required.', 'error');
    return;
  }
  examStudents.splice(idx, 1);
  renderExamInputs();
}

function generateStudentExamReport(idx) {
  const s = examStudents[idx];
  const sLang = s.lang || examLang;
  if (!s.nama || !s.nama.trim()) {
    showToast(sLang === 'id' ? 'Silakan masukkan nama siswa.' : 'Please enter Student Name.', 'error');
    return;
  }
  if (!s.course) {
    showToast(sLang === 'id' ? 'Silakan pilih course.' : 'Please select a Course.', 'error');
    return;
  }

  const generated = generateStudentExamNotes(s);
  s.notes = generated;

  renderExamPreview();
  showToast(sLang === 'id' ? `Report berhasil digenerate untuk ${s.nama}!` : `Report generated for ${s.nama}!`, 'success');

  const cardEl = document.getElementById(`exam-report-table-${idx}`);
  if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Regenerate single criteria note for a student
function regenerateCriteriaNote(idx, catKey) {
  const s = examStudents[idx];
  const sLang = s.lang || examLang;
  const categories = getCourseCategories(s.course, s.period);
  const catObj = categories.find(c => c.key === catKey) || { key: catKey, name: catKey };

  const newNote = generateSingleNote(catObj, s, sLang);
  s.notes[catKey] = newNote;

  const textarea = document.getElementById(`lms-note-${catKey}-${idx}`);
  if (textarea) {
    textarea.value = newNote;
    updateNoteCharCount(idx, catKey, newNote.length);
  }

  showToast(sLang === 'id' ? `Note ${catObj.name} diperbarui!` : `Regenerated ${catObj.name} note!`, 'success');
}

// Live typing note input handler
function onExamNoteInput(idx, catKey, val) {
  examStudents[idx].notes[catKey] = val;
  updateNoteCharCount(idx, catKey, val.length);
}

// Live character counter update
function updateNoteCharCount(idx, catKey, count) {
  const s = examStudents[idx];
  const sLang = (s && s.lang) || examLang;
  const pill = document.getElementById(`char-counter-${catKey}-${idx}`);
  const valEl = document.getElementById(`char-val-${catKey}-${idx}`);
  const statusEl = document.getElementById(`char-status-${catKey}-${idx}`);
  if (!pill || !valEl || !statusEl) return;

  valEl.textContent = count;
  pill.className = 'char-counter-pill';
  if (count >= 350 && count <= 500) {
    pill.classList.add('optimal');
    statusEl.textContent = sLang === 'id' ? '✓ Optimal (350–500)' : '✓ Optimal (350–500)';
  } else if (count < 350) {
    pill.classList.add('under');
    statusEl.textContent = sLang === 'id' ? `⚠️ Kurang ${350 - count} karakter` : `⚠️ ${350 - count} chars below target`;
  } else {
    pill.classList.add('over');
    statusEl.textContent = sLang === 'id' ? `⚠️ Melebihi batas (${count - 500})` : `⚠️ ${count - 500} chars over limit`;
  }
}

// Toggle period objectives panel visibility
function toggleStudentObjectives(idx) {
  const listEl = document.getElementById(`obj-list-${idx}`);
  const btnEl = document.getElementById(`obj-toggle-btn-${idx}`);
  const cardEl = document.getElementById(`period-obj-card-${idx}`);
  if (!listEl || !btnEl) return;

  const isOpen = listEl.style.display !== 'none';
  if (isOpen) {
    listEl.style.display = 'none';
    btnEl.textContent = 'Show Objectives ▼';
    if (cardEl) cardEl.classList.remove('open');
  } else {
    listEl.style.display = 'block';
    btnEl.textContent = 'Hide Objectives ▲';
    if (cardEl) cardEl.classList.add('open');
  }
}

// Copy all period objectives to clipboard
function copyPeriodObjectives(idx) {
  const s = examStudents[idx];
  const sLang = s.lang || examLang;
  const periods = getCoursePeriods(s.course);
  const pObj = periods.find(p => p.id === s.period) || periods[0] || { from: 1, to: 8 };
  const curDetails = getPeriodCurriculumDetails(s.course, pObj.from, pObj.to, sLang);

  if (!curDetails.allObjectivesList || curDetails.allObjectivesList.length === 0) {
    showToast('No objectives found.', 'error');
    return;
  }

  let text = `🎯 Learning Objectives — ${s.course} (Lesson ${pObj.from}–${pObj.to}):\n\n`;
  curDetails.allObjectivesList.forEach(l => {
    text += `• Lesson ${l.num}: ${l.title}\n`;
    l.objectives.forEach(o => {
      text += `  - ${o}\n`;
    });
  });

  navigator.clipboard.writeText(text.trim()).then(() => {
    showToast('Copied all period objectives!', 'success');
  }).catch(() => {
    showToast('Failed to copy objectives.', 'error');
  });
}

// ============================================================
// EXAM REPORT PREVIEW (RIGHT SIDE)
// ============================================================
function renderExamPreview() {
  const container = document.getElementById('exam-preview-container');
  if (!container) return;
  container.innerHTML = '';

  examStudents.forEach((s, idx) => {
    const sName = s.nama && s.nama.trim() ? s.nama.trim() : (s.lang === 'id' ? 'Nama Siswa' : 'Student Name');
    const sLang = s.lang || examLang;
    const periods = getCoursePeriods(s.course);
    const pObj = periods.find(p => p.id === s.period) || periods[0] || { label: 'Report 1', label_id: 'Rapor 1', from: 1, to: 8 };
    const periodLabel = sLang === 'id' ? pObj.label_id : pObj.label;
    const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(s.course, sLang) : (s.course || 'Course');
    const categories = getCourseCategories(s.course, s.period);
    const curDetails = getPeriodCurriculumDetails(s.course, pObj.from, pObj.to, sLang);

    // Auto-populate notes if empty
    ensureStudentCategories(s);
    let hasNotes = false;
    categories.forEach(cat => {
      if (s.notes[cat.key]) hasNotes = true;
    });
    if (!hasNotes) {
      s.notes = generateStudentExamNotes(s);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'exam-report-card';
    wrapper.id = `exam-report-table-${idx}`;

    // Build Learning Objectives Accordion HTML
    let objItemsHtml = '';
    curDetails.allObjectivesList.forEach(item => {
      const bulletsHtml = item.objectives.map(o => `<li>${esc(o)}</li>`).join('');
      objItemsHtml += `
        <div class="obj-lesson-item">
          <div class="obj-lesson-head">Lesson ${item.num}: ${esc(item.title)}</div>
          <ul class="obj-lesson-list">${bulletsHtml || `<li>${esc(item.title)}</li>`}</ul>
        </div>
      `;
    });

    const objectivesCardHtml = `
      <div class="period-objectives-card" id="period-obj-card-${idx}">
        <div class="period-objectives-toggle" onclick="toggleStudentObjectives(${idx})">
          <div class="period-objectives-title">
            <span>🎯</span>
            <span><strong>${sLang === 'id' ? 'Learning Objectives Siklus Ini' : 'Learning Objectives Covered'}</strong> (Lesson ${pObj.from}–${pObj.to})</span>
            <span class="obj-count-tag">${curDetails.lessons.length} Lessons</span>
          </div>
          <div class="obj-toggle-btn" id="obj-toggle-btn-${idx}">
            Show Objectives ▼
          </div>
        </div>
        <div class="period-objectives-list" id="obj-list-${idx}" style="display: none;">
          <div class="obj-actions-bar">
            <button type="button" class="btn-copy-obj" onclick="copyPeriodObjectives(${idx})">
              📋 ${sLang === 'id' ? 'Salin Semua Objective' : 'Copy All Objectives'}
            </button>
            <span class="obj-hint-text">💡 ${sLang === 'id' ? 'Materi & konsep riil yang dipelajari siswa sepanjang 8 lesson ini' : 'Actual curriculum concepts & projects studied by student in this 8-lesson cycle'}</span>
          </div>
          <div class="obj-grid">
            ${objItemsHtml}
          </div>
        </div>
      </div>
    `;

    // Build Table Rows HTML
    let rowsHtml = '';
    categories.forEach((cat) => {
      const noteVal = s.notes[cat.key] || '';
      const charCount = noteVal.length;
      let charClass = 'optimal';
      let statusText = sLang === 'id' ? '✓ Optimal (350–500)' : '✓ Optimal (350–500)';
      if (charCount < 350) {
        charClass = 'under';
        statusText = sLang === 'id' ? `⚠️ Kurang ${350 - charCount} karakter` : `⚠️ ${350 - charCount} chars below target`;
      } else if (charCount > 500) {
        charClass = 'over';
        statusText = sLang === 'id' ? `⚠️ Melebihi batas (${charCount - 500})` : `⚠️ ${charCount - 500} chars over limit`;
      }

      rowsHtml += `
        <tr>
          <td class="lms-criteria-cell">
            <strong>${esc(cat.name)}</strong>
            <button type="button" class="btn-copy-mini" onclick="copyCriteriaNote(${idx}, '${cat.key}')" title="Copy note">
              📋 Copy Note
            </button>
          </td>
          <td class="lms-note-cell">
            <textarea class="lms-note-input" id="lms-note-${cat.key}-${idx}"
              oninput="onExamNoteInput(${idx}, '${cat.key}', this.value)"
              placeholder="${sLang === 'id' ? 'Catatan guru untuk kriteria ini (target 350–500 karakter)...' : 'Teacher note for this criteria (target 350–500 characters)...'}"
              rows="4">${esc(noteVal)}</textarea>
            <div class="lms-note-footer">
              <div class="char-counter-pill ${charClass}" id="char-counter-${cat.key}-${idx}">
                <span class="char-count-val" id="char-val-${cat.key}-${idx}">${charCount}</span> / 350–500 chars
                <span class="char-count-status" id="char-status-${cat.key}-${idx}">${statusText}</span>
              </div>
              <div class="note-quick-actions">
                <button type="button" class="btn-regen-mini" onclick="regenerateCriteriaNote(${idx}, '${cat.key}')" title="Regenerate note">
                  🔄 Regenerate
                </button>
                <button type="button" class="btn-copy-mini" onclick="copyCriteriaNote(${idx}, '${cat.key}')" title="Copy note">
                  📋 Copy Note
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    const audienceBadge = s.audience === 'adult'
      ? `<span class="exam-period-badge" style="background:#eff6ff;color:#2563eb;border-color:#bfdbfe;">🧑 ${sLang === 'id' ? 'Siswa Dewasa (Kamu)' : 'Adult Student (You)'}</span>`
      : `<span class="exam-period-badge" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;">👨‍👩‍👧 ${sLang === 'id' ? 'Orang Tua (Dia)' : 'Parent (3rd Person)'}</span>`;

    wrapper.innerHTML = `
      <div class="exam-report-header">
        <div class="exam-report-student-meta">
          <span class="exam-student-title">${esc(sName)}</span>
          <span class="exam-period-badge">🗓️ ${esc(periodLabel)}</span>
          <span class="exam-course-badge">📚 ${esc(localizedCourse)}</span>
          ${audienceBadge}
        </div>
      </div>

      <!-- Objectives Accordion (Curriculum Context for Teacher) -->
      ${objectivesCardHtml}

      <!-- Clean LMS Table Replica (Notes Only) -->
      <div class="lms-table-responsive">
        <table class="lms-table">
          <thead>
            <tr>
              <th class="col-criteria" style="width: 220px;">Criteria</th>
              <th class="col-notes">Teacher's Note (350–500 Chars)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(wrapper);
  });
}

// Copy single criteria note
function copyCriteriaNote(studentIdx, categoryKey) {
  const s = examStudents[studentIdx];
  const note = (s.notes && s.notes[categoryKey]) ? s.notes[categoryKey].trim() : '';
  if (!note) {
    showToast('Note is empty.', 'error');
    return;
  }

  const categories = getCourseCategories(s.course, s.period);
  const catObj = categories.find(c => c.key === categoryKey);
  const catName = catObj ? catObj.name : 'Criteria';

  navigator.clipboard.writeText(note).then(() => {
    showToast(`Copied ${catName} note!`, 'success');
  }).catch(() => {
    showToast('Failed to copy note.', 'error');
  });
}


const EXAM_GUIDE_TEXTS = {
  id: {
    title: '💡 Cara Pakai',
    steps: `<ol class="how-to-steps"><li><strong>Siswa & Periode:</strong> Isi nama, pilih pembaca (👨‍👩‍👧 Ortu / 🧑 Dewasa), bahasa, course & periode 8 lesson.</li><li><strong>Nilai & Absensi:</strong> Masukkan nilai (0–100) & atur status kehadiran jika siswa sempat izin.</li><li><strong>Objective & 350–500 Karakter:</strong> Klik <strong>⚡ Generate</strong> &rarr; cek objective kurikulum & pastikan note optimal (350–500 karakter) &rarr; klik <strong>📋 Copy Note</strong> ke LMS.</li></ol>`
  },
  en: {
    title: '💡 How to Use',
    steps: `<ol class="how-to-steps"><li><strong>Student & Period:</strong> Enter name, lang, course & 8-lesson period.</li><li><strong>Scores:</strong> Enter scores (0–100) for each criteria.</li><li><strong>Objectives & 350–500 Chars:</strong> Click <strong>⚡ Generate</strong> &rarr; review curriculum objectives & ensure optimal note length (350–500 chars) &rarr; click <strong>📋 Copy Note</strong> to LMS.</li></ol>`
  }
};


function setExamGuideLang(lang) {
  const titleEl = document.getElementById('exam-guide-title');
  const contentEl = document.getElementById('exam-guide-content');
  const btnId = document.getElementById('exam-guide-btn-id');
  const btnEn = document.getElementById('exam-guide-btn-en');
  if (btnId) btnId.classList.toggle('active', lang === 'id');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (titleEl && EXAM_GUIDE_TEXTS[lang]) titleEl.textContent = EXAM_GUIDE_TEXTS[lang].title;
  if (contentEl && EXAM_GUIDE_TEXTS[lang]) contentEl.innerHTML = EXAM_GUIDE_TEXTS[lang].steps;
}

// Tab Switching
function switchMainTab(tab) {
  const dailyTabBtn = document.getElementById('tab-btn-daily');
  const examTabBtn = document.getElementById('tab-btn-exam');
  const dailyView = document.getElementById('view-daily');
  const examView = document.getElementById('view-exam');

  if (tab === 'exam') {
    if (dailyTabBtn) dailyTabBtn.classList.remove('active');
    if (examTabBtn) examTabBtn.classList.add('active');
    if (dailyView) dailyView.style.display = 'none';
    if (examView) examView.style.display = 'flex';
    renderExamInputs();
  } else {
    if (dailyTabBtn) dailyTabBtn.classList.add('active');
    if (examTabBtn) examTabBtn.classList.remove('active');
    if (dailyView) dailyView.style.display = 'flex';
    if (examView) examView.style.display = 'none';
  }
}

// Global Exam Language Toggle
function setExamGlobalLang(lang) {
  examLang = lang;
  const btnEn = document.getElementById('exam-lang-btn-en');
  const btnId = document.getElementById('exam-lang-btn-id');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnId) btnId.classList.toggle('active', lang === 'id');
  examStudents.forEach(s => s.lang = lang);
  renderExamInputs();
}

// Initialize on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setExamGuideLang(examLang || 'id');
    // If exam tab is active by default or clicked, render
    if (document.getElementById('view-exam') && document.getElementById('view-exam').style.display !== 'none') {
      renderExamInputs();
    }
  });
}

