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
// OFFICIAL TIMEDOOR EXAM REPORT TEMPLATES
// ============================================================
const EXAM_TEMPLATES = {
  // ------------------------------------------------------------
  // 3D ANIMATOR
  // ------------------------------------------------------------
  '3danimator': {
    report_1: {
      comp_lit: {
        id: {
          A: "{name} belajar cara mengoperasikan komputer, termasuk menggunakan mouse dan keyboard. {name} juga mengembangkan keterampilan motorik halus melalui aktivitas seperti mengklik, drag mouse, dan mengetik.",
          B: "{name} belajar cara mengoperasikan komputer, termasuk menggunakan mouse dan keyboard. {name} juga mengembangkan keterampilan motorik halus melalui aktivitas seperti mengklik, drag mouse, dan mengetik.",
          C: "{name} telah diperkenalkan dengan pengoperasian komputer dasar seperti penggunaan mouse dan keyboard. Latihan rutin mengklik dan drag mouse di rumah akan membantu kelancaran {name}."
        },
        en: {
          A: "{name} learned how to operate a computer, including using a mouse and keyboard. {name} also developed fine motor skills through activities such as clicking, dragging the mouse, and typing.",
          B: "{name} learned how to operate a computer, including using a mouse and keyboard. {name} also developed fine motor skills through activities such as clicking, dragging the mouse, and typing.",
          C: "{name} was introduced to basic computer operations such as using a mouse and keyboard. Regular practice with mouse clicks and typing at home will greatly improve {name}'s fluency."
        }
      },
      code_prac: {
        id: {
          A: "{name} mempelajari konsep dasar coding, termasuk algoritma, event, dan loop. Konsep-konsep ini diterapkan pada game koding interaktif sederhana, seperti rutinitas langkah demi langkah dan desain pola.",
          B: "{name} mempelajari konsep dasar coding, termasuk algoritma, event, dan loop. Konsep-konsep ini diterapkan pada game koding interaktif sederhana, seperti rutinitas langkah demi langkah dan desain pola.",
          C: "{name} mempelajari konsep dasar coding seperti algoritma dan event. Dengan sedikit pengulangan berkala, {name} akan semakin lancar dalam merancang alur logika codingnya."
        },
        en: {
          A: "{name} learned fundamental coding concepts, including algorithms, events, and loops. These concepts were applied to simple interactive coding games, such as step-by-step routines and pattern designs.",
          B: "{name} learned fundamental coding concepts, including algorithms, events, and loops. These concepts were applied to simple interactive coding games, such as step-by-step routines and pattern designs.",
          C: "{name} was introduced to basic coding concepts like algorithms and events. Periodic review will help {name} grasp logical sequencing with greater ease."
        }
      },
      char: {
        id: {
          A: "{name} menunjukkan kerajinan dan pemahaman materi yang baik. Namun, ia masih sering merasa malu untuk bertanya saat kesulitan dan cenderung diam sebelum disapa. Perlu dorongan agar ia lebih berani dan aktif di kelas.",
          B: "{name} dapat diandalkan dalam memahami materi dan menyelesaikan tugas dengan baik. Namun, ia masih perlu menjaga fokus saat belajar karena terkadang perhatiannya mudah teralihkan.",
          C: "{name} memiliki antusiasme yang baik di kelas. Diperlukan sedikit dorongan agar {name} dapat mempertahankan konsentrasi sepanjang sesi pembelajaran."
        },
        en: {
          A: "{name} demonstrates good diligence and solid comprehension of the material. However, {name} can still be shy about asking questions when facing difficulties. Encouragement will help build confidence to speak up.",
          B: "{name} is dependable in understanding lessons and completing assignments well. However, {name} still needs to maintain focus during study time as attention can occasionally wander.",
          C: "{name} shows a positive attitude in class. Continuous encouragement will help {name} sustain concentration throughout the whole learning session."
        }
      }
    },
    report_2: {
      comp_lit: {
        id: {
          A: "{name} meningkatkan keterampilannya dalam mengoperasikan komputer dengan mengeksplor berbagai platform coding. {name} menunjukkan rasa percaya diri dan kemandirian yang lebih besar dalam menggunakan komputer.",
          B: "{name} meningkatkan keterampilannya dalam mengoperasikan komputer dengan mengeksplor berbagai platform coding. {name} menunjukkan rasa percaya diri dan kemandirian yang lebih besar dalam menggunakan komputer."
        },
        en: {
          A: "{name} improved their computer operation skills by exploring various coding platforms. {name} demonstrated greater confidence and independence in using the computer.",
          B: "{name} improved their computer operation skills by exploring various coding platforms. {name} demonstrated greater confidence and independence in using the computer."
        }
      },
      code_prac: {
        id: {
          A: "{name} memperdalam pemahaman mereka tentang loop dan event melalui latihan menggunakan berbagai game koding. Mereka mengimplementasikannya dengan membuat game animasi interaktif / game 3D.",
          B: "{name} memperdalam pemahaman mereka tentang loop dan event melalui latihan menggunakan berbagai game koding. Mereka mengimplementasikannya dengan membuat game animasi interaktif / game 3D."
        },
        en: {
          A: "{name} deepened their understanding of loops and events through exercises using various coding games. They implemented these concepts by creating interactive animated games / 3D games.",
          B: "{name} deepened their understanding of loops and events through exercises using various coding games. They implemented these concepts by creating interactive animated games / 3D games."
        }
      },
      char: {
        id: {
          A: "{name} merupakan anak yang rajin dalam mengerjakan tugas dan memiliki pemahaman yang baik. Namun, {name} terkadang masih merasa malu untuk bertanya ketika mengalami kesulitan lalu {name} lebih memilih diam sampai ditanya.",
          B: "{name} menunjukkan pemahaman materi yang sangat baik. Ia mampu menyelesaikan tugas dengan cepat dan tepat, menunjukkan potensi akademik yang kuat sejak awal pertemuan."
        },
        en: {
          A: "{name} is diligent in completing tasks and possesses good understanding. However, {name} can still feel shy to ask when facing difficulties and tends to remain quiet until prompted.",
          B: "{name} shows very good comprehension of the material. {name} is able to finish tasks quickly and accurately, demonstrating solid academic potential."
        }
      }
    },
    report_3: {
      comp_lit: {
        id: {
          A: "{name} sudah lancar navigasi komputer dasar. {name} mampu mengelola pengerjaan proyek yang lebih rumit secara mandiri dengan rasa percaya diri yang terus meningkat di setiap tahapannya.",
          B: "{name} sudah lancar navigasi komputer dasar. Dia mampu mengelola pengerjaan proyek yang lebih rumit secara mandiri dengan rasa percaya diri yang terus meningkat di setiap tahapannya."
        },
        en: {
          A: "{name} is now fluent in basic computer navigation. {name} is able to manage more complex project work independently with growing confidence at every stage.",
          B: "{name} is fluent in basic computer navigation and can handle project workflows independently with increasing confidence."
        }
      },
      code_prac: {
        id: {
          A: "{name} mempelajari konsep baru yaitu conditional, dan mengaplikasikannya melalui berbagai game coding. Di akhir, {name} membuat sebuah game sebagai project akhirnya, menunjukkan pemahaman dan kreativitasnya sendiri.",
          B: "{name} mempelajari konsep baru yaitu conditional, dan mengaplikasikannya melalui berbagai game coding. Di akhir, {name} membuat sebuah game sebagai project akhirnya, menunjukkan pemahaman dan kreativitasnya sendiri."
        },
        en: {
          A: "{name} learned new concepts such as conditionals and applied them through various coding games. At the end, {name} created a game as the final project, demonstrating great understanding and creativity.",
          B: "{name} learned conditionals and applied them in coding games, successfully finishing a final project game with good creativity."
        }
      },
      char: {
        id: {
          A: "{name} menunjukkan progres yang baik melalui ketekunannya. {name} memiliki pemahaman yang kuat, sekarang sudah mulai aktif bertanya saat kesulitan. Inisiatif bertanya perlu terus ditingkatkan.",
          B: "{name} tetap dapat diandalkan dalam tugasnya, namun ia perlu menjaga fokus. Terkadang perhatiannya mudah teralihkan, sehingga konsentrasi penuh diperlukan agar hasilnya tetap maksimal."
        },
        en: {
          A: "{name} shows good progress through diligence and strong comprehension. {name} has become more active in asking questions when stuck. Continuing this initiative is encouraged.",
          B: "{name} remains dependable in assignments, though maintaining consistent focus will ensure optimal results throughout future sessions."
        }
      }
    }
  },

  // ------------------------------------------------------------
  // WEBSITE DESIGNER
  // ------------------------------------------------------------
  'websitedesigner': {
    report_1: {
      comp_lit: {
        id: {
          A: "{name} telah meningkatkan keterampilan motorik halusnya dengan berlatih mengoperasikan komputer, termasuk mengetik, mengklik, dan drag mouse dengan menggunakan berbagai platform coding dan VR/AR.",
          B: "{name} telah meningkatkan keterampilan motorik halusnya dengan berlatih mengoperasikan komputer, termasuk mengetik, mengklik, dan drag mouse dengan menggunakan berbagai platform coding."
        },
        en: {
          A: "{name} enhanced their fine motor skills by practicing computer operations, including typing, clicking, and dragging. She also navigated digital tools to explore coding platforms and VR/AR creation environments.",
          B: "{name} practiced computer operations such as typing, clicking, and dragging, exploring coding platforms and digital creation tools effectively."
        }
      },
      code_prac: {
        id: {
          A: "{name} telah mengimplementasikan kode dan mempelajari konsep coding seperti looping code, conditional loop, serta function. {name} juga mempelajari cara menerapkannya dalam lingkungan VR/AR dengan sangat baik.",
          B: "{name} telah mengeksplor alat digital untuk mempelajari platform coding dan lingkungan pembuatan VR/AR, serta mempraktikkan konsep perulangan dan event."
        },
        en: {
          A: "{name} has implemented the codes and learned about concepts like looping code, conditional loops, and functions. {name} also learned how to implement the concepts in VR/AR with great practice.",
          B: "{name} learned core coding structures like loops and functions and explored how to implement them in VR/AR creation platforms."
        }
      },
      creative: {
        id: {
          A: "Melalui pembuatan game animasi di CoSpaces Edu, {name} menumbuhkan kreativitas yang kuat berdasarkan imajinasinya dalam merancang dunia virtual yang menarik dan interaktif.",
          B: "Dalam tahap ini, {name} menunjukkan keunikan kreativitasnya. Terkadang ia butuh waktu lebih di tahap desain sehingga perlu penyesuaian waktu agar codingnya selesai tepat waktu."
        },
        en: {
          A: "Through the creation of an animated game on CoSpaces Edu, {name} grew strong creativity based on imagination and enjoyed implementing creative ideas in the project.",
          B: "In this phase, {name} demonstrated unique creativity. At times, spending extra time on visual design required balancing so coding steps remained on schedule."
        }
      },
      char: {
        id: {
          A: "{name} murid yang sangat disiplin dan bersemangat dalam belajar. Ketika fokus, {name} mampu menyelesaikan gamenya dengan cepat dan tidak ragu untuk meminta bimbingan saat mengalami kendala.",
          B: "{name} murid yang sangat disiplin dan selalu memberikan warna tersendiri di kelas. {name} perlu menjaga konsistensi fokus agar pengerjaan project berjalan optimal."
        },
        en: {
          A: "{name} is a passionate and quiet student who readily helps herself to be better. While still developing independent design habits, {name} is honest about challenges and asks for assistance promptly. Congratulations on leveling up, {name}!",
          B: "{name} is disciplined and brings positive energy to class. With sustained focus, {name} completes game projects quickly and enjoys sharing them with friends."
        }
      }
    },
    report_2: {
      comp_lit: {
        id: {
          A: "{name} berlatih menggunakan komputer untuk menavigasi pembuatan website. {name} telah mempelajari dasar-dasar desain website sederhana dan cara mengintegrasikan berbagai elemen ke dalam sebuah tata letak yang kohesif.",
          B: "{name} berlatih menggunakan komputer untuk menavigasi alat dasar pengembangan website dan mempelajari tata letak dasar."
        },
        en: {
          A: "{name} practiced using a computer to navigate basic website development tools. She learned the basics of web design and how to integrate multiple elements into a cohesive layout.",
          B: "{name} practiced computer navigation for web development tools, learning how to combine text, headers, and media elements into a unified page layout."
        }
      },
      code_prac: {
        id: {
          A: "{name} telah mempelajari pembuatan website dasar menggunakan Google Sites, termasuk cara mendesain tata letak, menyusun teks, dan menambahkan gambar untuk memamerkan karya proyeknya.",
          B: "{name} telah berlatih menggunakan komputer untuk menavigasi alat dasar pengembangan website dan mengintegrasikan berbagai elemen portofolio."
        },
        en: {
          A: "{name} learned basic website creation by using Google Sites, including how to design the layout, arrange the text, and add pictures to showcase portfolio projects.",
          B: "{name} learned how to create websites on Google Sites, structuring layouts and organizing project presentations neatly."
        }
      },
      char: {
        id: {
          A: "{name} murid yang sangat disiplin dan selalu memberikan warna tersendiri untuk guru dan teman-temannya. Ia bahkan suka berbagi hasil desain dan bermain bersama game yang ia buat.",
          B: "{name} menunjukkan dedikasi yang baik di kelas. Menjaga fokus tetap konsisten akan membantu {name} menyelesaikan setiap sesi dengan semakin cepat."
        },
        en: {
          A: "{name} is a passionate and disciplined student who always strives to do their best. {name} communicates openly when facing questions and enjoys sharing creations with classmates. Congratulations on leveling up, {name}!",
          B: "{name} is very disciplined and brings wonderful personality to class. Sustaining concentration helps {name} complete web modules rapidly."
        }
      },
      creative: {
        id: {
          A: "Dalam tahap ini, {name} menunjukkan keunikan kreativitasnya yang unik. Desain website dan gamenya sangat menarik, dan kreativitasnya meningkat dengan sangat baik. Good Job dear {name}!",
          B: "Dalam tahap ini, {name} menunjukkan keunikan kreativitasnya. Terkadang butuh waktu lebih di tahap visual, namun hasil akhirnya sangat kreatif."
        },
        en: {
          A: "Through the creation of website designs and animated projects, {name} grew strong creativity based on imagination and genuinely enjoyed personalizing every layout.",
          B: "{name} showcased wonderful creative ideas in website design. Balancing styling with page structure helped produce attractive project results."
        }
      }
    }
  },

  // ------------------------------------------------------------
  // VIRTUAL WORLD MAKER
  // ------------------------------------------------------------
  'virtualworldmaker': {
    report_1: {
      code_lit: {
        id: {
          A: "{name} mengingat kembali konsep dasar coding dengan menyelesaikan game yang lebih menantang dan tingkat lanjut. {name} telah diperkenalkan dengan platform baru bernama Scratch, di mana Dia menerapkan konsep-konsep koding dasar untuk membuat game animasi tingkat lanjut.",
          B: "{name} mengingat kembali konsep dasar coding dengan menyelesaikan game yang lebih menantang. {name} telah diperkenalkan dengan platform Scratch untuk membuat game animasi dasar.",
          C: "{name} telah diperkenalkan dengan platform Scratch dan konsep dasar animasi. Review materi secara berkala akan sangat membantu memperkuat ingatan {name}."
        },
        en: {
          A: "{name} reviewed fundamental coding concepts by solving more challenging and advanced games. {name} was introduced to Scratch, where they applied core coding concepts to make advanced animated games.",
          B: "{name} reviewed basic coding concepts with Scratch and applied them to build interactive animated games.",
          C: "{name} was introduced to Scratch block coding. Short review sessions at home will help reinforce foundational blocks and logic."
        }
      },
      code_app: {
        id: {
          A: "{name} telah berlatih mengaplikasikan konsep-konsep coding yang telah dipelajari sebelumnya untuk membuat sebuah game animasi di Scratch, dengan fokus pada penggunaan blok koding untuk merancang animasi yang interaktif sembari beradaptasi dengan berbagai fitur yang ada di platform tersebut.",
          B: "{name} telah berlatih mengaplikasikan konsep-konsep coding untuk membuat game animasi di Scratch, menggunakan blok koding dasar dengan bimbingan guru.",
          C: "{name} mempraktikkan pembuatan game animasi sederhana di Scratch dengan panduan berkala dari teacher."
        },
        en: {
          A: "{name} practiced applying learned coding concepts to create an animated game in Scratch, focusing on using code blocks to design interactive animations while mastering the platform's features.",
          B: "{name} practiced applying coding concepts to build animated games in Scratch, utilizing core code blocks successfully.",
          C: "{name} practiced building simple animated games in Scratch with step-by-step guidance from the teacher."
        }
      },
      char: {
        id: {
          A: "{name} sangat disiplin dan pantang menyerah. Walaupun masih berproses dalam membaca, saat dibantu Teacher dalam penggunaan coding {name} mampu dengan cepat mengingatnya. {name} tidak malu untuk bertanya atau berdiskusi.",
          B: "{name} memiliki sifat bersosialisasi yang sangat baik, {name} juga mampu mengikuti pembelajaran dengan baik tetapi perlu review beberapa kali agar pembelajaran yang lalu dapat diingat dengan baik.",
          C: "{name} menunjukkan antusiasme yang baik di kelas. Perlu pendampingan agar {name} dapat menjaga fokus dan konsentrasi saat mengerjakan tantangan coding."
        },
        en: {
          A: "{name} is very disciplined and persistent. Guided step-by-step by the teacher, {name} grasps coding blocks quickly and is never shy about asking questions or sharing thoughts.",
          B: "{name} socializes warmly with classmates and follows lessons well. Occasional reviews help {name} retain previously learned concepts with stronger confidence.",
          C: "{name} is enthusiastic in class. Supportive guidance helps {name} build longer concentration spans during coding challenges."
        }
      }
    },
    report_2: {
      code_lit: {
        id: {
          A: "{name} telah mempelajari konsep debugging, yaitu mengidentifikasi dan memperbaiki kesalahan dalam kode. {name} juga mengaplikasikan konsep coding yang lebih kompleks untuk membuat animasi di Scratch. Kerja bagus {name}!",
          B: "{name} telah mempelajari konsep debugging, yaitu mengidentifikasi dan memperbaiki kesalahan dalam kode. {name} juga mengaplikasikan konsep coding yang lebih kompleks untuk membuat animasi di Scratch."
        },
        en: {
          A: "{name} learned the concept of debugging, identifying and fixing errors in code. {name} also applied more complex coding logic to create animations in Scratch. Keep it up, {name}!",
          B: "{name} learned debugging to find and correct coding errors, applying structured logic in Scratch animation projects."
        }
      },
      code_app: {
        id: {
          A: "{name} telah membuat game animasi sederhana menggunakan Scratch, dengan menerapkan logika coding yang kompleks seperti event, loop, conditional dan lainnya. Semangat terus {name}!",
          B: "{name} telah membuat game animasi sederhana menggunakan Scratch, dengan menerapkan logika coding seperti event, loop, dan conditional."
        },
        en: {
          A: "{name} created animated games using Scratch, applying complex coding logic such as events, loops, conditionals, and more. Great job, {name}!",
          B: "{name} built animated games in Scratch, applying event handling and loop logic effectively."
        }
      },
      char: {
        id: {
          A: "{name} adalah anak yang sangat aktif di kelas, {name} juga sangat suka untuk bergaul dengan teman sekelasnya. {name} tidak malu untuk bertanya apabila ada suatu materi/lesson yang kurang Ia pahami dan tidak malu untuk meminta bantuan ketika terdapat kendala dalam melakukan coding. Kerja bagus dan semangat terus {name}!!",
          B: "{name} sangat disiplin dan pantang menyerah. Walaupun masih perlu sedikit bantuan dalam mengingat konsep coding, {name} berusaha mengingat tiap materi seperti forever, looping dan algoritma. {name} selalu sopan dan ramah di kelas."
        },
        en: {
          A: "{name} is very active in class and loves socializing with peers. {name} is never hesitant to ask questions when needed and actively seeks assistance during coding. Fantastic effort and keep it up, {name}!",
          B: "{name} is disciplined and persistent. {name} strives to remember every coding concept like forever loops and algorithms, maintaining polite and friendly behavior."
        }
      }
    },
    report_3: {
      code_lit: {
        id: {
          A: "{name} telah mempelajari konsep variabel dan operator, serta memahami cara menyimpan dan memanipulasi data dalam kode mereka. {name} juga mengeksplor konsep function dalam koding untuk pembuatan dunia VR yang lebih kompleks. Semangat terus {name}!",
          B: "{name} mempelajari konsep variabel dan operator, serta memahami cara menyimpan data dalam kode mereka. {name} juga mengeksplor function dalam koding untuk pembuatan dunia VR."
        },
        en: {
          A: "{name} learned the concepts of variables and operators, understanding how to store and manipulate data. {name} also explored functions for building more complex VR worlds. Keep it up, {name}!",
          B: "{name} learned variables and operators to store data, exploring functions to construct virtual reality environments."
        }
      },
      code_app: {
        id: {
          A: "{name} telah membuat game animasi di Scratch menggunakan kode variabel dan operator. {name} juga mengaplikasikan kode function untuk membangun dunia VR yang kompleks, menunjukkan pemahaman yang lebih mendalam tentang konsep coding. Kerja bagus {name}!!",
          B: "{name} telah membuat game animasi di Scratch menggunakan variabel dan operator, serta mengaplikasikan function untuk membangun dunia VR."
        },
        en: {
          A: "{name} created animated games in Scratch using variables and operators, and applied functions to build complex VR environments, demonstrating a deeper understanding of coding concepts. Great job, {name}!",
          B: "{name} built Scratch games using variables and operators, implementing functions in 3D/VR creation tools."
        }
      },
      char: {
        id: {
          A: "{name} adalah anak yang sangat aktif di kelas terutama pada sesi diskusi dan {name} juga sering berinteraksi dengan teman di kelasnya. {name} tidak malu untuk bertanya apabila ada suatu materi/lesson yang {name} kurang mengerti. Semangat terus {name}!",
          B: "{name} sangat disiplin dan pantang menyerah. Ia selalu berusaha mengingat tiap konsep coding yang Ia pelajari seperti function, forever, looping dan algoritma. Selamat atas kenaikan levelnya!"
        },
        en: {
          A: "{name} is very active during class discussions and communicates warmly with classmates. {name} asks questions confidently whenever encountering tricky topics. Keep up the high spirits, {name}!",
          B: "{name} is disciplined and determined, making conscientious efforts to remember functions, loops, and algorithmic thinking. Congratulations on leveling up!"
        }
      }
    }
  },

  // ------------------------------------------------------------
  // LITTLE PROGRAMMER
  // ------------------------------------------------------------
  'littleprogrammer': {
    report_1: {
      code_lit: {
        id: {
          A: "{name} telah mempelajari konsep list dan kode broadcast, yang kemudian diterapkan untuk membuat game animasinya. {name} telah mengeksplor cara mengimplementasikan konsep list dan menggunakan kode broadcast secara efektif. Kerja bagus {name}!",
          B: "{name} telah mempelajari konsep list dan kode broadcast, yang kemudian diterapkan untuk membuat game animasinya. {name} telah mengeksplor cara mengimplementasikan konsep list dan menggunakan kode broadcast."
        },
        en: {
          A: "{name} learned the concepts of lists and broadcast codes, which were applied to create their animation projects. They explored how to implement lists concept and used broadcasting to control the animation games effectively. Keep it up {name}!",
          B: "{name} has learned the concepts of lists and broadcast codes, which were applied to create animation projects, exploring how to use broadcast signals effectively."
        }
      },
      code_app: {
        id: {
          A: "{name} menerapkan berbagai konsep coding, menggabungkan list dan broadcast untuk menyelesaikan tugas dan membuat game animasi. Proyeknya menunjukkan pemahaman tentang cara menyinkronkan berbagai konsep dalam satu program. Kerja bagus {name}!",
          B: "{name} menerapkan berbagai konsep coding, menggabungkan list dan broadcast untuk menyelesaikan tugas dan membuat game animasi. Proyeknya menunjukkan pemahaman yang baik."
        },
        en: {
          A: "{name} implemented various coding concepts, combining lists and broadcast codes to complete tasks and create animation games. Their projects demonstrated an understanding of how to synchronize different concepts within a single program. Good Job {name}!",
          B: "{name} has been able to implement various coding concepts, combining lists and broadcasts to complete the animated game project effectively."
        }
      },
      char: {
        id: {
          A: "{name} sangat aktif di kelas terutama pada sesi diskusi. {name} tidak malu bertanya jika ada materi/lesson yang belum dipahami dan sangat menikmati berinteraksi dengan teman sekelasnya. Pertahankan prestasimu, {name}!",
          B: "{name} bersikap sangat baik dan sopan di kelas. {name} mampu mengerjakan materi secara mandiri serta sesekali bertanya ketika ada hal yang kurang dipahami. Semangat terus!"
        },
        en: {
          A: "{name} is a very active student in class, especially during discussion sessions. {name} is also not shy about asking questions if there is any material/lesson she doesn't understand. {name} really enjoys interacting with her classmates. Keep up the good work, {name}!",
          B: "{name} behaves well in class. She is polite to both the teacher and her classmates. {name} is also able to work on the material independently and occasionally asks the teacher when there is something she doesn't understand. Keep it up!"
        }
      }
    },
    report_2: {
      code_lit: {
        id: {
          A: "{name} telah mengeksplor pembuatan AR tingkat lanjut dengan mempelajari cara mengimplementasikan konsep coding yang lebih kompleks ke dalam desain mereka. Ia mempelajari cara menyusun dunia AR interaktif untuk membuat AR Quiz yang menarik.",
          B: "{name} telah mengeksplor pembuatan AR dengan mempelajari cara mengimplementasikan konsep coding ke dalam desain, menyusun dunia AR interaktif untuk membuat kuis AR."
        },
        en: {
          A: "{name} had explored advanced AR creation by learning how to integrate complex coding concepts into their designs. They learned how to structure interactive AR experiences and applied coding to create an engaging AR Quiz.",
          B: "{name} has explored advanced AR creation by learning how to integrate complex coding concepts into their designs, creating an interactive AR Quiz."
        }
      },
      code_app: {
        id: {
          A: "{name} menerapkan berbagai konsep coding untuk membangun AR Quiz yang fungsional dan interaktif. Proyek ini memadukan keterampilan teknis dan kreativitas untuk menghadirkan pengalaman pengguna yang menarik.",
          B: "{name} telah menerapkan berbagai konsep coding untuk membangun AR Quiz yang fungsional dan interaktif dengan hasil yang memuaskan."
        },
        en: {
          A: "{name} had applied various coding concepts to build a functional and interactive AR Quiz. Their project combined technical skills and creativity to deliver an immersive user experience.",
          B: "{name} has applied various coding concepts to build a functional and interactive AR Quiz, demonstrating great technical skills."
        }
      },
      char: {
        id: {
          A: "{name} sangat aktif di kelas terutama pada sesi diskusi. {name} tidak ragu untuk bertanya saat mengalami kendala dan sangat menikmati berinteraksi dengan teman-temannya. Kerja bagus!",
          B: "{name} bersikap santun dan mandiri di kelas. {name} tekun mengerjakan proyek AR dan mampu mengikuti arahan dengan baik."
        },
        en: {
          A: "{name} is a very active student in class, especially during discussion sessions. {name} is also not shy when she asks questions if there is any material/lesson she doesn't understand. Keep up the good work!",
          B: "{name} behaves well in class, working independently on AR challenges and asking thoughtful questions whenever needed."
        }
      }
    },
    report_3: {
      code_lit: {
        id: {
          A: "{name} menggabungkan pengetahuan coding mereka dengan merancang dan mengimplementasikan proyek akhir di Scratch. Tugas ini mendorong {name} untuk mengaplikasikan berbagai konsep yang telah mereka pelajari sepanjang kursus.",
          B: "{name} menggabungkan pengetahuan coding mereka dengan merancang proyek akhir di Scratch, mengaplikasikan materi yang telah dipelajari."
        },
        en: {
          A: "{name} had consolidated her coding knowledge by designing and implementing a final project in Scratch. This assignment encouraged them to integrate multiple concepts they had learned throughout the course.",
          B: "{name} consolidated coding knowledge by designing and implementing a final project in Scratch, integrating concepts learned across the level."
        }
      },
      code_app: {
        id: {
          A: "{name} telah membuat proyek akhir di Scratch sebagai penugasan kursus. Proyek ini menampilkan kemampuan menggabungkan berbagai konsep coding untuk mengembangkan program yang komprehensif dan interaktif.",
          B: "{name} telah membuat proyek akhir di Scratch yang menampilkan kemampuan menggabungkan konsep coding menjadi game interaktif."
        },
        en: {
          A: "{name} had created a final project in Scratch as her course assignment. The project showcased their ability to combine various coding concepts to develop a comprehensive and interactive program.",
          B: "{name} created a final project in Scratch as their course assignment, showcasing their ability to build a comprehensive interactive program."
        }
      },
      char: {
        id: {
          A: "Pada akhir level ini, {name} menunjukkan kemampuan kreativitas mandiri dan kedisiplinan yang tinggi. {name} selalu berusaha membuat game secara mandiri dan menyimak instruksi dengan sangat baik. Selamat atas pencapaianmu, {name}!",
          B: "{name} berperilaku sangat baik dan santun di kelas. {name} mampu bekerja secara mandiri dan tekun dalam menyelesaikan proyek akhirnya. Pertahankan prestasimu!"
        },
        en: {
          A: "At the end of this level, {name} can demonstrate the ability to create her own creativity. Also, {name} is a disciplined student who always tries to create the game by herself and listens attentively to instructions. Good job!",
          B: "{name} behaves well in class, polite to both teacher and peers, working on materials independently and completing the final project successfully."
        }
      }
    }
  },

  // ------------------------------------------------------------
  // CODE & DESIGN WITH ROBLOX
  // ------------------------------------------------------------
  'codeanddesignwithroblox': {
    report_1: {
      design_prac: {
        id: {
          A: "{name} mempelajari dasar-dasar modelling untuk membuat objek dengan baik dan mampu memahami penjelasan Guru dengan cepat. {name} mampu membangun lingkungan realistis seperti bukit dan sungai pada Mini Adventure Game serta membuat model objek seperti Pulau, Bangunan, dan Pohon pada Obby Game secara mandiri.",
          B: "{name} mempelajari dasar-dasar modelling untuk membuat objek dengan baik dan mampu membangun lingkungan seperti bukit dan sungai pada Mini Adventure Game dengan bimbingan Guru, serta membuat objek model pada Obby Game."
        },
        en: {
          A: "{name} shows a very good ability in learning the basics of modeling to make objects and understands the Teacher's explanation very well. {name} is also able to build realistic environments such as hills and rivers in Mini Adventure Game and make object models independently, such as Islands, Buildings, and Trees in Obby Game.",
          B: "{name} learned the basics of 3D modeling in Roblox Studio well, building environmental terrains and creating game models with teacher guidance."
        }
      },
      code_prac: {
        id: {
          A: "{name} mempelajari konsep Variable, Properties, Function, While Loop, dan Conditional Statement yang digunakan dalam Coding dengan baik. Saat penerapannya dalam Game, {name} sudah mampu menjelaskan bagaimana konsep-konsep tersebut berjalan dan mempraktikkannya ke dalam game Roblox.",
          B: "{name} mempelajari konsep Variable, Properties, Function, While Loop, dan Conditional Statement yang digunakan dalam Coding dengan cukup baik. Saat penerapannya dalam Game, {name} sudah mampu mempraktikkannya meskipun masih perlu dibimbing dalam penulisan sintaksnya. Perbanyak latihan lagi ya {name}!"
        },
        en: {
          A: "{name} well learned the concepts of Variables, Properties, Functions, While Loops, and Conditional Statements used in Coding. When applied to the game, {name} demonstrates how the concepts work and applies them into Roblox games.",
          B: "{name} learned Variables, Properties, Functions, Loops, and Conditionals in Lua. When applied to Roblox games, {name} understands the logic while continuing to practice syntax precision. Keep exploring, {name}!"
        }
      },
      char: {
        id: {
          A: "{name} sangat bersemangat dalam belajar sehingga menjadi contoh positif untuk teman sekelasnya. {name} selalu siap dengan Roblox Studio dan komputernya serta aktif mengerjakan tugas dengan tekun. Tingkatkan lagi ya {name}!",
          B: "{name} sangat antusias belajar coding Roblox. Terkadang {name} perlu diingatkan agar tetap fokus di tempat duduk dan berkonsentrasi penuh pada instruksi guru agar hasil belajarnya semakin maksimal."
        },
        en: {
          A: "{name} is passionate about learning, becoming a positive role model for classmates. {name} arrives on time, comes prepared with Roblox Studio, and works diligently on assignments. Keep it high, {name}!",
          B: "{name} shows high excitement for Roblox coding. Staying focused and following instructions attentively will help {name} achieve even greater progress."
        }
      }
    }
  }
};

