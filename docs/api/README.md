---
id: itoh-api-contract
title: "OpenAPI Document"
type: reference
domain: api
module: contracts
tags: [api, contracts, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define the OpenAPI contract, security, DEMO examples, and verification conditions."
---

# OpenAPI Document

**Static design contract; no API server, generated client, or API test results exist.** The [OpenAPI 3.1.1 JSON](openapi.json) follows the reference repository's contract-first approach while retaining FastAPI/Pydantic and existing JSON schemas. It is not a runtime export.

## Scope and status

| Topic | Artifact / outcome |
| --- | --- |
| Machine-readable contract | [openapi.json](openapi.json): 74 paths, 96 operations, 96 schemas |
| Traceability | [Operation catalog](operations.md): API01–19 → operationId/method/path/role/scope; UC/BR in the source catalog |
| Rules, TX, events | [API design](../technical/api-design.md): internal EVT01–17 are not HTTP routes |
| Business rules/permissions | [BR](../requirements/business-rules.md), [permissions](../requirements/permissions-matrix.md) |
| Authority | Project-owner review; detailed contract remains design-draft, not self-approved |

## Authentication, concurrency, and errors

PostgreSQL sessions with HttpOnly cookies; proposed cookie name itoh_session requires review, not JWT/localStorage. Login obtains pre-session CSRF and sends X-CSRF-Token. Mutations use CSRF/Origin and idempotency; GET does not change domain state. Backend supplies principal/role/grantor; public APIs accept neither forged requesters nor service identities. DTOs reject undeclared fields.

Versioned mutations use expectedVersion. The same idempotency key/digest returns the prior result; a different digest returns 409. In-flight requests do not call providers or apply effects twice; key lifetimes/retries remain D-40.201 means committed resource, 202 background acceptance only, 200 synchronous results, 204 logout/password change/chat deletion. Approval decisions have separate execution_status. Asset/task allocation remains atomic in domain services.

Error envelope: code/message/field_errors/request_id; 401/403/scoped 404/409/422/429/503. Missing/out-of-scope records share the same 404 message. Oversized files return 413. Lists use items/page/page_size/total after scope; page default 1, page_size 20, maximum 100. Timestamps are UTC with offsets; no secrets in URLs/logs/errors.

## Projections and refinement needs

TicketPublic excludes workforce plans/approvals/notes. TicketInternal is scoped to IT; separate response schemas avoid loading private data then hiding it client-side. Technician workforce access is self/minimal lookup; Admin has no blanket chat access. Assistant conversations belong to their owners; KB uses Published/current ACL. Retention/chat deletion does not delete business/audit/idempotency records. M/A require separately granted KB author/publisher rights; default deny until D-40 is resolved.

Two routes clarify existing UCs: PATCH /auth/profile (UC03, own display/contact details) and GET /lookups (minimum form data, not an employee directory). Profile/lookup naming, DTO enums, cookie names, limits, publisher policy, emergency handover, and exception grants remain D-40 proposals, not new operational decisions. Upload accepts one file per operation, up to 5 per UI action, each ≤10 MB, preserving business limits. Ticket timelines, asset assignment history, related tickets, and message history have GET routes; scope precedes every count. Group labels do not imply generic CRUD/DELETE.

## DEMO flows for contract review

Use fake UUIDs created in the test environment during implementation. Never put actual cookies/API keys/passwords in examples/repository. Tokens below are placeholders.

```http
POST /api/v1/tickets
Content-Type: application/json
X-CSRF-Token: DEMO-CSRF-PLACEHOLDER
Idempotency-Key: DEMO-ticket-001

{"title":"DEMO — prepare devices for fictitious employees","description":"DEMO — confirm configuration and handover deadline.","type":"SERVICE_REQUEST","category_id":"00000000-0000-4000-8000-000000000001","impact":"LOW","urgency":"LOW"}
```

Expected: 201/New/version; requester from session; SLA snapshot; same-key replay creates no duplicate ticket/event. Automation does not assign without a grant.

```http
POST /api/v1/approvals/00000000-0000-4000-8000-000000000002/decisions
Content-Type: application/json
X-CSRF-Token: DEMO-CSRF-PLACEHOLDER
Idempotency-Key: DEMO-approval-001

{"expectedVersion":2,"decision":"APPROVE","reason":"DEMO — resources checked","snapshot_versions":{"00000000-0000-4000-8000-000000000003":4}}
```

Expected: saved decision is distinct from execution. Changed versions/policy/skills/capacity cause 409 or execution Conflict after revalidation, not assignment from an old snapshot.

## Verification and future handover

Check JSON, local refs, operationId/path parameters, schema/required fields, scope metadata, API01–19 coverage. Official OpenAPI validation/client generation and live HTTP tests have not run. Before implementation, review DTO enums/naming, complete projections/historical resource shapes, and D-40 operations. Then semantically compare FastAPI exports with the approved contract, generate TypeScript, and run negative scope/version/concurrency/CSRF tests. This document does not activate M1–M5.

[OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) · [C4](../architecture/c4/README.md) · [DBML/ER](../database/README.md).

## Action cards and shared AI screen — D-42

AssistantResult includes action_cards (declarations, not effects). A trusted registry maps form_key to existing forms/APIs. Prefill contains no permissions/secrets/endpoints and only form-allowed fields. User confirmation sends the domain request with the operation's CSRF/version/idempotency controls. Tickets retain API13 draft/confirm; other forms use core APIs, not a generic proxy. Workspace unification does not change routes/operation counts; the new schema remains design-draft. Requesters see public ticket progress, not automation traces; forms/status remain available when the assistant is unavailable.
