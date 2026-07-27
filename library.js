'use strict';

/*
  القرآن الكريم — قارئ محلي للنص القرآني المرفق في ARQURAN.TXT.
  لا يعتمد هذا القسم على صور أو روابط خارجية، ويعمل دون إنترنت.
*/
const MUBEEN_DATA = window.MUBEEN_QURAN || {meta:{}, pages:[], surahs:[], juz:[]};
const MUBEEN_MAX_PAGE = MUBEEN_DATA.pages.length || 604;
const mubeenState = {
  page: Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(store.get('mubeenPage', 1)) || 1)),
  mode: store.get('mubeenMode', 'auto'),
  fontSize: Number(store.get('mubeenFontSize', 29)) || 29,
  lineHeight: Number(store.get('mubeenLineHeight', 2.05)) || 2.05
};
let mubeenSearchCache = null;

function mubeenPage(number) {
  const n = Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(number) || 1));
  return MUBEEN_DATA.pages[n - 1] || {page:n, juz:1, sections:[]};
}

function mubeenContext(number) {
  const pg = mubeenPage(number);
  const names = [...new Set((pg.sections || []).map(x => x.surahName).filter(Boolean))];
  return {
    page: pg.page,
    juz: pg.juz || 1,
    surahNames: names,
    title: names.length === 1 ? `سورة ${names[0]}` : (names.length ? names.map(x => `سورة ${x}`).join('، ') : 'القرآن الكريم')
  };
}

function openMubeenPage(page, selection = {}) {
  const n = Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(page) || 1));
  mubeenState.page = n;
  store.set('mubeenPage', n);
  store.set('mubeenSelection', {...selection, page:n});
  go(`#mubeen/read/${n}`);
}

async function renderMubeen(section = 'index', pageArg = '') {
  if (!MUBEEN_DATA.pages?.length) {
    view.innerHTML = '<div class="error-box"><strong>تعذر تحميل نص القرآن الكريم.</strong><br>تأكد من وجود ملف quran_data.js داخل مجلد التطبيق.</div>';
    return;
  }
  if (section === 'read') return renderMubeenReader(pageArg);
  return renderMubeenIndex();
}

