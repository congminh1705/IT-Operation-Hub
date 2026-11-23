# FE-18.03 — Phase A frontend/API handoff

## Scope and verification

The Phase A deliverable is a Next.js frontend DEMO for Requester, Technician, IT Manager and Admin. HTTP operations below come from the repository [OpenAPI draft](../../../api/openapi.json) and [operation catalog](../../../api/operations.md). They are the proposed integration targets. Account operations use the typed adapter; domain screens currently call typed local functions in the per-mount session and fixtures. The DEMO sends no domain HTTP requests. A matching endpoint or DTO in the matrix indicates a service mapping, not wire compatibility or a running endpoint.

- [FE-18.01 coverage and app/reference pairs](../FE-18.01/coverage.md) maps 51 reference specimens to native routes/interactions. Four roles visited 50 combined sidebar entries. [Coverage comparison](../FE-18.01/comparison.md) records inherited dashboard and KPI differences. The original story-to-task crosswalk remains in [implementation coverage](../../coverage.md).
- [FE-18.02 runtime checks](../FE-18.02/full-browser.log) and [serial rerun](../FE-18.02/final-rerun.log) cover 310 unique Chrome cases. The full run passed 308; two reference timeouts passed on rerun. 114 unit tests, TypeScript, production build, an isolated-source build and scoped formatting passed. [Login and states comparison](../FE-18.02/comparison.md).
- FE-18.03 is a contract and handoff task. The [catalog](../../../design/final/index.html) was opened in Chrome as the reference index. Visual evidence is the existing actual/reference pairs for the affected FE-18 surfaces. PO confirmed joint FE-18 acceptance. The FE-18 Parent merge is pending.

## Adapter and outcome rules

[SessionStore](../../../../src/frontend/src/features/auth/session-store.ts) creates the synthetic stores and fences results with a session epoch. [WorkspaceEntry](../../../../src/frontend/src/features/auth/workspace-entry.tsx) routes after login, uses scoped screens via WorkspacePage, and strips unsafe return targets. [QueryClient](../../../../src/frontend/src/lib/api/query-client.ts) keys reads by actor/version/effective scope and clears or aborts cached reads on identity changes. The registered ticket list polls every 30 seconds only when visible and focused. Other views currently use their own fixture read lifecycle. Confirmations never run from a background read.

| Contract state | Frontend behavior and integration obligation |
| --- | --- |
| HTTP 200, 201 or 204 from a confirmed operation | Render the returned projection; refresh affected reads only after confirmed effect. Never derive an effect from a UI preview. |
| HTTP 202 or local pending | Queue or processing state. Keep acknowledged/approved distinct from successful domain execution. Read/reconcile the operation state. |
| Unknown transport result or network response lost | Keep safe draft and show unconfirmed outcome. Reconcile by operation/record/idempotency key before enabling a repeat. |
| 401, expired or revoked identity | Clear private DOM, drafts/cache scoped to the session and reject late results. Return through the known local route allowlist. Draft OpenAPI login omits 401 although DEMO distinguishes invalid credentials; settle with PRE-01/INT-01. |
| 403 / 404 | Denied feature or generic missing/out-of-scope record. Render scoped feedback without returning the restricted body. |
| 409 or stale version/snapshot | Preserve draft as allowed, reload current safe projection and ask for fresh confirmation; no overwrite or invisible retry. |
| 413 / 422 | Enforce bounded file/form limits in the UI; use field-addressed errors where available and focus the first invalid control with draft intact. |
| 429 / 503 / unexpected failure | Show quota or unavailable explicitly. Read retry is separate from mutating retry; manual paths remain available where authorized. |

Version boundaries are the current record version for entity writes and an immutable version/snapshot token for proposals, approvals, policies, templates and SLA budgets. API drafts use `expectedVersion` or domain-specific request schemas listed below. Preserve the exact edited preview, applicable version, reason and affected record IDs through confirmation. Browser-visible DEMO values use synthetic IDs, fixture dates and GMT+7 displays. The mock clock, state, access rules, budgets and metric windows are not production policy. No passwords, session secrets, raw attachment bytes or private prompts belong in evidence. Repeated read/mutation attempts must use the operation's confirmed identity and idempotency contract.

## Deferred decisions and first eligible work

