import type { DemoPersona } from "./fixtures";
import type { TicketDraft } from "./ticket-draft";
import { scopedTicketRows, ticketStates, type TicketRow } from "./ticket-list";
import type { Priority } from "./sla-policy";

export const submitFixtures = ["failure", "stale", "unknown"] as const;
export type SubmitFixture = (typeof submitFixtures)[number];
type RecordSnapshot = {
  row: TicketRow;
  draft: TicketDraft;
  budget: { version: number; response: number; resolution: number };
};
type Outcome =
  { kind: "success"; id: string } | { kind: "failure" | "stale" | "unknown" };

export function createTicketIntake(config: {
  identity: () => { userId: string; scope: string } | null;
  intake: () => { id: string; name: string } | undefined;
  snapshot: (priority: Priority) => RecordSnapshot["budget"];
}) {
  const records = new Map<string, RecordSnapshot>();
  const committed = new Map<string, { owner: string; id: string }>();
  let sequence = 152;
  return {
    rows: () => [...records.values()].map((record) => ({ ...record.row })),
    detail(persona: DemoPersona, id: string, memberships: string[]) {
      const mine = scopedTicketRows(
        persona,
        "mine",
        memberships,
        false,
        this.rows(),
      );
      const work = scopedTicketRows(
        persona,
        "work",
        memberships,
        false,
        this.rows(),
      );
      const row = [
        ...(mine.kind === "success" ? mine.rows : []),
        ...(work.kind === "success" ? work.rows : []),
      ].find((item) => item.id === id);
      if (!row) return null;
      const stored = records.get(id);
      return stored
        ? structuredClone(stored)
        : { row, draft: null, budget: null };
    },
    check(intent: string): Outcome {
      const entry = committed.get(intent);
      return entry && entry.owner === config.identity()?.userId
        ? { kind: "success", id: entry.id }
        : { kind: "unknown" };
    },
    async submit(
      persona: DemoPersona,
      draft: TicketDraft,
      intent: string,
      fixture?: SubmitFixture,
    ): Promise<Outcome> {
      const identity = config.identity();
      if (
        !identity ||
        !persona.user.active ||
        identity.userId !== persona.user.id
      )
        return { kind: "stale" };
      await new Promise((resolve) => setTimeout(resolve, 650));
      const current = config.identity();
      if (
        !current ||
        current.userId !== identity.userId ||
        current.scope !== identity.scope
      )
        return { kind: "stale" };
      const entry = committed.get(intent);
      if (entry && entry.owner === identity.userId)
        return { kind: "success", id: entry.id };
      if (fixture) return { kind: fixture };
      const team = config.intake();
      if (!team) return { kind: "failure" };
      const id = `TKT-${String(sequence++).padStart(6, "0")}`;
      const row: TicketRow = {
        id,
        title: draft.title,
        requesterId: identity.userId,
        requester: persona.user.display_name,
        teamId: team.id as TicketRow["teamId"],
        team: team.name,
        assignee: "Chưa phân công",
        state: ticketStates[0],
        priority: draft.priority,
        category: draft.category,
        updated: new Date().toISOString().slice(0, 10),
        sla: "Phản hồi · Đang chạy",
      };
      records.set(id, {
        row,
        draft: structuredClone(draft),
        budget: config.snapshot(draft.priority),
      });
      committed.set(intent, { owner: identity.userId, id });
      return { kind: "success", id };
    },
  };
}
