'use strict';

/* Final review layer: only complete, usable sections are shown. */
const REMOVED_ROUTES=new Set([
  '#memorization','#tahajjud','#fasting','#fatwa','#seerah','#daily',
  '#quran-sciences','#tajweed','#fiqh-life','#nearest-mosque','#parents'
]);

FEATURES.splice(0,FEATURES.length,...FEATURES.filter(x=>!REMOVED_ROUTES.has(x[3])));
const reciteFeature=['◉','سمّع كتاب الله','استمع إلى تلاوتك وقارنها بالمصحف المعلّم','#recite-ai'];
const calendarFeature=['□','التقويم الإسلامي','إمساكية رمضان والمناسبات والإجازات الإسلامية','#islamic-calendar'];
AQSA_FEATURES.splice(0,AQSA_FEATURES.length,reciteFeature,calendarFeature);
const mushafCard=FEATURES.find(x=>x[3]==='#quran');
if(mushafCard)mushafCard[2]='اقرأ واستمع';

function visibleCards(){
  const seen=new Set();
  return [...FEATURES,...AQSA_FEATURES].filter(x=>{
    if(REMOVED_ROUTES.has(x[3])||seen.has(x[3]))return false;
    seen.add(x[3]);return true;
  });
}

function professionalCards(cards){
  const symbols={'#quran':'▤','#mubeen':'▥','#recitation':'◉','#adhkar':'✦','#duas':'❧','#protection':'◇','#tasbeeh':'◎','#prayer':'◷','#qibla':'⌁','#hadith':'≡','#recite-ai':'◉','#islamic-calendar':'□'};
  return `<div class="feature-grid-final">${cards.map(([i,t,d,h])=>`
    <button class="feature-card-final" data-go="${h}">
      <span class="feature-symbol" aria-hidden="true">${symbols[h]||'•'}</span>
      <span class="feature-copy"><strong>${esc(t)}</strong><small>${esc(d)}</small></span>
      <span class="feature-arrow" aria-hidden="true">←</span>
    </button>`).join('')}</div>`;
}

enhancedHomeHTML=function(){
  return `<section class="prophet-hero">
    <p>رفيقك الإيماني اليومي</p>
    <h1>اللهم صلِّ وسلم وبارك على سيدنا محمد ﷺ</h1>
    <p>قرآن وأذكار وتلاوة ومواقيت موثوقة في واجهة واضحة.</p>
  </section>
  ${dateRibbon()}<div id="homePrayer"></div>${professionalCards(visibleCards())}`;
};

renderMore=function(){
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#home">→</button>
    <div><h1>كل الأقسام</h1><p>الأقسام الفعلية المتاحة داخل التطبيق.</p></div></div>
    ${professionalCards(visibleCards())}`;
  bindGo();
};

/* Remove unavailable tafsir action instead of showing a dead/error-only dialog. */
const FINAL_AYAH_HTML=ayahHTML;
ayahHTML=function(s,v){
  return FINAL_AYAH_HTML(s,v).replace(/<button[^>]*data-tafsir="[^"]*"[^>]*>[\s\S]*?<\/button>/,'');
};

renderQuranIndex=function(){
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#home">→</button>
    <div><h1>المصحف</h1><p>اقرأ واستمع</p></div></div>
    <div class="toolbar"><button class="primary-btn" data-go="#mubeen">فتح القرآن الكريم</button></div>
    <div class="toolbar"><div class="search-field"><input id="surahSearch" type="search" placeholder="ابحث باسم السورة أو رقمها…"></div></div>
    <div id="surahGrid" class="surah-grid">${LOCAL_DATA.surahs.map(s=>surahCard(s)).join('')}</div>`;
  bindGo();
  const bind=()=>$$('[data-surah]').forEach(c=>c.onclick=()=>go(`#reader/${c.dataset.surah}/1`));
  bind();
  $('#surahSearch').oninput=e=>{
    const q=normalizeArabic(e.target.value),raw=e.target.value.trim();
    $('#surahGrid').innerHTML=LOCAL_DATA.surahs.filter(s=>normalizeArabic(s.name).includes(q)||String(s.id)===raw)
      .map(s=>surahCard(s)).join('')||'<div class="empty">لا توجد نتائج</div>';
    bind();
  };
};

