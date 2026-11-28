import { type WorkspaceSearch } from "@/components/layout/workspace-page";
import { WorkspaceEntry } from "@/features/auth/workspace-entry";

export default async function WorkspaceRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string[] }>;
  searchParams: Promise<WorkspaceSearch>;
}) {
  const { destination } = await params;
  return (
    <WorkspaceEntry
      pathname={`/${destination.join("/")}`}
      search={await searchParams}
    />
  );
}
