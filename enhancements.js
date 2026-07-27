'use strict';

/* Al-Aqsa 2026 enhancement layer. It extends the original offline-first PWA
   while leaving the bundled Quran text and existing reader intact. */

const AQSA_FEATURES=[
  ['🎙️','سمّع كتاب الله','تسميع صوتي وكتابي ومراجعة التسجيل','#recite-ai'],
  ['✅','تذكير','برنامجك الإيماني اليومي في دقائق','#daily'],
  ['📚','علوم القرآن','المحكم والمتشابه والناسخ وأسباب النزول والإعجاز','#quran-sciences'],
  ['🪶','أحكام التجويد','شرح منظم مع أمثلة وتدريبات','#tajweed'],
  ['⚖️','العبادات والمعاملات','الزكاة والصيام والمعاملات والميراث','#fiqh-life'],
  ['📆','المناسبات والإمساكية','التقويم الهجري وإمساكية رمضان','#islamic-calendar'],
  ['🧭','أقرب مسجد','بحث واتجاهات حسب موقعك','#nearest-mosque'],
  ['🤍','الدعاء للوالدين','دعاء وبر وصدقة جارية للأحياء والمتوفين','#parents'],
];

const ISLAMIC_EVENTS=[
  {m:1,d:1,name:'رأس السنة الهجرية'},
  {m:1,d:10,name:'يوم عاشوراء'},
  {m:3,d:12,name:'ذكرى المولد النبوي'},
  {m:7,d:27,name:'ذكرى الإسراء والمعراج'},
  {m:8,d:15,name:'ليلة النصف من شعبان'},
  {m:9,d:1,name:'بداية شهر رمضان'},
  {m:9,d:27,name:'ليلة القدر (مرجوة في العشر الأواخر)'},
  {m:10,d:1,name:'عيد الفطر'},
  {m:12,d:9,name:'يوم عرفة'},
  {m:12,d:10,name:'عيد الأضحى'}
];

/* Complete the daily collection with widely established supplications.
   References are shown beside every entry; duplicate titles are skipped. */
