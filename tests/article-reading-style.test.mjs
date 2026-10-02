import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const articleStyles = await readFile(new URL('../src/styles/inner-pages.css', import.meta.url), 'utf8');

test('article detail style uses the approved full-width readable text system', () => {
  assert.match(articleStyles, /\.inner-page \.reading-layout[\s\S]*?max-width:\s*none/);
  assert.match(articleStyles, /\.inner-page \.reading-layout[\s\S]*?grid-template-columns:\s*minmax\(0, 66\.6667vw\)/);
  assert.match(articleStyles, /\.inner-page \.article-content\s*\{[\s\S]*?max-width:\s*none/);
  assert.match(articleStyles, /\.article-content \.prose[\s\S]*?font-size:\s*1\.125rem[\s\S]*?line-height:\s*1\.9/);
  assert.match(articleStyles, /\.article-content h1[\s\S]*?#172A38/);
  assert.match(articleStyles, /\.article-content \.prose[\s\S]*?color:\s*#334155/);
  assert.match(articleStyles, /\.article-content \.prose a[\s\S]*?color:\s*#246B93/);
  assert.match(articleStyles, /\.reading-layout \.toc[\s\S]*?color:\s*#60758A/);
});
