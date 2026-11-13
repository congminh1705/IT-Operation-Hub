const reviewParams = new URLSearchParams(location.search);
{ // The selected format is now the sole dashboard appearance.
  document.documentElement.classList.add('violet');
  const fonts = document.createElement('link'); fonts.rel = 'stylesheet';
  fonts.href = 'prompt-dashboard/public/assets/fonts.css'; document.head.append(fonts);
}
if (reviewParams.has('embedded')) document.documentElement.classList.add('embedded');
/* Proposed dashboard design only. All records are synthetic; no API or auth calls. */
const role = document.body.dataset.role || 'manager';
const config = {
  manager: { name: 'IT Manager', initials: 'QL', heading: 'Nhịp vận hành hôm nay', description: 'Ưu tiên đúng việc. Giữ công việc đi đúng hướng.', primary: 'Xem hàng đợi', icon: 'inbox' },
  requester: { name: 'Requester', initials: 'NV', heading: 'Không gian của bạn', description: 'Theo dõi yêu cầu và những việc cần bạn phản hồi.', primary: 'Tạo yêu cầu', icon: 'plus' },
  technician: { name: 'Technician', initials: 'KT', heading: 'Công việc trong ca', description: 'Tập trung vào việc đang xử lý và các bước tiếp theo.', primary: 'Xem việc của tôi', icon: 'toolbox' },
  admin: { name: 'Admin', initials: 'QT', heading: 'Tổng quan quản trị', description: 'Quản lý truy cập, cấu hình và phạm vi vận hành.', primary: 'Quản lý người dùng', icon: 'users' },
}[role];
const I = name => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pill = (label, tone = '') => `<span class="pill ${tone}"><i></i>${label}</span>`;
const btn = (text, action, secondary = false) => `<button class="button ${secondary ? 'secondary' : ''}" data-action="${action}">${text}${I('arrow-right')}</button>`;
const link = (text, action) => `<button class="text-button" data-action="${action}">${text}${I('arrow-right')}</button>`;
const avatar = (text, name) => `<span class="person-stack"><span class="avatar">${text}</span>${name}</span>`;
const title = (text, side = '', sub = '') => `<div class="section-head"><div><h2>${text}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${side}</div>`;
const personal = role === 'requester';
const leader = role === 'manager' || role === 'admin';
const records = [
  { id: 'TKT-000122', title: 'Wi-Fi tầng 3 kết nối chập chờn', status: 'Đang xử lý', tone: 'blue', priority: 'P2', owner: 'Nhóm Mạng', mine: false, risk: true, unassigned: false, overdue: false },
  { id: 'TKT-000123', title: 'Cấp tài khoản cho nhân sự mới', status: 'Mới tiếp nhận', tone: '', priority: 'P3', owner: 'Chưa phân công', mine: false, risk: false, unassigned: true, overdue: false },
  { id: 'TKT-000124', title: 'Chuẩn bị thiết bị cho nhân sự mới', status: 'Đã tiếp nhận', tone: 'amber', priority: 'P2', owner: 'Nhóm Thiết bị', mine: false, risk: true, unassigned: false, overdue: false },
  { id: 'TKT-000125', title: 'Không mở được phần mềm kế toán', status: 'Chờ bổ sung', tone: 'amber', priority: 'P3', owner: 'Nhóm Phần mềm', mine: true, risk: false, unassigned: false, overdue: false },
  { id: 'TKT-000126', title: 'Cài đặt VPN cho laptop làm việc', status: 'Đang xử lý', tone: 'blue', priority: 'P2', owner: 'Nhóm Phần mềm', mine: true, risk: false, unassigned: false, overdue: false },
  { id: 'TKT-000127', title: 'Kiểm tra màn hình làm việc', status: 'Mới tiếp nhận', tone: '', priority: 'P3', owner: 'Chưa phân công', mine: true, risk: false, unassigned: true, overdue: false },
  { id: 'TKT-000128', title: 'Cài lại driver máy in phòng Kế toán', status: 'Đã tiếp nhận', tone: '', priority: 'P3', owner: 'Nhóm Thiết bị', mine: true, risk: false, unassigned: false, overdue: false },
  { id: 'TKT-000129', title: 'Bổ sung phụ kiện bàn làm việc', status: 'Mới tiếp nhận', tone: '', priority: 'P4', owner: 'Chưa phân công', mine: false, risk: false, unassigned: true, overdue: false },
  { id: 'TKT-000130', title: 'Xử lý lỗi đăng nhập ứng dụng nội bộ', status: 'Đang xử lý', tone: 'rose', priority: 'P2', owner: 'Nhóm Phần mềm', mine: false, risk: false, unassigned: false, overdue: true },
  { id: 'TKT-000131', title: 'Cấp tài khoản cho nhân sự thử việc', status: 'Đã tiếp nhận', tone: '', priority: 'P3', owner: 'Nhóm Tài khoản', mine: false, risk: false, unassigned: false, overdue: false },
  { id: 'TKT-000132', title: 'Kiểm tra laptop trước bàn giao', status: 'Chờ bổ sung', tone: 'amber', priority: 'P3', owner: 'Nhóm Thiết bị', mine: false, risk: false, unassigned: false, overdue: false },
  { id: 'TKT-000133', title: 'Kiểm tra cổng mạng phòng họp', status: 'Đã tiếp nhận', tone: '', priority: 'P3', owner: 'Nhóm Mạng', mine: false, risk: false, unassigned: false, overdue: false },
];
const scoped = personal ? records.filter(r => r.mine) : role === 'technician' ? records.filter(r => ['000122', '000125', '000126', '000127', '000128'].some(id => r.id.endsWith(id))) : records;
let filter = 'all', search = '', area = 'devices';
const nav = [ ['dashboard', 'Tổng quan', 'overview'], ['ticket', 'Yêu cầu của tôi', 'mine'],
  ...(!personal ? [['toolbox', 'Công việc IT', 'work']] : []),
  ...(leader ? [['users', 'Nhân sự & lịch', 'workforce']] : []),
  ['ai', 'AI Workspace', 'assistant'], ['folder', 'Kho kiến thức', 'knowledge'], ['laptop', personal ? 'Thiết bị của tôi' : 'Tài sản & thiết bị', 'assets'] ];