/* Full-text search with visible yellow highlighting. */
function highlightSearch(text,query){
  const words=normalizeArabic(query).split(' ').filter(Boolean);
  if(!words.length)return esc(text);
  return String(text??'').split(/(\s+)/).map(token=>{
    const n=normalizeArabic(token);
    const hit=words.some(w=>n.includes(w));
    return hit?`<mark>${esc(token)}</mark>`:esc(token);
  }).join('');
}

globalSearch=function(){
  const input=$('#globalSearchInput'),q=input?.value.trim();
  if(!q){toast('اكتب كلمة للبحث');return}
  const nq=normalizeArabic(q),results=[];
  LOCAL_DATA.surahs.forEach(s=>{
    if(normalizeArabic(s.name).includes(nq)||String(s.id)===q)
      results.push({title:`سورة ${s.name}`,text:`${s.ayahCount} آية`,go:`#reader/${s.id}/1`});
  });
  visibleCards().forEach(x=>{
    if(normalizeArabic(`${x[1]} ${x[2]}`).includes(nq))results.push({title:x[1],text:x[2],go:x[3]});
  });
  ['morning','evening'].forEach(g=>(LOCAL_DATA.adhkar[g]||[]).forEach(x=>{
    if(normalizeArabic(`${x.title} ${x.text}`).includes(nq))
      results.push({title:x.title,text:x.text,go:'#adhkar'});
  }));
  (LOCAL_DATA.quran_duas||[]).forEach(x=>{
    if(normalizeArabic(`${x.title} ${x.text}`).includes(nq))
      results.push({title:x.title,text:x.text,go:'#duas'});
  });
  (LOCAL_DATA.protection||[]).forEach(x=>{
    if(normalizeArabic(`${x.title} ${x.text}`).includes(nq))
      results.push({title:x.title,text:x.text,go:'#protection'});
  });
  showModal(`نتائج البحث عن «${q}»`,results.length?`<div class="list-stack">${
    results.slice(0,80).map(r=>`<article class="card search-result-card" data-modal-go="${r.go}">
      <h3>${highlightSearch(r.title,q)}</h3><p>${highlightSearch(r.text,q)}</p></article>`).join('')
  }</div>`:'<div class="empty">لا توجد نتائج مطابقة.</div>');
  $$('[data-modal-go]').forEach(x=>x.onclick=()=>{closeModal();go(x.dataset.modalGo)});
};

/* Highlight the search term inside loaded hadith results and remove fake explanation. */
renderHadith=function(){
  oldRenderHadith();
  const input=$('#hadithSearch'),list=$('#hadithList');
  if(!input||!list)return;
  const paint=()=>{
    const q=input.value.trim();
    $$('.hadith-text',list).forEach(el=>{
      const raw=el.dataset.rawText||el.textContent;
      el.dataset.rawText=raw;
      el.innerHTML=q?highlightSearch(raw,q):esc(raw);
    });
    $$('.hadith-explain',list).forEach(x=>x.remove());
  };
  input.addEventListener('input',()=>setTimeout(paint,0));
  new MutationObserver(paint).observe(list,{childList:true,subtree:true});
};