function addUnique(list,items){
  const seen=new Set(list.map(x=>normalizeArabic(x.title)));
  items.forEach(x=>{if(!seen.has(normalizeArabic(x.title)))list.push(x)});
}
addUnique(LOCAL_DATA.adhkar.morning,[
  {title:'أصبحنا وأصبح الملك لله',text:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',count:1,reference:'صحيح مسلم'},
  {title:'اللهم ما أصبح بي من نعمة',text:'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.',count:1,reference:'أبو داود'},
  {title:'يا حي يا قيوم',text:'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',count:1,reference:'النسائي في الكبرى والحاكم'},
  {title:'اللهم عالم الغيب والشهادة',text:'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ.',count:1,reference:'أبو داود والترمذي'},
  {title:'لا إله إلا الله وحده لا شريك له',text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',count:10,reference:'أبو داود'}
]);
addUnique(LOCAL_DATA.adhkar.evening,[
  {title:'اللهم ما أمسى بي من نعمة',text:'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.',count:1,reference:'أبو داود'},
  {title:'يا حي يا قيوم',text:'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',count:1,reference:'النسائي في الكبرى والحاكم'},
  {title:'اللهم عالم الغيب والشهادة',text:'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ.',count:1,reference:'أبو داود والترمذي'},
  {title:'لا إله إلا الله وحده لا شريك له',text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',count:10,reference:'أبو داود'}
]);
addUnique(LOCAL_DATA.quran_duas,[
  {title:'دعاء قبول العمل',text:'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',reference:'البقرة: 127'},
  {title:'دعاء التوبة والثبات',text:'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِنْ ذُرِّيَّتِنَا أُمَّةً مُسْلِمَةً لَكَ وَأَرِنَا مَنَاسِكَنَا وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',reference:'البقرة: 128'},
  {title:'دعاء الصبر',text:'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',reference:'الأعراف: 126'},
  {title:'دعاء المغفرة والرحمة',text:'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',reference:'الأعراف: 23'},
  {title:'دعاء حسن الخاتمة',text:'تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',reference:'يوسف: 101'},
  {title:'دعاء دخول الجنة',text:'رَبِّ ابْنِ لِي عِنْدَكَ بَيْتًا فِي الْجَنَّةِ',reference:'التحريم: 11'}
]);

function hijriParts(date=new Date()){
  const f=new Intl.DateTimeFormat('ar-EG-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'});
  return f.format(date);
}
function hijriNumbers(date=new Date()){
  const p=new Intl.DateTimeFormat('en-u-ca-islamic',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(date);
  const get=t=>Number(p.find(x=>x.type===t)?.value||0);
  return {d:get('day'),m:get('month'),y:get('year')};
}
function nextIslamicEvent(){
  const start=new Date(); start.setHours(12,0,0,0);
  for(let i=0;i<390;i++){
    const x=new Date(start); x.setDate(start.getDate()+i);
    const h=hijriNumbers(x);
    const e=ISLAMIC_EVENTS.find(v=>v.m===h.m&&v.d===h.d);
    if(e)return {...e,date:x,days:i};
  }
  return null;
}
function dateRibbon(){
  const now=new Date(), event=nextIslamicEvent();
  return `<div class="date-ribbon">
    <div><strong>التاريخ الميلادي</strong><span>${now.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
    <div><strong>التاريخ الهجري</strong><span>${hijriParts(now)}</span></div>
    <div><strong>المناسبة القادمة</strong><span>${event?`${esc(event.name)} · بعد ${event.days} يوم`:'تُحدّث حسب التقويم'}</span></div>
  </div>`;
}

function enhancedHomeHTML(){
  const cards=[...FEATURES.filter(x=>!['#memorization','#tahajjud','#fasting','#fatwa'].includes(x[3])),...AQSA_FEATURES];
  return `<section class="prophet-hero">
      <p>رفيقك الإيماني اليومي</p>
      <h1>اللهم صلِّ وسلم وبارك على سيدنا محمد ﷺ</h1>
      <p>قرآن، أذكار، علم نافع وعبادة يومية في مكان واحد.</p>
    </section>
    ${dateRibbon()}
    <div id="homePrayer"></div>
    <div class="section-intro"><strong>ابدأ من هنا</strong><p class="muted">اختر القسم الذي تحتاجه الآن. المحتوى الشرعي يَذكر مصدره، والميزات التقديرية تُبيّن حدودها.</p></div>
    <div class="feature-grid-pro">${cards.map(([i,t,d,h])=>`<article class="card feature-card-pro" data-go="${h}"><div class="feature-icon">${i}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>`;
}

renderHome=async function(){
  view.innerHTML=enhancedHomeHTML();
  bindGo();
  renderHomePrayer();
};

renderMore=function(){
  const cards=[...FEATURES.filter(x=>!['#memorization','#tahajjud','#fasting','#fatwa'].includes(x[3])),...AQSA_FEATURES];
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#home">→</button><div><h1>كل الأقسام</h1><p>مكتبة الأقصى وخدماتك اليومية.</p></div></div>
    <div class="feature-grid-pro">${cards.map(([i,t,d,h])=>`<article class="card feature-card-pro" data-go="${h}"><div class="feature-icon">${i}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}
    <article class="card feature-card-pro" data-go="#settings"><div class="feature-icon">⚙️</div><h3>الإعدادات</h3><p>المظهر والموقع والبيانات</p></article></div>`;
  bindGo();
};

renderQuranIndex=function(){
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#home">→</button><div><h1>القرآن الكريم</h1><p>المصحف النصي، مصحف المدينة 604 صفحات، والتفسير.</p></div></div>
    <div class="toolbar"><button class="primary-btn" data-go="#mubeen">📖 مصحف المدينة 604 صفحات</button><button class="soft-btn" id="continueRead">متابعة القراءة</button></div>
    <div class="source-note">النسخة المرفقة مقسمة إلى 604 صفحات وفق مصحف المدينة. لا يقدّم التطبيق ألوان تجويد مصطنعة قد تكون خاطئة. للمصحف الرسمي عالي الدقة استخدم إصدار مجمع الملك فهد.</div>
    <div class="toolbar"><a class="soft-btn" href="https://qurancomplex.gov.sa/" target="_blank" rel="noopener">المصدر الرسمي لمصحف المدينة</a></div>
    <div class="toolbar"><div class="search-field"><input id="surahSearch" placeholder="ابحث باسم السورة أو رقمها…"></div></div>
    <div id="surahGrid" class="surah-grid">${LOCAL_DATA.surahs.map(s=>surahCard(s)).join('')}</div>`;
  bindGo();
  $$('[data-surah]').forEach(c=>c.onclick=()=>go(`#reader/${c.dataset.surah}/1`));
  $('#continueRead').onclick=()=>{const l=store.get('lastRead',{surah:1,ayah:1});go(`#reader/${l.surah}/${l.ayah}`)};
  $('#surahSearch').oninput=e=>{const q=normalizeArabic(e.target.value),raw=e.target.value.trim();$('#surahGrid').innerHTML=LOCAL_DATA.surahs.filter(s=>normalizeArabic(s.name).includes(q)||String(s.id)===raw).map(s=>surahCard(s)).join('')||'<div class="empty">لا توجد نتائج</div>';$$('[data-surah]').forEach(c=>c.onclick=()=>go(`#reader/${c.dataset.surah}/1`))};
};

const OLD_AYAH_HTML=ayahHTML;
ayahHTML=function(s,v){
  return OLD_AYAH_HTML(s,v).replace(/<button class="soft-btn small-btn [^"]*" data-bookmark="[^"]+">🔖<\/button>/,'');
};

showTafsir=async function(s,a){
  showModal('تفسير الآية',`<div class="chip-row"><button class="chip active" data-tafsir-book="tabari">الطبري</button><button class="chip" data-tafsir-book="ibn-kathir">ابن كثير</button><button class="chip" data-tafsir-book="shaarawi">الشعراوي</button></div><div id="tafsirEnhanced"><div class="skeleton"></div></div>`);
  const box=$('#tafsirEnhanced');
  const load=async book=>{
    box.innerHTML='<div class="skeleton"></div>';
    const names={tabari:'الطبري', 'ibn-kathir':'ابن كثير',shaarawi:'الشعراوي'};
    try{
      const books=await fetchJSON(`${API.quran}/surah/tafsirs/${s}`);
      const found=(Array.isArray(books)?books:[]).find(b=>normalizeArabic(`${b.name||''} ${b.short_name||''} ${typeof b.author==='object'?(b.author.ar_name||b.author.full_name||''):b.author||''}`).includes(normalizeArabic(names[book])));
      if(!found?.id)throw new Error('غير متاح');
      const r=await fetchJSON(`${API.quran}/ayah/${s}/${a}/book/${found.id}`);
      const text=(r?.content||[]).map(x=>stripHtml(x.text||'')).filter(Boolean).join('\n\n');
      if(!text)throw new Error('غير متاح');
      box.innerHTML=`<div class="notice">سورة ${esc(surah(s).name)} — الآية ${a} · تفسير ${names[book]}</div><div class="tafsir-text" style="white-space:pre-wrap;margin-top:14px">${esc(text)}</div>`;
    }catch{
      box.innerHTML=`<div class="error-box">تعذر تحميل تفسير ${names[book]} من المصدر الآن. لا يعرض التطبيق نصًا بديلًا غير موثوق.</div>`;
    }
  };
  $$('[data-tafsir-book]').forEach(b=>b.onclick=()=>{$$('[data-tafsir-book]').forEach(x=>x.classList.remove('active'));b.classList.add('active');load(b.dataset.tafsirBook)});
  load('tabari');
};

RECITERS.splice(0,RECITERS.length,
  {id:'husary',name:'الحصري — مرتل',dir:'Husary_128kbps'},
  {id:'minshawi',name:'المنشاوي — مرتل',dir:'Minshawy_Murattal_128kbps'},
  {id:'abdulbasit',name:'عبد الباسط — مرتل',dir:'Abdul_Basit_Murattal_192kbps'},
  {id:'husary_mujawwad',name:'الحصري — مجود',dir:'Husary_128kbps_Mujawwad'},
  {id:'minshawi_mujawwad',name:'المنشاوي — مجود',dir:'Minshawy_Mujawwad_192kbps'},
  {id:'abdulbasit_mujawwad',name:'عبد الباسط — مجود',dir:'Abdul_Basit_Mujawwad_128kbps'},
  {id:'banna',name:'محمود علي البنا — مجود',dir:'mahmoud_ali_al_banna_32kbps'},
  {id:'husary_muallim',name:'الحصري — المصحف المعلّم',dir:'Husary_Muallim_128kbps'},
  {id:'husary_children',name:'الحصري — المعلّم مع الترديد',dir:'Husary_Muallim_128kbps'},
  {id:'warsh_dosary',name:'إبراهيم الدوسري — رواية ورش عن نافع',dir:'warsh/warsh_ibrahim_aldosary_128kbps'}
);

renderTasbeeh=function(){
  let count=store.get('tasbeehCount',0),idx=store.get('tasbeehIndex',0);
  const items=['سبحان الله','الحمد لله','الله أكبر','لا إله إلا الله','أستغفر الله','لا حول ولا قوة إلا بالله'];
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#home">→</button><div><h1>المسبحة الإلكترونية</h1><p>لمسة هادئة بلا وميض، والعدد محفوظ تلقائيًا.</p></div></div><div class="card qibla-card">
    <select id="tasbeehDhikr">${items.map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>${x}</option>`).join('')}</select>
    <button id="tasbeehCircle" class="tasbeeh-pro" style="width:220px;height:220px;border-radius:50%;border:14px solid var(--primary3);background:linear-gradient(145deg,var(--primary2),var(--primary));color:#fff;margin:24px auto;display:grid;place-items:center;box-shadow:var(--shadow);touch-action:manipulation"><span id="tasbeehCount" style="font-size:58px;font-weight:900">${count}</span></button>
    <div class="control-row"><button class="danger-btn" id="tasbeehReset">تصفير</button><button class="soft-btn" id="tasbeehMinus">تراجع −1</button><label class="soft-btn"><input id="tasbeehVibrate" type="checkbox" ${store.get('tasbeehVibrate',true)?'checked':''}> اهتزاز</label></div></div>`;
  bindGo();const draw=()=>$('#tasbeehCount').textContent=count;
  $('#tasbeehCircle').onclick=()=>{count++;store.set('tasbeehCount',count);if($('#tasbeehVibrate').checked)navigator.vibrate?.(20);draw()};
  $('#tasbeehReset').onclick=()=>{if(confirm('تصفير العداد؟')){count=0;store.set('tasbeehCount',0);draw()}};
  $('#tasbeehMinus').onclick=()=>{count=Math.max(0,count-1);store.set('tasbeehCount',count);draw()};
  $('#tasbeehVibrate').onchange=e=>store.set('tasbeehVibrate',e.target.checked);
  $('#tasbeehDhikr').onchange=e=>{idx=Number(e.target.value);store.set('tasbeehIndex',idx);count=0;store.set('tasbeehCount',0);draw()};
};

function screen(title,subtitle,body){
  view.innerHTML=`<div class="screen-title"><button class="icon-btn" data-go="#more">→</button><div><h1>${title}</h1><p>${subtitle}</p></div></div>${body}`;
  bindGo();
}

function renderDaily(){
  const key=`daily:${dateYMD(new Date())}`;
  let stateDaily=store.get(key,[false,false,false,false]);
  const tasks=[['📖','صفحة من القرآن','افتح الصفحة التالية من وردك','#mubeen'],['🤲','أذكار الصباح','ابدأ الأذكار بالعداد','#adhkar'],['☀️','ركعتا الضحى','من بعد الشروق إلى قبل الظهر',''],['🎧','درس 3 دقائق','وقفة قصيرة: الإخلاص في العمل','']];
  screen('تذكير','برنامج إيماني يومي صغير ومستمر',`<div class="card"><div class="progress-wide"><span id="dailyProgress"></span></div><p id="dailyText" class="muted"></p><div class="daily-check">${tasks.map((x,i)=>`<label class="daily-item ${stateDaily[i]?'done':''}"><input type="checkbox" data-daily="${i}" ${stateDaily[i]?'checked':''}><div class="feature-icon">${x[0]}</div><div class="grow"><strong>${x[1]}</strong><p>${x[2]}</p></div>${x[3]?`<button class="soft-btn" type="button" data-go="${x[3]}">فتح</button>`:''}</label>`).join('')}</div></div>`);
  const draw=()=>{const done=stateDaily.filter(Boolean).length;$('#dailyProgress').style.width=`${done/4*100}%`;$('#dailyText').textContent=`أنجزت ${done} من 4 مهام اليوم`;$$('.daily-item').forEach((x,i)=>x.classList.toggle('done',stateDaily[i]))};
  $$('[data-daily]').forEach(x=>x.onchange=()=>{stateDaily[Number(x.dataset.daily)]=x.checked;store.set(key,stateDaily);draw()});bindGo();draw();
}

function compareRecitation(expected,actual){
  const exp=normalizeArabic(expected).split(' ').filter(Boolean),got=normalizeArabic(actual).split(' ').filter(Boolean);
  return exp.map((w,i)=>got[i]===w?esc(w):`<span class="wrong-word">${esc(w)}</span>`).join(' ');
}
function renderReciteAI(){
  const opts=LOCAL_DATA.surahs.map(x=>`<option value="${x.id}">${x.id}. ${esc(x.name)}</option>`).join('');
  screen('سمّع كتاب الله','تسميع صوتي وكتابي مع مراجعة ذاتية',`<div class="warning-strong">التصحيح هنا يقارن الكلمات المنطوقة أو المكتوبة بالنص. تقييم المخارج والمدود والغنة يحتاج نموذجًا صوتيًا متخصصًا، لذلك لا يَصدر التطبيق حكمًا تجويديًا آليًا غير موثوق.</div>
  <div class="toolbar" style="margin:14px 0"><select id="aiSurah">${opts}</select><input id="aiAyah" type="number" value="1" min="1"><button class="primary-btn" id="aiLoad">تحميل الآية</button></div>
  <div class="ai-workspace"><article class="card"><h3>التسميع الصوتي</h3><div id="aiHidden" class="ayah-text hidden-verse">حمّل الآية أولًا</div><textarea id="aiSpeechText" rows="6" placeholder="سيظهر النص الذي تعرّف عليه المتصفح هنا…"></textarea><div class="control-row"><button class="record-orb" id="aiSpeak">🎙️</button><button class="primary-btn" id="aiCheckSpeech">تصحيح الكلمات</button></div><div id="aiSpeechResult" class="arabic"></div></article>
  <article class="card"><h3>التسميع بالكتابة</h3><textarea id="aiWriteText" rows="8" placeholder="اكتب الآية من حفظك…"></textarea><button class="primary-btn" id="aiCheckWrite">قارن بالنص</button><div id="aiWriteResult" class="arabic"></div></article>
  <article class="card"><h3>استمع وصحح لنفسك</h3><p>سجّل تلاوتك ثم استمع إليها مع ظهور النص الصحيح.</p><div class="control-row"><button class="primary-btn" id="selfRecord">● بدء التسجيل</button><button class="soft-btn" id="selfStop" disabled>■ إيقاف</button></div><audio id="selfAudio" controls class="hidden" style="width:100%;margin-top:12px"></audio><div id="selfVerse" class="arabic"></div></article></div>`);
  let current=null,recorder=null,chunks=[];
  const load=async()=>{const sid=Number($('#aiSurah').value),a=Number($('#aiAyah').value);const verses=await getSurah(sid);current=verses.find(x=>x.number===a)||verses[0];$('#aiHidden').textContent=current.text;$('#selfVerse').textContent=current.text};
  $('#aiLoad').onclick=load;$('#aiSpeak').onclick=()=>startSpeech($('#aiSpeechText'));
  $('#aiCheckSpeech').onclick=()=>{$('#aiSpeechResult').innerHTML=current?compareRecitation(current.text,$('#aiSpeechText').value):'حمّل الآية أولًا'};
  $('#aiCheckWrite').onclick=()=>{$('#aiWriteResult').innerHTML=current?compareRecitation(current.text,$('#aiWriteText').value):'حمّل الآية أولًا'};
  $('#selfRecord').onclick=async()=>{try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const u=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));$('#selfAudio').src=u;$('#selfAudio').classList.remove('hidden');stream.getTracks().forEach(t=>t.stop())};recorder.start();$('#selfRecord').disabled=true;$('#selfStop').disabled=false}catch{toast('اسمح للتطبيق باستخدام الميكروفون')}};
  $('#selfStop').onclick=()=>{recorder?.stop();$('#selfRecord').disabled=false;$('#selfStop').disabled=true};load();
}

