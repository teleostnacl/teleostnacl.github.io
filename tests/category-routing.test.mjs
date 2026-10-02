import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('分类入口有独立索引路由', async () => {
  await assert.doesNotReject(() => access(new URL('../src/pages/categories/index.astro', import.meta.url)));
});

test('共享导航的分类入口指向分类索引', async () => {
  const layout = await readSource('src/layouts/BaseLayout.astro');

  assert.match(layout, /<a href="\/categories\/">分类<\/a>/);
});

test('英文分类在原始文章 frontmatter 中使用大写首字母', async () => {
  const categorySources = [
    ['src/content/articles/Google Chrome 浏览器历史记录的存储位置/index.md', 'Chrome'],
    ['src/content/articles/Sublime Text 中文化及常用插件安装教程/index.md', 'Sublime'],
    ['src/content/articles/一种使用 Java 应用实现快捷键输入字符的方式/index.md', 'Java'],
    ['src/content/articles/一种解决 Win10的微软输入法无法禁用 shift + 空格 切换半角 全角切换bug的方法/index.md', 'Bug'],
    ['src/content/articles/当在git中新增忽略文件之后如何移除已经提交到git的文件/index.md', 'Git'],
    ['src/content/articles/解决 IDEA 在运行时中文乱码问题/index.md', 'Intellij-idea'],
  ];

  for (const [path, category] of categorySources) {
    const source = await readSource(path);
    assert.match(source, new RegExp(`^category: "${category}"$`, 'm'));
  }
});
