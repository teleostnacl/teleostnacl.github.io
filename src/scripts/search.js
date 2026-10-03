import { getSearchFilters, getSearchUrl, readSearchState } from './search-state.js';

/**
 * 每次仅下载十篇文章的数据，避免一次性拉取所有命中文章正文。
 */
const PAGE_SIZE = 10;

/**
 * 初始化静态搜索页，使用 Pagefind 索引并维护已提交查询与浏览器历史。
 * @returns {void} 通过页面控件展示结果与可重试的错误状态。
 */
export function initSearch() {
  // 入口只作用于搜索页，不影响其他页面的交互。
  const root = document.querySelector('.search-page');
  if (!root) {
    return;
  }
  // 表单负责提交，输入修改不自动改变已提交查询。
  const form = root.querySelector('.search-form');
  // 输入内容可以暂时不同于网址中的已提交关键词。
  const input = root.querySelector('#search-query');
  // 清除按钮同时清空输入、结果、筛选及网址参数。
  const clear = root.querySelector('.search-clear');
  // 结果容器向辅助技术报告后台查询状态。
  const area = root.querySelector('.search-results-area');
  // 筛选控件保留当前关键词的全部可选值，避免选中后无法切换。
  const filterPanel = root.querySelector('.search-filters');
  // 单独取消筛选时保留已提交关键词。
  const resetFilters = root.querySelector('.search-reset-filters');
  // 状态文本兼作读屏的加载、计数和错误通知。
  const status = root.querySelector('.search-status');
  // 列表只承载文章结果，不生成图片和章节子结果。
  const list = root.querySelector('.search-results');
  // 追加按钮保留已显示的结果及键盘焦点。
  const more = root.querySelector('.search-more');
  // 失败重试分别恢复查询或当前追加批次。
  const retry = root.querySelector('.search-retry');
  // 所有监听器绑定页面生命周期，正常离开时统一释放。
  const listeners = new AbortController();
  // 已提交状态是结果、过滤条件与网址的唯一来源。
  let state = readSearchState(new URL(window.location.href));
  // 递增序号隔离异步响应，旧查询不能覆盖新提交或已清空页面。
  let revision = 0;
  // 缓存原始关键词响应，筛选时不重新加载基础统计。
  let keywordSearch = null;
  // 对应基础响应的关键词，只在关键词变化时更新统计。
  let keyword = '';
  // 当前筛选后的结果引用按相关性排序，正文按批次懒加载。
  let results = [];
  // 已成功展示条数，追加失败时不推进游标。
  let shown = 0;
  // 重试种类避免追加失败时丢弃已展示的结果。
  let failedAppend = false;
  // 在禁用按钮前保存筛选焦点，避免焦点转移到页面主体后丢失位置。
  let filterFocusKey = '';

  /**
   * 将已提交条件写入历史，输入草稿不进入网址。
   * @returns {void} 相同条件不重复创建历史条目。
   */
  function syncUrl() {
    // 保留非搜索参数，使用浏览器标准编码处理技术关键词。
    const next = getSearchUrl(new URL(window.location.href), state);
    if (next.href !== window.location.href) {
      window.history.pushState(null, '', next);
    }
  }

  /**
   * 更新加载状态并阻止重复追加；新关键词仍可提交以替代旧请求。
   * @param {boolean} busy 是否正在查询或下载结果片段。
   * @returns {void} 更新控件和辅助技术可见的状态。
   */
  function setBusy(busy) {
    area.setAttribute('aria-busy', String(busy));
    more.disabled = busy;
    // 禁用当前筛选控件，避免同一批次中重复提交过滤请求。
    for (const button of filterPanel.querySelectorAll('button')) {
      button.disabled = busy;
      if (!busy && filterFocusKey === button.dataset.filterKey) {
        button.focus({ preventScroll: true });
      }
    }
    if (!busy) {
      filterFocusKey = '';
    }
  }

  /**
   * 渲染关键词命中的分类与标签，数量不受当前筛选影响。
   * @returns {void} 保持选中按钮可取消，并在无匹配时保留网址中的条件。
   */
  function renderFilters() {
    // 与筛选键对应的两个按钮组，不把分类标签当作文章结果。
    for (const group of filterPanel.querySelectorAll('[data-filter]')) {
      // 过滤键来自静态 HTML，仅为 category 或 tag。
      const key = group.dataset.filter;
      // 使用基础查询已限制文章类型的计数。
      const entries = Object.entries(keywordSearch?.filters?.[key] ?? {}).filter(([, count]) => {
        // Pagefind 可能返回零计数，仅显示当前关键词命中的选项。
        return count > 0;
      });
      if (state[key] && !entries.some(([value]) => {
        // 分享链接中可能包含无命中的条件，保留该项供取消。
        return value === state[key];
      })) {
        entries.push([state[key], 0]);
      }
      // 优先按命中文章数排列，相同数量使用中文名称顺序。
      entries.sort(([nameA, countA], [nameB, countB]) => {
        return countB - countA || nameA.localeCompare(nameB, 'zh-CN');
      });
      group.replaceChildren();
      group.closest('fieldset').hidden = entries.length === 0;
      // 筛选值按原始 frontmatter 传递，不通过显示文案反推条件。
      for (const [value, count] of entries) {
        // 使用 textContent 插入元数据，避免标题标签被解析为 HTML。
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.filterKey = `${key}:${value}`;
        button.dataset.key = key;
        button.dataset.value = value;
        button.setAttribute('aria-pressed', String(state[key] === value));
        button.textContent = value;
        // 计数与名称视觉分离，但共同组成按钮的可访问名称。
        const badge = document.createElement('span');
        badge.className = 'search-filter-count';
        badge.textContent = `(${count})`;
        button.append(badge);
        group.append(button);
      }
    }
    filterPanel.hidden = !state.query || (!keywordSearch?.results.length && !state.category && !state.tag);
    resetFilters.hidden = !state.category && !state.tag;
  }

  /**
   * 创建一篇文章的文字结果；只信任 Pagefind 转义后的片段 HTML。
   * @param {{url: string, meta: Object, excerpt: string}} data Pagefind 返回的单篇文章数据。
   * @returns {HTMLLIElement} 标题、真实元数据及一个命中片段。
   */
  function createResult(data) {
    // 每篇文章使用独立列表项，保持语义与阅读顺序。
    const item = document.createElement('li');
    item.className = 'search-result';
    // 标题链接指向文章页面而非某个内部章节。
    const heading = document.createElement('h2');
    // 标题等原始元数据使用文本插入，保留特殊字符。
    const link = document.createElement('a');
    link.href = data.url;
    link.textContent = data.meta.title;
    heading.append(link);
    // 日期允许缺失，分类直接来自文章 frontmatter 索引。
    const meta = document.createElement('div');
    meta.className = 'search-result-meta';
    if (data.meta.date) {
      // ISO 日期按字符串显示，避免浏览器时区改变文章日期。
      const date = document.createElement('time');
      date.dateTime = data.meta.date;
      date.textContent = data.meta.date.replaceAll('-', '/');
      meta.append(date);
    }
    if (data.meta.category) {
      // 分类文本仅作信息展示，筛选操作统一位于结果顶部。
      const category = document.createElement('span');
      category.className = 'search-result-category';
      category.textContent = data.meta.category;
      meta.append(category);
    }
    // Pagefind 的 excerpt 已对内容转义，仅保留其生成的关键词 mark。
    const excerpt = document.createElement('p');
    excerpt.className = 'search-result-excerpt';
    excerpt.innerHTML = data.excerpt;
    item.append(heading, meta, excerpt);
    return item;
  }

  /**
   * 追加下一批数据；批次全部成功后提交 DOM 与游标，失败可原批重试。
   * @param {number} current 调用方所属的查询序号。
   * @returns {Promise<void>} 完成本批展示或记录可重试的失败。
   */
  async function appendResults(current) {
    // 追加按钮禁用时可能失焦，恢复后保留键盘操作位置。
    const restoreMoreFocus = document.activeElement === more;
    setBusy(true);
    retry.hidden = true;
    status.textContent = shown ? '正在加载更多文章…' : '正在加载文章…';
    try {
      // 并行下载当前十篇，旧响应由查询序号隔离。
      const batch = await Promise.all(results.slice(shown, shown + PAGE_SIZE).map((result) => {
        return result.data();
      }));
      if (current !== revision) {
        return;
      }
      list.append(...batch.map(createResult));
      shown += batch.length;
      more.hidden = shown >= results.length;
      status.textContent = results.length
        ? `找到 ${results.length} 篇相关文章，已显示 ${shown} 篇。`
        : '没有找到匹配的文章，请更换关键词或清除筛选。';
    } catch (error) {
      if (current !== revision) {
        return;
      }
      // 仅记录错误类型，不输出关键词、分享网址或完整索引内容。
      console.error('搜索结果加载失败。', error?.name ?? 'Error');
      failedAppend = true;
      retry.hidden = false;
      status.textContent = '文章加载失败，请点击重试。';
    } finally {
      if (current === revision) {
        setBusy(false);
        if (restoreMoreFocus) {
          if (more.hidden) {
            list.lastElementChild?.querySelector('a')?.focus({ preventScroll: true });
          } else {
            more.focus({ preventScroll: true });
          }
        }
      }
    }
  }

  /**
   * 使用已提交状态查询索引，新条件清空旧批次，空输入直接恢复初始提示。
   * @returns {Promise<void>} 更新基础统计、筛选结果与首批文章。
   */
  async function search() {
    // 禁用前保存焦点，保证筛选控件重建后仍能连续键盘操作。
    const focused = document.activeElement;
    filterFocusKey = filterPanel.contains(focused) ? (focused.dataset.filterKey ?? '') : '';
    // 在首个 await 前建立序号，防止快速提交产生异步覆盖。
    const current = ++revision;
    // 固定本次状态，后续用户操作只能通过新序号使它失效。
    const submitted = { ...state };
    results = [];
    shown = 0;
    failedAppend = false;
    list.replaceChildren();
    more.hidden = true;
    retry.hidden = true;
    clear.hidden = !input.value && !state.query;
    if (!submitted.query) {
      keywordSearch = null;
      keyword = '';
      filterPanel.hidden = true;
      setBusy(false);
      status.textContent = '输入关键词，开始查找文章。';
      return;
    }
    // 新关键词加载时隐藏旧统计，原关键词筛选则保留按钮。
    if (keyword !== submitted.query) {
      filterPanel.hidden = true;
    }
    setBusy(true);
    status.textContent = '正在搜索文章…';
    try {
      // 索引由构建产生，延迟导入避免访问空搜索页就下载所有搜索依赖。
      const bundlePath = '/pagefind/pagefind.js';
      // 使用运行时路径，Pagefind 在 Astro 构建结束后才生成，不能由 Rollup 提前解析。
      const pagefind = await import(/* @vite-ignore */ bundlePath);
      // Pagefind 仅统计已加载的过滤索引；先加载所有过滤键，基础查询才会返回分类和标签计数。
      await pagefind.filters();
      if (current !== revision) {
        return;
      }
      if (!keywordSearch || keyword !== submitted.query) {
        // 基础响应只含文章，用它生成不受当前筛选影响的顶部计数。
        const base = await pagefind.search(submitted.query, { filters: { type: 'article' } });
        if (current !== revision) {
          return;
        }
        keywordSearch = base;
        keyword = submitted.query;
      }
      // 不传 sort，沿用 Pagefind 的相关性排序。
      const response = submitted.category || submitted.tag
        ? await pagefind.search(submitted.query, { filters: getSearchFilters(submitted) })
        : keywordSearch;
      if (current !== revision) {
        return;
      }
      results = response.results;
      renderFilters();
      await appendResults(current);
    } catch (error) {
      if (current !== revision) {
        return;
      }
      // 搜索索引不可用时保持已提交条件，方便在同一网址重试。
      console.error('文章搜索失败。', error?.name ?? 'Error');
      retry.hidden = false;
      status.textContent = '搜索暂时不可用，请点击重试。';
    } finally {
      if (current === revision) {
        setBusy(false);
      }
    }
  }

  // 页面初始化及历史恢复共用查询入口，不额外添加历史条目。
  input.value = state.query;
  form.addEventListener('submit', (event) => {
    // 原生 submit 同时覆盖回车与搜索按钮，避免输入法期间误触发搜索。
    event.preventDefault();
    // 新关键词从未筛选结果开始，同一关键词重新提交保留已选条件。
    const query = input.value.trim();
    state = query === state.query ? state : { query, category: '', tag: '' };
    input.value = state.query;
    syncUrl();
    void search();
  }, { signal: listeners.signal });
  input.addEventListener('input', () => {
    // 输入只影响清除按钮的可见性，结果仍对应已提交关键词。
    clear.hidden = !input.value && !state.query;
  }, { signal: listeners.signal });
  clear.addEventListener('click', () => {
    state = { query: '', category: '', tag: '' };
    input.value = '';
    syncUrl();
    void search();
    input.focus();
  }, { signal: listeners.signal });
  filterPanel.addEventListener('click', (event) => {
    // 使用委托处理筛选按钮，重绘时不重复注册监听器。
    const button = event.target.closest('button[data-key]');
    if (!button || button.disabled) {
      return;
    }
    // 单组单选，再次点击同项取消；另一组状态保持不变。
    const key = button.dataset.key;
    state = { ...state, [key]: state[key] === button.dataset.value ? '' : button.dataset.value };
    syncUrl();
    void search();
  }, { signal: listeners.signal });
  resetFilters.addEventListener('click', () => {
    state = { ...state, category: '', tag: '' };
    syncUrl();
    void search();
    // 此按钮随后会隐藏，将键盘焦点交还搜索输入框。
    input.focus();
  }, { signal: listeners.signal });
  more.addEventListener('click', () => {
    void appendResults(revision);
  }, { signal: listeners.signal });
  retry.addEventListener('click', () => {
    if (failedAppend) {
      void appendResults(revision);
    } else {
      void search();
    }
  }, { signal: listeners.signal });
  window.addEventListener('popstate', () => {
    state = readSearchState(new URL(window.location.href));
    input.value = state.query;
    void search();
  }, { signal: listeners.signal });
  window.addEventListener('pagehide', (event) => {
    // 往返缓存需要保留监听器；正常销毁时释放并使所有待完成响应失效。
    if (!event.persisted) {
      revision += 1;
      listeners.abort();
    }
  }, { signal: listeners.signal });
  void search();
}
