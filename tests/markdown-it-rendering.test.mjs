import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const articlePage = await readFile(
  new URL('../src/pages/articles/[...slug].astro', import.meta.url),
  'utf8'
);
const innerPagesCss = await readFile(
  new URL('../src/styles/inner-pages.css', import.meta.url),
  'utf8'
);

test('文章详情通过 markdown-it 渲染内容集合中的正文', () => {
  assert.match(articlePage, /from ['"]markdown-it['"]/);
  assert.match(articlePage, /markdownIt\.render\(markdownSource\)/);
});

test('文章详情将 @[TOC] 渲染为二至四级标题目录', () => {
  assert.match(articlePage, /const tocHeadings = headings\.filter\(\(\{ depth \}\) => depth >= 2 && depth <= 4\)/);
  assert.match(articlePage, /<!--article-toc-->/);
  assert.match(articlePage, /class="article-toc"/);
  assert.match(articlePage, /toc-depth-\$\{heading\.depth\}/);
});

test('文章目录仅通过缩进表示层级，不显示自动编号', () => {
  assert.match(innerPagesCss, /\.inner-page \.reading-layout \.toc ol,\s*\.inner-page \.article-toc ol\s*\{[\s\S]*?list-style: none;/);
  assert.doesNotMatch(innerPagesCss, /counter-(?:reset|increment)|counter\(toc-h[234]\)/);
});

test('文章详情将相对图片地址交给 Astro 内容资源映射', () => {
  assert.match(articlePage, /from 'astro:asset-imports'/);
  assert.match(articlePage, /from 'astro:assets'/);
  assert.match(articlePage, /const importedImage = imageAssetMap\.get\(imageImportId\)/);
  assert.match(articlePage, /const rewriteArticleImageSources = async \(html: string\)/);
  assert.match(articlePage, /rewriteArticleImageSources\(markdownIt\.render\(markdownSource\)\.replaceAll\(tocMarker, renderedToc\)\)/);
});

test('文章详情从 Astro 图片元数据取得可发布的 src 地址', () => {
  assert.match(articlePage, /await getImage\(\{ src: importedImage \}\)/);
  assert.match(articlePage, /const renderedContent = await rewriteArticleImageSources/);
});

test('跨文章目录的相对图片可回退到同源资源映射项', () => {
  assert.match(articlePage, /const assetSource = decodeURI\(source\);/);
  assert.match(articlePage, /assetImportId\.startsWith\(`\$\{assetSource\}\?`\)/);
});
