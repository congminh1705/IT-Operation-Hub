/* Visual review only. Preserve all domain handlers; never add app actions here. */
(() => {
 if(new URLSearchParams(location.search).get('capture')==='1')document.documentElement.setAttribute('data-documentation-capture','');
 let pending=false;
 function enhance(){
  pending=false;
  document.querySelectorAll('.pill,.badge,.status').forEach(el=>{
   const t=el.textContent.trim().toLocaleLowerCase('vi');
   const tone=/blocked|failed|bị chặn|thất bại|quá hạn|từ chối|lỗi/.test(t)?'blocked':/locked|disabled|khóa|khoá|vô hiệu|đã hủy|đã huỷ/.test(t)?'locked':/pending|waiting|chờ|chưa giao|chưa phân|tạm dừng/.test(t)?'waiting':/in progress|đang|thực hiện|xử lý/.test(t)?'active':/ready|done|completed|sẵn sàng|sẵn sáng|hoàn tất|hoàn thành|đã xong|đã giải quyết|đã đóng|đã duyệt|đã giao|đã xác minh/.test(t)?'success':el.classList.contains('red')?'blocked':el.classList.contains('amber')?'waiting':el.classList.contains('blue')?'active':el.classList.contains('green')?'success':'neutral';
   el.dataset.stateTone=tone;
  });
  if(document.querySelector('.access-page,#access-root')){
   document.body.classList.remove('taste-ui');return;
  }
  document.body.classList.add('taste-ui','capture');document.documentElement.setAttribute('data-motion','on');
  const heading=document.querySelector('main h1,#main h1');document.title=(heading?heading.textContent+' · ':'')+'ITOH / Mac / Teal final';
  document.querySelectorAll('.nav-label').forEach(el=>{const label=el.textContent.trim().toLocaleLowerCase('vi');const next=label.charAt(0).toLocaleUpperCase('vi')+label.slice(1);if(el.textContent!==next)el.textContent=next});
  document.querySelectorAll('.footer,.app-footer').forEach(el=>{for(const node of el.childNodes){if(node.nodeType!==3)continue;const next=node.textContent.replaceAll('Light Purple','Mac / Teal').replaceAll('v1.2','v1.3');if(next!==node.textContent)node.textContent=next}});
  document.querySelectorAll('.button').forEach(b=>b.classList.add('btn'));
  document.querySelectorAll('.topbar .avatar').forEach(el=>{
   if(el.dataset.defaultAvatar)return;
   el.setAttribute('aria-label','Tài khoản nhân viên');
   el.textContent='';el.dataset.defaultAvatar='true';
  });
  document.querySelectorAll('.who,.side-user').forEach(el=>{
   if(el.dataset.accountUnified)return;
   const name=el.querySelector('strong')?.textContent.trim()||'Tài khoản DEMO';
   const role=el.querySelector('p,small')?.textContent.trim()||'Nhân viên';
   const dashboard=location.pathname.includes('/dashboard/');
   const prefix=dashboard?'../':'';
   el.replaceChildren();el.classList.add('account-summary');el.dataset.accountUnified='true';
   const img=document.createElement('img');img.src=prefix+'assets/avatar-default.svg';img.alt='';img.width=36;img.height=36;
   const info=document.createElement('div');info.className='account-info';
   const title=document.createElement('strong');title.textContent=name;
   const subtitle=document.createElement('small');subtitle.textContent=role;info.append(title,subtitle);
   const link=document.createElement('a');link.href=prefix+'01-account.html#profile';link.className='account-profile';link.textContent='Hồ sơ';
   el.append(img,info,link);
  });
  document.querySelectorAll('a.list-card').forEach(b=>b.classList.add('card'));
  if(!document.querySelector('.taste-review-banner')&&!document.querySelector('.review-header')&&!document.documentElement.classList.contains('embedded')){
   const banner=document.createElement('div');banner.className='taste-review-banner';banner.innerHTML='<span>IT Operation Hub · Mac / Teal · Dữ liệu DEMO</span><a href="'+(location.pathname.includes('/dashboard/')?'../':'')+'index.html">Tất cả màn review ↗</a>';document.body.prepend(banner);
  }
 }
 new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(enhance)}}).observe(document.querySelector('#root')||document.body,{childList:true,subtree:true});
 addEventListener('hashchange',enhance);enhance();
})();
