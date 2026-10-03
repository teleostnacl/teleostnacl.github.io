import assert from 'node:assert/strict';
import test from 'node:test';

// 直接调用生产模块，验证分享链接与原生过滤条件的实际行为。
const searchState = await import('../src/scripts/search-state.js');

test('网址恢复已提交关键词及单个分类和标签，空查询不保留筛选', () => {
  assert.equal(typeof searchState.readSearchState, 'function');
  assert.deepEqual(searchState.readSearchState(new URL('https://example.test/search/?q=%20Android%20&category=Android&tag=%E5%B7%A5%E5%85%B7')), {
    query: 'Android', category: 'Android', tag: '工具',
  });
  assert.deepEqual(searchState.readSearchState(new URL('https://example.test/search/?q=%20&tag=工具')), {
    query: '', category: '', tag: '',
  });
});

test('分享网址准确编码技术关键词并保留其他参数，清除时只移除搜索状态', () => {
  assert.equal(typeof searchState.getSearchUrl, 'function');
  // 包含加号、中文和百分号，防止分享链接中的关键词因编码而变化。
  const original = new URL('https://example.test/search/?ref=nav&q=old&tag=old');
  const result = searchState.getSearchUrl(original, { query: 'C++ 中文 100%', category: '工具', tag: '' });
  assert.equal(result.searchParams.get('q'), 'C++ 中文 100%');
  assert.equal(result.searchParams.get('category'), '工具');
  assert.equal(result.searchParams.has('tag'), false);
  assert.equal(original.searchParams.get('q'), 'old');
  assert.equal(searchState.getSearchUrl(result, { query: '', category: '', tag: '' }).search, '?ref=nav');
});

test('Pagefind 限制文章结果，分类和标签作为同时满足的独立过滤键', () => {
  assert.equal(typeof searchState.getSearchFilters, 'function');
  assert.deepEqual(searchState.getSearchFilters({ query: 'Android', category: 'Android', tag: '工具' }), {
    type: 'article', category: 'Android', tag: '工具',
  });
  assert.deepEqual(searchState.getSearchFilters({ query: 'Android', category: '', tag: '' }), { type: 'article' });
});
