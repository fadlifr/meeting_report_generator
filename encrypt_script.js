const fs = require('fs');
const vm = require('vm');

console.log("Loading _source/data.js and _source/templates.js...");
const dataJs = fs.readFileSync('_source/data.js', 'utf8').replace(/const /g, 'var ');
const templatesJs = fs.readFileSync('_source/templates.js', 'utf8').replace(/const /g, 'var ');

const sandbox = {};
vm.createContext(sandbox);

try {
    vm.runInContext(dataJs, sandbox);
    vm.runInContext(templatesJs, sandbox);
} catch (e) {
    console.error("Error evaluating scripts in sandbox:", e);
    process.exit(1);
}

console.log("Scripts loaded successfully.");

const payload = {
  COURSE_DATA: sandbox.COURSE_DATA,
  COURSE_MAP: sandbox.COURSE_MAP,
  TEMPLATES: sandbox.TEMPLATES
};

if (sandbox.TEMPLATES_EN) {
    payload.TEMPLATES_EN = sandbox.TEMPLATES_EN;
}

const jsonStr = JSON.stringify(payload);
const textBuf = Buffer.from(jsonStr, 'utf8');
const passBuf = Buffer.from('timedoor2026', 'utf8');

const encryptedBuf = Buffer.alloc(textBuf.length);
for(let i=0; i<textBuf.length; i++) {
  encryptedBuf[i] = textBuf[i] ^ passBuf[i % passBuf.length];
}

const base64Str = encryptedBuf.toString('base64');
const output = `const SECURE_PAYLOAD = "${base64Str}";\n`;

fs.writeFileSync('js/secure_data.js', output);
console.log('Successfully encrypted and saved to js/secure_data.js');