const SCIENCE_SECTIONS={
  'المحكم والمتشابه':['تعريف المحكم والمتشابه','ضوابط رد المتشابه إلى المحكم','المتشابه اللفظي وطرق ضبطه','نماذج تطبيقية مرتبة حسب السور'],
  'الناسخ والمنسوخ':['معنى النسخ وشروطه','الفرق بين النسخ والتخصيص','المواضع المتفق عليها','المواضع المختلف فيها وسبب الخلاف'],
  'أسباب النزول':['فوائد معرفة سبب النزول','صيغ الرواية الصريحة والمحتملة','ترتيب الأسباب حسب السور','التحقق من صحة الأسانيد'],
  'إعجاز القرآن':['الإعجاز البياني واللغوي','الإعجاز التشريعي','الإخبار بالغيب','ضوابط الحديث عن الإعجاز العلمي']
};
function renderQuranSciences(){
  screen('علوم القرآن','أبواب علمية منظّمة مع بيان الخلاف والمصدر',`<div class="source-note">هذا القسم دليل دراسي منظم، ولا يجزم بالنسخ أو سبب النزول دون نقل موثق. من المراجع: الإتقان للسيوطي، البرهان للزركشي، وأسباب النزول للواحدي مع تحقيق الروايات.</div>${Object.entries(SCIENCE_SECTIONS).map(([k,v])=>`<details class="content-accordion"><summary>${k}</summary><div class="inside"><div class="chapter-list">${v.map((x,i)=>`<div class="chapter-row"><span class="num">${i+1}</span><div><strong>${x}</strong><p class="muted">باب تعليمي قابل للبحث، مع الآيات والمراجع عند توفر النص الموثق.</p></div></div>`).join('')}</div></div></details>`).join('')}`);
}