/* Extend the established morning/evening collection, without duplicates. */
addUnique(LOCAL_DATA.adhkar.morning,[
  {title:'اللهم إني أصبحت أُشهدك',text:'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.',count:4,reference:'أبو داود'},
  {title:'اللهم إني أسألك علمًا نافعًا',text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.',count:1,reference:'ابن ماجه'},
  {title:'سبحان الله وبحمده عدد خلقه',text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',count:3,reference:'صحيح مسلم'}
]);
addUnique(LOCAL_DATA.adhkar.evening,[
  {title:'اللهم إني أمسيت أُشهدك',text:'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.',count:4,reference:'أبو داود'},
  {title:'أعوذ بكلمات الله التامات',text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',count:3,reference:'صحيح مسلم'}
]);

const KHATM_DUA=`اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.
اللَّهُمَّ أَصْلِحْ لِي دِينِيَ الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِيَ الَّتِي إِلَيْهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.
رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ، وَاغْفِرْ لَنَا وَلِوَالِدِينَا وَلِجَمِيعِ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الْآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ. وَصَلَّى اللَّهُ وَسَلَّمَ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.`;

const BASE_ADHKAR=renderAdhkar;
renderAdhkar=function(){
  BASE_ADHKAR();
  const title=$('.screen-title');
  title?.insertAdjacentHTML('afterend',`<div class="toolbar"><button class="soft-btn" id="openKhatmDua">دعاء ختم القرآن</button></div>`);
  $('#openKhatmDua').onclick=()=>showModal('دعاء ختم القرآن',`<div class="source-note">هذه صيغة دعاء جائزة ومشهورة، وليست نصًا محددًا ثابتًا عن النبي ﷺ.</div><div class="khatm-dua">${esc(KHATM_DUA).replace(/\n/g,'<br><br>')}</div>`);
};

/* A substantial, sourced ruqyah/protection collection. */
addUnique(LOCAL_DATA.protection,[
  {title:'خواتيم سورة البقرة',text:'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ... لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا...',reference:'البقرة: 285-286'},
  {title:'إبطال السحر',text:'فَلَمَّا أَلْقَوْا قَالَ مُوسَىٰ مَا جِئْتُمْ بِهِ السِّحْرُ إِنَّ اللَّهَ سَيُبْطِلُهُ إِنَّ اللَّهَ لَا يُصْلِحُ عَمَلَ الْمُفْسِدِينَ.',reference:'يونس: 81'},
  {title:'الشفاء والرحمة',text:'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ.',reference:'الإسراء: 82'},
  {title:'شفاء الصدور',text:'يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُمْ مَوْعِظَةٌ مِنْ رَبِّكُمْ وَشِفَاءٌ لِمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِلْمُؤْمِنِينَ.',reference:'يونس: 57'},
  {title:'التوكل على الله',text:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ.',reference:'آل عمران: 173'},
  {title:'سورة الكافرون',text:'قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ ۝ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ ۝ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ لَكُمْ دِينُكُمْ وَلِيَ دِينِ.',reference:'سورة الكافرون'}
]);

/* Self review only, with the requested Husary Muallim comparison. */
renderReciteAI=function(){
  const opts=LOCAL_DATA.surahs.map(x=>`<option value="${x.id}">${x.id}. ${esc(x.name)}</option>`).join('');
  screen('سمّع كتاب الله','استمع إلى تسجيلك وقارنه بتلاوة الحصري — المصحف المعلّم',`
    <div class="toolbar"><select id="selfSurah">${opts}</select><input id="selfAyah" type="number" value="1" min="1">
      <button class="primary-btn" id="selfLoad">عرض الآية</button></div>
    <article class="card self-review-card"><div id="selfVerseFinal" class="ayah-text">اختر السورة والآية</div>
      <div class="control-row"><button class="primary-btn" id="playTeacher">استمع للحصري المعلّم</button>
        <button class="primary-btn" id="selfRecord">● بدء تسجيلك</button><button class="soft-btn" id="selfStop" disabled>■ إيقاف</button></div>
      <audio id="teacherAudio" controls class="review-audio"></audio><audio id="selfAudio" controls class="review-audio hidden"></audio>
      <p class="muted">سجّل قراءتك، ثم استمع إلى التسجيل وإلى تلاوة الشيخ الحصري مع متابعة النص.</p></article>`);
  let current=null,recorder=null,chunks=[];
  const load=async()=>{
    const sid=Number($('#selfSurah').value),a=Number($('#selfAyah').value);
    const verses=await getSurah(sid);current=verses.find(x=>x.number===a)||verses[0];
    $('#selfVerseFinal').textContent=current.text;$('#selfAyah').value=current.number;
  };
  $('#selfLoad').onclick=load;
  $('#playTeacher').onclick=async()=>{
    await load();const sid=String(Number($('#selfSurah').value)).padStart(3,'0'),a=String(current.number).padStart(3,'0');
    const el=$('#teacherAudio');el.src=`https://everyayah.com/data/Husary_Muallim_128kbps/${sid}${a}.mp3`;el.play().catch(()=>toast('اضغط تشغيل من مشغل الصوت'));
  };
  $('#selfRecord').onclick=async()=>{try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);
    recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const el=$('#selfAudio');el.src=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));el.classList.remove('hidden');stream.getTracks().forEach(t=>t.stop())};
    recorder.start();$('#selfRecord').disabled=true;$('#selfStop').disabled=false;
  }catch{toast('اسمح للتطبيق باستخدام الميكروفون')}};
  $('#selfStop').onclick=()=>{recorder?.stop();$('#selfRecord').disabled=false;$('#selfStop').disabled=true};
  load();
};

