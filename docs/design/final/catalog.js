/* Design review only. Proposed screens, not implemented application routes. */
window.reviewGroups=[
 {id:'01-account',title:'Tài khoản',desc:'Đăng nhập, hồ sơ và bảo mật',screens:[
 ['login','Đăng nhập','SCR01','public'],['profile','Hồ sơ cá nhân','SCR02','requester'],['security','Đổi mật khẩu','SCR03','requester']]},
 {id:'02-tickets',title:'Yêu cầu hỗ trợ',desc:'Từ tiếp nhận đến xác nhận kết quả',screens:[
 ['tickets','Danh sách ticket','SCR20','manager'],['my-tickets','Yêu cầu của tôi','SCR20','requester'],['create','Tạo yêu cầu','SCR21','requester'],['ticket-it','Chi tiết · Kỹ thuật viên','SCR22','technician'],['ticket-requester','Chi tiết · Chờ phản hồi','SCR22','requester'],['ticket-active','Chi tiết · Theo dõi','SCR22','requester'],['ticket-result','Chi tiết · Chờ xác nhận','SCR22 / SCR24','requester'],['provision','Yêu cầu cấp tài khoản','SCR22 / SCR60','admin'],['assign','Phân công / tiếp nhận','SCR23','manager'],['transition','Xử lý trạng thái','SCR24','technician'],['priority','Đổi ưu tiên','SCR25','manager']]},
 {id:'03-work',title:'Công việc & kế hoạch',desc:'Task, phụ thuộc và kết quả thực hiện',screens:[
 ['work','Bảng công việc','SCR-OPS01','manager'],['my-work','Công việc của tôi','SCR-OPS01','technician'],['plan','Kế hoạch & phụ thuộc','SCR-OPS02','manager'],['progress','Tiến độ & kết quả','SCR-OPS01 / SCR-OPS02','technician']]},
 {id:'04-workforce',title:'Nhân sự & năng lực',desc:'Kỹ năng, lịch và khả năng tiếp nhận',screens:[
 ['workforce','Nhân sự & capacity','SCR-OPS03','manager']]},
 {id:'05-ai',title:'AI & điều phối',desc:'Giữ bố cục AI v1.1, áp dụng phong cách Spectrum',screens:[
 ['ai-normal','Workspace · Bình thường','SCR-AI01 / SCR-AI02 / SCR-OPS04','manager','37-ai-workspace'],
 ['ai-requester','Workspace · Nhân viên','SCR-AI01 / SCR-AI02','requester','11-ai-assistant'],
 ['ai-tech','Workspace · Kỹ thuật viên','SCR-AI01 / SCR-AI02','technician','12-ai-ticket-assistant'],
 ['ai-exception','Workspace · Ngoại lệ','SCR-OPS04','manager','23-coordination'],
 ['ai-approval','Workspace · Phê duyệt','SCR-OPS05','manager','24-approval'],
 ['ai-states','Workspace · Trạng thái','SCR-AI01 / SCR-AI02','requester','13-ai-states'],
 ['policies','Chính sách & workflow','SCR-OPS06','manager']]},
 {id:'06-knowledge-assets',title:'Tri thức & tài sản',desc:'Nguồn hỗ trợ và vòng đời thiết bị',screens:[
 ['knowledge','Kho kiến thức','SCR-OPS07','requester'],['article','Bài viết & nguồn','SCR-OPS07','requester'],['knowledge-edit','Phiên bản & quyền bài viết','SCR-OPS07','manager'],
 ['assets','Danh sách tài sản','SCR30','manager'],['my-assets','Thiết bị của tôi','SCR30 / SCR32','requester'],['asset-form','Thêm / sửa tài sản','SCR31','manager'],['asset','Hồ sơ tài sản','SCR32','manager'],['asset-action','Cấp phát / thu hồi','SCR33','manager']]},
 {id:'07-monitoring',title:'Theo dõi vận hành',desc:'Báo cáo, thông báo và nhật ký',screens:[
 ['reports','Báo cáo','SCR40','manager'],['notifications','Thông báo','SCR50','requester'],['audit','Nhật ký hoạt động','SCR65','manager']]},
 {id:'08-admin-states',title:'Quản trị & trạng thái',desc:'Cấu hình tổ chức và các nhánh phục hồi',screens:[
 ['users','Người dùng','SCR60','admin'],['user-create','Tạo người dùng','SCR60','admin'],['departments','Phòng ban','SCR61','admin'],['teams','Nhóm & thành viên','SCR62','admin'],['categories','Danh mục','SCR63','admin'],['sla','Chính sách SLA','SCR64','admin'],['ai-settings','Cấu hình trợ lý AI','SCR-AI03','admin'],['forbidden','Không có quyền','SCR90','requester'],['not-found','Không tìm thấy','SCR91','requester'],['states','Loading / rỗng / lỗi','SHARED','requester']]}
];
