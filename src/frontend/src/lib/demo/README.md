# A1 DEMO account contract

FE-01.02 defines five typed operations in `../api/types.ts`: login, current user,
logout, own display-name update and own password change. DTOs retain draft OpenAPI
wire names (`display_name`, `expectedVersion`, `field_errors`, `request_id`). This
is a handwritten A1 subset, not a generated/full API client. Profile contact fields
and password thresholds remain undecided; this fixture set does not settle them.

`createDemoFixtures()` supplies four synthetic roles with reserved `.invalid`
addresses, stable UUIDs, role-specific navigation and scope hints. These are DEMO
UX projections, never server authorization. Workforce for a Technician means only
self/minimal lookup, not organization capacity. Knowledge navigation grants no
publication rights. Admin does not gain access to other users' conversations.

`createDemoScenarios()` supplies explicit expected outcomes, not executable services:

| Operation         | Scenarios                                                                       |
| ----------------- | ------------------------------------------------------------------------------- |
| login             | Four persona successes; invalid credentials; pending; unavailable; rate limited |
| currentUser       | Current requester; expired/revoked session; changed role; forbidden function    |
| updateOwnProfile  | Saved display name; field validation; stale-version conflict; unknown result    |
| changeOwnPassword | Simulated success; rejected current-password confirmation                       |
| logout            | Simulated no-content success; unknown result                                    |

`pending` is a local in-flight state, not a committed operation or HTTP 202 domain
result. `unknown` means an effect is not confirmed: reconcile rather than blindly
retry a mutation. Errors use the draft envelope and explicit status/discriminant;
only `success` carries data. The error union includes 404 and 500 for consumers,
without inventing A1 resource services. `DEMO_*` codes are mock-only scenario codes,
not claims that backend error codes have been finalized. Invalid-login 401 follows
the shared unauthenticated UX convention; the draft login operation currently
omits 401 in its response list, which needs reconciliation before real integration.

Time starts at the fixed UTC instant in `DEMO_CONVENTIONS`; display uses
`Asia/Ho_Chi_Minh`. The later adapter must inject/advance its clock explicitly.
Expiry/revocation are explicit scenario events, not assumed production TTL values.
Reset means calling the factories again and clearing the adapter's in-memory
session, selected scenario and clock to the initial state. Factories are fresh and
deterministic; they do not read system time, random values or browser storage.

Credentials are transient method inputs only. No password, session cookie/token,
credential matcher or password policy is stored here. A successful login scenario
is an explicit synthetic selection, not proof of credentials. The later gateway
must not retain/log input secrets. Re-read current identity after permission
changes and replace cached navigation/scope from the new role; expired/revoked
identity clears protected access. This task does not implement those side effects.

FE-01.03 owns the mock adapter, mode selection, scenario controls and session/reset
execution. This task creates no gateway implementation, UI page, real auth or
domain service. Visual comparison is N/A; approved HTML is context only.

Run `pnpm.cmd test` and `pnpm.cmd typecheck` from `src/frontend` (use `pnpm` outside
Windows). Tests verify role isolation, reset determinism, scenario/error projections
and compile-time rejection of unsafe result/profile shapes.