const TAJWEED=[
  ['مخارج الحروف','الجوف، الحلق، اللسان، الشفتان والخيشوم.'],
  ['صفات الحروف','الهمس والجهر، الشدة والرخاوة، الاستعلاء والاستفال وغيرها.'],
  ['النون الساكنة والتنوين','الإظهار، الإدغام، الإقلاب والإخفاء مع حروف كل حكم.'],
  ['الميم الساكنة','الإخفاء الشفوي، الإدغام الشفوي والإظهار الشفوي.'],
  ['المدود','المد الطبيعي والفرعي وأسبابه: الهمز والسكون.'],
  ['التفخيم والترقيق','حروف الاستعلاء، أحكام الراء ولام لفظ الجلالة.'],
  ['القلقلة','قطب جد عند السكون، ومراتب القلقلة.'],
  ['الوقف والابتداء','علامات الوقف، الوقف التام والكافي والحسن والقبيح.'],
  ['المتماثلان والمتجانسان والمتقاربان','ضوابط التقاء الحروف وأحكام الإدغام.'],
  ['الاستعاذة والبسملة','أوجه البدء بين السور وأحكام الوصل والقطع.']
];
function renderTajweed(){
  screen('أحكام التجويد','منهج كامل من الأساس إلى التطبيق',`<div class="source-note">التطبيق يقدّم شرحًا تعليميًا، أمّا تصحيح الأداء العملي فالأفضل أن يكون على يد معلّم متقن. المرجع المقترح: تحفة الأطفال والجزرية وشروح أهل الأداء.</div>${TAJWEED.map((x,i)=>`<details class="content-accordion"><summary>${i+1}. ${x[0]}</summary><div class="inside"><p>${x[1]}</p><div class="notice">أمثلة قرآنية وتمرين سماعي وتقييم ذاتي.</div></div></details>`).join('')}`);
}

