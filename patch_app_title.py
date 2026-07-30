import sys

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Update ID inProgressText
id_inprog_old = """    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} sedang mempelajari *Lesson ${lessonNum}* (${lessonTitle}). ${nama} telah memahami konsep dasarnya dan akan melanjutkan penyelesaian projek pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} sedang mempelajari *Lesson ${lessonNum}* (${lessonTitle}). Pada sesi ini, ${nama} sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Sisa materi dan project akan dilanjutkan pada pertemuan berikutnya.`;
    },"""

id_inprog_new = """    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} sedang mempelajari *${lessonTitle}*. ${nama} telah memahami konsep dasarnya dan akan melanjutkan penyelesaian projek pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} sedang mempelajari *${lessonTitle}*. Pada sesi ini, ${nama} sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Sisa materi dan project akan dilanjutkan pada pertemuan berikutnya.`;
    },"""
app_js = app_js.replace(id_inprog_old, id_inprog_new)


# Update ID oneAndHalfText
id_onehalf_old = """    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *Lesson ${l2Num}* (${l2Title}), yang akan dilanjutkan pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *Lesson ${l2Num}* (${l2Title}) dan sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Materi ini akan dilanjutkan pada pertemuan berikutnya.`;
    },"""

id_onehalf_new = """    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *${l2Title}*, yang akan dilanjutkan pada pertemuan berikutnya.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} menyelesaikan *Lesson ${l1Num}* hari ini — ${t1} Selanjutnya, ${nama} mulai memasuki materi *${l2Title}* dan sudah mulai memahami cara ${formatObjectives(partial, 'id')}. Materi ini akan dilanjutkan pada pertemuan berikutnya.`;
    },"""
app_js = app_js.replace(id_onehalf_old, id_onehalf_new)


# Update EN inProgressText
en_inprog_old = """    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} is currently working on *Lesson ${lessonNum}* (${lessonTitle}). ${nama} has understood the core concepts and will continue the project in the next session.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} is currently working on *Lesson ${lessonNum}* (${lessonTitle}). In this session, ${nama} has started learning how to ${formatObjectives(partial, 'en')}. The remaining materials and project will be continued in the next session.`;
    },"""

en_inprog_new = """    inProgressText: (nama, lessonNum, lessonTitle, objectives) => {
      if (!objectives || objectives.length === 0) return `${nama} is currently working on *${lessonTitle}*. ${nama} has understood the core concepts and will continue the project in the next session.`;
      const partial = getPartialObjectives(objectives);
      return `${nama} is currently working on *${lessonTitle}*. In this session, ${nama} has started learning how to ${formatObjectives(partial, 'en')}. The remaining materials and project will be continued in the next session.`;
    },"""
app_js = app_js.replace(en_inprog_old, en_inprog_new)


# Update EN oneAndHalfText
en_onehalf_old = """    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *Lesson ${l2Num}* (${l2Title}), which will be continued in the next session.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *Lesson ${l2Num}* (${l2Title}) and has begun learning how to ${formatObjectives(partial, 'en')}. This will be continued in the next session.`;
    },"""

en_onehalf_new = """    oneAndHalfText: (nama, l1Num, t1, l2Num, l2Title, obj2) => {
      if (!obj2 || obj2.length === 0) return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *${l2Title}*, which will be continued in the next session.`;
      const partial = getPartialObjectives(obj2);
      return `${nama} completed *Lesson ${l1Num}* today — ${t1} ${nama} then started *${l2Title}* and has begun learning how to ${formatObjectives(partial, 'en')}. This will be continued in the next session.`;
    },"""
app_js = app_js.replace(en_onehalf_old, en_onehalf_new)


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Title duplication patched successfully.")