// Aliases for template lookup
EXAM_TEMPLATES['codedesignroblox'] = EXAM_TEMPLATES['codeanddesignwithroblox'];

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

  const sampledTopics = allObjectives.slice(0, 4).join(', ');
  const topicsText = sampledTopics || (lang === 'id' ? 'konsep logika dan struktur kode' : 'core logic and coding structures');

  // Find project or exam lesson name
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

// Fallback dynamic note generator for any course/category
function generateFallbackCategoryNote(category, student, gradeObj, periodObj, lang) {
  const sName = student.nama && student.nama.trim() ? student.nama.trim() : 'Student';
  const course = student.course || 'Coding';
  const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(course, lang) : course;
  const context = getCurriculumContext(course, periodObj.from, periodObj.to, lang);

  const catKey = category.key;
  const catName = category.name.toLowerCase();

  // 1. Concept / Literacy category
  if (catKey === 'comp_lit' || catKey === 'code_lit' || catKey === 'concept' || catName.includes('concept') || catName.includes('literacy')) {
    if (lang === 'en') {
      if (gradeObj.grade === 'A') {
        return `${sName} learned the core concepts in ${localizedCourse} this term, such as ${context.topics}. ${sName} grasps programming ideas effortlessly, follows complex logic independently, and understands the purpose behind each code block. Well done mastering these concepts with high excellence, ${sName}!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} learned the basic ideas in ${localizedCourse} this term, such as ${context.topics}. ${sName} can follow the LMS instructions well and understands what each idea is for. With a short review before each class to strengthen recall, ${sName} will master these concepts even faster. Well done learning these new ideas, ${sName}!`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} was introduced to fundamental concepts in ${localizedCourse} this term, including ${context.topics}. While ${sName} understands the general workflow, some technical logic took longer to absorb. A regular 10-15 minute review of past lessons at home will greatly help solidify these ideas. Keep practicing and reviewing, ${sName}!`;
      } else {
        return `${sName} has been guided through the essential concepts in ${localizedCourse} this term, such as ${context.topics}. ${sName} is making progress, though several foundational ideas require consistent repetition and step-by-step review to build full confidence. We encourage regular review at home to support ${sName}'s learning journey. Keep going, ${sName}!`;
      }
    } else {
      if (gradeObj.grade === 'A') {
        return `${sName} telah mempelajari konsep-konsep inti dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} mampu memahami logika pemrograman dengan sangat mandiri, cepat menangkap ide-ide baru, serta memahami fungsi dari setiap blok kode. Kerja yang luar biasa dalam menguasai materi ini, ${sName}!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} mempelajari konsep-konsep dasar dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} dapat mengikuti instruksi LMS dengan baik dan memahami tujuan dari setiap materi. Sedikit review materi sebelum sesi kelas akan membantu ${sName} mengingat konsep dengan lebih kuat. Kerja bagus dalam mempelajari materi baru ini, ${sName}!`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} telah mempelajari konsep-konsep penting dalam ${localizedCourse} pada term ini, termasuk ${context.topics}. Meskipun sudah memahami alur umumnya, beberapa logika teknis membutuhkan waktu lebih untuk dipahami. Review rutin 10-15 menit di rumah akan sangat membantu memperkuat pemahaman ${sName}. Tetap semangat dan terus berlatih, ${sName}!`;
      } else {
        return `${sName} telah diperkenalkan pada konsep-konsep dasar dalam ${localizedCourse} pada term ini, seperti ${context.topics}. ${sName} terus berproses, meski beberapa logika dasar masih memerlukan bimbingan intensif dan pengulangan berkala. Latihan rutin di rumah akan sangat mendukung kemajuan ${sName}. Tetap semangat, ${sName}!`;
      }
    }
  }

  // 2. Application / Practice / Creation / Design
  if (catKey === 'code_app' || catKey === 'code_prac' || catKey === 'code_dig' || catKey === 'design_prac' || catKey === 'creative' || catName.includes('application') || catName.includes('practice') || catName.includes('creation') || catName.includes('creativity')) {
    if (lang === 'en') {
      if (gradeObj.grade === 'A') {
        return `${sName} applied these concepts brilliantly to develop ${context.project}. ${sName} demonstrated strong problem-solving skills, implemented features with minimal assistance, and finished the term exam covering all this material with impressive results. Fantastic effort and creativity throughout the project, ${sName}! Keep it up!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} used these ideas to build a complete project — working on ${context.project}. ${sName} followed the development steps well and finished the term exam covering all this material. More practice at home between classes can help ${sName} build and assemble these project components even faster. Good job finishing the exam, ${sName}! Keep it up.`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} worked on applying these concepts to create ${context.project}. ${sName} was able to complete the required features with guidance during debugging and finished the term exam. Practicing similar mechanics independently at home will give ${sName} greater speed and agility in coding. Keep practicing, ${sName}!`;
      } else {
        return `${sName} participated in creating ${context.project} this term. ${sName} completed the project tasks with close guidance and finished the term exam. Dedicating extra time for hands-on practice will help ${sName} feel more comfortable writing and applying code independently. Keep up the effort, ${sName}!`;
      }
    } else {
      if (gradeObj.grade === 'A') {
        return `${sName} berhasil menerapkan konsep-konsep ini dengan sangat baik dalam mengembangkan ${context.project}. ${sName} menunjukkan kemampuan problem solving yang matang, menyusun fitur project secara mandiri, dan menyelesaikan ujian praktik term ini dengan hasil yang memuaskan. Prestasi dan kreativitas yang luar biasa, ${sName}! Terus pertahankan!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} menggunakan materi ini untuk membangun project lengkap — mengerjakan ${context.project}. ${sName} mengikuti langkah-langkah pembuatan dengan baik dan menyelesaikan ujian term yang mencakup seluruh materi ini. Latihan tambahan di rumah akan membantu ${sName} menyusun komponen project dengan lebih cepat. Kerja bagus dalam menyelesaikan ujian, ${sName}! Terus pertahankan.`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} mempraktikkan konsep yang dipelajari untuk membuat ${context.project}. ${sName} berhasil menyelesaikan fitur-fitur yang ditentukan dengan sedikit pendampingan saat memperbaiki kesalahan kode (debugging) serta menyelesaikan ujian term. Latihan mandiri di rumah akan membantu ${sName} lebih mandiri dan terbiasa. Tetap semangat, ${sName}!`;
      } else {
        return `${sName} telah berpartisipasi dalam pembuatan ${context.project} pada term ini. ${sName} menyelesaikan tugas-tugas project dengan panduan langsung dari teacher dan menyelesaikan ujian term. Meluangkan waktu latihan praktik tambahan akan membantu ${sName} merasa lebih nyaman memprogram secara mandiri. Terus berjuang, ${sName}!`;
      }
    }
  }

  // 3. Character category
  if (catKey === 'char' || catName.includes('character')) {
    if (lang === 'en') {
      if (gradeObj.grade === 'A') {
        return `${sName} consistently displays an outstanding learning attitude in class. ${sName} is enthusiastic, stays focused on tasks, asks thoughtful questions, and readily overcomes coding difficulties with patience and resilience. An absolute pleasure to teach. Keep up the wonderful character and passion, ${sName}!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} pays attention in class and likes working on coding projects, but can get distracted sometimes and may need a small reminder to stay on task. Maintaining consistent attendance and a quick review after class will help ${sName} catch up and advance even faster. Good job staying focused in class, ${sName}! Keep it up.`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} shows interest in the lessons and enjoys interactive coding activities. At times, ${sName} needs encouragement to maintain concentration throughout the whole session. Building a steady routine and practicing sustained focus will boost ${sName}'s learning stamina significantly. Keep working hard, ${sName}!`;
      } else {
        return `${sName} is friendly and interactive during class. ${sName} requires supportive motivation and guidance to stay engaged with the assignments and develop disciplined learning habits. With patience and consistent encouragement, ${sName}'s focus will steadily improve. Keep trying your best, ${sName}!`;
      }
    } else {
      if (gradeObj.grade === 'A') {
        return `${sName} senantiasa menunjukkan sikap belajar yang sangat teladan di kelas. ${sName} selalu antusias, fokus penuh saat mengerjakan tugas, aktif bertanya, dan memiliki daya juang tinggi saat memecahkan kendala coding. Sangat menyenangkan membimbing ${sName}. Terus pertahankan karakter dan semangat hebat ini, ${sName}!`;
      } else if (gradeObj.grade === 'B') {
        return `${sName} memperhatikan penjelasan di kelas dengan baik dan senang mengerjakan project coding-nya, namun terkadang sedikit terdistraksi dan memerlukan pengingat ringan agar tetap fokus pada tugas. Konsistensi kehadiran dan review singkat setelah kelas akan sangat membantu ${sName} belajar lebih cepat. Kerja bagus dalam menjaga fokus, ${sName}! Terus pertahankan.`;
      } else if (gradeObj.grade === 'C') {
        return `${sName} menunjukkan ketertarikan yang baik dalam belajar coding dan menikmati kegiatan di kelas. Terkadang ${sName} membutuhkan dorongan semangat agar dapat mempertahankan konsentrasi sepanjang sesi. Membangun kebiasaan fokus yang stabil akan sangat mendukung perkembangan ${sName}. Terus bersemangat, ${sName}!`;
      } else {
        return `${sName} sangat ramah dan komunikatif di kelas. ${sName} membutuhkan bimbingan suportif dan motivasi teratur untuk mempertahankan fokus pada instruksi serta membangun kebiasaan belajar yang disiplin. Dengan dorongan positif yang konsisten, fokus ${sName} akan semakin berkembang. Tetap semangat melakukan yang terbaik, ${sName}!`;
      }
    }
  }

  // Generic fallback
  return lang === 'id'
    ? `${sName} telah menyelesaikan penilaian untuk ${category.name} dengan pencapaian yang baik (Nilai: ${student.scores[catKey] || 85}). Terus pertahankan semangat belajar!`
    : `${sName} has successfully completed assessment for ${category.name} with good achievement (Score: ${student.scores[catKey] || 85}). Keep up the great work!`;
}

