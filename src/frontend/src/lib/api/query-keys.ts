export type QueryIdentity = Readonly<{ userId: string; scope: string }>;
export type QueryKey = readonly [string, string, string, string];

/** Scope includes role/permission version and effective resource scope. Not authorization. */
export function queryKey(
  identity: QueryIdentity,
  resource: string,
  params: Readonly<Record<string, string>> = {},
): QueryKey {
  return [
    identity.userId,
    identity.scope,
    resource,
    JSON.stringify(
      Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
    ),
  ];
}
