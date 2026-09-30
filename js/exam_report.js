// ============================================================
// EXAM REPORT GENERATOR (LMS Student Progress Report)
// Timedoor Academy 8-Lesson Cycle Exam & Progress Report
// ============================================================

// State for Exam Report
let examStudents = [
  {
    nama: 'Student One',
    criteria: 'Kids',
    course: 'Game Developer',
    period: 'report_1',
    lang: 'en',
    scores: {
      concept: 80,
      application: 82,
      character: 84
    },
    notes: {
      concept: '',
      application: '',
      character: ''
    }
  }
];

let examLang = 'en';

const esc = (typeof escHtml === 'function')
  ? escHtml
  : (s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
// A: 86-100 (Very Good)
// B: 75-85 (Good)
// C: 60-74 (Fair)
// D: 50-59 (Bad)
// E: <49 (Fail)
function calculateGrade(score) {
  const s = parseFloat(score);
  if (isNaN(s)) return { grade: '—', label: '—', stars: '☆☆☆☆☆', starCount: 0, color: '#94a3b8' };
  if (s >= 86) {
    return { grade: 'A', label: 'Very Good', label_id: 'Sangat Baik', stars: '★★★★★', starCount: 5, color: '#16a34a' };
  } else if (s >= 75) {
    return { grade: 'B', label: 'Good', label_id: 'Baik', stars: '★★★★☆', starCount: 4, color: '#2563eb' };
  } else if (s >= 60) {
    return { grade: 'C', label: 'Fair', label_id: 'Cukup', stars: '★★★☆☆', starCount: 3, color: '#d97706' };
  } else if (s >= 50) {
    return { grade: 'D', label: 'Bad', label_id: 'Kurang', stars: '★★☆☆☆', starCount: 2, color: '#ea580c' };
  } else {
    return { grade: 'E', label: 'Fail', label_id: 'Perlu Pengulangan', stars: '★☆☆☆☆', starCount: 1, color: '#dc2626' };
  }
}

// Generate report periods based on course lesson count
function getCoursePeriods(courseName) {
  // Special case: Python Game Dev Kids
  if (courseName === 'Python Game Developer' || courseName === 'Python Game Dev') {
    return [
      { id: 'report_1', label: 'Report 1 (Lesson 1 - 8)', label_id: 'Rapor 1 (Lesson 1 - 8)', from: 1, to: 8 },
      { id: 'report_2', label: 'Report 2 (Lesson 9 - 16)', label_id: 'Rapor 2 (Lesson 9 - 16)', from: 9, to: 16 },
      { id: 'report_single_16', label: 'Report (Lesson 1 - 16)', label_id: 'Rapor (Lesson 1 - 16)', from: 1, to: 16 }
    ];
  }

  let totalLessons = 24;
  if (typeof COURSE_DATA !== 'undefined' && COURSE_DATA[courseName]) {
    totalLessons = COURSE_DATA[courseName].length;
  }

  const periods = [];
  const cycle = 8;
  const count = Math.max(1, Math.ceil(totalLessons / cycle));

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

// Extract curriculum topics and project context from COURSE_DATA
function getCurriculumContext(courseName, fromLesson, toLesson, lang) {
  if (typeof COURSE_DATA === 'undefined' || !COURSE_DATA[courseName]) {
    return {
      topics: lang === 'id' ? 'konsep dasar dan logika pemrograman' : 'core programming concepts and logic',
      project: lang === 'id' ? 'project coding dan ujian praktik' : 'the term coding project and practical exam'
    };
  }

  const lessons = COURSE_DATA[courseName].filter(l => l.num >= fromLesson && l.num <= toLesson);
  if (!lessons || lessons.length === 0) {
    return {
      topics: lang === 'id' ? 'konsep pemrograman' : 'programming concepts',
      project: lang === 'id' ? 'project akhir' : 'final project'
    };
  }

  // Collect key topics
  const allObjectives = [];
  lessons.forEach(l => {
    if (lang === 'en') {
      if (l.objectives_en && l.objectives_en.length > 0) {
        l.objectives_en.forEach(o => {
          const clean = o.replace(/^Understanding\s+|^Capable of\s+|^Learning\s+/i, '').trim();
          if (clean && !allObjectives.includes(clean)) allObjectives.push(clean);
        });
      } else {
        // Fallback: use clean English lesson titles
        const cleanTitle = (l.title_en || l.title || '').replace(/^Lesson\s*\d+\s*(?:-|:)\s*/i, '').trim();
        if (cleanTitle && !/^(?:overview|exam|review|ujian|kuis|exam\s*\d*)$/i.test(cleanTitle) && !allObjectives.includes(cleanTitle)) {
          allObjectives.push(cleanTitle);
        }
      }
    } else {
      const objs = l.objectives || [];
      objs.forEach(o => {
        const clean = o.replace(/^Memahami\s+|^Mampu\s+|^Mempelajari\s+/i, '').trim();
        if (clean && !allObjectives.includes(clean)) allObjectives.push(clean);
      });
    }
  });

  // Pick 3-4 representative topics
  const sampledTopics = allObjectives.slice(0, 4).join(', ');
  const topicsText = sampledTopics || (lang === 'id' ? 'konsep logika dan struktur kode' : 'core logic and coding structures');

  // Find exam or project lesson (usually the last or second to last lesson in cycle)
  let cleanProject = '';
  for (let i = lessons.length - 1; i >= 0; i--) {
    const l = lessons[i];
    const raw = (lang === 'id' && l.title_id) ? l.title_id : (l.title_en || l.title || '');
    const clean = raw.replace(/^Lesson\s*\d+\s*(?:-|:)\s*/i, '').trim();
    if (clean && !/^(?:exam|ujian|review|kuis|exam\s*\d*|overview and exam)$/i.test(clean)) {
      cleanProject = clean;
      break;
    }
  }

  if (!cleanProject) {
    cleanProject = lang === 'id' ? 'project coding dan ujian praktik' : 'the term coding project and practical exam';
  } else {
    cleanProject = (lang === 'id' ? `project ${cleanProject}` : `the ${cleanProject} project`);
  }

  return {
    topics: topicsText,
    project: cleanProject
  };
}

// Generate Teacher's Notes for all 3 criteria following Timedoor rubric
function generateExamNotes(student) {
  const sName = student.nama && student.nama.trim() ? student.nama.trim() : 'Student';
  const course = student.course || 'Coding';
  const lang = student.lang || examLang || 'en';
  const periods = getCoursePeriods(course);
  const currentPeriod = periods.find(p => p.id === student.period) || periods[0] || { from: 1, to: 8 };

  const context = getCurriculumContext(course, currentPeriod.from, currentPeriod.to, lang);
  const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(course, lang) : course;

  const conceptScore = parseFloat(student.scores.concept) || 80;
  const appScore = parseFloat(student.scores.application) || 82;
  const charScore = parseFloat(student.scores.character) || 84;

  const gConcept = calculateGrade(conceptScore);
  const gApp = calculateGrade(appScore);
  const gChar = calculateGrade(charScore);

  let noteConcept = '';
  let noteApp = '';
  let noteChar = '';

  // 1. Coding & Literacy Concept Note
  if (lang === 'en') {
    if (gConcept.grade === 'A') {
      noteConcept = `${sName} learned the core concepts in ${localizedCourse} this term, such as ${context.topics}. ${sName} grasps programming ideas effortlessly, follows complex logic independently, and understands the purpose behind each code block. Well done mastering these concepts with high excellence, ${sName}!`;
    } else if (gConcept.grade === 'B') {
      noteConcept = `${sName} learned the basic ideas in ${localizedCourse} this term, such as ${context.topics}. ${sName} can follow the LMS instructions well and understands what each idea is for. With a short review before each class to strengthen recall, ${sName} will master these concepts even faster. Well done learning these new ideas, ${sName}!`;
    } else if (gConcept.grade === 'C') {
      noteConcept = `${sName} was introduced to fundamental concepts in ${localizedCourse} this term, including ${context.topics}. While ${sName} understands the general workflow, some technical logic took longer to absorb. A regular 10-15 minute review of past lessons at home will greatly help solidify these ideas. Keep practicing and reviewing, ${sName}!`;
    } else {
      noteConcept = `${sName} has been guided through the essential concepts in ${localizedCourse} this term, such as ${context.topics}. ${sName} is making progress, though several foundational ideas require consistent repetition and step-by-step review to build full confidence. We encourage regular review at home to support ${sName}'s learning journey. Keep going, ${sName}!`;
    }
  } else {
    if (gConcept.grade === 'A') {
      noteConcept = `${sName} telah mempelajari konsep-konsep inti dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} mampu memahami logika pemrograman dengan sangat mandiri, cepat menangkap ide-ide baru, serta memahami fungsi dari setiap blok kode. Kerja yang luar biasa dalam menguasai materi ini, ${sName}!`;
    } else if (gConcept.grade === 'B') {
      noteConcept = `${sName} mempelajari konsep-konsep dasar dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} dapat mengikuti instruksi LMS dengan baik dan memahami tujuan dari setiap materi. Sedikit review materi sebelum sesi kelas akan membantu ${sName} mengingat konsep dengan lebih kuat. Kerja bagus dalam mempelajari materi baru ini, ${sName}!`;
    } else if (gConcept.grade === 'C') {
      noteConcept = `${sName} telah mempelajari konsep-konsep penting dalam ${localizedCourse} pada term ini, termasuk ${context.topics}. Meskipun sudah memahami alur umumnya, beberapa logika teknis membutuhkan waktu lebih untuk dipahami. Review rutin 10-15 menit di rumah akan sangat membantu memperkuat pemahaman ${sName}. Tetap semangat dan terus berlatih, ${sName}!`;
    } else {
      noteConcept = `${sName} telah diperkenalkan pada konsep-konsep dasar dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} terus berproses, meski beberapa logika dasar masih memerlukan bimbingan intensif dan pengulangan berkala. Latihan rutin di rumah akan sangat mendukung kemajuan ${sName}. Tetap semangat, ${sName}!`;
    }
  }

  // 2. Coding Application Note
  if (lang === 'en') {
    if (gApp.grade === 'A') {
      noteApp = `${sName} applied these concepts brilliantly to develop ${context.project}. ${sName} demonstrated strong problem-solving skills, implemented features with minimal assistance, and finished the term exam covering all this material with impressive results. Fantastic effort and creativity throughout the project, ${sName}! Keep it up!`;
    } else if (gApp.grade === 'B') {
      noteApp = `${sName} used these ideas to build a complete project — working on ${context.project}. ${sName} followed the development steps well and finished the term exam covering all this material. More practice at home between classes can help ${sName} build and assemble these project components even faster. Good job finishing the exam, ${sName}! Keep it up.`;
    } else if (gApp.grade === 'C') {
      noteApp = `${sName} worked on applying these concepts to create ${context.project}. ${sName} was able to complete the required features with guidance during debugging and finished the term exam. Practicing similar mechanics independently at home will give ${sName} greater speed and agility in coding. Keep practicing, ${sName}!`;
    } else {
      noteApp = `${sName} participated in creating ${context.project} this term. ${sName} completed the project tasks with close guidance and finished the term exam. Dedicating extra time for hands-on practice will help ${sName} feel more comfortable writing and applying code independently. Keep up the effort, ${sName}!`;
    }
  } else {
    if (gApp.grade === 'A') {
      noteApp = `${sName} berhasil menerapkan konsep-konsep ini dengan sangat baik dalam mengembangkan ${context.project}. ${sName} menunjukkan kemampuan problem solving yang matang, menyusun fitur project secara mandiri, dan menyelesaikan ujian praktik term ini dengan hasil yang memuaskan. Prestasi dan kreativitas yang luar biasa, ${sName}! Terus pertahankan!`;
    } else if (gApp.grade === 'B') {
      noteApp = `${sName} menggunakan materi ini untuk membangun project lengkap — mengerjakan ${context.project}. ${sName} mengikuti langkah-langkah pembuatan dengan baik dan menyelesaikan ujian term yang mencakup seluruh materi ini. Latihan tambahan di rumah akan membantu ${sName} menyusun komponen project dengan lebih cepat. Kerja bagus dalam menyelesaikan ujian, ${sName}! Terus pertahankan.`;
    } else if (gApp.grade === 'C') {
      noteApp = `${sName} mempraktikkan konsep yang dipelajari untuk membuat ${context.project}. ${sName} berhasil menyelesaikan fitur-fitur yang ditentukan dengan sedikit pendampingan saat memperbaiki kesalahan kode (debugging) serta menyelesaikan ujian term. Latihan mandiri di rumah akan membantu ${sName} lebih mandiri dan terbiasa. Tetap semangat, ${sName}!`;
    } else {
      noteApp = `${sName} telah berpartisipasi dalam pembuatan ${context.project} pada term ini. ${sName} menyelesaikan tugas-tugas project dengan panduan langsung dari teacher dan menyelesaikan ujian term. Meluangkan waktu latihan praktik tambahan akan membantu ${sName} merasa lebih nyaman memprogram secara mandiri. Terus berjuang, ${sName}!`;
    }
  }

  // 3. Character Note
  if (lang === 'en') {
    if (gChar.grade === 'A') {
      noteChar = `${sName} consistently displays an outstanding learning attitude in class. ${sName} is enthusiastic, stays focused on tasks, asks thoughtful questions, and readily overcomes coding difficulties with patience and resilience. An absolute pleasure to teach. Keep up the wonderful character and passion, ${sName}!`;
    } else if (gChar.grade === 'B') {
      noteChar = `${sName} pays attention in class and likes working on coding projects, but can get distracted sometimes and may need a small reminder to stay on task. Maintaining consistent attendance and a quick review after class will help ${sName} catch up and advance even faster. Good job staying focused in class, ${sName}! Keep it up.`;
    } else if (gChar.grade === 'C') {
      noteChar = `${sName} shows interest in the lessons and enjoys interactive coding activities. At times, ${sName} needs encouragement to maintain concentration throughout the whole session. Building a steady routine and practicing sustained focus will boost ${sName}'s learning stamina significantly. Keep working hard, ${sName}!`;
    } else {
      noteChar = `${sName} is friendly and interactive during class. ${sName} requires supportive motivation and guidance to stay engaged with the assignments and develop disciplined learning habits. With patience and consistent encouragement, ${sName}'s focus will steadily improve. Keep trying your best, ${sName}!`;
    }
  } else {
    if (gChar.grade === 'A') {
      noteChar = `${sName} senantiasa menunjukkan sikap belajar yang sangat teladan di kelas. ${sName} selalu antusias, fokus penuh saat mengerjakan tugas, aktif bertanya, dan memiliki daya juang tinggi saat memecahkan kendala coding. Sangat menyenangkan membimbing ${sName}. Terus pertahankan karakter dan semangat hebat ini, ${sName}!`;
    } else if (gChar.grade === 'B') {
      noteChar = `${sName} memperhatikan penjelasan di kelas dengan baik dan senang mengerjakan project coding-nya, namun terkadang sedikit terdistraksi dan memerlukan pengingat ringan agar tetap fokus pada tugas. Konsistensi kehadiran dan review singkat setelah kelas akan sangat membantu ${sName} belajar lebih cepat. Kerja bagus dalam menjaga fokus, ${sName}! Terus pertahankan.`;
    } else if (gChar.grade === 'C') {
      noteChar = `${sName} menunjukkan ketertarikan yang baik dalam belajar coding dan menikmati kegiatan di kelas. Terkadang ${sName} membutuhkan dorongan semangat agar dapat mempertahankan konsentrasi sepanjang sesi. Membangun kebiasaan fokus yang stabil akan sangat mendukung perkembangan ${sName}. Terus bersemangat, ${sName}!`;
    } else {
      noteChar = `${sName} sangat ramah dan komunikatif di kelas. ${sName} membutuhkan bimbingan suportif dan motivasi teratur untuk mempertahankan fokus pada instruksi serta membangun kebiasaan belajar yang disiplin. Dengan dorongan positif yang konsisten, fokus ${sName} akan semakin berkembang. Tetap semangat melakukan yang terbaik, ${sName}!`;
    }
  }

  return {
    concept: noteConcept,
    application: noteApp,
    character: noteChar
  };
}

// Render the Exam Report form in the sidebar
function renderExamInputs() {
  const container = document.getElementById('exam-students-container');
  if (!container) return;
  container.innerHTML = '';

  examStudents.forEach((s, i) => {
    const sLang = s.lang || examLang;
    s.lang = sLang;
    const periods = getCoursePeriods(s.course);

    const gConcept = calculateGrade(s.scores.concept);
    const gApp = calculateGrade(s.scores.application);
    const gChar = calculateGrade(s.scores.character);

    const card = document.createElement('div');
    card.className = 'student-card exam-student-card';
    card.id = `exam-student-card-${i}`;

    card.innerHTML = `
      <div class="student-card-header">
        <div class="student-num">${i + 1}</div>
        <input type="text" id="exam-name-${i}" placeholder="Student Name" value="${esc(s.nama)}" oninput="examStudents[${i}].nama=this.value;renderExamPreview()">
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

        <!-- Scores Input Section -->
        <div class="exam-scores-box">
          <div class="exam-score-row">
            <div class="exam-score-label">
              <span class="score-cat-title">Coding &amp; Literacy Concept</span>
              <span class="score-grade-badge" id="exam-badge-concept-${i}" style="color:${gConcept.color}">${gConcept.grade} (${gConcept.label})</span>
            </div>
            <div class="exam-score-input-wrap">
              <input type="number" min="0" max="100" class="exam-score-input" id="exam-score-concept-${i}" value="${s.scores.concept}" oninput="onExamScoreInput(${i},'concept',this.value)">
            </div>
          </div>

          <div class="exam-score-row">
            <div class="exam-score-label">
              <span class="score-cat-title">Coding Application</span>
              <span class="score-grade-badge" id="exam-badge-app-${i}" style="color:${gApp.color}">${gApp.grade} (${gApp.label})</span>
            </div>
            <div class="exam-score-input-wrap">
              <input type="number" min="0" max="100" class="exam-score-input" id="exam-score-app-${i}" value="${s.scores.application}" oninput="onExamScoreInput(${i},'application',this.value)">
            </div>
          </div>

          <div class="exam-score-row">
            <div class="exam-score-label">
              <span class="score-cat-title">Character</span>
              <span class="score-grade-badge" id="exam-badge-char-${i}" style="color:${gChar.color}">${gChar.grade} (${gChar.label})</span>
            </div>
            <div class="exam-score-input-wrap">
              <input type="number" min="0" max="100" class="exam-score-input" id="exam-score-char-${i}" value="${s.scores.character}" oninput="onExamScoreInput(${i},'character',this.value)">
            </div>
          </div>
        </div>

        <button class="btn-generate" onclick="generateStudentExamReport(${i})" style="margin-top:6px;">
          ⚡ Generate Exam Report
        </button>
      </div>
    `;

    container.appendChild(card);
    populateExamCourseDropdown(i);

    // Setup custom select for level, course, and period
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
  const courseList = (s.criteria && COURSE_MAP[s.criteria])
    ? COURSE_MAP[s.criteria]
    : ((s.criteria === 'Juniors' || s.criteria === 'Junior') ? (COURSE_MAP['Juniors'] || COURSE_MAP['Junior']) : null);

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
  examStudents[idx].course = '';
  examStudents[idx].period = 'report_1';
  populateExamCourseDropdown(idx);
  renderExamInputs();
}

function onExamCourseChange(idx, selectEl) {
  examStudents[idx].course = selectEl.value;
  examStudents[idx].period = 'report_1';
  renderExamInputs();
}

function onExamPeriodChange(idx, selectEl) {
  examStudents[idx].period = selectEl.value;
  renderExamPreview();
}

function onExamScoreInput(idx, cat, val) {
  const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
  examStudents[idx].scores[cat] = num;
  const g = calculateGrade(num);

  const badge = document.getElementById(`exam-badge-${cat === 'application' ? 'app' : (cat === 'character' ? 'char' : 'concept')}-${idx}`);
  if (badge) {
    badge.textContent = `${g.grade} (${g.label})`;
    badge.style.color = g.color;
  }

  renderExamPreview();
}

function setExamStudentLang(idx, lang) {
  examStudents[idx].lang = lang;
  renderExamInputs();
}

function addExamStudent() {
  examStudents.push({
    nama: '',
    criteria: 'Kids',
    course: 'Game Developer',
    period: 'report_1',
    lang: examLang,
    scores: { concept: 80, application: 82, character: 84 },
    notes: { concept: '', application: '', character: '' }
  });
  renderExamInputs();
  const cards = document.querySelectorAll('#exam-students-container .student-card');
  if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeExamStudent(idx) {
  if (examStudents.length <= 1) {
    if (typeof toast === 'function') toast('Minimum 1 student is required.', 'error');
    return;
  }
  examStudents.splice(idx, 1);
  renderExamInputs();
}

function generateStudentExamReport(idx) {
  const s = examStudents[idx];
  if (!s.nama || !s.nama.trim()) {
    if (typeof toast === 'function') toast('Please enter Student Name.', 'error');
    return;
  }
  if (!s.course) {
    if (typeof toast === 'function') toast('Please select a Course.', 'error');
    return;
  }

  const generated = generateExamNotes(s);
  s.notes.concept = generated.concept;
  s.notes.application = generated.application;
  s.notes.character = generated.character;

  renderExamPreview();
  if (typeof toast === 'function') toast(`Report generated for ${s.nama}!`, 'success');

  const table = document.getElementById(`exam-report-table-${idx}`);
  if (table) table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateAllExamReports() {
  examStudents.forEach((_, idx) => generateStudentExamReport(idx));
}

// Render the right-side LMS-style table output
function renderExamPreview() {
  const container = document.getElementById('exam-preview-container');
  if (!container) return;
  container.innerHTML = '';

  examStudents.forEach((s, idx) => {
    const sName = s.nama && s.nama.trim() ? s.nama.trim() : 'Student Name';
    const sLang = s.lang || examLang;
    const periods = getCoursePeriods(s.course);
    const pObj = periods.find(p => p.id === s.period) || periods[0] || { label: 'Report 1', label_id: 'Rapor 1' };
    const periodLabel = sLang === 'id' ? pObj.label_id : pObj.label;
    const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(s.course, sLang) : (s.course || 'Course');

    const gConcept = calculateGrade(s.scores.concept);
    const gApp = calculateGrade(s.scores.application);
    const gChar = calculateGrade(s.scores.character);

    // Auto generate initial notes if empty
    if (!s.notes.concept && !s.notes.application && !s.notes.character) {
      const initNotes = generateExamNotes(s);
      s.notes.concept = initNotes.concept;
      s.notes.application = initNotes.application;
      s.notes.character = initNotes.character;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'exam-report-card';
    wrapper.id = `exam-report-table-${idx}`;

    wrapper.innerHTML = `
      <div class="exam-report-header">
        <div class="exam-report-student-meta">
          <span class="exam-student-title">${esc(sName)}</span>
          <span class="exam-period-badge">${esc(periodLabel)}</span>
          <span class="exam-course-badge">${esc(localizedCourse)}</span>
        </div>
        <div class="exam-report-actions">
          <button class="btn-copy-exam" onclick="copyFullExamReport(${idx})">📋 Copy Full Report</button>
        </div>
      </div>

      <!-- LMS Official Table Replica -->
      <div class="lms-table-responsive">
        <table class="lms-table">
          <thead>
            <tr>
              <th style="width: 175px;">Criteria</th>
              <th>Teacher's Note</th>
            </tr>
          </thead>
          <tbody>
            <!-- Row 1: Coding & Literacy Concept -->
            <tr>
              <td class="lms-criteria-cell">
                <strong>Coding & Literacy Concept</strong>
                <button type="button" class="btn-copy-mini" onclick="copyCriteriaNote(${idx}, 'concept')">📋 Copy</button>
              </td>
              <td class="lms-note-cell">
                <textarea class="lms-note-input" id="lms-note-concept-${idx}" oninput="examStudents[${idx}].notes.concept=this.value" rows="4">${esc(s.notes.concept)}</textarea>
              </td>
            </tr>

            <!-- Row 2: Coding Application -->
            <tr>
              <td class="lms-criteria-cell">
                <strong>Coding Application</strong>
                <button type="button" class="btn-copy-mini" onclick="copyCriteriaNote(${idx}, 'application')">📋 Copy</button>
              </td>
              <td class="lms-note-cell">
                <textarea class="lms-note-input" id="lms-note-app-${idx}" oninput="examStudents[${idx}].notes.application=this.value" rows="4">${esc(s.notes.application)}</textarea>
              </td>
            </tr>

            <!-- Row 3: Character -->
            <tr>
              <td class="lms-criteria-cell">
                <strong>Character</strong>
                <button type="button" class="btn-copy-mini" onclick="copyCriteriaNote(${idx}, 'character')">📋 Copy</button>
              </td>
              <td class="lms-note-cell">
                <textarea class="lms-note-input" id="lms-note-char-${idx}" oninput="examStudents[${idx}].notes.character=this.value" rows="4">${esc(s.notes.character)}</textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(wrapper);
  });
}

function renderStarsHTML(count) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= count ? 'star-filled' : 'star-empty'}">★</span>`;
  }
  return html;
}

// Copy individual criteria note to clipboard
function copyCriteriaNote(studentIdx, criteriaKey) {
  const s = examStudents[studentIdx];
  const note = s.notes[criteriaKey] || '';
  if (!note) {
    if (typeof toast === 'function') toast('Note is empty.', 'error');
    return;
  }

  navigator.clipboard.writeText(note).then(() => {
    const titles = {
      concept: 'Coding & Literacy Concept',
      application: 'Coding Application',
      character: 'Character'
    };
    if (typeof toast === 'function') toast(`Copied ${titles[criteriaKey]} note!`, 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Failed to copy note.', 'error');
  });
}

// Copy full student report text formatted for chat/LMS
function copyFullExamReport(studentIdx) {
  const s = examStudents[studentIdx];
  const sName = s.nama && s.nama.trim() ? s.nama.trim() : 'Student';
  const sLang = s.lang || examLang;
  const periods = getCoursePeriods(s.course);
  const pObj = periods.find(p => p.id === s.period) || periods[0] || { label: 'Report 1', label_id: 'Rapor 1' };
  const periodLabel = sLang === 'id' ? pObj.label_id : pObj.label;
  const courseName = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(s.course, sLang) : (s.course || 'Course');

  const gConcept = calculateGrade(s.scores.concept);
  const gApp = calculateGrade(s.scores.application);
  const gChar = calculateGrade(s.scores.character);

  const text = `📊 *STUDENT PROGRESS / EXAM REPORT*
👤 *Student:* ${sName}
📚 *Course:* ${courseName}
🗓️ *Period:* ${periodLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ *Coding & Literacy Concept*
⭐ Score: ${s.scores.concept} (Grade ${gConcept.grade} - ${gConcept.label})
📝 Teacher's Note:
${s.notes.concept}

━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ *Coding Application*
⭐ Score: ${s.scores.application} (Grade ${gApp.grade} - ${gApp.label})
📝 Teacher's Note:
${s.notes.application}

━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ *Character*
⭐ Score: ${s.scores.character} (Grade ${gChar.grade} - ${gChar.label})
📝 Teacher's Note:
${s.notes.character}
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  navigator.clipboard.writeText(text).then(() => {
    if (typeof toast === 'function') toast(`Full exam report for ${sName} copied!`, 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Failed to copy report.', 'error');
  });
}

// Copy all students' reports
function copyAllExamReports() {
  let combined = '';
  examStudents.forEach((s, idx) => {
    const sName = s.nama && s.nama.trim() ? s.nama.trim() : `Student ${idx + 1}`;
    const sLang = s.lang || examLang;
    const periods = getCoursePeriods(s.course);
    const pObj = periods.find(p => p.id === s.period) || periods[0] || { label: 'Report 1', label_id: 'Rapor 1' };
    const periodLabel = sLang === 'id' ? pObj.label_id : pObj.label;
    const courseName = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(s.course, sLang) : (s.course || 'Course');

    const gConcept = calculateGrade(s.scores.concept);
    const gApp = calculateGrade(s.scores.application);
    const gChar = calculateGrade(s.scores.character);

    combined += `📊 *STUDENT PROGRESS REPORT — ${sName.toUpperCase()}*
📚 Course: ${courseName} | Period: ${periodLabel}

1. Coding & Literacy Concept (${s.scores.concept} - Grade ${gConcept.grade}):
${s.notes.concept}

2. Coding Application (${s.scores.application} - Grade ${gApp.grade}):
${s.notes.application}

3. Character (${s.scores.character} - Grade ${gChar.grade}):
${s.notes.character}

===========================================\n\n`;
  });

  navigator.clipboard.writeText(combined.trim()).then(() => {
    if (typeof toast === 'function') toast('All exam reports copied to clipboard!', 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Failed to copy.', 'error');
  });
}

// Switch between Daily Meeting Report and Student Exam Report
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

function setExamGlobalLang(lang) {
  examLang = lang;
  const btnEn = document.getElementById('exam-lang-btn-en');
  const btnId = document.getElementById('exam-lang-btn-id');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnId) btnId.classList.toggle('active', lang === 'id');
  examStudents.forEach(s => s.lang = lang);
  renderExamInputs();
}

// Auto init on page load
document.addEventListener('DOMContentLoaded', () => {
  const tgl = document.getElementById('exam-tanggal');
  if (tgl && !tgl.value) {
    const today = new Date().toISOString().split('T')[0];
    tgl.value = today;
  }
});