function renderMubeenIndex() {
  const savedTab = store.get('mubeenIndexTab', 'surahs');
  const lastPage = Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(store.get('mubeenPage', 1)) || 1));
  view.innerHTML = `<div class="mubeen-shell">
    <div class="screen-title">
      <button class="icon-btn" data-go="#home">→</button>
      <div class="feature-icon mubeen-icon">📖</div>
      <div><h1>القرآن الكريم</h1><p>القرآن الكريم بالحركات — قراءة محلية من الملف المرفق</p></div>
      <div class="grow"></div>
      <button class="soft-btn small-btn" id="mubeenAbout">حول النص</button>
    </div>

    <section class="mubeen-index-hero card">
      <div>
        <span class="mubeen-kicker">فهرس القرآن الكريم</span>
        <h2>اختر السورة أو الجزء</h2>
        <p>النص محفوظ داخل التطبيق ويعمل دون اتصال بالإنترنت. اختر السورة أو الجزء، أو ابحث في نص القرآن كاملًا.</p>
      </div>
      <button class="primary-btn" id="mubeenContinue">📖 متابعة آخر قراءة — صفحة ${lastPage}</button>
    </section>

    <div class="card mubeen-index-tools">
      <div class="mubeen-tabs" role="tablist" aria-label="نوع الفهرس">
        <button class="mubeen-tab ${savedTab === 'surahs' ? 'active' : ''}" data-mubeen-tab="surahs" role="tab">السور</button>
        <button class="mubeen-tab ${savedTab === 'juz' ? 'active' : ''}" data-mubeen-tab="juz" role="tab">الأجزاء</button>
        <button class="mubeen-tab ${savedTab === 'search' ? 'active' : ''}" data-mubeen-tab="search" role="tab">البحث</button>
      </div>
      <div class="mubeen-index-search">
        <span>⌕</span>
        <input id="mubeenIndexSearch" type="search" placeholder="ابحث باسم السورة أو رقمها…" aria-label="البحث في القرآن الكريم">
      </div>
    </div>

    <div id="mubeenIndexGrid" class="mubeen-index-grid"></div>
    <div class="notice">النص مأخوذ من الملف المرفق <strong>ARQURAN.TXT</strong>، وهو نص بالحركات وليس مصحفًا مصورًا ولا يتضمن ألوان أحكام التجويد.</div>
  </div>`;
  bindGo();

  let activeTab = ['surahs','juz','search'].includes(savedTab) ? savedTab : 'surahs';
  let visibleSearchCount = 100;
  const grid = $('#mubeenIndexGrid');
  const search = $('#mubeenIndexSearch');

  const renderItems = () => {
    const rawQuery = search.value.trim();
    const query = normalizeArabic(rawQuery);
    if (activeTab === 'juz') {
      search.placeholder = 'ابحث برقم الجزء…';
      const items = (MUBEEN_DATA.juz || []).filter(x => !rawQuery || String(x.number).includes(toLatinDigitsLocal(rawQuery)));
      grid.className = 'mubeen-index-grid';
      grid.innerHTML = items.map(item => `<button class="mubeen-index-card" data-page="${item.page}" data-juz="${item.number}">
        <span class="mubeen-index-number">${item.number}</span>
        <span class="mubeen-index-copy"><strong>الجزء ${item.number}</strong><small>يبدأ من سورة ${esc(item.surahName)} — الآية ${item.ayah}</small></span>
        <span class="mubeen-index-arrow">←</span>
      </button>`).join('') || '<div class="empty">لا توجد نتائج.</div>';
    } else if (activeTab === 'search') {
      search.placeholder = 'ابحث عن كلمة أو عبارة في القرآن…';
      grid.className = 'mubeen-search-results';
      if (!query.length) {
        grid.innerHTML = '<div class="empty">اكتب كلمة أو عبارة للبحث في جميع آيات القرآن الكريم.</div>';
      } else {
        const results = searchMubeenText(query);
        const shown = results.slice(0, visibleSearchCount);
        grid.innerHTML = `<div class="quran-search-summary">عدد الآيات المطابقة: <strong>${results.length.toLocaleString('ar-EG')}</strong></div>` +
          shown.map(result => `<button class="mubeen-search-card" data-page="${result.page}" data-surah-id="${result.surahId}" data-ayah="${result.ayah}">
          <span class="mubeen-index-number">${result.ayah}</span>
          <span class="mubeen-index-copy"><strong>سورة ${esc(result.surahName)} — الآية ${result.ayah}</strong><small>الجزء ${result.juz} · الصفحة ${result.page}</small><span class="mubeen-snippet">${highlightMubeenMatch(result.text, rawQuery)}</span></span>
          <span class="mubeen-index-arrow">←</span>
        </button>`).join('') +
          (results.length > shown.length ? `<button class="soft-btn mubeen-load-more" id="mubeenMoreResults">عرض المزيد (${(results.length-shown.length).toLocaleString('ar-EG')})</button>` : '') ||
          '<div class="empty">لم يُعثر على نتائج مطابقة.</div>';
        const more = $('#mubeenMoreResults');
        if (more) more.onclick = () => { visibleSearchCount += 100; renderItems(); };
      }
    } else {
      search.placeholder = 'ابحث باسم السورة أو رقمها…';
      const latin = toLatinDigitsLocal(rawQuery);
      const items = (MUBEEN_DATA.surahs || []).filter(s => !query || normalizeArabic(s.name).includes(query) || String(s.id) === latin);
      grid.className = 'mubeen-index-grid';
      grid.innerHTML = items.map(s => `<button class="mubeen-index-card" data-page="${s.startPage}" data-surah="${s.id}">
        <span class="mubeen-index-number">${s.id}</span>
        <span class="mubeen-index-copy"><strong>سورة ${esc(s.name)}</strong><small>${s.ayahCount || '—'} آية · تبدأ من الصفحة ${s.startPage}</small></span>
        <span class="mubeen-index-arrow">←</span>
      </button>`).join('') || '<div class="empty">لا توجد نتائج.</div>';
    }

    $$('[data-page]', grid).forEach(btn => btn.onclick = () => {
      const page = Number(btn.dataset.page);
      if (btn.dataset.surah) {
        const s = MUBEEN_DATA.surahs.find(x => x.id === Number(btn.dataset.surah));
        openMubeenPage(page, {type:'surah', surahId:s?.id, title:s ? `سورة ${s.name}` : ''});
      } else if (btn.dataset.juz) {
        openMubeenPage(page, {type:'juz', juz:Number(btn.dataset.juz), title:`الجزء ${btn.dataset.juz}`});
      } else {
        openMubeenPage(page, {type:'search', query:rawQuery, surahId:Number(btn.dataset.surahId||0), ayah:Number(btn.dataset.ayah||0)});
      }
    });
  };

  $$('.mubeen-tab').forEach(btn => btn.onclick = () => {
    activeTab = btn.dataset.mubeenTab;
    store.set('mubeenIndexTab', activeTab);
    $$('.mubeen-tab').forEach(x => x.classList.toggle('active', x === btn));
    search.value = '';
    renderItems();
    search.focus();
  });
  let searchTimer;
  search.oninput = () => {
    clearTimeout(searchTimer);
    visibleSearchCount = 100;
    searchTimer = setTimeout(renderItems, activeTab === 'search' ? 180 : 0);
  };
  $('#mubeenContinue').onclick = () => openMubeenPage(lastPage, {type:'continue'});
  $('#mubeenAbout').onclick = () => showModal('حول القرآن الكريم', `<div class="library-about"><p><strong>${esc(MUBEEN_DATA.meta?.title || 'القرآن الكريم')}</strong></p><p>الإصدار: ${esc(MUBEEN_DATA.meta?.version || '—')}</p><p>الملف: ${esc(MUBEEN_DATA.meta?.sourceFile || 'ARQURAN.TXT')}</p><div class="notice">${esc(MUBEEN_DATA.meta?.validationNote || '')}</div><div class="library-source-notes">${esc(MUBEEN_DATA.meta?.notes || 'نص القرآن الكريم بالحركات من الملف المرفق.')}</div>${(MUBEEN_DATA.meta?.validationIssues || []).length ? `<div class="warning-box"><strong>ملاحظات التحقق:</strong><ul>${MUBEEN_DATA.meta.validationIssues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}</div>`);
  renderItems();
}

function toLatinDigitsLocal(value) {
  return String(value ?? '')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
}

function ensureMubeenSearchCache() {
  if (mubeenSearchCache) return mubeenSearchCache;
  mubeenSearchCache = (MUBEEN_DATA.pages || []).map(pg => {
    const raw = (pg.sections || []).map(s => `${s.surahName} ${s.text}`).join(' ');
    return {page:pg.page, juz:pg.juz, raw, normalized:normalizeArabic(raw)};
  });
  return mubeenSearchCache;
}

let mubeenAyahSearchCache = null;
function ensureMubeenAyahSearchCache() {
  if (mubeenAyahSearchCache) return mubeenAyahSearchCache;
  const surahBuckets = new Map();
  (MUBEEN_DATA.pages || []).forEach(pg => (pg.sections || []).forEach(section => {
    if (!surahBuckets.has(section.surahId)) surahBuckets.set(section.surahId, {surahId:section.surahId, surahName:section.surahName, stream:''});
    surahBuckets.get(section.surahId).stream += `\n§PAGE:${pg.page}:${pg.juz || 1}§\n${section.text || ''}`;
  }));
  const ayahs=[];
  for (const bucket of surahBuckets.values()) {
    let match, currentPage=1, currentJuz=1;
    const pattern=/([\s\S]*?)\{(\d+)\}/g;
    while ((match=pattern.exec(bucket.stream))) {
      const segment=match[1];
      const markers=[...segment.matchAll(/§PAGE:(\d+):(\d+)§/g)];
      if(markers.length){
        currentPage=Number(markers[markers.length-1][1]);
        currentJuz=Number(markers[markers.length-1][2]);
      }
      const text=segment.replace(/§PAGE:\d+:\d+§/g,' ').replace(/\s+/g,' ').trim();
      if(!text)continue;
      ayahs.push({
        surahId:bucket.surahId,
        surahName:bucket.surahName,
        ayah:Number(match[2]),
        page:currentPage,
        juz:currentJuz,
        text,
        normalized:normalizeArabic(text)
      });
    }
  }
  mubeenAyahSearchCache=ayahs;
  return ayahs;
}

function searchMubeenText(query) {
  return ensureMubeenAyahSearchCache().filter(item=>item.normalized.includes(query));
}

function highlightMubeenMatch(text,query){
  const words=normalizeArabic(query).split(' ').filter(Boolean);
  if(!words.length)return esc(text);
  return String(text||'').split(/(\s+)/).map(token=>{
    const normalized=normalizeArabic(token);
    return words.some(word=>normalized.includes(word))?`<mark>${esc(token)}</mark>`:esc(token);
  }).join('');
}

function renderMubeenReader(pageArg = '') {
  const requested = Number(pageArg);
  if (Number.isFinite(requested) && requested > 0) mubeenState.page = Math.min(MUBEEN_MAX_PAGE, Math.max(1, requested));
  store.set('mubeenPage', mubeenState.page);
  const context = mubeenContext(mubeenState.page);

  view.innerHTML = `<div class="mubeen-shell">
    <div class="screen-title">
      <button class="icon-btn" data-go="#mubeen">→</button>
      <div class="feature-icon mubeen-icon">📖</div>
      <div><h1 id="mubeenReaderTitle">${esc(context.title)}</h1><p id="mubeenReaderMeta">الجزء ${context.juz} · الصفحة ${context.page}</p></div>
      <div class="grow"></div>
      <button class="soft-btn small-btn" data-go="#mubeen">☰ الفهرس</button>
    </div>

    <div class="card mubeen-toolbar">
      <div class="mubeen-toolbar-row">
        <button class="primary-btn" id="mushafPrev">→ السابقة</button>
        <button class="primary-btn" id="mushafNext">التالية ←</button>
        <div class="field"><label>العرض</label><select id="mushafMode"><option value="auto">تلقائي</option><option value="one">صفحة واحدة</option><option value="two">صفحتان</option></select></div>
        <div class="field"><label>حجم الخط</label><input id="mushafFont" type="range" min="20" max="42" step="1" value="${mubeenState.fontSize}"></div>
        <div class="field"><label>تباعد السطور</label><input id="mushafLineHeight" type="range" min="1.55" max="2.55" step="0.05" value="${mubeenState.lineHeight}"></div>
        <button class="icon-btn" id="mushafFullscreen" title="ملء الشاشة">⛶</button>
        <button class="soft-btn" data-go="#mubeen">فهرس السور والأجزاء</button>
      </div>
    </div>

    <section class="mushaf-stage text-mushaf-stage" id="mushafStage" tabindex="0" aria-label="قارئ القرآن الكريم" dir="rtl">
      <div class="mushaf-spread text-mushaf-spread" id="mushafSpread" aria-live="polite">
        <article class="mushaf-text-page secondary" id="mushafPageLeft" dir="rtl"></article>
        <article class="mushaf-text-page" id="mushafPageRight" dir="rtl"></article>
      </div>
    </section>
    <div class="mubeen-footer"><span id="mushafPageInfo">—</span><span>اتجاه القراءة من اليمين إلى اليسار: اسحب يمينًا للصفحة التالية ويسارًا للسابقة.</span></div>
  </div>`;
  bindGo();
  $('#mushafMode').value = mubeenState.mode;
  $('#mushafFont').oninput = e => {mubeenState.fontSize = Number(e.target.value); store.set('mubeenFontSize', mubeenState.fontSize); drawMubeenPages()};
  $('#mushafLineHeight').oninput = e => {mubeenState.lineHeight = Number(e.target.value); store.set('mubeenLineHeight', mubeenState.lineHeight); drawMubeenPages()};
  $('#mushafMode').onchange = e => {mubeenState.mode = e.target.value; store.set('mubeenMode', mubeenState.mode); drawMubeenPages()};
  $('#mushafPrev').onclick = () => moveMubeen(-1);
  $('#mushafNext').onclick = () => moveMubeen(1);
  $('#mushafFullscreen').onclick = () => $('#mushafStage').requestFullscreen?.();
  $('#mushafStage').addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') moveMubeen(1);
    if (e.key === 'ArrowLeft') moveMubeen(-1);
    if (e.key === 'Escape') go('#mubeen');
  });
  let startX = null;
  $('#mushafStage').addEventListener('touchstart', e => {startX = e.changedTouches[0].clientX}, {passive:true});
  $('#mushafStage').addEventListener('touchend', e => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 55) moveMubeen(delta > 0 ? 1 : -1);
    startX = null;
  }, {passive:true});
  drawMubeenPages();
}

function effectiveMubeenMode() {
  if (mubeenState.mode !== 'auto') return mubeenState.mode;
  return window.matchMedia('(max-width: 900px)').matches ? 'one' : 'two';
}

function mubeenStep() {return effectiveMubeenMode() === 'two' ? 2 : 1}

function mubeenSpreadStart(page = mubeenState.page) {
  const n = Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(page) || 1));
  return n % 2 === 0 ? Math.max(1, n - 1) : n;
}

function moveMubeen(direction) {
  const dir = direction >= 0 ? 1 : -1;
  if (effectiveMubeenMode() === 'two') {
    setMubeenPage(mubeenSpreadStart() + (dir * 2));
  } else {
    setMubeenPage(mubeenState.page + dir);
  }
}

function setMubeenPage(page) {
  mubeenState.page = Math.min(MUBEEN_MAX_PAGE, Math.max(1, Number(page) || 1));
  store.set('mubeenPage', mubeenState.page);
  history.replaceState(null, '', `#mubeen/read/${mubeenState.page}`);
  drawMubeenPages();
}

