import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./g1.html',import.meta.url),'utf8');
test('G1 login shell uses the verified iframe bridge and keeps data out of the public page',()=>{
  assert.match(source,/ADMISSION_G1_BRIDGE_INIT/);
  assert.match(source,/ADMISSION_G1_ID_TOKEN/);
  assert.match(source,/ADMISSION_G1_AUTHENTICATED/);
  assert.match(source,/<iframe id="admissionBackend"[^>]*sandbox="allow-scripts allow-same-origin"[^>]*credentialless/);
  assert.match(source,/frame\.src=config\.backendFrameUrl/);
  assert.match(source,/event\.source\s*!==\s*backendSource/);
  assert.match(source,/event\.origin\s*!==\s*backendOrigin/);
  assert.match(source,/message\.channel\s*!==\s*channel/);
  assert.match(source,/backendOrigin\s*=\s*event\.origin/);
  assert.match(source,/config\.backendOrigins\.includes\(event\.origin\)/);
  assert.match(source,/config\.backendOrigins\.includes\(event\.origin\)/);
  assert.doesNotMatch(source,/\*\.googleusercontent\.com/);
  assert.match(source,/credential\.length\s*<\s*20\s*\|\|\s*credential\.length\s*>\s*8192/);
  assert.doesNotMatch(source,/id="openBackend"|window\.open\(/);
  assert.doesNotMatch(source,/innerHTML|localStorage|sessionStorage|type="password"|postMessage\([^,]+,\s*['"]\*['"]\)/);
  assert.doesNotMatch(source,/spreadsheets\/d\/|_원본파일ID|대상자명|환자/);
  assert.match(source,/backendSource\.postMessage\(\{[^}]*type:\s*'ADMISSION_G1_BRIDGE_INIT'[^}]*\},\s*backendOrigin\)/);
  assert.match(source,/target\.postMessage\(\{[^}]*type:\s*'ADMISSION_G1_ID_TOKEN'[^}]*\},\s*backendOrigin\)/);
  assert.match(source,/document\.body\.classList\.add\('authenticated'\)/);
});

test('G1 iframe bridge does not log credentials or retain popup diagnostics',()=>{
  assert.doesNotMatch(source,/console\.warn|popupWindow|credential.*console|channel.*console/i);
});

test('G1 iframe bridge script parses before publication',()=>{
  const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(()=>new vm.Script(script));
});
