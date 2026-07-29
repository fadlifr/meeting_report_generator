const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'templates.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace known corrupted sequences that PowerShell introduced
// Usually the E2 80 94 bytes got read as ANSI and then written back as UTF-8, 
// resulting in "â€”" or similar. We can use a regex to catch these variations.
content = content.replace(/â€”/g, '-');
content = content.replace(/\?"/g, '-');
content = content.replace(/\?/g, '-');
content = content.replace(/ — /g, ' - ');
content = content.replace(/—/g, '-');

// Fix words
content = content.replace(/\{nama\} pun menggunakan/g, '{nama} juga belajar menggunakan');
content = content.replace(/\{nama\} pun /g, '{nama} juga ');
content = content.replace(/\{nama\} turut /g, '{nama} juga ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed successfully via Node.js!');