function renderFiqhLife(){
  screen('العبادات والمعاملات','أدوات تعليمية تقديرية وليست فتوى شخصية',`<div class="warning-strong">الحسابات للتعليم المبدئي. راجع جهة إفتاء موثوقة في الزكاة المركبة، والأسهم، والمواريث، والعقود والنزاعات.</div>
  <div class="settings-grid" style="margin-top:14px"><article class="card"><h3>حاسبة الزكاة</h3><div class="field"><label>النقد والمدخرات</label><input id="zCash" type="number" min="0" value="0"></div><div class="field"><label>قيمة الذهب وعروض التجارة</label><input id="zTrade" type="number" min="0" value="0"></div><div class="field"><label>الديون الحالة القابلة للخصم</label><input id="zDebt" type="number" min="0" value="0"></div><button class="primary-btn" id="zCalc">احسب 2.5% تقديريًا</button><div class="zakat-result" id="zResult">0</div></article>
  <article class="card"><h3>متابعة الصيام</h3><p>الاثنين والخميس، الأيام البيض، وقضاء الصيام.</p><div class="daily-check"><label class="daily-item"><input type="checkbox"> الاثنين</label><label class="daily-item"><input type="checkbox"> الخميس</label><label class="daily-item"><input type="checkbox"> يوم من القضاء</label></div></article>
  <article class="card"><h3>دليل المعاملات</h3><div class="chapter-list">${['البيع والشراء','الديون والقروض','العمل والأجور','الزواج والأسرة','السفر','الصدقات الجارية'].map((x,i)=>`<div class="chapter-row"><span class="num">${i+1}</span><strong>${x}</strong></div>`).join('')}</div></article>
  <article class="card"><h3>حاسبة الميراث</h3><p>تحتاج معرفة دقيقة بالورثة والموانع والوصايا والديون. لذلك يعرض التطبيق دليلًا تعليميًا ولا يقسم تركة حقيقية دون مراجعة شرعية وقانونية.</p><button class="soft-btn" onclick="toast('راجِع مختصًا شرعيًا وقانونيًا قبل أي تقسيم')">ابدأ الدليل التعليمي</button></article></div>`);
  $('#zCalc').onclick=()=>{const base=Math.max(0,Number($('#zCash').value)+Number($('#zTrade').value)-Number($('#zDebt').value));$('#zResult').textContent=`${(base*.025).toLocaleString('ar-EG')} (تقديري)`};
}

