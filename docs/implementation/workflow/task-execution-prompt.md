---
id: itoh-task-execution-prompt
title: "Reusable single-task execution prompt"
type: reference
domain: development
module: delivery
tags: [prompt, tasks, execution, context]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-13
authority: derived
purpose: "Provide a reusable task assignment that limits context, edits and verification to one executable task."
---
> **Current visual standard:** [v1.3 / D-51](../../design/approved-format.md) overrides older D-47 post-login colors/type: Mac/Teal globally, Night City coordination panel only, original login preserved. Read this with the task-specific business layout/state references; do not implement the old Graphite palette.


# Reusable single-task execution prompt

For UI work, use the [owner-approved v1.3 format](../../design/README.md) and [source precedence](../../design/approval.md). Design approval does not complete a task.

Replace the single `<TASK_ID>` below with an executable child ID such as `FE-01.01`, then send the block to the coding agent in this repository. This file is a template; creating or reading it does not start implementation. Sending the completed block requests implementation of that one task.

## Selection and usage

- `FE-*`: copy only the complete Frontend-only copyable prompt block.
- All other task IDs: copy only the complete Copyable prompt block.
- Replace `<TASK_ID>` on the first line only. Every later `{TASK_ID}` means that same assigned ID; commit-title placeholders are naming syntax, not additional assignment fields.
- The selected block authorizes one task, its checks, execution records and scoped Git delivery. It does not authorize the next task or deployment. Use the same block/ID to resume unfinished work; do not repeat valid completed work.
- Alternatively, send the short assignment at the end; it instructs the agent to read the applicable complete block from this file. No manual status change is needed before assignment.

Use a child ID from the [execution board](execution-board.md), not a broad group such as FE-01. [Task cards](../tasks/FE-01.01.md) define the implementation scope; [task-workflow.md](task-workflow.md) defines lifecycle and phase rules. Only the ID changes between ordinary assignments.

## Copyable prompt

