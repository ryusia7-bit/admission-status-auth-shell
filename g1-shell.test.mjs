import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('./g1.html',import.meta.url),'utf8');
test('G1 login shell keeps data out of the public page and targets only its fixed backend window',()=>{
  assert.match(source,/ADMISSION_G1_BRIDGE_INIT/);
  assert.match(source,/ADMISSION_G1_ID_TOKEN/);
  assert.match(source,/ADMISSION_G1_AUTHENTICATED/);
  assert.match(source,/window\.open\(config\.backendFrameUrl/);
  assert.match(source,/event\.source\s*!==\s*backendWindow/);
  assert.match(source,/config\.backendOrigins\.includes\(event\.origin\)/);
  assert.doesNotMatch(source,/\*\.googleusercontent\.com/);
  assert.match(source,/credential\.length\s*<\s*20\s*\|\|\s*credential\.length\s*>\s*8192/);
  assert.match(source,/id="openBackend"/);
  assert.doesNotMatch(source,/<iframe\b/);
  assert.doesNotMatch(source,/innerHTML|localStorage|sessionStorage|type="password"|postMessage\([^,]+,\s*['"]\*['"]\)/);
  assert.doesNotMatch(source,/spreadsheets\/d\/|_원본파일ID|대상자명|환자/);
});
