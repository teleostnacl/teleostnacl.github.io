import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('全站背景由 tsParticles 初始化，并提供随机连接线与多边形图案', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /@tsparticles\/slim/);
  assert.match(source, /loadSlim/);
  assert.match(source, /links:/);
  assert.match(source, /polygon:/);
});

test('点击空白处会创建有限生命周期的图案粒子', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /event\.target\.closest\('a, button, input, textarea, select'\)/);
  assert.match(source, /life:\s*\{[\s\S]*?duration:/);
  assert.match(source, /particles\.addParticle/);
});

test('点击图案会延长显示，环境图案以受上限约束的节奏随机生成', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /life: \{ count: 1, duration: \{ value: 14 \} \}/);
  assert.match(source, /const ambientParticleLimit = 30/);
  assert.match(source, /const ambientSpawnIntervalMs = 1100/);
  assert.match(source, /life: \{ count: 1, duration: \{ value: 28 \} \}/);
  assert.match(source, /const ambientLifetimeMs = 28000/);
  assert.match(source, /container\.canvas\.size/);
  assert.match(source, /ambientParticleCount >= ambientParticleLimit/);
  assert.match(source, /window\.setInterval\(spawnAmbientShape, ambientSpawnIntervalMs\)/);
});

test('自动漂浮图案使用更清晰的透明度与连线可见度', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /#176B5A/);
  assert.match(source, /#E36B4F/);
  assert.match(source, /#D99A27/);
  assert.match(source, /links: \{ enable: true, distance: 170, opacity: 0\.65 \}/);
  assert.match(source, /value: \{ min: 0\.58, max: 0\.95 \}/);
});

test('首页采用暖奶油白背景，并保留高辨识度的图案色', async () => {
  const source = await readSource('src/styles/tsparticles-home.css');

  assert.match(source, /--paper:#fff8ec/);
  assert.match(source, /--mint:#176b5a/);
  assert.match(source, /--coral:#e36b4f/);
  assert.match(source, /--gold:#d99a27/);
});

test('同一次点击会从环形起点向不同方向分散图案粒子', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /const burstRadius =/);
  assert.match(source, /Math\.cos\(angle\) \* burstRadius/);
  assert.match(source, /Math\.sin\(angle\) \* burstRadius/);
  assert.match(source, /direction: angleDegrees/);
  assert.match(source, /straight: true/);
});

test('高 DPI 显示器会把 CSS 鼠标坐标转换为 tsParticles 画布坐标', async () => {
  const source = await readSource('src/scripts/tsparticles-background.js');

  assert.match(source, /const pixelRatio = container\.retina\.pixelRatio/);
  assert.match(source, /event\.clientX - canvasBounds\.left\) \* pixelRatio/);
  assert.match(source, /event\.clientY - canvasBounds\.top\) \* pixelRatio/);
  assert.match(source, /const burstRadius = 18 \* pixelRatio/);
});

test('布局仅保留一个 tsParticles 背景容器，首页不再放置旧 Canvas 元素', async () => {
  const [layout, home] = await Promise.all([
    readSource('src/layouts/BaseLayout.astro'),
    readSource('src/pages/index.astro'),
  ]);

  assert.match(layout, /id="tsparticles"/);
  assert.doesNotMatch(home, /legacy-generative-art/);
});

test('首页与布局不再保留旧背景实现或仅隐藏的旧首页内容', async () => {
  const [layout, home] = await Promise.all([
    readSource('src/layouts/BaseLayout.astro'),
    readSource('src/pages/index.astro'),
  ]);

  assert.doesNotMatch(layout, /refresh\.css|hero-copy\.css|generative-background\.js/);
  assert.doesNotMatch(home, /home-legacy|getContext\('2d'\)|cat-stage/);
  await assert.rejects(access(new URL('../src/scripts/generative-background.js', import.meta.url)));
  await assert.rejects(access(new URL('../src/styles/refresh.css', import.meta.url)));
  await assert.rejects(access(new URL('../src/styles/hero-copy.css', import.meta.url)));
});

test('首页是无顶部与页脚的双语技术博客入口', async () => {
  const [layout, home] = await Promise.all([
    readSource('src/layouts/BaseLayout.astro'),
    readSource('src/pages/index.astro'),
  ]);

  assert.match(layout, /const isHomePage = Astro\.url\.pathname === '\/';/);
  assert.match(layout, /!isHomePage && <header class="site-header">/);
  assert.match(layout, /!isHomePage && <footer>/);
  assert.match(home, /把系统中的复杂问题，整理成可复用的答案。/);
  assert.doesNotMatch(home, /home-stream/);
});

test('首页提供四个带单色图标的中英双语入口', async () => {
  const home = await readSource('src/pages/index.astro');

  assert.match(home, /文章[\s\S]*?Articles/);
  assert.match(home, /分类[\s\S]*?Categories/);
  assert.match(home, /关于[\s\S]*?About/);
  assert.match(home, /搜索[\s\S]*?Search/);
  assert.match(home, /<svg[^>]*aria-hidden="true"/);
  assert.match(home, /stroke="currentColor"/);
});
