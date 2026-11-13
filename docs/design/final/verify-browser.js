/* Opt-in smoke checks for documentation prototypes. Open ?qa=1; results in #qa-results. */
if(new URLSearchParams(location.search).has('qa'))setTimeout(()=>{
 const checks=[];const check=(name,pass,detail='')=>checks.push({name,pass:!!pass,detail});
 const sourceGroup=document.body.dataset.group;
 if(sourceGroup){
  const g=reviewAPI.groups.find(x=>x.id===sourceGroup);
  for(const s of g.screens){
   location.hash=s[0];
   // Hash events are async; explicit event makes each view immediately inspectable.
   window.dispatchEvent(new Event('hashchange'));
   check(s[0]+': main',!!document.querySelector('main'));
   check(s[0]+': title',document.title.includes(s[1]));
   const bad=[...document.querySelectorAll('use')].filter(u=>!document.querySelector(u.getAttribute('href')));
   check(s[0]+': icons',bad.length===0);
   check(s[0]+': document width',document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,
    JSON.stringify({viewport:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   const search=document.querySelector('[data-search]');if(search){search.value='NO_MATCH_987';search.dispatchEvent(new Event('input',{bubbles:true}));check(s[0]+': search',![...document.querySelectorAll('[data-row]')].some(r=>!r.hidden));check(s[0]+': search visually hides rows',[...document.querySelectorAll('[data-row]')].every(r=>getComputedStyle(r).display==='none'));search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
   const opener=document.querySelector('[data-action="feedback"]');opener.focus();opener.click();check(s[0]+': dialog',document.getElementById('detail-dialog').open);document.getElementById('dialog-close').click();check(s[0]+': focus return',document.activeElement===opener);
   if(s[0]==='security'){
    const form=document.querySelector('[data-form=password]');form.querySelector('#old-password').value='demo-old';form.querySelector('#new-password').value='demo-new';form.querySelector('#confirm-password').value='different';form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));check('password mismatch: inline summary',!!document.querySelector('.error-summary'));
   }
   if(s[0]==='profile')check('profile: email read only',document.getElementById('profile-email').readOnly);
   if(s[0]==='ticket-it'){
    document.querySelector('[data-tab=internal]').click();check('internal note: explicit audience',document.querySelector('[name=audience]').value==='internal');
    check('technician: no colleague assignment',![...document.querySelectorAll('main a')].some(a=>a.textContent.includes('Đổi người phụ trách')));
   }
   if(s[0]==='user-create'){
    const f=document.querySelector('[data-form=user-create]');f.querySelector('#initial-password').value='DEMO_SECRET_SHOULD_NOT_APPEAR';f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));check('user create: secret excluded from preview',!document.getElementById('dialog-body').textContent.includes('DEMO_SECRET_SHOULD_NOT_APPEAR'));document.getElementById('dialog-close').click();
   }
   if(s[0]==='progress'){
    const f=document.querySelector('[data-form=task-progress]');f.querySelector('#task-status').value='Done';f.querySelector('#remaining').value='60';f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));check('task Done: nonzero remaining rejected',document.getElementById('dialog-title').textContent.includes('Chưa đủ'));document.getElementById('dialog-close').click();
   }
  }
 }else{check('catalog: eight groups',document.querySelectorAll('.group-card').length===8);}
 const result={requestedGroup:sourceGroup||'catalog',viewport:{width:innerWidth,height:innerHeight},checks};
 const el=document.createElement('pre');el.id='qa-results';el.textContent=JSON.stringify(result);document.body.append(el);
},150);