const renderNav = items => items.map(([icon, label, action]) => `<button class="nav-item ${action === 'overview' ? 'active' : ''}" ${action === 'overview' ? 'aria-current="page"' : ''} data-action="${action}">${I(icon)}<span>${label}</span>${action === 'work' ? '<span class="nav-count">IT</span>' : ''}</button>`).join('');
document.querySelector('#sidebar').innerHTML = `<a href="${personal ? 'requester' : role === 'manager' ? 'index' : role}.html" class="brand" aria-label="IT Operations Hub"><span class="brand-mark"></span><div><strong>IT Operations</strong><small>Hub / Không gian nội bộ</small></div></a><div class="organization">${I('building')}<div><strong>IT Operations Hub</strong><span>Tổ chức DEMO</span></div></div><p class="nav-label">Không gian làm việc</p><nav class="nav-list">${renderNav(nav)}</nav><p class="nav-label">Theo dõi</p><nav class="nav-list">${renderNav([...(leader ? [['chart', 'Báo cáo vận hành', 'reports']] : []), ['bell', 'Thông báo', 'notifications'], ...(leader ? [['history', 'Nhật ký hoạt động', 'audit']] : [])])}</nav>${role === 'admin' ? `<p class="nav-label">Quản trị</p><nav class="nav-list">${renderNav([['users', 'Người dùng', 'users'], ['settings', 'Cấu hình hệ thống', 'settings']])}</nav>` : ''}<div class="sidebar-bottom"><button class="help-link" data-action="knowledge">${I('help')}Tìm hướng dẫn</button><div class="side-user"><span class="avatar">${config.initials}</span><div><strong>Tài khoản DEMO</strong><small>${config.name}</small></div></div></div>`;
document.querySelector('#sidebar').insertAdjacentHTML('afterbegin', '<button class="icon-btn nav-close" aria-label="\u0110\u00f3ng \u0111i\u1ec1u h\u01b0\u1edbng" data-close-nav>&times;</button>');
function closeNav() {
  const wasOpen = document.querySelector('#sidebar').classList.contains('open');
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('.workspace').inert = false;
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  if (wasOpen) document.querySelector('.menu-toggle').focus();
}
document.querySelector('#top-avatar').textContent = config.initials;
document.querySelectorAll('.review-bar a').forEach(a => { if (a.getAttribute('href') === (role === 'manager' ? 'index.html' : role + '.html')) a.setAttribute('aria-current', 'page'); });

