import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const articlePage = await readFile(
  new URL('../src/pages/articles/[...slug].astro', import.meta.url),
  'utf8'
);

test('文章详情通过 markdown-it 渲染内容集合中的正文', () => {
  assert.match(articlePage, /from ['"]markdown-it['"]/);
  assert.match(articlePage, /markdownIt\.render\(article\.body\)/);
});
