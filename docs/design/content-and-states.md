---
id: itoh-docs-design-content-and-states
title: "UI content, errors, and states"
type: reference
domain: design
module: content
tags: [design, content, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Standardize terminology, messages, errors, and interface states."
---

# UI content, errors, and states

## Writing principles

Use concise, specific verbs identifying outcomes/next steps. Vietnamese UI verbs include “Gửi yêu cầu”, “Tiếp nhận”, “Bắt đầu xử lý”, “Chờ phản hồi”, “Đề xuất giải quyết”, “Xác nhận đóng”, “Yêu cầu xử lý lại”. Avoid generic OK/Submit/Success or implying SLA restarts at assignment. Documentation is English; quoted **product UI copy remains Vietnamese**.

## Sample UI copy

| Situation | Proposed Vietnamese copy |
| --- | --- |
| Created | “Đã tạo yêu cầu TKT-000123. Bạn có thể theo dõi trao đổi tại đây.” |
| Pending | “IT đang cần bạn bổ sung thông tin. Trả lời câu hỏi bên dưới để tiếp tục xử lý.” |
| Resolved | “IT đã đề xuất giải pháp. Hãy kiểm tra kết quả rồi xác nhận đóng hoặc yêu cầu xử lý lại.” |
| Closed | “Yêu cầu đã được bạn xác nhận hoàn tất. Nếu cần mở lại, liên hệ trưởng phòng IT.” |
| Internal composer | “Ghi chú nội bộ · Chỉ nhóm IT có quyền xem ticket.” |
| Public composer | “Trao đổi công khai · Người yêu cầu và IT có quyền sẽ xem được.” |
| Suggested priority | “Ưu tiên đề xuất: P3 — Trung bình. IT sẽ xác minh mức ảnh hưởng và khẩn cấp.” |
| Changed priority | “Ngân sách mới áp dụng trên thời gian đã sử dụng. Lịch sử vi phạm vẫn được giữ.” |
| Resolution paused | “Tạm dừng khi chờ phản hồi. Đã dùng 2 giờ/8 giờ; còn 6 giờ.” |
| SLA settings | “Chỉ áp dụng cho ticket được tạo sau khi lưu. Ticket hiện có giữ chính sách đã ghi nhận.” |
| User lock | “Tài khoản sẽ không thể đăng nhập và các phiên hiện tại sẽ bị vô hiệu. Lịch sử được giữ lại.” |

## State contract

| State | UI/focus behavior | Avoid |
| --- | --- | --- |
| Initial loading | Stable shell/content skeleton/assistive status | Previous user's/role's data flash |
| Refresh | Retain old data/updating label; disable unverified-version actions | Empty table/false zero |
| No data | Explain absent requests/assets; authorized creation CTA | DEMO substitution |
| No filter matches | Preserve filters/reset action; distinguish from no records | Claiming system contains no tickets |
| Sending | Pending button/block repeats/form remains readable | Clearing before server confirmation |
| Field error | Preserve input/adjacent accessible errors/first-error focus/summary if needed | Toast-only/full reset |
| Conflict | Changed-data banner/reload-review/preserve draft | Silent overwrite/state merge |
| Lost record access | Generic 404/stop protected loads/list return | Ticket-title/creator disclosure |
| Prohibited feature | 403 heading/explanation/overview return | Query-based elevation |
| Session expired | Hide protected content/login | Shared-device cached internal data |
| Ambiguous network outcome | Explicit uncertainty/check record before idempotent retry | Definite failure when server may have committed |
| Load failure | Regional error/retry/support ID if available | Stack trace/false zero |
| Success | Refresh source/concise message/appropriate focus | Fake controls/stale numbers |

## Field errors

Keep these Vietnamese UI messages:

- Title: “Nhập tiêu đề từ 5 đến 180 ký tự.”
- Description: “Mô tả thêm hiện tượng và thời điểm xảy ra, tối thiểu 10 ký tự.”
- Pending: “Nhập câu hỏi hoặc thông tin bạn đang chờ người yêu cầu bổ sung.”
- Solution: “Ghi cách xử lý và kết quả để người yêu cầu kiểm tra.”
- Reason: “Nhập lý do thay đổi, tối thiểu 10 ký tự.”
- File: “Tệp này vượt 10 MB. Chọn tệp nhỏ hơn hoặc bỏ khỏi lần gửi.” / “Chỉ nhận PNG, JPEG, WebP và PDF.”
- Assignee: “Chọn người hoạt động thuộc nhóm phụ trách.”
- Issue conflict: “Tài sản đã được cấp hoặc vừa thay đổi. Tải lại để kiểm tra.”
- Reopen: “Người phụ trách trước đây không còn đủ điều kiện. Trưởng phòng IT cần phân công lại trước khi mở lại.”

Length limits are proposed/testable, not substitutes for meaningful content. Map backend errors to approved UI messages, not raw technical text.

## Product glossary

| Term / Vietnamese label | Shared meaning |
| --- | --- |
| Requester / Người yêu cầu | Ticket creator relationship, not necessarily the Requester role alone |
| Technician / Kỹ thuật viên | IT person with team scope |
| Assignee / Người phụ trách | Current responsible individual, eligible team member |
| Open / Đã tiếp nhận | IT intake acknowledged, not first response |
| Pending / Chờ phản hồi | Await requester, resolution paused |
| Resolved / Đã giải quyết | IT solution awaiting acceptance; resolution stopped |
| Closed / Đã đóng | Requester accepted; M/A reasoned reopen only |
| Response SLA | Creation to first eligible public IT comment |
| Resolution SLA | Active duration excluding Pending/Resolved/Closed |
| Snapshot | Recorded ticket policy; ordinary UI calls it “Chính sách trên yêu cầu” |
| Assignment / Lượt cấp phát | Asset issue interval with preserved history |

## Coordination, approval, KB copy

| Situation | Proposed Vietnamese copy / requirements |
| --- | --- |
| Ticket preview | “Chưa tạo yêu cầu. Kiểm tra nội dung rồi xác nhận.”; “Xác nhận tạo yêu cầu” / “Chỉnh trong form” |
| No policy grant | “Quy trình chưa được cấp quyền tự động. Kế hoạch đang ở bản nháp.” |
| Missing information | “Cần bổ sung danh sách nhân viên, cấu hình máy hoặc hạn bàn giao trước khi lập kế hoạch.” Ask only actually missing fields |
| Infeasible | “Chưa có người đủ điều kiện nhận việc trong khoảng này. Cần quản lý điều chỉnh nguồn lực hoặc kế hoạch.” |
| Dependency | “Chưa thể bắt đầu: công việc phụ thuộc chưa hoàn thành.” |
| Proposed | “Phương án đã được tạo, chưa áp dụng thay đổi.” |
| Assigned | “Đã giao công việc cho [người có quyền hiển thị].” Only after service commit |
| Awaiting approval | “Cần quản lý quyết định phương án này.” Never already assigned |
| Stale approval | “Dữ liệu đã thay đổi từ lúc đề xuất. Đánh giá lại trước khi duyệt.” Preserve reason |
| Approved, execution pending | “Đã duyệt phương án. Đang kiểm tra điều kiện thực thi.” |
| Manual lock | “Phân công đã được quản lý khóa. AI sẽ không tự thay đổi.” |
| Provider/broker failure | “Chưa hoàn tất điều phối. Các thao tác thủ công vẫn dùng được.” Actual retry/failed state |
| Budget/usage | “Đã dừng trước giới hạn kiểm thử.” / “Chi phí chưa xác định”; missing usage never USD0 |
| Revoked KB | “Nguồn không còn khả dụng trong phạm vi của bạn.” No prohibited title/snippet |

Ticket=intake/SLA; Task=execution; Plan=versioned tasks/dependencies; Allocation=period effort; AssetAssignment=asset issue, not task assignment; Approval=decision, not execution; AI_COORDINATOR=policy-constrained service identity.

OPS inherits shared error/empty/loading/access/conflict contracts. Technical IDs appear only in useful diagnostic contexts, not ordinary forms.

## v0.6 role behavior and business outcomes

Next-step banners address the correct person: R replies/accepts; T executes/reports; M policies/exceptions; A verifies/provisions. No ordinary stack traces/raw JSON/snapshots/endpoints.

| Flow | Before effect | Outcome/error |
| --- | --- | --- |
| Form/chat confirmation | Draft/uncreated/preserve input/block duplicates | 201 only confirms ticket ID; ambiguous timeout checks outcome before retry |
| Task progress | Unsubmitted remaining changes no resources; T no colleague assignments | Save remaining/result; Done separate/result+remaining 0 |
| Absence/proposal | Source schedules may change; proposal not assignment | New assignee only after successful commit; locks/in-progress escalate |
| Approval | Before-after/reason/impact/source timestamp | Approved≠Succeeded; stale/revoke/capacity change re-evaluates |
| Pending | IT public question, requester must answer | Actual public requester reply resumes without SLA reset; not internal Admin waiting |
| Admin user | Empty password/requester≠employee | No redisplay/auto-close; last-Admin/handover invariants |
| KB/notification | Current ACL; no retained sensitive revoked preview | Readers no publishing; read notification does not edit ticket |

[Current SVGs](wireframes/README.md) are DEMO snapshots, not operational sources. Preserve API/session/CSRF/expectedVersion/idempotency contracts.

## Cards, icons, details v0.6

| Illustrated interaction | Destination/data | Effect |
| --- | --- | --- |
| R device/network/account/other support | SCR21 suggestions, user confirms | Open only, no ticket/new taxonomy/user |
| R tracking/knowledge | Own SCR20 / Published KB under ACL in SCR-OPS07 | Navigation only, no internal plans |
| M/T/A work/calendar/admin cards | Existing authorized screens | Opening does not claim/change/save |
| Topbar search | Scoped SCR20 | No global module search |
| Task cards/table | Same scope/filter/sort/population | Presentation only, no state/lock/dependency change |
| AI guidance/tracking/request preparation | Existing intent; preserve composer draft/wait send | Chip does not create/send extra data |
| Approve/reject | Reasoned/versioned decision | Separate execution; preserve reason on conflicts/re-evaluate |
| Disclosure | Sources/history/explanations/formulas/guards | Inline expansion only, no mutations/grants |
| Notification open/read | Recipient/current resource | Read state only |

Account/access cards request current-user service. New-user requests still need department heads/Admin D-29; no self-signup. Chips do not redefine agreed schemas/types/categories.

Disclosure has local loading/empty/error/keyboard/names. Disabled reasons cannot exist only on hover. Compact warnings/actions remain contextual; long user data is not truncated away. SVG controls are static.

## App actions inside AI Workspace — v0.8

D-42 permits the same trusted composer inside workspace or ticket, superseding handoff-only replies. Cards show resource/audience/editable payload/preview/specific confirmation verb. Reply/progress/approval buttons are user-confirmed native commands; Ask AI/Open card are not mutations. No generic Agree for multiple actions or implicit mutation chains from one message.

Only native-service outcomes show Sent/Saved; timeouts show Unknown with outcome checking. Cancel draft does not undo commits. Provider failure does not lock forms. R activity is public projection; M sees runs/approvals, not others' private chats.

Sensitive admin cards open trusted detail forms; no secret prefill/chat/prompt/history. Landing shortcuts remain navigation; workspace native forms may submit when implemented, not yet now.

## Login copy — v0.8

| Situation | Vietnamese content / behavior |
| --- | --- |
| Initial | Empty Email/Mật khẩu, persistent labels, internal IT help |
| Invalid email | “Nhập email hợp lệ.” beside field after interaction |
| Missing password | “Nhập mật khẩu.”; do not invent server length policy |
| Sending | “Đang đăng nhập…”; one pending request, stable CTA |
| Auth failure | “Không thể đăng nhập với thông tin này.”; no existence/lock disclosure |
| Network | “Kết nối bị gián đoạn. Kiểm tra mạng và thử lại.”; not wrong-password claim |
| Caps Lock | “Caps Lock đang bật” only when active |
| Show/hide | “Hiện mật khẩu”/“Ẩn mật khẩu” accessible names; no plaintext history |
| Expired/success | Reauthenticate; allowed route/validated internal return path |

Board 36 bullets simulate freshly entered text, not prefilled credentials. Main design has no default email/password. Focus/validation/loading/keyboard remain future targets.

## Assistant identity copy

- Page “Không gian AI”; conversation region “Trợ lý AI”.
- Introduction “Chọn việc tôi có thể giúp bạn thực hiện.”; role/context-specific action verbs.
- Composer “Nhắn cho Trợ lý AI”; example is not sent data.
- “Gửi cho trợ lý” sends a conversation request; “Gửi câu trả lời”/“Lưu tiến độ”/“Duyệt phương án” confirms separate business actions.
- Speaker labels “Trợ lý AI” and “Bạn”; sources/drafts/unsent states stay contextual.
- “Điều phối tự động”/“Cập nhật tự động” is separate activity, not another speaker or chat prerequisite.

Shortcuts never auto-execute/overwrite/delete drafts. Missing targets require selection; unauthorized capabilities hidden/explained and manual forms remain available.

## Background proposals and conversation

Full replacement proposal retains before-after/review entry as independent business region. Chat is not bound to it: creation/search/lookup/reporting work with any pending run. Only explicit user request selects a proposal context. Review/approval is not reassignment; OPS05 retains diff/impact/reason/rechecks.

## Sequential coordination copy

Each step shows “Đã xong”/“Đang chờ”/“Chưa chạy”; locked branch header “Bước 3/5 · Chờ bạn duyệt”. “Đề xuất người thay” never means reassigned. Approval still rechecks; notification/monitoring follows successful assignment. No-approval policy branches show corresponding steps without fake waiting. Fail/reject/conflict stops or re-evaluates at the correct step, preserving history/valid actions.

## Normal and exception states

UI37 says “Không có ngoại lệ cần duyệt” only at actual count 0, without approval card/empty reserved space. UI23 explicitly “Phương án ngoại lệ” when authorized data warrants it. No run uses empty activity, not fabricated progress. Successful assignment history does not mean Task Done/Ticket Closed. Two states of one page, not two AI products.
