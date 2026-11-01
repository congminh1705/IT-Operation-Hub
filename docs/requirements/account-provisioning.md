---
id: itoh-docs-requirements-account-provisioning
title: "Internal account provisioning"
type: reference
domain: domain
module: identity
tags: [domain, identity, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Specify department-head requests and Admin verification/account creation."
---

# Internal account provisioning

**Business flow confirmed on 30 October 2026 — D-29.** A specification for future implementation; no running account-creation system exists.

**Department heads submit provisioning tickets in IT Operations Hub; IT Admin verifies and creates users under Administration → Users.** Heads use existing Requester accounts. Four existing roles remain; no public signup.

## Responsibilities and scope

| Participant | Responsibility |
| --- | --- |
| Department head | Sign in, submit account request, provide details, accept result |
| Authorized internal approver | Confirm Technician/IT Manager/Admin access under enterprise policy; Admin records valid outcome on ticket |
| IT Admin | Verify, create user, select department/role, hand over credentials, lock when needed |
| User | Receive account, sign in, use authorized profile/password functions |
| Authorized implementer | Bootstrap the first Admin during setup |

Department head is an organization title, not a new app role or necessarily IT Manager. Requester role/same department does not prove authority; Admin verifies organizational responsibility.

Account categories are not restricted entirely to department heads: anyone may request ordinary account support. New-person provisioning must be verified as a valid department-head request. Ticket text/Requester rights do not create users.

## Provisioning flow

1. Head signs in and selects **Create request → Service request → Account category**; example title: “Create an account for a new employee.”
2. Description includes employee name, work email, department, access needs, optional start date. No password. Head remains requester; employee is the provisioning subject, not replacement requester.
3. Existing intake/assignment/handling applies. Admin verifies requester/personnel/unique email/active department. Missing information is discussed; Pending requires valid state and public question.
4. Default role **Requester**. Technician/IT Manager/Admin requires authorized approval recorded by Admin before creation. Heads cannot grant roles.
5. Admin alone creates under **Administration → Users**, entering the D-16 initial password. Team membership is separate; Technician does not join all teams. Tickets never automatically create users.
6. Admin sends app address/login email/initial password through an enterprise channel. No passwords in tickets/internal notes/solutions/notifications; no automatic email without configured provider.
7. IT records the solution/Resolved through valid transitions; the requesting head accepts closure or requests further work. Employee signs in and may use existing password change.

Reuse current ticket forms/descriptions; no provisioning-request entity or approval ticket status. Automation approval is separate from Admin/IT-role authorization. Start date is descriptive, not a new mandatory User field/activation schedule. SLA starts at ticket creation; user creation does not transition/close tickets.

## Passwords and first Admin

- Admin enters initial passwords; the app never returns stored passwords or redisplays them after creation. No audit/log/ticket/notification inclusion.
- Handover follows enterprise channels. Password/forgotten-password policies need M1 refinement; no unsolicited email reset.
- An authorized implementer bootstraps first Admin; technical method remains M1. No public default production credentials.
- After bootstrap, Admin creates initial department-head accounts from the verified enterprise list so they can submit future provisioning tickets.
- Later Admin accounts follow account management/role approval. Never lock the last active Admin.

## Departure or access termination

Head submits a service request naming the account; Admin verifies/locks/revokes sessions. Handle open-ticket handover and asset returns through existing flows. Do not delete historical accounts; unlocking does not restore old sessions.

## Designs and illustrative data

| v0.6 design | Screen | Snapshot / meaning |
| --- | --- | --- |
| [Requester](../design/wireframes/16-dashboard-requester.svg) | SCR10 | Linh DEMO personal data; Pending reply and Resolved acceptance |
| [Admin](../design/wireframes/17-dashboard-admin.svg) | SCR12/SCR60 | TKT-000123 account provisioning differs from TKT-000125 login support |
| [Provisioning ticket](../design/wireframes/18-ticket-account-provisioning.svg) | SCR22 → SCR60 | DEMO head is requester; employee remains description content |
| [Create-user form](../design/wireframes/27-admin-user-create.svg) | SCR60 | Employee DEMO B, demo-b@example.invalid; default Requester; empty password |

All fictitious, not seeds/queries/app screenshots. Do not explain current figures using v0.4 names/timelines/KPIs. TKT-000123 authority requires Admin verification; opening a form creates no user; creating a user does not resolve/close the ticket. Requester accepts under BR-04.

TKT-000124 onboarding/absence snapshots are separate from TKT-000123. See [v0.6 dataset](../design/visual-refresh.md). Implemented metrics use the [metrics catalog](metrics-catalog.md), not image sample counts.

## Planned acceptance checks

Clarifies **UC10/US13/AC13** for head submission and **UC05/US05/AC05** for Admin creation, reusing UC04, UC07, and UC15 and current resolution/closure. D-29 keeps core IDs; OPS adds coordination without provisioning permissions/new ticket states.

- Only Admin creates; direct Requester/Technician/IT Manager API calls are denied.
- Default Requester; unique email, valid role, active department.
- Head submits as Requester; submission creates only a ticket. Admin verifies authority/records outcome; invalid requests are not provisioned.
- IT roles require authorized approval; role changes remain audited.
- Requesting head closes/reopens under valid states; employee never becomes ticket requester.
- No password in responses/lists/audit/notifications; no automatic unconfigured email.
- Lock revokes sessions/preserves history; last Admin protected.

Not run on an application. See [permissions](permissions-matrix.md), [business rules](business-rules.md), [UC05](../03-use-cases.md), [decisions](../decisions/design-decisions.md).

## Onboarding and AI coordination

AI may break down/assign/monitor a verification/provisioning task to an authorized person in an approved workflow, remind, and escalate; **it cannot call user-creation/role-change tools or hand over passwords**. Backend checks Admin rights at creation; task assignment does not grant a Technician administration rights. Candidates must meet action authorization and skills/team/schedule/capacity.

IT_MANAGER policy/operational exception authority differs from a requesting department head. Automation approval does not replace IT-role approval evidence or close tickets. Performer records results; requester accepts under BR-04. Task/plan rules are BR-14–18. No executable code/API is created in this documentation phase.