```text
For UI work, read docs/design/approved-format.md (v1.3 / D-51): Mac/Teal globally, Night City coordination only, original login unchanged. It overrides older post-login Graphite presentation.
TASK_ID: <TASK_ID>

Work in this repository for PO.
Keep task Owner fixed as PO. AI Agents support implementation; do not add
an Executor column or put an agent name in Owner. Read and apply
docs/implementation/workflow/task-workflow.md, including its Git delivery policy.
Interpret every {TASK_ID} below as the assigned ID above. Read current-context.md
for its compact resume pointer, then verify it against the task/board evidence.
If the task is already done, report its evidence rather than reimplement it.
Resume review/blocked work from actual evidence; do not restart cancelled work.

For AI-related scope, D-48 selects Gemini Developer API free tier, USD 0 paid
spend; exact model/embedding eligibility needs verification. No OpenAI fallback,
billing activation or real-data permission is implied. D-49 records future
RAG/context evolution; LangChain/LangGraph are not selected dependencies.

Delivery checklist - mandatory for every task in every phase (A/B/C/D):
1. Resolve this task's Parent and phase; keep Owner = PO. Check the previous
   Parent PR on GitHub before coding another Parent on the shared phase branch.
   If it remains open, report its URL, remind PO to review/merge, and stop
   dependent implementation. A statement that it was merged needs verification.
2. Commit each child task separately with its Task ID and specific outcome;
   push to the correct phase branch, verify the remote SHA, and update the task,
   task-history and current-context with actual results. Do not create a PR
   for each child or claim a partial Parent is complete.
3. After this task, check all children AND Parent acceptance/closure criteria,
   including required external integration evidence. If incomplete, report the
   remaining tasks/gates; do not create a completed-Parent PR prematurely.
4. When the Parent is verified complete, create/update ONE Parent PR into main,
   using task-workflow.md title/body rules. Final report MUST include the real PR
   URL, actual open/merged state and a reminder for PO to review/merge while open.
5. Do not add another Parent's code while that PR is open. After verified merge,
   fetch/sync the merged baseline without force-push or destructive reset; keep
   the phase branch. Only start the next task when separately assigned and ready.
6. At phase handoff verify every Parent PR is merged, every phase acceptance and
   exit gate has passed, then record actual phase results and next prerequisites.
   There is no extra phase PR. Do not start the next phase or merge automatically.
7. PR/access/check failures stay explicit; never fabricate a commit, PR, merge,
   approval or reminder delivery. Preserve existing reporting format and history.

Git delivery is part of this assignment:
- One PR per completed Parent, not per phase. While its PR is open, remind PO
  to merge with its URL; do not start another Parent on the shared branch.
- Read task-workflow.md section "Task commits and GitHub delivery" at task start.
- Use the existing phase branch: phase/a-frontend, phase/b-backend,
  phase/c-integration or phase/d-acceptance. Do not create a branch per task.
- Commit each small task separately with title:
  <type>(<scope>): <TASK_ID> <specific outcome>.
- Push scoped task commits to that phase branch and verify its remote SHA.
- Record branch, implementation commit/link and actual push result in task
  section 6, task-history section 8, current-context and the final report.
- At verified Parent completion, create/update that Parent PR into main using the
  workflow's required PR title and description; report the actual PR URL.
- Do not merge automatically, push main, force-push or include unrelated changes.
- Report Git access/push/PR failures explicitly; do not claim successful delivery.

For a UI task, read docs/design/README.md and docs/design/approval.md,
then your TASK_ID row in docs/design/implementation-scope.md and only its named
screen/style sections. v1.3 / D-51 governs post-login presentation and retains the D-47 login;
implement only your task-owned scope and verify actual design conformance.
Open the mandatory final HTML references listed in the task card in a browser
before building its UI. Match those surfaces; do not replace them with a generic
layout inferred from text. For owned visual changes, capture reference vs running
app at matching viewport/role/state, save real evidence under
docs/implementation/evidence/{TASK_ID}/ and report differences and the actual
owner visual verdict (or pending review). Nonvisual work: N/A with reason.

Superseded visual alternatives have been removed; use docs/design/final/ only.

Implement this single task in the current repository. This assignment authorizes
its stated implementation, essential verification and execution-record updates.

Resolve scope and readiness:
- Read docs/implementation/tasks/{TASK_ID}.md. Apply repository instructions and
  the relevant rules in docs/implementation/workflow/task-workflow.md.
- Inspect only this task's row in
  docs/implementation/workflow/execution-board.md, its named prerequisites'
  status and necessary handoff evidence. Check the relevant parent criteria and
  closure; consult docs/implementation/workflow/current-context.md only if useful
  for resuming existing work.
- Respect Phase A frontend first. Later phases require the actual FE-18.03 exit.
  Document readiness is not proof that dependencies or business decisions passed.
- If a prerequisite is unfinished or a required decision/access is missing,
  report the exact gap. Leave an unstarted task pending; if an active task becomes
  blocked, record the blocker and valid state transition. Do not implement its
  predecessors or silently choose unresolved enterprise policy.

Retrieve only justified context:
- Read the task's embedded context sources at the named sections/trace IDs.
  Do not load all task files, all 00-07 summaries or the entire specification.
- Check existing workspace changes before editing and preserve unrelated work.
- When .codegraph exists, use CodeGraph before locating/understanding indexed
  application code, starting with the task's query hint. In PowerShell use
  codegraph.cmd. Read files directly only for unindexed material or specifically
  missing/stale details. Do not rebuild an index just because source is empty.
- Treat proposed output paths as ownership hints; inspect existing interfaces
  and reuse them instead of creating a parallel implementation.
- For visual/UI/UX tasks, use the relevant project-local UI/UX skill under
  .agents/skills/ (normally ui-ux-pro-max). Follow its bounded searches while
  respecting the agreed stack, current approved design and this task's scope.
  Skill installation alone is not authorization to redesign all screens.

Execute the bounded deliverable:
- Briefly state the objective, intended edit areas and checks, then proceed
  without a routine approval pause when readiness is satisfied.
- Keep Owner as PO, activate the parent as needed and move the task
  to in-progress using the existing workflow.
- Implement only Included scope and essential acceptance/error handling. Read
  extra context or extend a shared interface only when this task requires it;
  explain a material scope mismatch rather than broadening the task silently.
- For frontend tasks use explicit DEMO fixtures and the typed mock boundary;
  do not create backend/workers/live-provider infrastructure. In later phases
  reuse the frontend and never silently substitute mock data for real results.
- Complete the task's required meaningful checks and fix observed failures.
  Keep task and package completion distinct; do not change acceptance criteria,
  run the next task or deploy without separate authorization. Follow the task commits
  and GitHub delivery policy in task-workflow.md: scoped commits on the current phase branch and
  ordinary pushes are authorized; no direct main push, force-push or merge.

Verify and hand off:
- Append one chronological report for this actual attempt/handoff to
  docs/implementation/workflow/task-history.md using Format version 1 exactly:
  keep its fields, ten subsections and table columns, fill all acceptance/check
  results, and run its Report validation before handoff checklist. Give it a
  unique task/attempt ID/anchor and actual times/executor. Preserve prior reports;
  corrections and resumed work get linked new entries.
- Record actual changed paths/key symbols, acceptance results, exact check
  commands and pass/fail/not-run outcomes in the task's Evidence and handoff.
  Update that small task file's section 6 after every attempt, not only at done.
  Fill its latest Report ID/history-link fields and current handoff summary;
  keep long report/log detail in the history and linked artifacts. Preserve the
  task's scope/acceptance; never mark an unrun check as passed.
- Follow in-progress -> review -> done only when required evidence passes;
  label self-review honestly and leave missing required checks open.
- Update the relevant execution-board row for task state only; keep Owner fixed as PO, the parent
  state when justified, and current-context.md including its Latest task report.
  Keep the latest owner-facing summary in current-context.md, never duplicate
  reports in execution-board.md. Show Task ID/state, result, important files,
  checks/results, gaps, the task evidence and exact history-entry links, and next task.
  Keep report claims consistent with actual task evidence and the final reply;
  refresh stale aggregate statements when the first/current task changes them.
  Update coverage/dependencies only for an actual scoped refinement, preserving
  all required outcomes and an acyclic graph.
- Finish with: result/status, important files, checks performed, remaining gaps
  and the next eligible task. Recommend the next task; do not start it.
```