| Decision owner | Decisions to settle before consumers |
| --- | --- |
| [PRE-01](../../00-decisions.md#pre-01) | Bootstrap, identity/session lifecycle, CSRF/origin and error mapping, emergency revoke/handover, canonical IDs, field/nullability and transaction/idempotency boundaries. |
| [PRE-02](../../00-decisions.md#pre-02) | Workforce intervals, timezone and working budgets, skill verifiers, scope grants, published templates, approval/retry and concurrency rules. |
| [PRE-03](../../00-decisions.md#pre-03) | KB ACL and publisher rights, provider/model/embedding, retention/limits, index recency and sensitive response shaping. |
| [PRE-04](../../00-decisions.md#pre-04) | Deployment ownership, monitoring, restore/recovery targets and measurable acceptance. |
| [INT-01–06](../../07-integration.md) | Replace adapters by module with reviewed services. Keep fixture and real configuration explicit, verify actual scopes and mutations, and validate timing/concurrency at the relevant service boundary. |

Full unresolved source is [D-40](../../../decisions/design-decisions.md#d-40--open-decisions). Real service, DB/transaction, security, worker, model/RAG, backup and production gates remain unrun in FE-18. After FE-18 joint acceptance and Parent PR merge, PRE-01.01 is the first planned decision task, subject to separate PO authorization. Phase A closes after FE-18 merge and recorded exit verification.

GitHub verified all prior Parent PRs merged into `main`. FE-01 → #1, FE-02 → #3, FE-03 → #4, FE-04 → #5, FE-05 → #6 with closure record #7, FE-06 → #8, FE-07 → #9, FE-08 → #10, FE-09 → #11, FE-10 → #12, FE-11 → #13, FE-12 → #14, FE-13 → #15, FE-14 → #16, FE-15 → #17, FE-16 → #18, FE-17 → #19. FE-17's merge `4c71825` is in the current phase branch.

## Endpoint/DTO crosswalk

Paths are relative to `/api/v1`. Request and success response names are from the exact OpenAPI operations. HTTP error responses listed here reference the draft's declared statuses; use the shared UI handling above. The section for each tag names the source implementation and the version/confirmation mapping. A dash denotes no declared JSON/multipart body or no declared response DTO.

### Authentication · FE-03

[login-form.tsx](../../../../src/frontend/src/features/auth/login-form.tsx) · [session-store.ts](../../../../src/frontend/src/features/auth/session-store.ts) · [types.ts](../../../../src/frontend/src/lib/api/types.ts) · [gateway.ts](../../../../src/frontend/src/lib/demo/gateway.ts)

`LoginInput`, `UserView`, `ProfileUpdate`, `PasswordChange` use the handwritten `AccountGateway`. Login is a fresh fixture session. Profile saves the current version. Password change requires current-password confirmation and resets the session in DEMO. CSRF and actual cookies belong to the service.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /auth/csrf` | `getCsrf` | — | 200 `Csrf` | 403, 422, 429, 503 |
| `POST /auth/login` | `login` | `Login` | 200 `UserView` | 403, 422, 429, 503 |
| `POST /auth/logout` | `logout` | — | 204 — | 401, 403, 404, 409, 422, 429, 503 |
| `GET /auth/me` | `getCurrentUser` | — | 200 `UserView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /auth/profile` | `updateOwnProfile` | `ProfileUpdate` | 200 `UserView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /auth/password` | `changeOwnPassword` | `PasswordChange` | 204 — | 401, 403, 404, 409, 422, 429, 503 |

### Administration · FE-04

[users-screen.tsx](../../../../src/frontend/src/features/administration/users-screen.tsx) · [user-directory.ts](../../../../src/frontend/src/lib/demo/user-directory.ts) · [organization-catalog.ts](../../../../src/frontend/src/lib/demo/organization-catalog.ts) · [team-directory.ts](../../../../src/frontend/src/lib/demo/team-directory.ts)

Provisioning requires the verified DEMO request and a preview. Access/role/membership changes review impact, confirm the selected change and reject stale or ineligible states. Lookups are restricted projections. Real bootstrap, atomic handover and emergency revoke are PRE-01 decisions.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /users` | `listUsers` | — | 200 `UserViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /users` | `createUser` | `UserCreate` | 201 `UserView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /users/{id}` | `getUser` | — | 200 `UserView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /users/{id}` | `updateUser` | `UserUpdate` | 200 `UserView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /departments` | `listDepartments` | — | 200 `NamedViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /departments` | `createDepartment` | `NamedCreate` | 201 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /departments/{id}` | `getDepartment` | — | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /departments/{id}` | `updateDepartment` | `NamedUpdate` | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /teams` | `listTeams` | — | 200 `NamedViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /teams` | `createTeam` | `NamedCreate` | 201 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /teams/{id}` | `getTeam` | — | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /teams/{id}` | `updateTeam` | `NamedUpdate` | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /categories` | `listCategorys` | — | 200 `NamedViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /categories` | `createCategory` | `NamedCreate` | 201 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /categories/{id}` | `getCategory` | — | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /categories/{id}` | `updateCategory` | `NamedUpdate` | 200 `NamedView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /teams/{id}/members` | `listTeamMembers` | — | 200 `UserViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /teams/{id}/members` | `setTeamMembership` | `MemberCommand` | 200 `Reference` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /lookups` | `listAllowedLookups` | — | 200 `NamedViewPage` | 401, 403, 404, 409, 422, 429, 503 |

### Tickets · FE-05 / FE-06

[ticket-form.tsx](../../../../src/frontend/src/features/tickets/intake/ticket-form.tsx) · [ticket-list.tsx](../../../../src/frontend/src/features/tickets/intake/ticket-list.tsx) · [ticket-detail.tsx](../../../../src/frontend/src/features/tickets/intake/ticket-detail.tsx) · [ticket-intake.ts](../../../../src/frontend/src/lib/demo/ticket-intake.ts)

Create previews the actual draft; one idempotent confirmation creates the ticket. Transition and assignment recheck actor, current version and reason. Priority derives from impact/urgency and SLA retains elapsed time. `TKT-*` is a DEMO code; endpoints must use the authorized canonical identifier.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /tickets` | `listTickets` | — | 200 `TicketViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets` | `createTicket` | `TicketCreate` | 201 `TicketPublic` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /tickets/{id}` | `getTicket` | — | 200 `TicketView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/transitions` | `transitionTicket` | `TicketTransition` | 200 `TicketView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/assignment` | `assignTicket` | `TicketAssignment` | 200 `TicketView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/priority` | `changeTicketPriority` | `PriorityCommand` | 200 `TicketView` | 401, 403, 404, 409, 422, 429, 503 |

### Ticket content · FE-06 / FE-07

[ticket-reply-composer.tsx](../../../../src/frontend/src/features/tickets/intake/ticket-reply-composer.tsx) · [ticket-attachment-downloads.tsx](../../../../src/frontend/src/features/tickets/intake/ticket-attachment-downloads.tsx) · [ticket-attachments.ts](../../../../src/frontend/src/lib/demo/ticket-attachments.ts) · [ticket-intake.ts](../../../../src/frontend/src/lib/demo/ticket-intake.ts)

Public/internal audiences are separate. A public human IT reply can record first response; a note cannot. Per-file upload tracks committed, failed and unconfirmed outcomes, then reconciles before retry. Download rechecks authorized audience and returns synthetic content. Object storage, streaming, original bytes and real server enforcement are later work.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /tickets/{id}/comments` | `listTicketComments` | — | 200 `CommentViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/comments` | `createTicketComment` | `CommentCreate` | 201 `CommentView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/attachments` | `uploadTicketAttachment` | `AttachmentUpload` | 201 `AttachmentView` | 401, 403, 404, 409, 422, 429, 503, 413 |
| `GET /attachments/{id}/download` | `downloadAttachment` | — | 200 string | 401, 403, 404, 409, 422, 429, 503 |
| `GET /tickets/{id}/events` | `listTicketEvents` | — | 200 `TicketEventViewPage` | 401, 403, 404, 409, 422, 429, 503 |

### Plans · FE-08 / FE-10

[work-plan.ts](../../../../src/frontend/src/lib/demo/work-plan.ts) · [work-board.tsx](../../../../src/frontend/src/features/work/work-board.tsx) · [automation-workflow.ts](../../../../src/frontend/src/lib/demo/automation-workflow.ts)

DEMO presents effective/history plans and staged orchestration. Proposal and activation operations belong to service integration. Revalidate plan version, dependency DAG and source semantics before activation. A candidate plan never dispatches work by itself.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /tickets/{id}/plans` | `listTicketPlans` | — | 200 `PlanViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /plans/{id}/versions` | `listPlanVersions` | — | 200 `PlanViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tickets/{id}/plan-proposals` | `proposePlan` | `ProposalCommand` | 202 `Accepted` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /plans/{id}/activate` | `activatePlan` | `VersionCommand` | 200 `PlanView` | 401, 403, 404, 409, 422, 429, 503 |

### Tasks · FE-08 / FE-15

[work-board.tsx](../../../../src/frontend/src/features/work/work-board.tsx) · [work-board.ts](../../../../src/frontend/src/lib/demo/work-board.ts) · [assistant-intents.ts](../../../../src/frontend/src/lib/demo/assistant-intents.ts)

Read task and scope independently of ticket state. Progress and Done keep version, result and remaining minutes. Human assignment/lock uses an impact preview and reason; dependency and conflict guards block without replacing the draft.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /tasks` | `listTasks` | — | 200 `TaskViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /tasks/{id}` | `getTask` | — | 200 `TaskView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tasks/{id}/transitions` | `transitionTask` | `TaskTransition` | 200 `TaskView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tasks/{id}/progress` | `updateTaskProgress` | `ProgressCommand` | 200 `TaskView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tasks/{id}/assignment` | `assignTask` | `TaskAssignment` | 200 `TaskView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /tasks/{id}/assignment-lock` | `lockTaskAssignment` | `LockCommand` | 200 `TaskView` | 401, 403, 404, 409, 422, 429, 503 |

### Workforce · FE-09

[workforce-screen.tsx](../../../../src/frontend/src/features/workforce/workforce-screen.tsx) · [workforce.ts](../../../../src/frontend/src/lib/demo/workforce.ts)

Use `workforceProjection` for scoped reads. Edit and absence previews carry a snapshot; confirm persists the workforce change and leaves downstream evaluation pending. Slot, work-hours, skill verification and capacity defaults remain PRE-02/D-40.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /workforce` | `listWorkforce` | — | 200 `WorkforceViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /workforce/{id}` | `getWorkforce` | — | 200 `WorkforceView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /workforce/{id}` | `updateWorkforce` | `WorkforceUpdate` | 200 `WorkforceView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /workforce/{id}/absences` | `recordAbsence` | `AbsenceCreate` | 201 `Reference` | 401, 403, 404, 409, 422, 429, 503 |

### Workflows · FE-10

[automation-screen.tsx](../../../../src/frontend/src/features/automation/automation-screen.tsx) · [automation-workflow.ts](../../../../src/frontend/src/lib/demo/automation-workflow.ts)

Validate template/DAG and keep earlier published versions immutable. Preview then explicitly publish the reviewed version. Synthetic templates and limits require business confirmation before enabling the real service.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /workflows` | `listWorkflows` | — | 200 `WorkflowViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /workflows` | `createWorkflow` | `WorkflowCreate` | 201 `WorkflowView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /workflows/{id}/versions` | `createWorkflowVersion` | `WorkflowVersion` | 201 `WorkflowView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /workflows/{id}/publish` | `publishWorkflow` | `VersionCommand` | 200 `WorkflowView` | 401, 403, 404, 409, 422, 429, 503 |

### Automation policies · FE-10

[automation-screen.tsx](../../../../src/frontend/src/features/automation/automation-screen.tsx) · [automation-policy.ts](../../../../src/frontend/src/lib/demo/automation-policy.ts)

Existing scope, allowed actions and limits are explicit. Preview cancellation leaves state unchanged. Confirmation enables, disables or saves only the reviewed policy; a policy is not an execution result.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /automation/policies` | `listPolicies` | — | 200 `PolicyViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /automation/policies` | `createPolicy` | `PolicyCreate` | 201 `PolicyView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /automation/policies/{id}` | `updatePolicy` | `PolicyUpdate` | 200 `PolicyView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /automation/policies/{id}/disable` | `disablePolicy` | `VersionCommand` | 200 `PolicyView` | 401, 403, 404, 409, 422, 429, 503 |

### Runs · FE-10 / FE-11

[automation-activity.tsx](../../../../src/frontend/src/features/automation/automation-activity.tsx) · [automation-activity.ts](../../../../src/frontend/src/lib/demo/automation-activity.ts)

Run states are projected and scoped. Read is side-effect-free. Retry requires a deliberate confirmation and current eligibility. Queueing/retrying are distinct from execution success; real worker/state reconciliation belongs to B/C.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /automation/runs` | `listRuns` | — | 200 `RunViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /automation/runs/{id}` | `getRun` | — | 200 `RunView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /automation/runs/{id}/retry` | `retryRun` | `VersionCommand` | 202 `Accepted` | 401, 403, 404, 409, 422, 429, 503 |

### Approvals · FE-11

[approval-proposal.tsx](../../../../src/frontend/src/features/automation/approval-proposal.tsx) · [approval-proposal.ts](../../../../src/frontend/src/lib/demo/approval-proposal.ts) · [approval-decisions.ts](../../../../src/frontend/src/lib/demo/approval-decisions.ts)

Review before/after and evidence. Confirm decision and reason only after version and scope recheck. Approved, queued, failed and succeeded remain distinct. Stale, revoked or infeasible retains draft where permitted, with no execution.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /approvals` | `listApprovals` | — | 200 `ApprovalViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /approvals/{id}` | `getApproval` | — | 200 `ApprovalView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /approvals/{id}/decisions` | `decideApproval` | `ApprovalDecision` | 200 `ApprovalView` | 401, 403, 404, 409, 422, 429, 503 |

### Assistant · FE-14 / FE-15

[assistant-workspace.tsx](../../../../src/frontend/src/features/assistant/assistant-workspace.tsx) · [assistant.ts](../../../../src/frontend/src/lib/demo/assistant.ts) · [assistant-intents.ts](../../../../src/frontend/src/lib/demo/assistant-intents.ts)

Conversation projection is owner-specific; input retained on cancellation, quota or network error. Cards select allowed routes/forms. Scope is rechecked for citations and domain targets. No execution from text alone, real provider connection or access to other users' chats.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `POST /assistant/conversations` | `createConversation` | `ConversationCreate` | 201 `ConversationView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /assistant/conversations/{id}` | `getConversation` | — | 200 `ConversationView` | 401, 403, 404, 409, 422, 429, 503 |
| `DELETE /assistant/conversations/{id}` | `deleteConversation` | — | 204 — | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assistant/conversations/{id}/messages` | `sendAssistantMessage` | `AssistantMessage` | 200 `AssistantResult` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /assistant/conversations/{id}/messages` | `listConversationMessages` | — | 200 `AssistantResultPage` | 401, 403, 404, 409, 422, 429, 503 |

### Ticket confirmation · FE-15

[assistant-actions.tsx](../../../../src/frontend/src/features/assistant/assistant-actions.tsx) · [assistant-intents.ts](../../../../src/frontend/src/lib/demo/assistant-intents.ts) · [ticket-intake.ts](../../../../src/frontend/src/lib/demo/ticket-intake.ts)

The confirmed native form is the effect boundary in DEMO. Exact edited content and current revision go to preview and confirmation. Production draft IDs, expiry, version/idempotency and audit need reviewed mapping; unsupported intent uses the named manual surface.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `POST /assistant/ticket-drafts` | `createTicketDraft` | `DraftCreate` | 201 `DraftView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assistant/ticket-drafts/{id}/confirm` | `confirmTicketDraft` | `DraftConfirm` | 201 `TicketPublic` | 401, 403, 404, 409, 422, 429, 503 |

### Knowledge · FE-13

[knowledge-screen.tsx](../../../../src/frontend/src/features/knowledge/knowledge-screen.tsx) · [knowledge.ts](../../../../src/frontend/src/lib/demo/knowledge.ts)

Published content, version, grant and source index are independent. Author save does not publish; publishers explicitly preview access changes. Revoked content/source and citations disappear. ACL grant model, embedding and index freshness remain PRE-03/D-40.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /knowledge` | `searchKnowledge` | — | 200 `KnowledgeViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /knowledge` | `createKnowledgeArticle` | `KnowledgeCreate` | 201 `KnowledgeView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /knowledge/{id}/versions/{version}` | `getKnowledgeVersion` | — | 200 `KnowledgeView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /knowledge/{id}/versions` | `createKnowledgeVersion` | `KnowledgeVersionCreate` | 201 `KnowledgeView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /knowledge/{id}/publish` | `publishKnowledge` | `VersionCommand` | 200 `KnowledgeView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /knowledge/{id}/access` | `changeKnowledgeAccess` | `KnowledgeACLCommand` | 200 `KnowledgeView` | 401, 403, 404, 409, 422, 429, 503 |

### Assets · FE-12

[asset-screen.tsx](../../../../src/frontend/src/features/assets/asset-screen.tsx) · [assets.ts](../../../../src/frontend/src/lib/demo/assets.ts)

Role-scoped catalog/detail/history and ticket picker. Metadata edits preview and compare version; issue, return, repair and retire confirm candidate and allowed state. At most one active assignment. DEMO does not settle reservation or storage policies.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /assets` | `listAssets` | — | 200 `AssetViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assets` | `createAsset` | `AssetCreate` | 201 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /assets/{id}` | `getAsset` | — | 200 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /assets/{id}` | `updateAsset` | `AssetUpdate` | 200 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assets/{id}/assignments` | `assignAsset` | `AssetAssign` | 200 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /assets/{id}/assignments` | `listAssetAssignments` | — | 200 `AssetAssignmentViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assets/{id}/returns` | `returnAsset` | `AssetReturn` | 200 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /assets/{id}/transitions` | `transitionAsset` | `AssetTransition` | 200 `AssetView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /assets/{id}/tickets` | `listAssetTickets` | — | 200 `TicketViewPage` | 401, 403, 404, 409, 422, 429, 503 |

### Operations · FE-16 / FE-17

[notifications-screen.tsx](../../../../src/frontend/src/features/monitoring/notifications-screen.tsx) · [audit-screen.tsx](../../../../src/frontend/src/features/monitoring/audit-screen.tsx) · [organization-reports.tsx](../../../../src/frontend/src/features/reports/organization-reports.tsx) · [notifications.ts](../../../../src/frontend/src/lib/demo/notifications.ts) · [audit.ts](../../../../src/frontend/src/lib/demo/audit.ts) · [organization-metrics.ts](../../../../src/frontend/src/lib/demo/organization-metrics.ts)

Own notifications preserve first read time and recheck current target scope. Reports derive authorized populations and local date windows; unknown and unconfirmed stay explicit. Audit is projected metadata, with business and Admin SLA/identity views. Live notification delivery and audit retention stay with real service owners.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /notifications` | `listNotifications` | — | 200 `NotificationViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `POST /notifications/{id}/read` | `readNotification` | — | 200 `NotificationView` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /reports` | `getReports` | — | 200 `ReportViewPage` | 401, 403, 404, 409, 422, 429, 503 |
| `GET /audit` | `listAudit` | — | 200 `AuditViewPage` | 401, 403, 404, 409, 422, 429, 503 |

### Assistant administration · FE-14

[assistant-settings.tsx](../../../../src/frontend/src/features/assistant/assistant-settings.tsx) · [assistant-availability.ts](../../../../src/frontend/src/lib/demo/assistant-availability.ts)

Admin-only versioned synthetic configuration controls availability independently of workflow activation. Unavailable generation keeps manual routes. Credentials, provider approval, quotas and spend remain in PRE-03 and later real acceptance.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /admin/assistant` | `getAssistantSettings` | — | 200 `AssistantSettings` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /admin/assistant` | `updateAssistantSettings` | `AssistantSettingsUpdate` | 200 `AssistantSettings` | 401, 403, 404, 409, 422, 429, 503 |

### Health · Phase B

[gateway.ts](../../../../src/frontend/src/lib/api/gateway.ts)

Service probes have no product route or DEMO HTTP implementation. Deployment owners define real health/readiness checks; Phase A only verifies the local frontend process is serving.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /health/live` | `getHealthLive` | — | 200 `Health` | 403, 422, 429, 503 |
| `GET /health/ready` | `getHealthReady` | — | 200 `Health` | 403, 422, 429, 503 |

### SLA · FE-04 / FE-06

[sla-screen.tsx](../../../../src/frontend/src/features/administration/sla-screen.tsx) · [sla-policy.ts](../../../../src/frontend/src/lib/demo/sla-policy.ts) · [ticket-sla.ts](../../../../src/frontend/src/lib/demo/ticket-sla.ts)

Admin confirms versioned budgets. A new default applies to new tickets; existing ticket snapshots, elapsed clocks and separate response/resolution are preserved. SLA decisions and actual timing/storage integrity are later service checks.

| Method and path | Operation ID | Request DTO | Success response DTO | Draft error codes |
| --- | --- | --- | --- | --- |
| `GET /sla/policy` | `getSLAPolicy` | — | 200 `SLAPolicyView` | 401, 403, 404, 409, 422, 429, 503 |
| `PATCH /sla/policy` | `updateSLAPolicy` | `SLAUpdate` | 200 `SLAPolicyView` | 401, 403, 404, 409, 422, 429, 503 |
