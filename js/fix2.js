const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'templates.js');
let content = fs.readFileSync(filePath, 'utf8');

// Remove numbers after "Coding Challenge" (case-insensitive)
content = content.replace(/(Coding Challenge)\s+\d+/gi, '$1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Numbers removed from Coding Challenge successfully!');