## Git delivery rule for both prompts

Apply the Task commits and GitHub delivery policy in [task-workflow.md](task-workflow.md#task-commits-and-github-delivery) after each actual task attempt. This rule supersedes any older commit/push prohibition in copied prompts. Commit only scoped changes, push the shared phase branch, verify the remote SHA, and report branch, implementation commit, final delivery HEAD and actual push result. Do not include the existing uncommitted planning/design baseline in a coding task commit. Git delivery does not substitute for task acceptance or owner visual review.

Use one branch per phase (`phase/a-frontend`, `phase/b-backend`, `phase/c-integration`, `phase/d-acceptance`), not per task. Name each task commit `<type>(<scope>): <TASK_ID> <specific outcome>`. At verified Parent completion, create the Parent PR into `main` with the title and description template in task-workflow.md; report its actual URL and remind PO to merge. Do not add the next Parent to the shared phase branch until this PR is verified merged; do not merge automatically.

## Frontend-only copyable prompt

Use this complete block for Phase A FE tasks. Replace only `<TASK_ID>`. It explicitly requires the authoritative workflow; you do not need to copy the general prompt as well.

```text
For UI work, read docs/design/approved-format.md (v1.3 / D-51): Mac/Teal globally, Night City coordination only, original login unchanged. It overrides older post-login Graphite presentation.
TASK_ID: <TASK_ID>

Delivery checklist - mandatory for every task in every phase (A/B/C/D):
1. Resolve this task's Parent and phase; keep Owner = PO. Check the previous
   Parent PR on GitHub before coding another Parent on the shared phase branch.
   If it remains open, report its URL, remind PO to review/merge, and stop
   dependent implementation. A statement that it was merged needs verification.
2. Commit each child task separately with its Task ID and specific outcome;
   push to the correct phase branch, verify the remote SHA, and update the task,
   task-history and current-context with actual results. Do not create a PR
   for each child or claim a partial Parent is complete.
3. After this task, check all children AND Parent acceptance/closure criteria,
   including required external integration evidence. If incomplete, report the
   remaining tasks/gates; do not create a completed-Parent PR prematurely.
4. When the Parent is verified complete, create/update ONE Parent PR into main,
   using task-workflow.md title/body rules. Final report MUST include the real PR
   URL, actual open/merged state and a reminder for PO to review/merge while open.
5. Do not add another Parent's code while that PR is open. After verified merge,
   fetch/sync the merged baseline without force-push or destructive reset; keep
   the phase branch. Only start the next task when separately assigned and ready.
6. At phase handoff verify every Parent PR is merged, every phase acceptance and
   exit gate has passed, then record actual phase results and next prerequisites.
   There is no extra phase PR. Do not start the next phase or merge automatically.
7. PR/access/check failures stay explicit; never fabricate a commit, PR, merge,
   approval or reminder delivery. Preserve existing reporting format and history.

Git delivery is part of this assignment:
- One PR per completed Parent, not per phase. While its PR is open, remind PO
  to merge with its URL; do not start another Parent on the shared branch.
- Read task-workflow.md section "Task commits and GitHub delivery" at task start.
- Use the existing phase branch: phase/a-frontend, phase/b-backend,
  phase/c-integration or phase/d-acceptance. Do not create a branch per task.
- Commit each small task separately with title:
  <type>(<scope>): <TASK_ID> <specific outcome>.
- Push scoped task commits to that phase branch and verify its remote SHA.
- Record branch, implementation commit/link and actual push result in task
  section 6, task-history section 8, current-context and the final report.
- At verified Parent completion, create/update that Parent PR into main using the
  workflow's required PR title and description; report the actual PR URL.
- Do not merge automatically, push main, force-push or include unrelated changes.
- Report Git access/push/PR failures explicitly; do not claim successful delivery.

Triển khai đúng một task FE trong repo này, theo frontend v1.3 / D-51.
Project owner và người review giao diện: Hoang Cong Minh.
Owner trên mọi task chỉ ghi `PO`. AI Agent hỗ trợ triển khai và kiểm tra;
không thêm cột Executor, không ghi tên người hoặc agent vào cột Owner.
Mọi {TASK_ID} bên dưới là ID được giao ở dòng đầu, không phải chỗ cần sửa thêm.

Đọc và áp dụng toàn bộ quy tắc liên quan trong
docs/implementation/workflow/task-workflow.md, gồm lifecycle, báo cáo và Git.
Đọc phần tóm tắt trong current-context.md để tiếp nối phiên; xác minh lại bằng
task card, execution-board và handoff thực tế. Không đọc toàn bộ history/repo.
Task đã done với bằng chứng hợp lệ: báo lại kết quả, không triển khai lần nữa.
Task review/blocked: tiếp tục từ bằng chứng; không tự khởi động lại task cancelled.

1. Xác định scope trước khi sửa:
- Đọc docs/implementation/tasks/{TASK_ID}.md, task-workflow.md trong folder
  docs/implementation/workflow và đúng dòng task/prerequisites trên execution-board.
- Nếu task đã bắt đầu, đọc Evidence and handoff và báo cáo gần nhất để tiếp tục.
- Chỉ bắt đầu khi prerequisite và các điều kiện workflow đã thỏa mãn.
  Khi task sẵn sàng, kích hoạt parent và cập nhật in-progress, giữ Owner là PO;
  không yêu cầu owner tự sửa trạng thái hoặc xác nhận lại công việc đã giao.
  Thiếu điều kiện thì báo rõ; không tự triển khai task phụ thuộc trước đó.
- Giữ nguyên Included/Excluded, mục tiêu và tiêu chí nghiệp vụ của task.

2. Bắt buộc bám bản HTML đã chốt:
- Đọc docs/design/approval.md và đúng dòng TASK_ID trong
  docs/design/implementation-scope.md; chỉ lấy context cần cho task này.
- Mở các URL trong “Approved HTML reference — mandatory” của task bằng trình
  duyệt trước khi dựng UI; xem đúng role/state và CSS/JS/SVG liên quan khi cần.
- Dùng HTML làm mẫu trực tiếp cho bố cục, tỷ lệ, spacing, font, màu, viền sáng,
  icon và tương tác thuộc scope. Không tự thay layout hoặc dùng template khác.
- Dùng skill UI/UX để triển khai đúng bản chốt, không để đề xuất lại thiết kế.
- Chỉ làm phần task sở hữu. Link tới một màn không có nghĩa phải code cả màn.
  Thiếu mẫu cho trạng thái bắt buộc: dùng pattern đã chốt gần nhất và ghi rõ gap.
- Nếu không mở được bản HTML, báo rõ giới hạn và giữ phần đối chiếu chưa xác minh;
  không tự suy đoán rồi báo giống thiết kế. Vẫn làm phần độc lập được xác minh.

3. Triển khai Phase A:
- Áp dụng AGENTS.md, CodeGraph khi khả dụng và kiểm tra thay đổi hiện có.
- Chỉ lấy context theo nguồn/section trong task. Với code đã index, dùng CodeGraph
  trước; nếu công cụ lỗi hoặc dữ liệu thiếu/cũ thì đọc đúng file cần thiết và báo giới hạn.
- Dùng frontend DEMO và typed mock gateway; không dựng backend, database,
  worker hoặc gọi model/RAG thật. Không đưa công cụ review/catalog vào product UI.
- Tái sử dụng component hiện có; không sửa bản thiết kế để khớp với code lệch.
- Dùng nhánh phase/a-frontend; tạo một lần từ baseline đã xác minh, rồi tái sử dụng.
  Không gom thay đổi tài liệu/design có sẵn vào commit task. Nếu baseline cần thiết
  chưa được commit, ghi rõ gap và xử lý theo workflow; không tự coi đã đồng bộ GitHub.
- Follow task-workflow.md: commit scoped task changes and push the current phase branch; do not start another task, merge, push main, force-push or deploy.

4. Kiểm tra và bằng chứng:
- Chạy các check thực sự liên quan theo task; ghi pass/fail/not-run trung thực.
- Với UI: mở ứng dụng đang chạy và HTML mẫu cùng viewport/role/state, đối chiếu
  desktop/mobile theo scope; kiểm tra hover/focus, lỗi và reduced motion liên quan.
- Lưu ảnh reference/actual cùng ghi chú sai lệch thực tế tại
  docs/implementation/evidence/{TASK_ID}/. Ảnh HTML không thay cho ảnh ứng dụng.
- Task thuần scaffold/transport/helper không đổi UI: ghi N/A và lý do; không làm
  thêm màn hoặc tạo bằng chứng giả để đáp ứng mục đối chiếu.
- Ghi rõ owner visual review: pending/approved/changes requested theo kết quả
  thực tế. Không tự nhận owner đã duyệt; chưa duyệt hoặc còn lệch đáng kể thì
  không báo visual acceptance đã hoàn tất.

5. Bàn giao:
- Áp dụng quy tắc lifecycle/reporting trong task-execution-prompt.md và workflow.
- Cập nhật section 6 của task; append task-history đúng Format version 1;
  cập nhật current-context với kết quả, gap, trạng thái review và link báo cáo/ảnh.
- History giữ đủ 10 mục, Report ID/anchor duy nhất, thời gian thực và kết quả từng AC.
  Bảo toàn báo cáo cũ; lần tiếp tục/sửa báo cáo tạo entry liên kết mới.
- Execution-board chỉ cập nhật state/owner/dependencies theo workflow,
  không chứa bản sao báo cáo. Không đánh dấu done khi thiếu nghiệm thu bắt buộc.
- Trả final report: task/state, phần đã làm, HTML đã đối chiếu, file quan trọng,
  check thực tế, link ảnh so sánh/báo cáo, sai lệch còn lại, trạng thái owner review
  và task tiếp theo đủ điều kiện. Chỉ đề xuất task tiếp theo, không chạy tiếp.
- Final report phải có branch, implementation commit/link, final delivery HEAD,
  kết quả push/xác minh remote; PR URL khi hoàn thành Parent và đã tạo PR.
  Nhắc PO review và merge PR đó trước khi bắt đầu Parent khác trên nhánh phase chung.
  Thiếu check/review/Git access thì báo chính xác, không tự nhận pass hoặc đã duyệt.
```

## Short assignment after the template is available

```text
TASK_ID: <TASK_ID>
Read docs/implementation/workflow/task-execution-prompt.md and execute its full
Frontend-only copyable prompt for FE-*; otherwise execute its full Copyable prompt.
Substitute the assigned TASK_ID throughout. Apply its referenced task-workflow.md,
including task scope, checks, reporting, task commits, phase-branch pushes and
Parent PR requirements. Execute only this task; do not start the next task.
```

The short assignment supplies the real ID to the reusable instructions. If execution finds the task already done with valid evidence, report that state instead of implementing it again. A task in review or blocked resumes from its actual evidence and valid transition; cancelled work is not restarted without explicit direction.


PR publication rule: publish one Parent PR with the required title/description directly on GitHub. Do not save per-Parent PR .md files or create a pull-requests folder. Temporary body files belong outside the repo and must be removed after use. Record the PR link/status in existing task/history/current-context records and remind PO to merge.
