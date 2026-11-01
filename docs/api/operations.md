---
id: itoh-api-operations
title: "HTTP operation catalog"
type: reference
domain: api
module: contracts
tags: [api, contracts, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Trace operationId, routes, principals, and business rules."
---

# HTTP operation catalog

**Design draft / not implemented.** Derived from [OpenAPI](openapi.json); no public endpoint impersonates AI_COORDINATOR. API01–19 reference UC/BR in the [source catalog](../technical/api-design.md). Roles are feature gates; owner/scope/state/grant conditions require additional checks. KB author/publisher access defaults to deny until D-40 is resolved.

| Group | Method | Path relative to /api/v1 | operationId | Roles | Scope / guard |
| --- | --- | --- | --- | --- | --- |
| API01 | GET | `/auth/csrf` | `getCsrf` | PUBLIC | Pre-session or authenticated session; no domain data. |
| API01 | POST | `/auth/login` | `login` | PUBLIC | Validate active account; rotate session. Requires pre-session CSRF and Origin. |
| API01 | POST | `/auth/logout` | `logout` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN |  |
| API01 | GET | `/auth/me` | `getCurrentUser` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Current session owner only. |
| API01 | PATCH | `/auth/profile` | `updateOwnProfile` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Self only; no email/role/active/membership write. Profile fields proposed for refinement. |
| API01 | POST | `/auth/password` | `changeOwnPassword` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Self only; rotate/revoke sessions per approved security policy. |
| API02 | GET | `/users` | `listUsers` | ADMIN | Admin management list; no public employee directory. |
| API02 | POST | `/users` | `createUser` | ADMIN | Admin only; account role request requires D-29 authorization. |
| API02 | GET | `/users/{id}` | `getUser` | ADMIN | Admin management record. |
| API02 | PATCH | `/users/{id}` | `updateUser` | ADMIN | Admin only; current versions; atomic handover/revoke if rights affected. Emergency no replacement remains D-40. |
| API02 | GET | `/departments` | `listDepartments` | ADMIN | Admin management list; no public employee directory. |
| API02 | POST | `/departments` | `createDepartment` | ADMIN | Admin only; account role request requires D-29 authorization. |
| API02 | GET | `/departments/{id}` | `getDepartment` | ADMIN | Admin management record. |
| API02 | PATCH | `/departments/{id}` | `updateDepartment` | ADMIN | Admin only; current versions; atomic handover/revoke if rights affected. Emergency no replacement remains D-40. |
| API02 | GET | `/teams` | `listTeams` | ADMIN | Admin management list; no public employee directory. |
| API02 | POST | `/teams` | `createTeam` | ADMIN | Admin only; account role request requires D-29 authorization. |
| API02 | GET | `/teams/{id}` | `getTeam` | ADMIN | Admin management record. |
| API02 | PATCH | `/teams/{id}` | `updateTeam` | ADMIN | Admin only; current versions; atomic handover/revoke if rights affected. Emergency no replacement remains D-40. |
| API02 | GET | `/categories` | `listCategorys` | ADMIN | Admin management list; no public employee directory. |
| API02 | POST | `/categories` | `createCategory` | ADMIN | Admin only; account role request requires D-29 authorization. |
| API02 | GET | `/categories/{id}` | `getCategory` | ADMIN | Admin management record. |
| API02 | PATCH | `/categories/{id}` | `updateCategory` | ADMIN | Admin only; current versions; atomic handover/revoke if rights affected. Emergency no replacement remains D-40. |
| API02 | GET | `/teams/{id}/members` | `listTeamMembers` | ADMIN | Admin management view; member lookup is a separate minimal projection. |
| API02 | POST | `/teams/{id}/members` | `setTeamMembership` | ADMIN | Admin only; atomic assignment handover and scope revoke. |
| API02 | GET | `/lookups` | `listAllowedLookups` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Only permitted categories, intake teams and own department reference. No employee enumeration; allowlisted kind required. |
| API03 | GET | `/tickets` | `listTickets` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | R own; T active teams plus own public view; M/A organization. Scope before count. |
| API03 | POST | `/tickets` | `createTicket` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Requester derived from session; priority matrix and SLA snapshot server-side; no caller-provided requester or priority. |
| API03 | GET | `/tickets/{id}` | `getTicket` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Server projects public or scoped IT data; no workforce/approval/action data for requester. |
| API03 | POST | `/tickets/{id}/transitions` | `transitionTicket` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | BR-04 actor/state/assignee guards; requester alone accepts Resolved -> Closed. Pending requires public question; Done task never auto-closes ticket. |
| API03 | POST | `/tickets/{id}/assignment` | `assignTicket` | TECHNICIAN, IT_MANAGER, ADMIN | T may only self-claim unassigned ticket in own team; M/A may assign/transfer. Human assignee eligible in current team. |
| API03 | POST | `/tickets/{id}/priority` | `changeTicketPriority` | IT_MANAGER, ADMIN | M/A only, reason required; new budget from ticket snapshot over elapsed usage, never reset. |
| API04 | GET | `/tickets/{id}/comments` | `listTicketComments` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Parent ticket scope and audience; internal note never requester. |
| API04 | POST | `/tickets/{id}/comments` | `createTicketComment` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Public requester reply resumes Pending; first response only eligible public IT comment. No write on Closed/Cancelled. |
| API04 | POST | `/tickets/{id}/attachments` | `uploadTicketAttachment` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Parent/comment audience verified; max 10 MB/file; one file per operation, up to 5 accepted in one user action. |
| API04 | GET | `/attachments/{id}/download` | `downloadAttachment` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Current parent content scope, no public object URL; safe Content-Disposition, nosniff. |
| API05 | GET | `/tickets/{id}/plans` | `listTicketPlans` | TECHNICIAN, IT_MANAGER, ADMIN | T current ticket team; M/A scope; requester excluded. |
| API05 | GET | `/plans/{id}/versions` | `listPlanVersions` | TECHNICIAN, IT_MANAGER, ADMIN | Same scoped IT plan permission. |
| API05 | POST | `/tickets/{id}/plan-proposals` | `proposePlan` | IT_MANAGER, ADMIN | MA requests proposal; model runs outside DB transaction; no assignment implied. |
| API05 | POST | `/plans/{id}/activate` | `activatePlan` | IT_MANAGER, ADMIN | One Effective version; semantic/DAG/source checks. Policy automation uses internal services, not public service login. |
| API06 | GET | `/tasks` | `listTasks` | TECHNICIAN, IT_MANAGER, ADMIN | Current group membership; no requester projection. |
| API06 | GET | `/tasks/{id}` | `getTask` | TECHNICIAN, IT_MANAGER, ADMIN | Current group membership or M/A scope. |
| API06 | POST | `/tasks/{id}/transitions` | `transitionTask` | TECHNICIAN, IT_MANAGER, ADMIN | Assignee or authorized M/A; dependency/state/version; Done requires human result and remaining=0. |
| API06 | POST | `/tasks/{id}/progress` | `updateTaskProgress` | TECHNICIAN, IT_MANAGER, ADMIN | Assignee or authorized M/A; remaining cannot become Done without explicit valid transition. |
| API06 | POST | `/tasks/{id}/assignment` | `assignTask` | IT_MANAGER, ADMIN | MA only; recheck skills/calendar/remaining/capacity/manual lock; atomic allocation. |
| API06 | POST | `/tasks/{id}/assignment-lock` | `lockTaskAssignment` | IT_MANAGER, ADMIN | Manual lock/unlock requires reason; does not bypass in-progress/approval rules. |
| API07 | GET | `/workforce` | `listWorkforce` | TECHNICIAN, IT_MANAGER, ADMIN | T self/minimal task lookup; M/A managed IT scope; no global private calendar for T. |
| API07 | GET | `/workforce/{id}` | `getWorkforce` | TECHNICIAN, IT_MANAGER, ADMIN | T self/minimal scoped projection; M/A managed scope. |
| API07 | PATCH | `/workforce/{id}` | `updateWorkforce` | IT_MANAGER, ADMIN | MA confirms source data. Calendar/capacity values D-40; not attendance/payroll. |
| API07 | POST | `/workforce/{id}/absences` | `recordAbsence` | IT_MANAGER, ADMIN | Validated interval; version/event triggers reevaluation, not automatic override of working/locked task. |
| API08 | GET | `/workflows` | `listWorkflows` | TECHNICIAN, IT_MANAGER, ADMIN | T only effective templates needed for execution; M/A management. |
| API08 | POST | `/workflows` | `createWorkflow` | IT_MANAGER, ADMIN | MA workflow authority. |
| API08 | POST | `/workflows/{id}/versions` | `createWorkflowVersion` | IT_MANAGER, ADMIN | Validated DAG/skills/effort; published version immutable. |
| API08 | POST | `/workflows/{id}/publish` | `publishWorkflow` | IT_MANAGER, ADMIN | Human validates template assumptions; model estimates not sufficient. |
| API09 | GET | `/automation/policies` | `listPolicies` | IT_MANAGER, ADMIN | Current management scope. |
| API09 | POST | `/automation/policies` | `createPolicy` | IT_MANAGER, ADMIN | Grantor derived from session, cannot exceed own authority. Default disabled/deny pending explicit grant. |
| API09 | PATCH | `/automation/policies/{id}` | `updatePolicy` | IT_MANAGER, ADMIN | Versioned rules, no self-grant by AI. |
| API09 | POST | `/automation/policies/{id}/disable` | `disablePolicy` | IT_MANAGER, ADMIN | Immediate effect for next action; queued/running proposals revalidate before commit. |
| API10 | GET | `/automation/runs` | `listRuns` | IT_MANAGER, ADMIN | Scoped/redacted, never arbitrary prompts, secrets or other users chats. |
| API10 | GET | `/automation/runs/{id}` | `getRun` | IT_MANAGER, ADMIN | Scoped/redacted events/actions/errors/usage. |
| API10 | POST | `/automation/runs/{id}/retry` | `retryRun` | IT_MANAGER, ADMIN | Does not repeat succeeded intent or reuse stale approval; budget reserves unknown cost conservatively. |
| API11 | GET | `/approvals` | `listApprovals` | IT_MANAGER, ADMIN | Only currently authorized approver. |
| API11 | GET | `/approvals/{id}` | `getApproval` | IT_MANAGER, ADMIN | Before/after/current snapshot scope; no requester. |
| API11 | POST | `/approvals/{id}/decisions` | `decideApproval` | IT_MANAGER, ADMIN | Decision commits separately from execution. Stale snapshot 409; Approved not Succeeded. |
| API12 | POST | `/assistant/conversations` | `createConversation` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner from session; INTERNAL only scoped IT for linked ticket. |
| API12 | GET | `/assistant/conversations/{id}` | `getConversation` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner only; current source visibility rechecked, revoked content redacted. |
| API12 | DELETE | `/assistant/conversations/{id}` | `deleteConversation` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner only; retention/tombstone D-40; never delete Ticket/Task/audit/idempotency evidence. |
| API12 | POST | `/assistant/conversations/{id}/messages` | `sendAssistantMessage` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | JSON response, no streaming contract yet; own scope/Published KB/ACL/citations. No secret/internal DEMO leakage. |
| API12 | GET | `/assistant/conversations/{id}/messages` | `listConversationMessages` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner only; source ACL/current visibility redacted again when reading history. No other users chats. |
| API13 | POST | `/assistant/ticket-drafts` | `createTicketDraft` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner preview only, no ticket/SLA created yet. |
| API13 | POST | `/assistant/ticket-drafts/{id}/confirm` | `confirmTicketDraft` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Owner digest/version/TTL confirmed; same Ticket service and idempotency, requester from session. |
| API14 | GET | `/knowledge` | `searchKnowledge` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Published and current ACL for reader; no source means no invented citation. |
| API14 | POST | `/knowledge` | `createKnowledgeArticle` | IT_MANAGER, ADMIN | Requires separately granted author permission; D-40 default deny until publisher/author policy approved. |
| API14 | GET | `/knowledge/{id}/versions/{version}` | `getKnowledgeVersion` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Published version AND current article ACL; old citation does not retain revoked access. |
| API14 | POST | `/knowledge/{id}/versions` | `createKnowledgeVersion` | IT_MANAGER, ADMIN | Explicit author/owner permission; no editing immutable Published version. |
| API14 | POST | `/knowledge/{id}/publish` | `publishKnowledge` | IT_MANAGER, ADMIN | Separate publisher/ACL authority pending D-40. MA role alone not sufficient; revoke immediately, index async. |
| API14 | POST | `/knowledge/{id}/access` | `changeKnowledgeAccess` | IT_MANAGER, ADMIN | Separate publisher/ACL authority pending D-40. MA role alone not sufficient; revoke immediately, index async. |
| API15 | GET | `/assets` | `listAssets` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | R assigned-to-self minimal; T related group ticket/own; MA organization. |
| API15 | POST | `/assets` | `createAsset` | IT_MANAGER, ADMIN | MA only; unique code/declared serial. |
| API15 | GET | `/assets/{id}` | `getAsset` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | R self-assigned minimal; T related group ticket/own; related ticket links checked separately. |
| API15 | PATCH | `/assets/{id}` | `updateAsset` | IT_MANAGER, ADMIN | No direct holder/status update via metadata. |
| API15 | POST | `/assets/{id}/assignments` | `assignAsset` | IT_MANAGER, ADMIN | BR-11 state/assignment guards; atomic one active assignment, keep history. AI never directly allocates assets. |
| API15 | GET | `/assets/{id}/assignments` | `listAssetAssignments` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | R only own current assignment, never previous holders; T asset related to current group ticket or own; MA history within authority. |
| API15 | POST | `/assets/{id}/returns` | `returnAsset` | IT_MANAGER, ADMIN | BR-11 state/assignment guards; atomic one active assignment, keep history. AI never directly allocates assets. |
| API15 | POST | `/assets/{id}/transitions` | `transitionAsset` | IT_MANAGER, ADMIN | BR-11 state/assignment guards; atomic one active assignment, keep history. AI never directly allocates assets. |
| API16 | GET | `/notifications` | `listNotifications` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Current recipient only; safe/redacted content if underlying scope revoked. |
| API16 | POST | `/notifications/{id}/read` | `readNotification` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Own recipient only; does not mutate ticket. |
| API16 | GET | `/reports` | `getReports` | IT_MANAGER, ADMIN | MET allowlist, authorized aggregate scope; facts from DB, not model estimates. |
| API16 | GET | `/audit` | `listAudit` | IT_MANAGER, ADMIN | M business scope; A additional user/role/SLA administration; neither arbitrary chat/raw secrets. |
| API17 | GET | `/admin/assistant` | `getAssistantSettings` | ADMIN | Safe status only; no credential read endpoint. |
| API17 | PATCH | `/admin/assistant` | `updateAssistantSettings` | ADMIN | No credential input in chat/API examples; automation policy is distinct MA authority. |
| API18 | GET | `/health/live` | `getHealthLive` | PUBLIC | Minimal status only, no DB/provider hostname/credentials. Ready depends core DB, not provider availability. |
| API18 | GET | `/health/ready` | `getHealthReady` | PUBLIC | Minimal status only, no DB/provider hostname/credentials. Ready depends core DB, not provider availability. |
| API19 | GET | `/sla/policy` | `getSLAPolicy` | ADMIN | Admin configuration; others see own ticket SLA projection. |
| API19 | PATCH | `/sla/policy` | `updateSLAPolicy` | ADMIN | Future tickets only; existing budget snapshots/history unchanged. |
| API04 | GET | `/tickets/{id}/events` | `listTicketEvents` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Public timeline for requester; internal events only scoped IT. Filter before pagination/count. |
| API15 | GET | `/assets/{id}/tickets` | `listAssetTickets` | REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN | Asset access does not grant ticket access; each linked ticket scope checked before count. |