function metrics() {
  const defs = personal ? [
    ['Yêu cầu chưa hoàn tất', 4, 'Theo yêu cầu của bạn', 'ticket', 'all', 'amber'],
    ['Cần bạn bổ sung', 1, 'Phản hồi để IT tiếp tục', 'mail', 'waiting', 'orange'],
    ['Đang được xử lý', 1, 'Có người phụ trách', 'clock', 'progress', 'blue'],
    ['Đang chờ tiếp nhận', 1, 'Yêu cầu mới đã gửi', 'inbox', 'unassigned', 'rose'],
  ] : [
    ['Yêu cầu chưa hoàn tất', scoped.length, 'Tất cả ngày tạo · MET01', 'ticket', 'all', 'amber'],
    ['Chưa có người phụ trách', scoped.filter(r => r.unassigned).length, 'Trong phạm vi hiện tại · MET02', 'users', 'unassigned', 'orange'],
    ['SLA có nguy cơ trễ', scoped.filter(r => r.risk).length, 'Không gồm yêu cầu đã quá hạn', 'clock', 'risk', 'blue'],
    ['SLA đã quá hạn', scoped.filter(r => r.overdue).length, 'Cần ưu tiên can thiệp · MET04', 'alert', 'overdue', 'rose'],
  ];
  return `<div class="metrics" aria-label="Chỉ số DEMO — bấm để lọc hàng đợi">${defs.map(([label, value, note, icon, key, tone]) => `<button class="metric ${tone}" data-filter="${key}" aria-pressed="false"><span class="metric-head">${label}${I(icon)}</span><span class="metric-value" style="display:block">${value}</span><span class="metric-foot">${note}${I('arrow-right')}</span></button>`).join('')}</div>`;
}
function mapStage() {
  return `${title(role === 'admin' ? 'Phạm vi vận hành' : 'Bản đồ xử lý', pill('Dữ liệu DEMO'), 'Công việc đang mở theo nhóm hỗ trợ')}<div class="map-panel"><div class="map-top"><div><span class="eyebrow">Không gian IT / 01</span><strong>Nhóm hỗ trợ nội bộ</strong></div><div class="map-legend"><span><i></i>Trong hạn</span><span><i class="warning"></i>Cần chú ý</span></div></div><svg class="map-svg" viewBox="0 0 640 310" role="img" aria-label="Sơ đồ nhóm hỗ trợ, chọn nhóm bằng các nút phía dưới"><defs><pattern id="desk" x="0" y="0" width="28" height="25" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="14" height="9" rx="1" fill="#a6ba9a"/><path d="M10 17h5" stroke="#8ba57d" stroke-width="2"/></pattern></defs><path class="floor-shadow" d="M75 155 318 26 574 157 328 291Z"/><path class="floor" d="M75 140 318 11 574 142 328 276Z"/><path class="floor" d="M75 140v15l253 136v-15Z"/><path class="floor" d="m328 276 246-134v15L328 291Z"/><g data-room="devices"><path class="room" d="m105 141 107-57 106 55-107 59Z"/><path d="m121 140 89-44 89 44-89 45Z" fill="url(#desk)" opacity=".7"/><text class="room-label" x="180" y="151">Thiết bị</text></g><g data-room="network"><path class="room" d="m231 74 86-46 105 54-87 47Z"/><path d="m242 73 74-34 83 42-72 38Z" fill="url(#desk)" opacity=".7"/><text class="room-label" x="302" y="85">Mạng</text></g><g data-room="software"><path class="room" d="m348 139 90-48 102 53-90 49Z"/><path d="m365 138 72-36 83 41-72 38Z" fill="url(#desk)" opacity=".7"/><text class="room-label" x="399" y="151">Phần mềm</text></g><g data-room="accounts"><path class="room" d="m231 206 101-55 101 53-102 55Z"/><path d="m249 204 82-42 82 42-82 42Z" fill="url(#desk)" opacity=".7"/><text class="room-label" x="294" y="217">Tài khoản</text></g><path class="network" d="M211 155 332 138 442 151M332 138 325 76M332 138 331 218"/><circle class="room-node" cx="211" cy="169" r="5"/><circle class="room-node" cx="448" cy="167" r="5"/><g fill="#567952"><circle cx="326" cy="99" r="3"/><circle cx="330" cy="231" r="3"/></g></svg><div class="area-status"><span id="area-label">Nhóm Thiết bị</span><strong id="area-count">05</strong><span>yêu cầu đang mở</span></div><div class="map-areas" aria-label="Chọn nhóm hỗ trợ">${[['devices', 'Thiết bị'], ['network', 'Mạng'], ['software', 'Phần mềm'], ['accounts', 'Tài khoản']].map(([key, label]) => `<button data-area="${key}" aria-pressed="${key === area}">${label}</button>`).join('')}</div></div>`;
}
function journey() {
  return `${title('Yêu cầu đang theo dõi', pill('Đang xử lý', 'blue'))}<div class="journey-panel"><div class="journey-copy"><span class="code">TKT-000126 / Phần mềm</span><h3>Cài đặt VPN cho laptop làm việc</h3><p>IT đang kiểm tra kết nối. Bạn có thể xem tiến độ và gửi thêm thông tin.</p>${link('Xem yêu cầu', 'ticket:TKT-000126')}<div class="journey-steps" aria-label="Tiến độ: Đã gửi, tiếp nhận, đang xử lý; chưa hoàn tất">${['Đã gửi', 'Tiếp nhận', 'Đang xử lý', 'Hoàn tất'].map((s, i) => `<div class="journey-step ${i < 2 ? 'done' : i === 2 ? 'current' : ''}"><i></i>${s}</div>`).join('')}</div></div><div class="device-scene" aria-hidden="true"><span class="orbit"></span><span class="device-visual">${I('lock')}</span><span class="device-check">${I('check')}</span></div></div>`;
}
function shift() {
  return `${title('Thứ tự xử lý', pill('Ca DEMO'), 'Ưu tiên việc đang làm trước khi nhận thêm')}<div class="shift-panel"><div class="shift-title"><span>Danh sách thực hiện</span><span>Còn lại</span></div>${[
    ['01', 'Cài đặt và kiểm tra kết nối VPN', 'T07 · TKT-000126 · Đang xử lý', '60 phút'],
    ['02', 'Kiểm tra laptop trong kho', 'T02 · TKT-000124 · Đang xử lý', '60 phút'],
    ['03', 'Kiểm tra màn hình phòng Kế toán', 'T09 · TKT-000127 · Sẵn sàng', '60 phút'],
  ].map(([n, name, meta, time], i) => `<div class="shift-row ${i === 0 ? 'active' : ''}"><span class="shift-num">${n}</span><div class="shift-body"><h3>${name}</h3><p>${meta}</p></div><span class="time">${time}</span><button class="icon-btn" data-action="${i === 0 ? 'ticket:TKT-000126' : 'work'}" aria-label="Xem ${name}">${I('arrow-right')}</button></div>`).join('')}</div>`;
}
function attention() {
  const name = personal ? 'Cần bạn phản hồi' : role === 'technician' ? 'Trước khi tiếp tục' : role === 'admin' ? 'Truy cập & cấu hình' : 'Cần bạn quyết định';
  if (personal) return `<aside class="decision-rail">${title(name, '<span class="eyebrow">01 yêu cầu</span>')}<div class="attention-note">${I('mail')}IT cần thêm thông tin từ bạn</div><article class="decision-item"><div class="decision-meta"><span class="code">TKT-000125</span>${pill('Chờ bổ sung', 'amber')}</div><h3>Không mở được phần mềm kế toán</h3><p>Vui lòng gửi ảnh lỗi để IT kiểm tra bước tiếp theo.</p><div class="decision-action"><span class="eyebrow">Phản hồi công khai</span>${link('Xem nội dung', 'ticket:TKT-000125')}</div></article><article class="decision-item"><div class="decision-meta">Kho kiến thức</div><h3>Thiết lập VPN trên laptop</h3><p>Tìm hướng dẫn phù hợp với thiết bị của bạn.</p>${link('Mở hướng dẫn', 'knowledge')}</article></aside>`;
  if (role === 'technician') return `<aside class="decision-rail">${title(name, '<span class="eyebrow">Ca hiện tại</span>')}<div class="attention-note">${I('clock')}Còn 180 phút khả dụng trong lịch DEMO</div><article class="decision-item"><div class="decision-meta"><span class="code">TKT-000122</span>${pill('Nguy cơ trễ', 'amber')}</div><h3>Wi-Fi tầng 3 chập chờn</h3><p>Kiểm tra thông tin SLA trước khi cập nhật trạng thái.</p><div class="decision-action">${avatar('KT', 'Nhóm Mạng')}${link('Xem yêu cầu', 'ticket:TKT-000122')}</div></article><article class="decision-item"><div class="decision-meta">Trợ lý công việc</div><h3>Chuẩn bị phản hồi cho người gửi</h3><p>Tóm tắt ngữ cảnh từ những yêu cầu bạn được xem.</p>${link('Mở AI Workspace', 'assistant')}</article></aside>`;
  if (role === 'admin') return `<aside class="decision-rail">${title(name, '<span class="eyebrow">Phạm vi Admin</span>')}<div class="attention-note">${I('lock')}Quyền truy cập cần được xác nhận</div><article class="decision-item"><div class="decision-meta">Danh tính & quyền</div><h3>Người dùng và nhóm hỗ trợ</h3><p>Tạo tài khoản, kiểm tra vai trò và trạng thái hoạt động.</p><div class="decision-action">${pill('Admin')}${link('Xem người dùng', 'users')}</div></article><article class="decision-item"><div class="decision-meta">Cấu hình vận hành</div><h3>Chính sách SLA và danh mục</h3><p>Thay đổi mới áp dụng theo phạm vi đã được quy định.</p>${link('Xem cấu hình', 'settings')}</article></aside>`;
  return `<aside class="decision-rail">${title(name, '<span class="eyebrow">01 đề xuất</span>')}<div class="attention-note">${I('alert')}Lịch vắng ảnh hưởng một công việc đang khóa</div><article class="decision-item"><div class="decision-meta"><span class="code">T03 · TKT-000124</span>${pill('Đang khóa', 'amber')}</div><h3>Cài đặt phần mềm cho nhân sự mới</h3><p>Đề xuất thay người thực hiện. Chưa phân công lại.</p><div class="decision-action">${avatar('KT', 'Kỹ thuật DEMO 01')}${link('Xem tác động', 'proposal')}</div></article><article class="decision-item"><div class="decision-meta"><span class="code">TKT-000130</span>${pill('Quá hạn', 'rose')}</div><h3>Lỗi đăng nhập ứng dụng nội bộ</h3><p>Kiểm tra trạng thái xử lý và hỗ trợ nhóm phụ trách.</p>${link('Xem yêu cầu', 'ticket:TKT-000130')}</article></aside>`;
}
function queue() {
  return `<section class="queue" id="queue">${title(personal ? 'Yêu cầu của bạn' : role === 'technician' ? 'Yêu cầu trong phạm vi' : 'Hàng đợi cần theo dõi', `<span class="eyebrow" id="queue-count">${scoped.length} yêu cầu mở</span>`)}<div class="queue-box"><div class="queue-tools"><div class="filters" aria-label="Lọc yêu cầu"><button class="filter" data-filter="all" aria-pressed="true">Tất cả</button><button class="filter" data-filter="progress" aria-pressed="false">Đang xử lý</button><button class="filter" data-filter="waiting" aria-pressed="false">Chờ bổ sung</button></div><label class="search">${I('search')}<span class="search-label">T\u00ecm y\u00eau c\u1ea7u</span><input id="search" type="search" placeholder="Tìm mã, tên yêu cầu…"></label></div><table class="ticket-table"><thead><tr><th scope="col">Yêu cầu</th><th scope="col">Trạng thái</th><th scope="col">Ưu tiên</th><th class="table-owner" scope="col">Phụ trách</th></tr></thead><tbody id="ticket-rows"></tbody></table><div class="table-footer"><span id="row-count"></span>${link('Xem danh sách', 'all-tickets')}</div></div></section>`;
}
function supplemental() {
  if (personal) return `<section class="capacity">${title('Thiết bị của bạn', '<span class="eyebrow">02 thiết bị</span>')}<div class="asset-row"><span class="asset-icon">${I('laptop')}</span><div><strong>Dell Latitude 5440</strong><small>LT-001 · Đang sử dụng</small></div>${link('Xem', 'assets')}</div><div class="asset-row"><span class="asset-icon">${I('laptop')}</span><div><strong>Dell P2425H</strong><small>MN-003 · Màn hình 24 inch</small></div>${link('Xem', 'assets')}</div><p class="capacity-footnote">Chỉ hiển thị thiết bị đang được cấp cho tài khoản DEMO này.</p></section>`;
  if (role === 'technician') return `<section class="capacity">${title('Khối lượng trong tuần', '<div class="range-switch" aria-label="Phạm vi biểu đồ"><button data-range="week" aria-pressed="true">Tuần</button><button data-range="day" aria-pressed="false">Ngày</button></div>')}<div class="week-chart" role="img" aria-label="Biểu đồ khối lượng DEMO theo ngày; dữ liệu chi tiết trong bảng mở rộng"></div><div class="chart-legend"><span>Tiếp nhận</span><span>Hoàn tất</span></div>${link('Xem dữ liệu biểu đồ', 'chart-data')}<p class="capacity-footnote">Dữ liệu DEMO · Không dùng để xếp hạng hiệu suất.</p></section>`;
  return `<section class="capacity">${title('Khả năng tiếp nhận', '<span class="eyebrow">Trong ngày</span>')}<div class="capacity-rows">${[['KT', 'Kỹ thuật DEMO 01', 180, 360, 'Windows · Thiết bị', '#527a60'], ['KT', 'Kỹ thuật DEMO 02', 240, 360, 'Mạng · Phần mềm', '#6386a0'], ['KT', 'Kỹ thuật DEMO 03', 180, 240, 'Vắng 10:00–14:00', '#b48c46']].map(([initial, name, load, cap, note, color]) => `<div class="capacity-row"><div class="capacity-label">${avatar(initial, name)}<span>${load} / ${cap} phút</span></div><div class="capacity-track" role="img" aria-label="${name}: ${load} trên ${cap} phút"><div class="capacity-fill" style="width:${load / cap * 100}%;--fill:${color}"></div></div><div class="capacity-caption"><span>${note}</span><span>Còn ${cap - load} phút</span></div></div>`).join('')}</div><p class="capacity-footnote">Theo lịch và phân bổ DEMO. Khả dụng không đồng nghĩa đủ điều kiện nhận mọi công việc.</p></section>`;
}
document.querySelector('#main').innerHTML = `<div class="page-heading"><div><div class="eyebrow">${config.name} <span>·</span> Thứ Năm, 12 tháng 11</div><h1>${config.heading}</h1><p>${config.description}</p></div><div class="heading-actions">${btn('Hôm nay', 'date', true)}${btn(config.primary, personal ? 'new-ticket' : role === 'admin' ? 'users' : 'queue')}</div></div>${metrics()}<div class="board-grid"><section>${personal ? journey() : role === 'technician' ? shift() : mapStage()}</section>${leader ? `<div class="operations-rail">${supplemental()}${attention()}</div>` : attention()}</div><div class="bottom-grid ${leader ? 'queue-full' : ''}">${queue()}${leader ? '' : supplemental()}</div>`;

