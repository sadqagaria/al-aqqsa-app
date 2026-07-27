'use strict';

store.del('prayerVoiceEnabled');

function cairoNow(){
  return new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Cairo'}));
}

function egyptGregorian(date=new Date()){
  return new Intl.DateTimeFormat('ar-EG',{
    timeZone:'Africa/Cairo',weekday:'long',day:'numeric',month:'long',year:'numeric'
  }).format(date);
}

function egyptHijriFallback(date=new Date()){
  return new Intl.DateTimeFormat('ar-EG-u-ca-islamic',{
    timeZone:'Africa/Cairo',day:'numeric',month:'long',year:'numeric'
  }).format(date).replace('هـ','').trim()+' هـ';
}

dateRibbon=function(){
  const now=new Date(),event=nextIslamicEvent();
  return `<section class="date-ribbon premium-date-ribbon" aria-label="الوقت والتاريخ في مصر">
    <div class="time-card"><span class="date-icon">◷</span><strong>الساعة الآن — القاهرة</strong><b id="egyptClock">${now.toLocaleTimeString('ar-EG',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',second:'2-digit'})}</b></div>
    <div><span class="date-icon">▦</span><strong>التاريخ الميلادي</strong><b id="egyptGregorian">${egyptGregorian(now)}</b></div>
    <div><span class="date-icon">☾</span><strong>التاريخ الهجري — مصر</strong><b id="egyptHijri">${egyptHijriFallback(now)}</b></div>
    <div><span class="date-icon">✦</span><strong>المناسبة القادمة</strong><b>${event?`${esc(event.name)} — بعد ${event.days.toLocaleString('ar-EG')} يوم`:'تُحدّث حسب التقويم المصري'}</b></div>
  </section>`;
};

async function updateEgyptDates(){
  const clock=$('#egyptClock');
  if(clock)clock.textContent=new Date().toLocaleTimeString('ar-EG',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const greg=$('#egyptGregorian');if(greg)greg.textContent=egyptGregorian(new Date());
  try{
    const data=await fetchJSON(`${API.prayer}/timingsByCity?city=Cairo&country=Egypt&method=5`);
    const h=data?.date?.hijri;
    if(h&&$('#egyptHijri'))$('#egyptHijri').textContent=`${h.day} ${h.month?.ar||''} ${h.year} هـ`;
  }catch{}
}

const PREMIUM_RENDER_HOME=renderHome;
renderHome=async function(){
  await PREMIUM_RENDER_HOME();
  updateEgyptDates();
};
setInterval(updateEgyptDates,1000);

const PREMIUM_RENDER_CALENDAR=renderIslamicCalendar;
renderIslamicCalendar=function(){
  PREMIUM_RENDER_CALENDAR();
  const title=$('.screen-title p');
  if(title)title.textContent='تقويم وإمساكية بتوقيت القاهرة وطريقة الحساب المعتمدة لمصر';
};

/* The header search controls stay hidden for compatibility; every visible
   search box is local to its own section. */
