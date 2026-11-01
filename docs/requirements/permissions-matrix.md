---
id: itoh-docs-requirements-permissions-matrix
title: "Permissions matrix and record scope"
type: reference
domain: security
module: authorization
tags: [security, authorization, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Provide the authoritative feature and read/write scope permissions for each principal."
---

# Permissions matrix and record scope

These are **future backend** requirements. Hiding menus/buttons only supports UX. Requester = R, Technician = T, IT Manager = M, Admin = A. Each user has one role; all can submit personal requests as Requester under [D-01](../decisions/design-decisions.md).

**IT_MANAGER means Head of IT; no separate IT Team Lead role.** AI coordinates under policy; IT Manager sets policies, supervises, intervenes, approves exceptions. Teams group specialists/work scope, not managers. Other department heads submit as Requesters.

## Read scopes

- **Mine:** `requester = current user`, not everyone in the same department.
- **Team:** ticket's current team is among the Technician's active memberships, not merely an assignee ID.
- **All:** M/A within the organization.
- T reading own tickets outside team has only Requester rights, not internal IT access. Workforce plans/traces/approvals are excluded from Requester projections.
- Internal reads/writes require IT rights on that ticket. Employees receive no internal counts/file metadata/excerpts/events.

## Tickets

| Action | R | T | M | A |
| --- | --- | --- | --- | --- |
| Create own ticket | Yes | Yes | Yes | Yes |
| View/search/filter/count | Own | Team + own by view | All | All |
| Public timeline | Own | Team/own | All | All |
| Public comment | Own, not terminated | Team, not terminated; or R rights | Yes | Yes |
| Read/write internal notes | No | Team | Yes | Yes |
| Files | Ticket + parent visibility | Ticket + visibility | Yes | Yes |
| Claim unassigned ticket | No | Active team member | If eligible team member | Same as M |
| Assign others/transfer team | No | No | Yes | Yes |
| New → Open | No | Team | Yes | Yes |
| Open → In Progress | No | Eligible assignee | Valid assignee required | Valid assignee required |
| In Progress → Pending/Resolved; Pending → In Progress | No | Eligible assignee | Yes | Yes |
| Resolved → Closed | Ticket requester | Only if requester | Only if requester | Only if requester |
| Resolved → In Progress | Requester, reason | Only if requester | Reason required | Reason required |
| Closed → In Progress | No | No | Reason required | Reason required |
| Cancel New | Requester | As requester or with M/A permissions | Reason required | Reason required |
| Cancel Open/In Progress/Pending | No | No | Reason required | Reason required |
| Cancel Resolved/Closed/Cancelled | No | No | No | No |
| Change priority | No | No; may suggest in note | Reason required | Reason required |
| Edit/delete sent content or delete ticket | No | No | No | No |

M/A comments are still blocked on Closed/Cancelled. Resolved allows public discussion without automatic reopening. Pending automatically resumes only when the **requester** posts public content, not any commenter.

## Assets, administration, and notifications

| Action | R | T | M | A |
| --- | --- | --- | --- | --- |
| Assigned asset list | Own | Own | Yes | Yes |
| Support asset record | Reduced own-asset view | Team-ticket-related and own assets | All | All |
| Asset-related tickets | Own tickets only | Authorized tickets only | All | All |
| Create/edit/issue/return/change state | No | No | Yes | Yes |
| Link asset at ticket creation | Currently assigned to self | Same as R for personal request | Any eligible asset | Any eligible asset |
| Dashboard | Personal | Personal/team | Organization | Organization |
| Organization reports | No | No | Yes | Yes |
| Users/roles/departments/teams/members/categories/SLA | No | Necessary lookup only | Necessary lookup only | Manage |
| Global audit | No | No | Scoped ticket/asset/workforce/automation business audit | Additional user/role/SLA admin audit under permissions; not all chats |
| Notifications/read state | Own only | Own only | Own only | Own only |
| Profile/password | Own | Own | Own | Own |

No employee-directory endpoint/menu for Requesters; forms get minimal reference data. Technicians cannot inspect unrelated assignment histories by changing IDs.

## Mid-session permission changes

Team transfers revoke old-team T access on the next request; new teams can read needed internal history. Old notifications do not preserve sensitive previews; links recheck rights. If access is lost while composing, preserve user input in memory on the error screen without more server data, allowing copying of the user's own text.

Membership removal/account locking/role loss revokes immediately without deleting history. Active assignees must remain eligible IT/team members. Admin consistently hands over/unassigns open tickets/tasks subject to state; In Progress/Pending needs a valid replacement. Resolved/Closed retain historical assignees; M/A reassigns before reopening if needed [D-12](../decisions/design-decisions.md).

## UX response conventions

Unauthenticated/expired → login. Role-prohibited function → 403. Missing/out-of-scope record/file → generic 404, “Not found or you do not have access.” Do not reveal ticket/creator names in errors. Behavior contract only, not implemented APIs.

## Tasks, workforce, automation, and KB

| Action | R | T | M | A | AI_COORDINATOR |
| --- | --- | --- | --- | --- | --- |
| Internal tasks/plans | No | Current team | Management scope | Business scope | Policy/grant/service scope |
| Progress/remaining/results | No | Assigned task, valid state/dependencies | Authorized intervention with reason | Same as M | No autonomous Done/technical result |
| Assign/reassign/lock | No | No assigning others | Yes, skills/schedule/load checks | Same as M | Granted actions only; in-progress/lock needs approval |
| Schedules/skills/load | No | Self/minimal task-related team lookup | Managed IT department | Business permissions | Minimum policy candidate-selection data |
| Verify skills/schedules/capacity | No | No self-verification | Yes | M permissions | No |
| Workflows/templates/policies | No | Execution-required version | Audited manage/publish/enable/disable | M permissions | Read effective scope; no self-grants |
| Approve exception | No | Propose/add scoped evidence | Authorized, snapshot recheck | M permissions | Propose only, no self-approval |
| Run/action traces | No | Required work information, not global payloads | Scoped/redacted traces | Authorized operations metadata, not all chats | Run/service scope |
| Retry/re-evaluate | No | Request within scope | Audited; no repeat successful intent | M permissions | Bounded retry/current policy |
| KB read/search/citations | Own Published + ACL | Own Published + ACL | ACL | ACL, no default all-content access | Current Published/ACL/service scope |
| KB drafts/edit/publish/ACL | Not by default | Separately granted author rights if approved | Publisher/owner policy to decide | Technical admin without ACL bypass | No autonomous publishing/ACL edits |
| Assistant disable/provider configuration | No | No | Disable automation through policy, not system credentials | System availability configuration | No |

AI_COORDINATOR is a service principal, not a fifth login role. An action grant is not blanket record access. Chat cannot borrow service identity to elevate Requesters. Automation approvals do not replace D-29 IT-role authorization; AI cannot create users/roles.

Account/membership/skills/policy/KB revocation applies to the next request/action and emits affected-task evaluation events. Do not assign new work to someone who lost rights during a model call. Requester errors/notifications/reports expose no internal titles/counts/arguments/sources/plans.

## Shared AI Workspace — D-42

One shell changes no permissions. Assistant cards dispatch under the current user through the matching API; activity uses domain scope, not others' chats. R has no internal runs/candidates/policies/approvals; T cannot assign others; M cannot administer users. A provisions users/roles only through D-29 checks/secure forms, not autonomous model execution. Public/notes stay separate. Done/Resolved/Closed require authorized human confirmation, never model inference. Sessions cannot borrow AI_COORDINATOR to elevate rights.