// Generate Note for a specific category
function generateSingleNote(category, student, lang) {
  const sName = student.nama && student.nama.trim() ? student.nama.trim() : 'Student';
  const course = student.course || 'Coding';
  const periodId = student.period || 'report_1';
  const normCourse = normalizeCourseName(course);
  const score = parseFloat(student.scores[category.key]) || 85;
  const gradeObj = calculateGrade(score);
  const periods = getCoursePeriods(course);
  const periodObj = periods.find(p => p.id === periodId) || periods[0] || { from: 1, to: 8 };

  // Check in curated EXAM_TEMPLATES first
  const courseTpl = EXAM_TEMPLATES[normCourse];
  if (courseTpl && courseTpl[periodId] && courseTpl[periodId][category.key]) {
    const catTpl = courseTpl[periodId][category.key];
    const langTpl = catTpl[lang] || catTpl['id'] || catTpl['en'];
    if (langTpl) {
      let tplText = langTpl[gradeObj.grade] || langTpl['B'] || langTpl['A'] || Object.values(langTpl)[0];
      if (tplText) {
        return tplText.replace(/\{name\}|\(student_name\)|\[Student Name\]/gi, sName);
      }
    }
  }

  // Fallback to curriculum-informed generator
  return generateFallbackCategoryNote(category, student, gradeObj, periodObj, lang);
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
    const pObj = periods.find(p => p.id === s.period) || periods[0] || { label: 'Report 1', label_id: 'Rapor 1' };
    const periodLabel = sLang === 'id' ? pObj.label_id : pObj.label;
    const localizedCourse = (typeof getLocalizedCourseName === 'function') ? getLocalizedCourseName(s.course, sLang) : (s.course || 'Course');
    const categories = getCourseCategories(s.course, s.period);

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

    let rowsHtml = '';
    categories.forEach((cat) => {
      const noteVal = s.notes[cat.key] || '';

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
              oninput="examStudents[${idx}].notes['${cat.key}']=this.value"
              placeholder="${sLang === 'id' ? 'Catatan guru untuk kriteria ini...' : 'Teacher note for this criteria...'}"
              rows="4">${esc(noteVal)}</textarea>
          </td>
        </tr>
      `;
    });

    wrapper.innerHTML = `
      <div class="exam-report-header">
        <div class="exam-report-student-meta">
          <span class="exam-student-title">${esc(sName)}</span>
          <span class="exam-period-badge">🗓️ ${esc(periodLabel)}</span>
          <span class="exam-course-badge">📚 ${esc(localizedCourse)}</span>
        </div>
      </div>

      <!-- Clean LMS Table Replica (Notes Only) -->
      <div class="lms-table-responsive">
        <table class="lms-table">
          <thead>
            <tr>
              <th class="col-criteria" style="width: 220px;">Criteria</th>
              <th class="col-notes">Teacher's Note</th>
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
    // If exam tab is active by default or clicked, render
    if (document.getElementById('view-exam') && document.getElementById('view-exam').style.display !== 'none') {
      renderExamInputs();
    }
  });
}