function renderIslamicCalendar(){
  const e=nextIslamicEvent(),h=hijriNumbers();
  screen('المناسبات الإسلامية والإمساكية','تقويم هجري مرتبط بموقعك',`${dateRibbon()}<div class="settings-grid"><article class="card"><h3>المناسبة القادمة</h3><div class="countdown">${e?esc(e.name):'—'}</div><p>${e?`متبقي تقريبًا ${e.days} يوم`:'يتعذر الحساب'}</p><div class="source-note">قد تختلف بداية الشهور حسب الرؤية الشرعية والإعلان الرسمي في بلدك.</div></article><article class="card"><h3>إمساكية رمضان</h3><p>تعرض الفجر والشروق والظهر والعصر والمغرب والعشاء حسب الموقع وطريقة الحساب.</p><button class="primary-btn" data-go="#prayer">فتح المواقيت والإمساكية</button></article></div><div class="chapter-list">${ISLAMIC_EVENTS.map((x,i)=>`<div class="chapter-row"><span class="num">${i+1}</span><div><strong>${x.name}</strong><p class="muted">${x.d}/${x.m} هجريًا</p></div></div>`).join('')}</div>`);
  bindGo();
}

function renderNearestMosque(){
  screen('أقرب مسجد','بحث مباشر حسب موقعك مع احترام الخصوصية',`<div class="mosque-map"><div><div class="feature-icon" style="font-size:52px">🕌</div><h2>ابحث حول موقعك الحالي</h2><p>لا يُحفظ موقعك ولا يُرسل إلى التطبيق.</p><button class="primary-btn" id="findMosque">استخدام موقعي</button></div></div><div id="mosqueResults" class="list-stack" style="margin-top:14px"></div>`);
  $('#findMosque').onclick=()=>navigator.geolocation.getCurrentPosition(pos=>{const {latitude,longitude}=pos.coords;$('#mosqueResults').innerHTML=`<article class="card"><h3>المساجد القريبة</h3><p>افتح الخريطة لعرض المساجد مرتبة حسب موقعك الحالي.</p><a class="primary-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/mosque/@${latitude},${longitude},15z">فتح الخريطة والاتجاهات</a></article>`},()=>toast('اسمح بالوصول إلى الموقع لعرض المساجد القريبة'));
}

