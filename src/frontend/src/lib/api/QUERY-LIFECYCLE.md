# Query lifecycle (FE-02.04)

The root `Providers` owns one memory-only `QueryClient` per application mount;
there is no module-global server cache, persistence or new dependency.
No domain polling starts until a feature registers a read.

Session integration belongs to FE-03.02. Before rendering queries for an identity,
call `client.setIdentity({ userId, scope })`. The scope must include effective
role/permission version and resource scope. On logout call `client.logout()`
immediately, before awaiting transport. Change identity/scope before exposing the
new view; neither URL role parameters nor these cache keys authorize access.

Build keys with `queryKey(identity, resource, params)`. All filters/page/sort that
affect the response belong in params. Use `client.fetch(key, signal => gatewayRead())`
with the existing typed `ApiOutcome` boundary. Pass the AbortSignal to transports
that support cancellation; late responses are discarded even when it is ignored.
`useQueryState<T>(key)` subscribes without initiating transport during render.
Use a custom empty predicate for paginated envelopes; default empty means null or
an empty array. Errors/unknown transport outcomes never become empty successes.

Register `client.poll(key, read, isEmpty)` in a feature effect and return its
unsubscribe function. Polling runs every 30 seconds while visible and focused,
without overlapping an in-flight read. Focus restoration starts a fresh interval.
Initial reads are explicit. Provider cleanup stops polling and clears private data.

After a **successful** mutation call `client.invalidate(resource)`, then explicitly
refetch affected reads (or let their registered poll run). Do not invalidate on
pending/unknown/failure or claim those outcomes changed the domain. Invalidation
aborts matching reads and prevents stale writes; it does not create a business
mutation or automatically replay a command.

`formatBusinessTime` displays UTC ISO timestamps as dd/MM/yyyy HH:mm in
Asia/Ho_Chi_Minh. `localDateWindow` accepts inclusive YYYY-MM-DD selections and
returns UTC `[from, toExclusive)` boundaries. Modern Vietnam dates from 1976 are
supported; historical timezone conversion is rejected. No SLA calculation occurs.