function drawMubeenPages() {
  const stage = $('#mushafStage');
  if (!stage) return;
  const two = effectiveMubeenMode() === 'two';
  const current = mubeenState.page;
  const rightPage = two ? mubeenSpreadStart(current) : current;
  const leftPage = Math.min(MUBEEN_MAX_PAGE, rightPage + 1);
  const spread = $('#mushafSpread');
  spread.style.setProperty('--mubeen-font-size', `${mubeenState.fontSize}px`);
  spread.style.setProperty('--mubeen-line-height', String(mubeenState.lineHeight));
  spread.style.gridTemplateColumns = two ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)';
  spread.style.gridTemplateAreas = two ? '"left right"' : '"right"';
  $('#mushafPageLeft').style.display = two ? 'block' : 'none';

  // في المصحف العربي توضع الصفحة الفردية على اليمين، والصفحة التالية على اليسار.
  renderMubeenTextPage($('#mushafPageRight'), rightPage);
  if (two) renderMubeenTextPage($('#mushafPageLeft'), leftPage);

  const context = mubeenContext(current);
  $('#mubeenReaderTitle').textContent = context.title;
  $('#mubeenReaderMeta').textContent = `الجزء ${context.juz} · الصفحة ${current}`;
  $('#mushafPageInfo').textContent = two
    ? `${context.title} · الجزء ${context.juz} · من اليمين الصفحة ${rightPage} ثم الصفحة ${leftPage}`
    : `${context.title} · الجزء ${context.juz} · الصفحة ${current}`;
  store.set('mubeenLastContext', context);
  $('#mushafPrev').disabled = two ? rightPage <= 1 : current <= 1;
  $('#mushafNext').disabled = two ? leftPage >= MUBEEN_MAX_PAGE : current >= MUBEEN_MAX_PAGE;
}