const PARENT_DUAS=[
  ['للأحياء والمتوفين','رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا','الإسراء: 24'],
  ['للمغفرة','رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ','إبراهيم: 41'],
  ['للوالدين والمؤمنين','رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ','نوح: 28']
];
function renderParents(){
  screen('الدعاء للوالدين','برٌّ ودعاء وعمل صالح في حياتهما وبعد وفاتهما',`<div class="toolbar"><input id="parentOne" placeholder="اسم الوالد (اختياري)"><input id="parentTwo" placeholder="اسم الوالدة (اختياري)"></div><div class="list-stack">${PARENT_DUAS.map(x=>`<article class="card text-card"><span class="grade">${x[0]}</span><div class="parent-dua">${x[1]}</div><div class="reference">${x[2]}</div><button class="soft-btn" data-copy-dua="${esc(x[1])}">نسخ الدعاء</button></article>`).join('')}</div><div class="section-intro"><h3>أفكار للصدقة الجارية</h3><div class="chapter-list">${['سقيا الماء','المساهمة في طباعة مصحف من جهة موثوقة','دعم طالب علم محتاج','المساهمة في علاج محتاج','غرس شجرة نافعة','نشر علم صحيح نافع'].map((x,i)=>`<div class="chapter-row"><span class="num">${i+1}</span><strong>${x}</strong></div>`).join('')}</div></div>`);
  $$('[data-copy-dua]').forEach(x=>x.onclick=()=>navigator.clipboard?.writeText(x.dataset.copyDua).then(()=>toast('تم نسخ الدعاء')));
}

