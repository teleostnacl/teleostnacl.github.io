/**
 * 从网址恢复已提交的搜索条件；空关键词不触发全文检索。
 * @param {URL} url 当前页面或分享链接的网址。
 * @returns {{query: string, category: string, tag: string}} 单关键词、单分类和单标签的搜索状态。
 */
export function readSearchState(url) {
  // 去除边缘空白，避免同一关键词生成多个无意义的历史记录。
  const query = (url.searchParams.get('q') ?? '').trim();
  return {
    query,
    category: query ? (url.searchParams.get('category') ?? '') : '',
    tag: query ? (url.searchParams.get('tag') ?? '') : '',
  };
}

/**
 * 创建可分享的搜索网址，不修改传入网址及其他页面参数。
 * @param {URL} url 作为基础的页面网址。
 * @param {{query: string, category: string, tag: string}} state 已提交的搜索条件。
 * @returns {URL} 更新搜索参数后的独立网址。
 */
export function getSearchUrl(url, state) {
  // URLSearchParams 负责中文、加号和百分号的编码，避免手工拼接破坏关键词。
  const next = new URL(url);
  // 仅管理搜索页的三个参数，保留来源等外部参数。
  for (const [key, value] of Object.entries({ q: state.query, category: state.category, tag: state.tag })) {
    if (state.query && value) {
      next.searchParams.set(key, value);
    } else {
      next.searchParams.delete(key);
    }
  }
  return next;
}

/**
 * 创建原生 Pagefind 过滤条件，始终排除分类页、标签页等非文章结果。
 * @param {{query: string, category: string, tag: string}} state 已提交的搜索条件。
 * @returns {{type: string, category?: string, tag?: string}} 不同过滤键同时满足的条件。
 */
export function getSearchFilters(state) {
  return {
    type: 'article',
    ...(state.category ? { category: state.category } : {}),
    ...(state.tag ? { tag: state.tag } : {}),
  };
}
