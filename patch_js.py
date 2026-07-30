import json

# Load JSON output from scratch_output.txt or directly
with open('scratch_output.txt', 'r', encoding='utf-8') as f:
    content = f.read()

course_data_part = content.split('=== COURSE DATA ===\n')[1].split('\n\n=== TEMPLATES ===')[0].strip()[1:-1] # remove quotes
templates_part = content.split('=== TEMPLATES ===\n')[1].strip()

# Patch data.js
with open('_source/data.js', 'r', encoding='utf-8') as f:
    data_js = f.read()

data_js = data_js.replace('"Kids": ["Coding Explorer", "Game Developer"', '"Kids": ["Coding Explorer", "Tech Explorer", "Game Developer"')
data_js = data_js.replace('const COURSE_DATA = {"3D ANIMATOR": [', f'const COURSE_DATA = {{"Tech Explorer": {course_data_part}, "3D ANIMATOR": [')

with open('_source/data.js', 'w', encoding='utf-8') as f:
    f.write(data_js)

# Patch templates.js
with open('_source/templates.js', 'r', encoding='utf-8') as f:
    templates_js = f.read()

templates_js = templates_js.replace('const TEMPLATES = {"3D ANIMATOR": {', f'const TEMPLATES = {{"Tech Explorer": {templates_part}, "3D ANIMATOR": {{')

with open('_source/templates.js', 'w', encoding='utf-8') as f:
    f.write(templates_js)

print("Patching complete.")
