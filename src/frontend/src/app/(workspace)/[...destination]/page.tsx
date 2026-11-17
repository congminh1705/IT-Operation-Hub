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
  // The client boundary renders no private shell until a mock session exists.
  return (
    <WorkspaceEntry
      pathname={`/${destination.join("/")}`}
      search={await searchParams}
    />
  );
}