function monthCells(year,month){
  const first=new Date(year,month-1,1),days=new Date(year,month,0).getDate(),offset=(first.getDay()+1)%7;
  const cells=Array(offset).fill('<div class="calendar-day empty-cell"></div>');
  for(let d=1;d<=days;d++){
    const date=new Date(year,month-1,d),h=hijriNumbers(date);
    const event=ISLAMIC_EVENTS.find(e=>e.m===h.m&&e.d===h.d);
    cells.push(`<div class="calendar-day ${event?'event-day':''}"><strong>${d}</strong><small>${h.d} ${hijriParts(date).split(' ')[1]||''}</small>${event?`<span>${esc(event.name)}</span>`:''}</div>`);
  }
  return cells.join('');
}

renderIslamicCalendar=function(){
  const now=new Date();
  screen('التقويم الإسلامي','تقويم هجري وميلادي وإمساكية رمضان لمصر',`
    <div class="toolbar"><select id="calMonth">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i+1===now.getMonth()+1?'selected':''}>${new Date(2026,i,1).toLocaleDateString('ar-EG',{month:'long'})}</option>`).join('')}</select>
      <input id="calYear" type="number" value="${now.getFullYear()}" min="2020" max="2040"><button class="primary-btn" id="drawCalendar">عرض</button></div>
    <div class="calendar-week"><span>السبت</span><span>الأحد</span><span>الاثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span></div>
    <div id="calendarGrid" class="calendar-grid"></div>
    <div class="source-note">تتحدد بدايات الشهور الهجرية رسميًا بالرؤية الشرعية، وقد تختلف بيوم حسب إعلان دار الإفتاء المصرية.</div>
    <article class="card ramadan-card"><h2>إمساكية رمضان</h2><div class="toolbar"><input id="ramadanYear" type="number" value="${hijriNumbers().y}" min="1440" max="1465"><button class="primary-btn" id="loadRamadan">تحميل إمساكية القاهرة</button></div><div id="ramadanTable"></div></article>`);
  const draw=()=>$('#calendarGrid').innerHTML=monthCells(Number($('#calYear').value),Number($('#calMonth').value));
  $('#drawCalendar').onclick=draw;draw();
  $('#loadRamadan').onclick=async()=>{
    const box=$('#ramadanTable');box.innerHTML='<div class="skeleton"></div>';
    try{
      const y=Number($('#ramadanYear').value);
      const r=await fetchJSON(`https://api.aladhan.com/v1/hijriCalendarByCity/${y}/9?city=Cairo&country=Egypt&method=5`);
      const days=Array.isArray(r?.data)?r.data:(Array.isArray(r)?r:[]);
      if(!days.length)throw new Error('no data');
      box.innerHTML=`<div class="table-scroll"><table><thead><tr><th>رمضان</th><th>الميلادي</th><th>الإمساك</th><th>الفجر</th><th>المغرب</th><th>العشاء</th></tr></thead><tbody>${
        days.map(x=>`<tr><td>${esc(x.date.hijri.day)}</td><td>${esc(x.date.gregorian.date)}</td><td>${safeTime(x.timings.Imsak)}</td><td>${safeTime(x.timings.Fajr)}</td><td>${safeTime(x.timings.Maghrib)}</td><td>${safeTime(x.timings.Isha)}</td></tr>`).join('')
      }</tbody></table></div>`;
    }catch{box.innerHTML='<div class="error-box">تعذر تحميل الإمساكية الآن. لم يتم عرض بيانات قديمة أو تقديرية.</div>'}
  };
};

