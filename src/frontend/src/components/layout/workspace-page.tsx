import { notFound } from "next/navigation";
import Link from "next/link";
import type { DemoPersona } from "@/lib/demo/fixtures";
import {
  activeNavigation,
  canOpenDestination,
  effectiveScope,
  getAccountLinks,
  knownDestinations,
} from "@/lib/navigation";
import { Feedback } from "../feedback/feedback";
import { WorkspaceShell } from "./workspace-shell";

export type WorkspaceSearch = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Honest route stubs: no domain reads/writes, auth redirect or role-query elevation. */
export function WorkspacePage({
  persona,
  pathname,
  search = {},
  prefix = "",
}: {
  persona: DemoPersona;
  pathname: string;
  search?: WorkspaceSearch;
  prefix?: string;
}) {
  if (!knownDestinations.has(pathname)) notFound();
  const scope = effectiveScope(persona, pathname, first(search.scope));
  const item = activeNavigation(persona, pathname, scope);
  const label =
    item?.label ??
    getAccountLinks(persona).find((item) => item.href === pathname)?.label ??
    "Không có quyền truy cập";
  const query = (first(search.q) ?? "").trim().slice(0, 180);
  const allowed = canOpenDestination(persona, pathname);
  return (
    <WorkspaceShell
      persona={persona}
      pathname={pathname}
      scope={scope}
      query={query}
      prefix={prefix}
    >
      <p className="workspace-breadcrumb">
        Không gian làm việc <span aria-hidden="true">/</span> {label}
      </p>
      <div className="workspace-heading">
        <h1>{label}</h1>
        <p>Bố cục làm việc theo quyền của bạn.</p>
      </div>
      {allowed ? (
        <div className="shell-pending" data-effective-scope={scope}>
          {pathname === "/tickets" && query && (
            <p className="shell-search-summary">
              Từ khóa: <strong>{query}</strong>. Chưa thực hiện tìm kiếm dữ
              liệu.
            </p>
          )}
          <Feedback
            kind="empty"
            title="Chức năng chưa triển khai"
            description={
              pathname === "/logout"
                ? "Chưa thực hiện đăng xuất. Phiên hiện tại chưa bị thay đổi; đây là màn chờ triển khai chức năng."
                : "Điều hướng đã sẵn sàng. Nội dung và thao tác nghiệp vụ sẽ được bổ sung ở bước triển khai tiếp theo; chưa có dữ liệu được tải hoặc thay đổi."
            }
          />
          <Link href={`${prefix}/dashboard`} className="shell-return-link">
            Về tổng quan
          </Link>
        </div>
      ) : (
        <div className="shell-pending">
          <Feedback kind="forbidden" />
        </div>
      )}
    </WorkspaceShell>
  );
}
