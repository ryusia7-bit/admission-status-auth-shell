import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('가상 로그인 껍데기는 업무 데이터와 실제 운영 설정을 포함하지 않는다', () => {
  assert.match(source, /__ADMISSION_AUTH_SHELL_CONFIG__/);
  assert.doesNotMatch(source, /spreadsheets\/d\/|@(?:gmail|homeless)\.or\.kr/i);
  assert.match(source, /backendFrameUrl: 'https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec'/);
  assert.match(source, /backendOrigin: 'https:\/\/n-[a-z0-9-]+-script\.googleusercontent\.com'/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|innerHTML/i);
  assert.match(source, /대상자 목록·검색·저장 기능이 없습니다/);
});

test('토큰 전달은 고정 출처, iframe 출처, 일회용 채널을 모두 요구한다', () => {
  assert.match(source, /event\.origin !== config\.backendOrigin/);
  assert.match(source, /let backendSource = null/);
  assert.match(source, /backendSource = event\.source/);
  assert.match(source, /event\.source !== backendSource/);
  assert.match(source, /message\.channel !== channel/);
  assert.match(source, /message\.type === 'ADMISSION_G0_BACKEND_WAITING'/);
  assert.match(source, /type: 'ADMISSION_G0_BRIDGE_INIT', channel/);
  assert.match(source, /Object\.keys\(message\)\.sort\(\)\.join\(','\) !== 'channel,type'/);
  assert.match(source, /target\.postMessage\([^\n]+config\.backendOrigin\)/);
  assert.doesNotMatch(source, /postMessage\([^\n]+,\s*['"]\*['"]\)/);
  assert.match(source, /sandbox="allow-scripts allow-same-origin"/);
  assert.doesNotMatch(source, /allow-top-navigation|allow-popups|allow-forms/);
  assert.match(source, /if \(window\.top !== window\.self\) \{ show\('직접 연 로그인 화면에서만 사용할 수 있습니다\.'\); return; \}/);
});

test('설정과 자격증명 형식이 맞지 않으면 로그인 토큰을 전달하지 않는다', () => {
  assert.match(source, /if \(!validConfig\(config\)\) \{ show\('가상 검증 설정이 없어 로그인할 수 없습니다\.'\); return; \}/);
  assert.match(source, /credential\.length < 20 \|\| credential\.length > 8192/);
  assert.match(source, /if \(!backendReady \|\| !pendingCredential \|\| !channel \|\| !validConfig\(config\)/);
  assert.match(source, /pendingCredential = ''/);
});