function renderRows() {
  const rows = scoped.filter(r => {
    const matches = filter === 'all' || (filter === 'progress' && r.status === 'Đang xử lý') || (filter === 'waiting' && r.status === 'Chờ bổ sung') || (filter === 'unassigned' && r.unassigned) || (filter === 'risk' && r.risk) || (filter === 'overdue' && r.overdue);
    return matches && (!window.dashboardQueuePredicate || window.dashboardQueuePredicate(r)) && `${r.id} ${r.title}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'));
  });
  document.querySelector('#ticket-rows').innerHTML = rows.length ? rows.slice(0, 4).map(r => `<tr><td><button class="ticket-name" data-action="ticket:${r.id}"><span class="code">${r.id}</span>${escape(r.title)}</button></td><td>${pill(r.status, r.tone)}</td><td><span class="priority">${r.priority}</span></td><td class="table-owner"><span class="muted">${r.owner}</span></td></tr>`).join('') : '<tr><td class="empty" colspan="4">Không có yêu cầu phù hợp. Thử thay bộ lọc hoặc từ khóa.</td></tr>';
  document.querySelector('#row-count').textContent = `Hiển thị ${Math.min(4, rows.length)} / ${rows.length} yêu cầu`;
  document.querySelector('#queue-count').textContent = `${rows.length} yêu cầu phù hợp`;
}
function selectFilter(value) {
  filter = value;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  renderRows();
}
function selectArea(value) {
  area = value;
  const values = { devices: ['Thiết bị', '05'], network: ['Mạng', '02'], software: ['Phần mềm', '03'], accounts: ['Tài khoản', '02'] };
  document.querySelectorAll('[data-area]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.area === value)));
  document.querySelectorAll('[data-room]').forEach(g => g.querySelector('.room').classList.toggle('room-active', g.dataset.room === value));
  document.querySelector('#area-label').textContent = 'Nhóm ' + values[value][0];
  document.querySelector('#area-count').textContent = values[value][1];
  const panel = document.querySelector('.map-panel'); panel.classList.remove('changing'); requestAnimationFrame(() => panel.classList.add('changing'));
}
const dialog = document.querySelector('#detail');
let returnFocus = null;
function openDetail(heading, content) {
  returnFocus = document.activeElement;
  document.querySelector('#detail-content').innerHTML = `<h2 id="detail-title">${heading}</h2>${content}`;
  dialog.showModal();
}
function action(name) {
  if (name === 'overview') { selectFilter('all'); return; }
  if (name === 'queue') { document.querySelector('#queue').scrollIntoView({ behavior: 'instant', block: 'start' }); document.querySelector('#search').focus(); return; }
  if (name.startsWith('ticket:')) {
    const r = scoped.find(x => x.id === name.slice(7));
    if (!r) { openDetail('Không có quyền xem', '<p>Yêu cầu không nằm trong phạm vi tài khoản DEMO này.</p>'); return; }
    openDetail(r.title, `<p class="code">${r.id}</p>${pill(r.status, r.tone)}<dl><dt>Phụ trách</dt><dd>${r.owner}</dd><dt>Ưu tiên</dt><dd>${r.priority}</dd></dl><p>Đây là chi tiết xem trước. Phản hồi và thay đổi nghiệp vụ sẽ được triển khai theo task riêng.</p>`); return;
  }
  const details = {
    'new-ticket': ['Tạo yêu cầu hỗ trợ', '<p>Luồng tạo yêu cầu sẽ giữ biểu mẫu đã chốt. Preview này chỉ thiết kế dashboard, chưa gửi yêu cầu thật.</p>'],
    proposal: ['Tác động của đề xuất', '<p>T03 · Cài đặt phần mềm cho nhân sự mới.</p><dl><dt>Hiện tại</dt><dd>Kỹ thuật DEMO 03</dd><dt>Đề xuất</dt><dd>Kỹ thuật DEMO 01</dd><dt>Còn lại</dt><dd>180 phút</dd><dt>Trạng thái</dt><dd>Chưa phân công lại</dd></dl><p>Phê duyệt là quyết định; hệ thống phải kiểm tra quyền và điều kiện trước khi thực hiện. Không có thay đổi nào được ghi từ preview này.</p>'],
    assistant: ['AI Workspace', '<p>Điểm vào trợ lý giữ nguyên trong điều hướng. Bản preview không gọi Gemini, không chạy RAG và không thay thiết kế AI Workspace.</p>'],
    knowledge: ['Kho kiến thức', '<p>Tra cứu hướng dẫn đã xuất bản trong phạm vi được xem. Quyền xuất bản không được suy ra từ việc nhìn thấy menu.</p>'],
    assets: ['Thiết bị & tài sản', `<p>${personal ? 'LT-001 · Dell Latitude 5440<br>MN-003 · Dell P2425H' : 'Danh sách tài sản được mở theo quyền hiện tại.'}</p><p>Không có thao tác cấp, thu hồi hay thay đổi tài sản trong preview dashboard.</p>`],
    users: ['Quản lý người dùng', '<p>Tài khoản, vai trò và trạng thái được quản trị qua biểu mẫu bảo mật riêng. Preview này không tạo người dùng hoặc thay đổi quyền.</p>'],
    settings: ['Cấu hình vận hành', '<p>Danh mục, tổ chức và chính sách SLA vẫn tuân thủ phạm vi Admin. Không có cấu hình hệ thống thật trong preview này.</p>'],
    notifications: ['Thông báo của bạn', '<p>Chỉ hiển thị thông báo của tài khoản hiện tại. Dữ liệu tổng hợp trong bản thiết kế không đại diện cho thông báo thật.</p>'],
    work: ['Công việc trong phạm vi', '<p>Ticket và task thực hiện là hai loại đối tượng riêng. Chuyển trạng thái phải theo quyền và điều kiện của task.</p>'],
    workforce: ['Lịch & khả năng tiếp nhận', '<p>Các thanh thể hiện số phút đã phân bổ trên khả năng trong ngày, không phải xếp hạng hiệu suất. Đây là dữ liệu DEMO.</p>'],
    reports: ['Báo cáo vận hành', '<p>Báo cáo tổ chức dành cho IT Manager và Admin. Số liệu hiện tại được gắn DEMO, không phải dữ liệu hệ thống thật.</p>'],
    audit: ['Nhật ký hoạt động', '<p>Chỉ truy xuất sự kiện trong phạm vi được phép. Quyền quản trị không cho phép xem hội thoại riêng của người khác.</p>'],
    date: ['Ngày quan sát', '<p>Ngày cố định của bản review: 12 tháng 11 năm 2026. Các chỉ số là dữ liệu tổng hợp để xem bố cục.</p>'],
    'chart-data': ['Dữ liệu biểu đồ DEMO', '<table class="ticket-table"><thead><tr><th>Ngày</th><th>Tiếp nhận</th><th>Hoàn tất</th></tr></thead><tbody>' + chartValues.map((x, i) => `<tr><td>T${i + 2}</td><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('') + '</tbody></table>'],
  };
  if (name === 'mine') { selectFilter('all'); document.querySelector('#search').focus(); return; }
  if (name === 'all-tickets') { openDetail('Danh sách trong phạm vi', '<p>Danh sách DEMO đầy đủ theo tài khoản đang review.</p>' + scoped.map(r => `<p><strong>${r.id}</strong> · ${escape(r.title)}</p>`).join('')); return; }
  if (details[name]) openDetail(...details[name]);
}
let chartValues = [[4, 2], [6, 4], [2, 4], [8, 6], [6, 4], [4, 2], [6, 4]];
function renderChart(range = 'week') {
  const chart = document.querySelector('.week-chart'); if (!chart) return;
  chartValues = range === 'week' ? [[4, 2], [6, 4], [2, 4], [8, 6], [6, 4], [4, 2], [6, 4]] : [[2, 1], [3, 2], [4, 3], [2, 2], [3, 1], [1, 2], [2, 1]];
  chart.innerHTML = chartValues.map(([a, b], i) => `<div class="chart-day" title="${range === 'week' ? 'Ngày T' + (i + 2) : (8 + i) + ':00'}: ${a} tiếp nhận, ${b} hoàn tất"><i style="--height:${a * 12}%"></i><i style="--height:${b * 12}%"></i><span>${range === 'week' ? (i === 6 ? 'CN' : 'T' + (i + 2)) : (8 + i) + 'h'}</span></div>`).join('');
  document.querySelectorAll('[data-range]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.range === range)));
}
document.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  if (button.hasAttribute('data-close-nav')) { closeNav(); return; }
  if (button.dataset.action && document.querySelector('#sidebar').classList.contains('open')) closeNav();
  if (button.hasAttribute('data-close')) { dialog.close(); return; }
  if (button.dataset.filter) selectFilter(button.dataset.filter);
  if (button.dataset.area) selectArea(button.dataset.area);
  if (button.dataset.range) renderChart(button.dataset.range);
  if (button.dataset.action) action(button.dataset.action);
  if (button.classList.contains('menu-toggle')) {
    const open = document.querySelector('#sidebar').classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    document.querySelector('.workspace').inert = open;
    if (open) document.querySelector('#sidebar button').focus();
  }
});
dialog.addEventListener('click', e => { if (e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientX > dialog.getBoundingClientRect().right)) dialog.close(); });
dialog.addEventListener('close', () => returnFocus?.focus());
document.querySelector('#search').addEventListener('input', e => { search = e.target.value; renderRows(); });
document.addEventListener('keydown', e => {
  document.body.classList.add('keyboard');
  if (e.key === 'Escape') closeNav();
  if (e.key === 'Tab' && document.querySelector('#sidebar').classList.contains('open')) {
    const items = [...document.querySelectorAll('#sidebar a, #sidebar button')].filter(x => x.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
document.addEventListener('pointerdown', () => document.body.classList.remove('keyboard'));
renderRows(); renderChart(); if (leader) selectArea(area);
window.dashboardPreview = { role, filter: selectFilter, area: selectArea, action, scopedCount: scoped.length };
// Compose the selected light dashboard with the self-contained Night City panel only.
if (leader) {
  const sheet = document.createElement('link'); sheet.rel = 'stylesheet'; sheet.href = 'night-city/dispatch.css'; document.head.append(sheet);
  const dispatchScript = document.createElement('script'); dispatchScript.src = 'night-city/night.js'; document.body.append(dispatchScript);
}
