import json

with open('lessons_objectives_tech_explorer_id.json', 'r', encoding='utf-8') as f:
    data_id = json.load(f)

course_data_array = []
templates_dict = {}

phrases_start = [
    "Pada pertemuan ini, {nama}",
    "Dalam sesi ini, {nama}",
    "Di pertemuan kali ini, {nama}",
    "Pada sesi kali ini, {nama}",
    "Dalam pertemuan kali ini, {nama}"
]

phrases_join = [
    "{nama} juga",
    "Selain itu, {nama} juga",
    "Di samping itu, {nama} juga",
    "Tak hanya itu, {nama} juga",
    "Lebih dari itu, {nama} juga",
    "Tidak hanya itu, {nama} juga"
]

import random
random.seed(42) # For consistency

for i, lesson in enumerate(data_id):
    num = i + 1
    title = f"Lesson {num} - {lesson['title']}"
    objs = lesson['objectives']
    
    course_data_array.append({
        "num": num,
        "title": title,
        "objectives": objs
    })
    
    # Generate template
    # Example: "Pada pertemuan ini, {nama} [obj1]. [join] [obj2], dan [obj3]."
    
    start_phrase = phrases_start[i % len(phrases_start)]
    join_phrase = phrases_join[i % len(phrases_join)]
    
    # Process objectives to lowercase first letter if it's a verb?
    # Actually, in existing templates, they sometimes lowercase, sometimes not.
    # Let's lowercase the first letter to make it flow better in the sentence.
    def lower_first(s):
        if not s: return s
        # Special cases
        if s.startswith("Memahami") or s.startswith("Mengenal") or s.startswith("Membuat") or s.startswith("Mengidentifikasi") or s.startswith("Menggunakan") or s.startswith("Menerapkan") or s.startswith("Menganalisis") or s.startswith("Menguasai") or s.startswith("Mampu") or s.startswith("Mempelajari") or s.startswith("Mencegah") or s.startswith("Mengoperasikan") or s.startswith("Mengenal") or s.startswith("Mendapatkan") or s.startswith("Mengumpulkan") or s.startswith("Mengintegrasikan") or s.startswith("Melanjutkan") or s.startswith("Menanggapi") or s.startswith("Menyelesaikan") or s.startswith("Mengerti") or s.startswith("Mengerjakan") or s.startswith("Mempresentasikan") or s.startswith("Overview") or s.startswith("Exam") or s.startswith("Written") or s.startswith("Coding") or s.startswith("Pengenalan"):
            return s[0].lower() + s[1:]
        # Remove trailing spaces
        return s.strip()
    
    processed_objs = [lower_first(obj.strip()) for obj in objs]
    
    if num in [8, 16, 24]:
        # Special exams handling based on existing templates
        if num == 8:
            templates_dict[str(num)] = "{nama} melaksanakan sesi review materi 1-7 dan mengikuti ujian Level Xplorer 1 pada pertemuan ini."
        elif num == 16:
            templates_dict[str(num)] = "{nama} melaksanakan sesi review materi 9-15 serta mengikuti ujian tertulis dan coding pada pertemuan ini."
        elif num == 24:
            templates_dict[str(num)] = "Pada pertemuan ini, {nama} memahami poin penting dalam presentasi. Selain itu, {nama} juga mengerjakan ujian tertulis dengan seksama dan mempresentasikan project dengan baik."
        continue

    if len(processed_objs) == 1:
        text = f"{start_phrase} {processed_objs[0]}."
    elif len(processed_objs) == 2:
        text = f"{start_phrase} {processed_objs[0]}. {join_phrase.capitalize()} {processed_objs[1]}."
    elif len(processed_objs) == 3:
        text = f"{start_phrase} {processed_objs[0]}. {join_phrase.capitalize()} {processed_objs[1]}, dan {processed_objs[2]}."
    elif len(processed_objs) >= 4:
        text = f"{start_phrase} {processed_objs[0]}. {join_phrase.capitalize()} {processed_objs[1]}, {processed_objs[2]}, dan {processed_objs[3]}."
        if len(processed_objs) > 4:
            for j in range(4, len(processed_objs)):
                if j == len(processed_objs) - 1:
                    text = text[:-1] + f", serta {processed_objs[j]}."
                else:
                    text = text[:-1] + f", {processed_objs[j]}."

    # Capitalize first letter of join_phrase is handled by .capitalize() which might lowercase the {nama}, so:
    # Actually just string replace {Nama} to {nama}
    # Better:
    if "{nama}" in text:
        pass # it's fine
    
    # Fix capitalization for joining phrases
    text = text.replace(" selain itu", " Selain itu")
    text = text.replace(" di samping itu", " Di samping itu")
    text = text.replace(" tak hanya itu", " Tak hanya itu")
    text = text.replace(" lebih dari itu", " Lebih dari itu")
    text = text.replace(" tidak hanya itu", " Tidak hanya itu")
    text = text.replace(" {nama} juga", " {nama} juga")

    # The start of sentence after period should be capitalized
    parts = text.split('. ')
    for i_p in range(len(parts)):
        if parts[i_p]:
            parts[i_p] = parts[i_p][0].upper() + parts[i_p][1:]
    text = '. '.join(parts)
    
    # Ensure no double dots
    text = text.replace("..", ".")
    
    templates_dict[str(num)] = text

course_data_json = json.dumps(course_data_array, ensure_ascii=False)
templates_json = json.dumps(templates_dict, ensure_ascii=False, indent=2)

with open('scratch_output.txt', 'w', encoding='utf-8') as f:
    f.write("=== COURSE DATA ===\n")
    f.write(f'"{course_data_json}"\n\n')
    f.write("=== TEMPLATES ===\n")
    f.write(templates_json)
