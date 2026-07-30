import sys

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# 1. Insert helper functions after let isAutoFit = ...;
helper_funcs = """let isAutoFit = { manual: true, auto: true };

function lowerFirst(str) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function getPartialObjectives(objectives) {
  if (!objectives || objectives.length === 0) return [];
  if (objectives.length === 1) return objectives;
  return objectives.slice(0, Math.ceil(objectives.length / 2));
}

function formatObjectives(objectives, lang) {
  if (!objectives || objectives.length === 0) return '';
  const obj = objectives.map(o => lowerFirst(o));
  if (obj.length === 1) return obj[0];
  const last = obj.pop();
  const andWord = lang === 'en' ? 'and' : 'dan';
  return obj.join(', ') + `, ${andWord} ` + last;
}
"""
app_js = app_js.replace('let isAutoFit = { manual: true, auto: true };', helper_funcs)

# 2. Update LANG_UI.id
id_fallback_old = "fallbackProgress: (nama, lessonNum, course) => `${nama} telah menyelesaikan *Lesson ${lessonNum}* pada course ${course}.`,"
id_fallback_new = """fallbackProgress: (nama, lessonNum, course, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} telah menyelesaikan *Lesson ${lessonNum}* pada course ${course}.`;
      return `Pada pertemuan ini, ${nama} telah menyelesaikan *Lesson ${lessonNum}*. ${nama} berhasil ${formatObjectives(objectives, 'id')}.`;
    },"""
app_js = app_js.replace(id_fallback_old, id_fallback_new)

id_inprogress_old = "inProgressText: (nama, lessonNum, lessonTitle) => `${nama} sedang mempelajari *Lesson ${lessonNum}* (${lessonTitle}). ${nama} telah memahami konsep dasarnya dan akan melanjutkan penyelesaian projek pada pertemuan berikutnya.`,"
id_inprogress_new = """inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} sedang mempelajari *Lesson ${lessonNum}* (${lessonTitle}). ${nama} telah memahami konsep dasarnya dan akan melanjutkan penyelesaian projek pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} sedang mempelajari *Lesson ${lessonNum}* (${lessonTitle}). Pada sesi ini, ${nama} sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Sisa materi dan project akan dilanjutkan pada pertemuan berikutnya.`;
    },"""
app_js = app_js.replace(id_inprogress_old, id_inprogress_new)

# 3. Update LANG_UI.en
en_fallback_old = "fallbackProgress: (nama, lessonNum, course) => `${nama} completed *Lesson ${lessonNum}* in the ${course} course today.`,"
en_fallback_new = """fallbackProgress: (nama, lessonNum, course, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} completed *Lesson ${lessonNum}* in the ${course} course today.`;
      return `In today's session, ${nama} completed *Lesson ${lessonNum}*. ${nama} successfully learned to ${formatObjectives(objectives, 'en')}.`;
    },"""
app_js = app_js.replace(en_fallback_old, en_fallback_new)

en_inprogress_old = "inProgressText: (nama, lessonNum, lessonTitle) => `${nama} is currently working on *Lesson ${lessonNum}* (${lessonTitle}). ${nama} has understood the core concepts and will continue the project in the next session.`,"
en_inprogress_new = """inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} is currently working on *Lesson ${lessonNum}* (${lessonTitle}). ${nama} has understood the core concepts and will continue the project in the next session.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} is currently working on *Lesson ${lessonNum}* (${lessonTitle}). In this session, ${nama} has started learning how to ${formatObjectives(partial, 'en')}. The remaining materials and project will be continued in the next session.`;
    },"""
app_js = app_js.replace(en_inprogress_old, en_inprogress_new)

# 4. Update generateProgress
gen_t1_old = """  const t1 = (templateMap[s.course] && templateMap[s.course][s.lesson])
    ? templateMap[s.course][s.lesson].replace(/{nama}/g, s.nama)
    : L.fallbackProgress(s.nama, s.lesson, s.course);"""
gen_t1_new = """  const t1 = (templateMap[s.course] && templateMap[s.course][s.lesson])
    ? templateMap[s.course][s.lesson].replace(/{nama}/g, s.nama)
    : L.fallbackProgress(s.nama, s.lesson, s.course, l1Obj ? l1Obj.objectives : []);"""
app_js = app_js.replace(gen_t1_old, gen_t1_new)

gen_inprog_old = """    const lessonTitle = l1Obj ? l1Obj.title : `Lesson ${s.lesson}`;
    text = L.inProgressText(s.nama, s.lesson, lessonTitle);"""
gen_inprog_new = """    const lessonTitle = l1Obj ? l1Obj.title : `Lesson ${s.lesson}`;
    text = L.inProgressText(s.nama, s.lesson, lessonTitle, l1Obj ? l1Obj.objectives : []);"""
app_js = app_js.replace(gen_inprog_old, gen_inprog_new)

gen_double_old = """  } else if (s.status === 'double') {
    const t2 = (templateMap[s.course] && templateMap[s.course][s.lesson2])
      ? templateMap[s.course][s.lesson2].replace(/{nama}/g, s.nama)
      : L.fallbackProgress(s.nama, s.lesson2, s.course);
    text = L.doubleText(s.nama, s.lesson, t1, s.lesson2, t2);
  }"""
gen_double_new = """  } else if (s.status === 'double') {
    const t2 = (templateMap[s.course] && templateMap[s.course][s.lesson2])
      ? templateMap[s.course][s.lesson2].replace(/{nama}/g, s.nama)
      : L.fallbackProgress(s.nama, s.lesson2, s.course, l2Obj ? l2Obj.objectives : []);
    text = L.doubleText(s.nama, s.lesson, t1, s.lesson2, t2);
  }"""
app_js = app_js.replace(gen_double_old, gen_double_new)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("app.js patched successfully.")
