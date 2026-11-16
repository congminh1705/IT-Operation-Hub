import { notFound } from "next/navigation";
import {
  WorkspacePage,
  type WorkspaceSearch,
} from "@/components/layout/workspace-page";
import { createDemoFixtures } from "@/lib/demo/fixtures";
import type { Role } from "@/lib/api/types";

const roles: Record<string, Role> = {
  requester: "REQUESTER",
  technician: "TECHNICIAN",
  manager: "IT_MANAGER",
  admin: "ADMIN",
};

/** Developer fixture entry only: never a role switch in product navigation. */
export default async function WorkspacePreview({
  params,
  searchParams,
}: {
  params: Promise<{ persona: string; destination?: string[] }>;
  searchParams: Promise<WorkspaceSearch>;
}) {
  const { persona: slug, destination } = await params;
  if (!Object.hasOwn(roles, slug)) notFound();
  const persona = createDemoFixtures().personas[roles[slug]];
  const search = await searchParams;
  if (search.fixture === "long-name")
    persona.user.display_name =
      "Nhân viên DEMO Nguyễn Thị Phương Anh — Bộ phận hỗ trợ công nghệ thông tin";
  return (
    <WorkspacePage
      persona={persona}
      pathname={
        destination?.length ? `/${destination.join("/")}` : "/dashboard"
      }
      prefix={`/preview/workspace/${slug}`}
      search={search}
    />
  );
}