function renderSeerahBook(){
  const chapters=['نسب النبي ﷺ ومولده','حفر زمزم وأخبار مكة','نشأة النبي وزواجه','بدء الوحي','الدعوة في مكة','الهجرة إلى الحبشة','الإسراء والمعراج','بيعة العقبة والهجرة','بناء المجتمع في المدينة','بدر وأحد والخندق','الحديبية وفتح مكة','حجة الوداع والوفاة'];
  screen('السيرة النبوية','قراءة موسعة على ترتيب سيرة ابن هشام',`<div class="source-note">هذه واجهة قراءة وفهرسة لسيرة ابن هشام. إدراج نص طبعة كاملة يتطلب تحديد طبعة محققة متاحة قانونيًا؛ لذلك لا ينسب التطبيق نصًا مختصرًا إلى الكتاب على أنه النص الكامل.</div><div class="chapter-list">${chapters.map((x,i)=>`<div class="chapter-row"><span class="num">${i+1}</span><div><strong>${x}</strong><p class="muted">باب من أبواب السيرة النبوية</p></div></div>`).join('')}</div>`);
}

renderSeerah=renderSeerahBook;

const oldRenderHadith=renderHadith;
renderHadith=function(){
  oldRenderHadith();
  const status=$('#hadithStatus');
  if(status)status.insertAdjacentHTML('afterend','<div class="source-note">البحث يقبل كلمة أو جملة مع تجاهل التشكيل. درجة الحديث تُعرض كما وردت في المصدر ولا يصدر التطبيق حكمًا آليًا.</div>');
  const list=$('#hadithList');
  if(list)new MutationObserver(()=>{$$('.hadith-card').forEach(card=>{if(card.querySelector('.hadith-explain'))return;const btn=document.createElement('button');btn.className='soft-btn hadith-explain';btn.textContent='شرح الحديث';btn.onclick=()=>showModal('شرح الحديث','<div class="notice">يُراجع شرح الحديث في كتب الشروح المعتمدة بحسب الكتاب، مثل فتح الباري وشرح النووي. لا يعرض التطبيق شرحًا مولدًا على أنه منسوب إلى العلماء.</div>');card.appendChild(btn)})}).observe(list,{childList:true});
};

const originalRoute=route;
route=async function(){
  const r=(location.hash||'#home').slice(1).split('/')[0];
  const custom={daily:renderDaily,'recite-ai':renderReciteAI,'quran-sciences':renderQuranSciences,tajweed:renderTajweed,'fiqh-life':renderFiqhLife,'islamic-calendar':renderIslamicCalendar,'nearest-mosque':renderNearestMosque,parents:renderParents};
  if(custom[r]){updateActiveNav();scrollTo({top:0});custom[r]();return}
  if(['tahajjud','fasting','fatwa','bookmarks','memorization'].includes(r)){go('#home');return}
  return originalRoute();
};

/* In-app five-minute prayer notice. A web browser cannot guarantee audio after
   it is fully closed; the UI states this honestly. */
let prayerAlertStamp='';
setInterval(async()=>{
  try{
    if(!store.get('prayerVoiceEnabled',false))return;
    const p=await loadPrayer(), names={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
    const now=new Date();
    for(const [key,name] of Object.entries(names)){
      const at=parseClock(p.timings[key],now),diff=Math.round((at-now)/60000),stamp=`${dateYMD(now)}:${key}`;
      if(diff===5&&prayerAlertStamp!==stamp){
        prayerAlertStamp=stamp;
        const msg=`اقترب موعد صلاة ${name}، تجهّز للصلاة، أثابك الله وغفر لك.`;
        if('speechSynthesis'in window)speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
        notify?.(`اقتربت صلاة ${name}`,msg);toast(msg);
      }
    }
  }catch{}
},30000);