function renderMubeenTextPage(element, pageNumber) {
  const pg = mubeenPage(pageNumber);
  const sections = pg.sections || [];
  element.innerHTML = `<div class="quran-paper">
    <header class="quran-paper-head"><span>الجزء ${pg.juz || '—'}</span><span>القرآن الكريم</span></header>
    <div class="quran-paper-body">${sections.length ? sections.map(sec => renderMubeenSection(sec, pageNumber, sections.length > 1)).join('') : '<div class="empty">لا يوجد نص في هذه الصفحة.</div>'}</div>
    <footer class="quran-paper-foot"><span>${pageNumber}</span></footer>
  </div>`;
}

function renderMubeenSection(section, pageNumber, forceTitle = false) {
  const surah = MUBEEN_DATA.surahs.find(x => x.id === section.surahId);
  const startsHere = surah?.startPage === pageNumber || forceTitle;
  const title = startsHere || forceTitle ? `<div class="quran-surah-title">سورة ${esc(section.surahName)}</div>` : '';
  const lines = String(section.text || '').split('\n').map(line => {
    const safe = esc(line || ' ');
    const withAyahs = safe.replace(/([\{\(])(\d+)([\}\)])/g, '<span class="ayah-number">$1$2$3</span>');
    return `<div class="quran-line">${withAyahs || '&nbsp;'}</div>`;
  }).join('');
  return `<section class="quran-page-section" data-surah="${section.surahId}">${title}<div class="quran-page-lines">${lines}</div></section>`;
}

/* إضافة «القرآن الكريم» إلى قائمة الأقسام الحالية. */
try {
  const quranIndex = FEATURES.findIndex(x => x[1] === 'المصحف');
  const existing = FEATURES.find(x => x[1] === 'القرآن الكريم');
  if (existing) {
    existing[2] = 'فهرس السور والأجزاء ونص القرآن بالحركات';
    existing[3] = '#mubeen';
  } else {
    FEATURES.splice(quranIndex + 1, 0, ['📖', 'القرآن الكريم', 'فهرس السور والأجزاء ونص القرآن بالحركات', '#mubeen']);
  }
} catch (error) {console.warn(error)}

window.addEventListener('resize', () => {
  if (location.hash.startsWith('#mubeen/read')) drawMubeenPages();
});
