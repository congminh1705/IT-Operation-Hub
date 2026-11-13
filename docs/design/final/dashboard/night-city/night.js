// Review only: diagram and queue share the role-scoped DEMO records.
(() => {
  const host = document.querySelector('.map-panel');
  if (!host) return;
  const groups = [
    { id:'devices', name:'Thiết bị', ids:[124,127,128,129,132], x:170,y:236,h:80,color:'#f0c85d',person:'Kỹ thuật DEMO 01',used:180,total:360,slot:'13:00–16:00',skill:'Laptop · Máy in · Bàn giao' },
    { id:'network', name:'Mạng', ids:[122,133], x:330,y:158,h:110,color:'#3fd8ff',person:'Kỹ thuật DEMO 02',used:240,total:360,slot:'14:00–16:00',skill:'Wi-Fi · LAN · Kết nối' },
    { id:'software', name:'Phần mềm', ids:[125,126,130], x:510,y:242,h:88,color:'#e997bf',person:'Kỹ thuật DEMO 03',used:180,total:240,slot:'15:00–16:00',skill:'Ứng dụng · VPN · Cài đặt' },
    { id:'accounts', name:'Tài khoản', ids:[123,131], x:340,y:324,h:60,color:'#b6df83',person:'Kỹ thuật DEMO 04',used:120,total:360,slot:'13:00–17:00',skill:'Tài khoản · Truy cập' },
  ];
  let selected=null, layer='requests';
  const groupRecords = g => scoped.filter(r=>g.ids.includes(Number(r.id.slice(-3))));
  const attentionCount = g => groupRecords(g).filter(r=>r.risk||r.overdue).length;
  const displayValue = g => layer==='people' ? `${g.total-g.used}′ trống` : layer==='sla' ? `${attentionCount(g)} cần chú ý` : `${groupRecords(g).length} yêu cầu`;
  const points = (x,y,w,d,z=0) => `${x},${y-z} ${x+w},${y-w/2-z} ${x+w+d},${y-w/2+d/2-z} ${x+d},${y+d/2-z}`;
  function building(g) {
    const {x,y,h,color}=g,w=65,d=65;
    const windows=Array.from({length:3},(_,r)=>Array.from({length:4},(_,c)=>`<path d="M${x+9+c*12} ${y-h+12+r*19-c*6}v8l6-3v-8Z" fill="var(--group-color)" opacity="${(r+c)%3?'.7':'.22'}"/>`).join('')).join('');
    return `<g class="city-building" data-city-group="${g.id}" role="button" tabindex="0" aria-label="Nhóm ${g.name}, ${groupRecords(g).length} yêu cầu. Chọn để lọc hàng đợi" aria-pressed="false" style="--group-color:${color}">
      <polygon class="building-pad" points="${points(x-16,y+8,82,82)}"/>
      <polygon class="building-left" points="${x},${y-h} ${x+w},${y-w/2-h} ${x+w},${y-w/2} ${x},${y}"/>
      <polygon class="building-right" points="${x+w},${y-w/2-h} ${x+w+d},${y-w/2+d/2-h} ${x+w+d},${y-w/2+d/2} ${x+w},${y-w/2}"/>
      <polygon class="building-roof" points="${points(x,y,w,d,h)}"/><polygon class="roof-inset" points="${points(x+14,y-2,38,38,h+2)}"/>
      ${windows}<path d="M${x+w+d-18} ${y-20}v-20l-10-5v20Z" fill="${color}" opacity=".55"/>
      <circle cx="${x+65}" cy="${y+27}" r="5" fill="${color}"/><rect class="building-label" x="${x-12}" y="${y+38}" width="154" height="43" rx="5"/>
      <text x="${x+65}" y="${y+55}" text-anchor="middle" class="city-name">${g.name}</text><text x="${x+65}" y="${y+71}" text-anchor="middle" class="city-value" data-city-value="${g.id}">${displayValue(g)}</text></g>`;
  }
  host.parentElement.querySelector('h2').textContent='Không gian điều phối';
  host.outerHTML=`<div class="dispatch-panel"><div class="dispatch-toolbar"><span>IT OPERATIONS / LIVE DEMO</span><button class="dispatch-reset" disabled>Bỏ lọc nhóm</button></div>
    <div class="dispatch-layers" role="group" aria-label="Lớp quan sát">${[['requests','Yêu cầu'],['people','Nhân lực'],['sla','SLA']].map(([id,label])=>`<button data-city-layer="${id}" aria-pressed="${id===layer}">${label}</button>`).join('')}</div>
    <div class="city-viewport"><svg class="city-svg" viewBox="70 0 660 445" aria-label="Sơ đồ isometric bốn nhóm IT, dùng Tab để chọn nhóm">
      <defs><pattern id="city-grid" width="46" height="23" patternUnits="userSpaceOnUse"><path d="M0 11.5 23 0 46 11.5 23 23Z" fill="none" stroke="#9fb8d5" stroke-opacity=".08"/></pattern><filter id="route-light" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <path d="M82 230 392 68 722 239 411 412Z" fill="#142134" stroke="#304660"/><path d="M82 230 392 68 722 239 411 412Z" fill="url(#city-grid)"/>
      <g class="city-routes"><path d="M235 263 400 235 395 185M400 235 575 269M400 235 405 351" class="route-glow"/><path d="M235 263 400 235 395 185M400 235 575 269M400 235 405 351" class="route-core"/></g>
      ${building(groups[1])}${building(groups[0])}${building(groups[2])}${building(groups[3])}<g pointer-events="none"><circle cx="400" cy="235" r="13" fill="#0f1626" stroke="#3fd8ff"/><circle cx="400" cy="235" r="5" fill="#3fd8ff"/></g>
    </svg></div><div class="city-group-switch" role="group" aria-label="Chọn nhóm IT">${groups.map(g=>`<button data-city-select="${g.id}" aria-pressed="false">${g.name}</button>`).join('')}</div><div class="dispatch-summary" role="status" aria-live="polite"></div><div class="dispatch-inspector"></div></div>`;
  const panel=document.querySelector('.dispatch-panel');
  document.querySelector('#queue').insertAdjacentHTML('afterbegin','<p class="dispatch-queue-scope" role="status" aria-live="polite"></p>');
  function showPerson(g) {
    openDetail(g.person,`<p>Nhóm ${g.name} · Hồ sơ nhân lực DEMO</p><dl><dt>Phạm vi hỗ trợ</dt><dd>${g.skill}</dd><dt>Đã phân bổ</dt><dd>${g.used} / ${g.total} phút</dd><dt>Còn khả dụng</dt><dd>${g.total-g.used} phút</dd><dt>Khung giờ trống</dt><dd>${g.slot}</dd></dl><p>Khả dụng không đồng nghĩa đủ điều kiện nhận mọi việc. Preview không phân công hoặc cập nhật lịch.</p>`);
  }
  function renderInspector() {
    const active=groups.find(g=>g.id===selected),list=active?[active]:groups,rows=list.flatMap(groupRecords);
    panel.querySelector('.dispatch-summary').textContent=`${active?'Nhóm '+active.name:'Tất cả nhóm IT'} · ${rows.length} yêu cầu mở · ${rows.filter(r=>r.risk).length} nguy cơ trễ · ${rows.filter(r=>r.overdue).length} quá hạn`;
    const inspector=panel.querySelector('.dispatch-inspector');
    if(!active) {
      inspector.innerHTML='<p class="dispatch-empty">Chọn một tòa nhà hoặc nhóm IT để xem yêu cầu, nhân lực và SLA.</p>';
    } else if(layer==='people') {
      inspector.innerHTML=`<div class="inspector-heading"><strong>Nhân lực trong ngày</strong><span>Lịch DEMO · 12/11/2026</span></div>${list.map(g=>`<button class="dispatch-person" data-city-person="${g.id}"><span class="avatar">${g.person.slice(-2)}</span><span><strong>${g.person}</strong><small>Nhóm ${g.name} · ${g.skill}</small></span><span>${g.total-g.used}′ trống ↗</span></button>`).join('')}`;
    } else {
      const visible=layer==='sla'?rows.filter(r=>r.risk||r.overdue):rows;
      inspector.innerHTML=`<div class="inspector-heading"><strong>${layer==='sla'?'Yêu cầu cần chú ý SLA':'Yêu cầu trong nhóm'}</strong><span>${visible.length} yêu cầu</span></div>${visible.slice(0,3).map(r=>`<button class="dispatch-ticket" data-action="ticket:${r.id}"><span><small>${r.id}</small><strong>${escape(r.title)}</strong></span><span class="dispatch-ticket-status">${layer==='sla'?(r.overdue?'Quá hạn':'Nguy cơ trễ'):escape(r.status)} ↗</span></button>`).join('')||'<p class="dispatch-empty">Không có yêu cầu cần chú ý SLA trong nhóm này.</p>'}<button class="dispatch-show-queue">Đến hàng đợi đang lọc ↓</button>`;
    }
  }
  function refresh() {
    window.dashboardQueuePredicate=r=>(!selected||groups.find(g=>g.id===selected).ids.includes(Number(r.id.slice(-3))))&&(layer!=='sla'||r.risk||r.overdue);
    panel.querySelectorAll('[data-city-group],[data-city-select]').forEach(el=>el.setAttribute('aria-pressed',String((el.dataset.cityGroup||el.dataset.citySelect)===selected)));
    panel.querySelectorAll('[data-city-layer]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.cityLayer===layer)));
    groups.forEach(g=>{
      panel.querySelector(`[data-city-value="${g.id}"]`).textContent=displayValue(g);
      const tone=layer==='sla'?(groupRecords(g).some(r=>r.overdue)?'#ff8eae':attentionCount(g)?'#f0c85d':'#b6df83'):layer==='people'?'#3fd8ff':g.color;
      panel.querySelector(`[data-city-group="${g.id}"]`).style.setProperty('--group-color',tone);
    });
    panel.querySelector('.dispatch-reset').disabled=!selected;
    document.querySelector('.dispatch-queue-scope').textContent=`${selected?'Nhóm '+groups.find(g=>g.id===selected).name:'Tất cả nhóm IT'}${layer==='sla'?' · Chỉ nguy cơ trễ / quá hạn':''} · Kết hợp bộ lọc trạng thái và tìm kiếm`;
    renderRows(); renderInspector();
  }
  panel.addEventListener('click',e=>{
    const group=e.target.closest('[data-city-group],[data-city-select]'); if(group){selected=group.dataset.cityGroup||group.dataset.citySelect;refresh();}
    const toggle=e.target.closest('[data-city-layer]');if(toggle){layer=toggle.dataset.cityLayer;refresh();}
    if(e.target.closest('.dispatch-reset')){selected=null;refresh();}
    const person=e.target.closest('[data-city-person]');if(person)showPerson(groups.find(g=>g.id===person.dataset.cityPerson));
    if(e.target.closest('.dispatch-show-queue'))action('queue');
  });
  panel.addEventListener('keydown',e=>{const group=e.target.closest('[data-city-group]');if(group&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=group.dataset.cityGroup;refresh();}});
  const initial=new URLSearchParams(location.search);
  if(groups.some(g=>g.id===initial.get('group')))selected=initial.get('group');
  if(['requests','people','sla'].includes(initial.get('layer')))layer=initial.get('layer');
  refresh();
  window.nightDispatch={selectGroup:id=>{if(id!==null&&!groups.some(g=>g.id===id))return;selected=id;refresh();},selectLayer:id=>{if(!['requests','people','sla'].includes(id))return;layer=id;refresh();},snapshot:()=>({selected,layer,count:scoped.filter(window.dashboardQueuePredicate).length})};
})();
document.title='IT Operations Hub — Điều phối IT tương tác / DEMO';