async function renderMarkets(){
  screen('الأسعار والأسواق','بيانات مباشرة مع وقت آخر تحديث ومصدر واضح',`
    <div class="market-grid">
      <article class="card market-card"><h2>العملات مقابل الجنيه</h2><div id="currencyData"><div class="skeleton"></div></div><div class="reference">المصدر: Frankfurter / البنك المركزي الأوروبي</div></article>
      <article class="card market-card"><h2>الذهب</h2><div id="goldData"><div class="skeleton"></div></div><div class="reference">السعر العالمي المباشر للأونصة، وتحويل تقديري للجنيه دون مصنعية أو ضريبة.</div></article>
      <article class="card market-card"><h2>البورصة المصرية</h2><p>القائمة الكاملة والأسعار اللحظية تتغير أثناء جلسة التداول؛ افتح المصدر الرسمي لتجنب عرض أسعار مؤجلة أو ناقصة.</p>
        <a class="primary-btn inline-link" href="https://www.egx.com.eg/ar/MarketWatch.aspx" target="_blank" rel="noopener">فتح شاشة التداول الرسمية EGX</a>
        <div class="reference">المصدر الرسمي: البورصة المصرية</div></article>
    </div><p id="marketUpdated" class="updated-chip">جاري التحديث…</p>`);
  try{
    const rates=await fetch('https://api.frankfurter.app/latest?from=EGP&to=USD,EUR,GBP,SAR,AED,KWD').then(r=>r.ok?r.json():Promise.reject());
    const names={USD:'الدولار الأمريكي',EUR:'اليورو',GBP:'الجنيه الإسترليني',SAR:'الريال السعودي',AED:'الدرهم الإماراتي',KWD:'الدينار الكويتي'};
    $('#currencyData').innerHTML=`<div class="price-list">${Object.entries(rates.rates).map(([k,v])=>`<div><span>${names[k]}</span><strong>${(1/v).toFixed(2)} ج.م</strong></div>`).join('')}</div>`;
  }catch{$('#currencyData').innerHTML='<div class="error-box">تعذر تحديث العملات الآن.</div>'}
  try{
    const g=await fetch('https://api.gold-api.com/price/XAU').then(r=>r.ok?r.json():Promise.reject());
    const usd=Number(g.price),fx=await fetch('https://api.frankfurter.app/latest?from=USD&to=EGP').then(r=>r.json());
    const egp=usd*Number(fx.rates.EGP),gram=egp/31.1034768;
    $('#goldData').innerHTML=`<div class="price-list"><div><span>عيار 24</span><strong>${Math.round(gram).toLocaleString('ar-EG')} ج.م</strong></div><div><span>عيار 21</span><strong>${Math.round(gram*.875).toLocaleString('ar-EG')} ج.م</strong></div><div><span>عيار 18</span><strong>${Math.round(gram*.75).toLocaleString('ar-EG')} ج.م</strong></div></div>`;
  }catch{$('#goldData').innerHTML='<div class="error-box">تعذر تحديث الذهب الآن.</div>'}
  $('#marketUpdated').textContent=`آخر محاولة تحديث: ${new Date().toLocaleString('ar-EG')}`;
}

const FINAL_ORIGINAL_ROUTE=route;
route=async function(){
  const r=(location.hash||'#home').slice(1).split('/')[0];
  if(r==='markets'){go('#home');return}
  if(REMOVED_ROUTES.has(`#${r}`)){go('#home');return}
  return FINAL_ORIGINAL_ROUTE();
};
