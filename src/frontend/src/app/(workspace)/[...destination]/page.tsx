import {
  WorkspacePage,
  type WorkspaceSearch,
} from "@/components/layout/workspace-page";
import { createDemoFixtures } from "@/lib/demo/fixtures";

export default async function WorkspaceRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string[] }>;
  searchParams: Promise<WorkspaceSearch>;
}) {
  const { destination } = await params;
  // Explicit fixture, replaced by the session projection in the owned auth-routing task.
  const persona = createDemoFixtures().personas.REQUESTER;
  return (
    <WorkspacePage
      persona={persona}
      pathname={`/${destination.join("/")}`}
      search={await searchParams}
    />
  );
}
