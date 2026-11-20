import type { DemoPersona } from "./fixtures";
import {
  allowedLifecycleActions,
  lifecycleActions,
  requiresCancellationReason,
  type LifecycleAction,
} from "./ticket-lifecycle";
import type { TicketDraft } from "./ticket-draft";
import { scopedTicketRows, ticketStates, type TicketRow } from "./ticket-list";
import type { Priority } from "./sla-policy";
import {
  canReadInternalTicket,
  projectTicketEvents,
  ticketFixtureEvents,
  type TicketEvent,
} from "./ticket-detail";

export const submitFixtures = ["failure", "stale", "unknown"] as const;
export type SubmitFixture = (typeof submitFixtures)[number];
type RecordSnapshot = {
  row: TicketRow;
  draft: TicketDraft;
  budget: { version: number; response: number; resolution: number };
};
type Conversation = {
  row: TicketRow;
  events: TicketEvent[];
  version: number;
  firstResponseAt: string | null;
};
type Outcome =
  { kind: "success"; id: string } | { kind: "failure" | "stale" | "unknown" };

export function createTicketIntake(config: {
  identity: () => { userId: string; scope: string } | null;
  actor: () => DemoPersona | null;
  memberships: () => string[];
  isTeamMember: (teamId: string, userId: string) => boolean;
  intake: () => { id: string; name: string } | undefined;
  snapshot: (priority: Priority) => RecordSnapshot["budget"];
}) {
  const records = new Map<string, RecordSnapshot>();
  const committed = new Map<string, { owner: string; id: string }>();
  const conversations = new Map<string, Conversation>();
  let sequence = 152;
  return {
    rows: () => [
      ...[...conversations.values()].map(({ row }) => ({ ...row })),
      ...[...records.values()]
        .filter(({ row }) => !conversations.has(row.id))
        .map(({ row }) => ({ ...row })),
    ],
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
      const internal = canReadInternalTicket(persona, row, memberships);
      const conversation = conversations.get(id);
      const baseEvents =
        conversation?.events ?? (stored ? [] : ticketFixtureEvents(row));
      const firstResponseAt = conversation
        ? conversation.firstResponseAt
        : (baseEvents.find((event) => event.id === "team-message")?.at ?? null);
      const events = projectTicketEvents(baseEvents, internal);
      return {
        row,
        draft: stored ? structuredClone(stored.draft) : null,
        budget: stored ? { ...stored.budget } : null,
        internal,
        events,
        version: conversation?.version ?? 1,
        firstResponseAt,
        canReply: row.state !== "Hoàn tất" && row.state !== "Đã hủy",
        actions: allowedLifecycleActions(
          row,
          persona,
          internal,
          !!row.assigneeId && config.isTeamMember(row.teamId, row.assigneeId),
        ),
      };
    },
    async postMessage(
      id: string,
      audience: TicketEvent["audience"],
      input: string,
      expectedVersion: number,
      simulateRevocation: boolean,
    ) {
      const initial = config.identity();
      const text = input.trim();
      if (!text || text.length > 4000) return "invalid" as const;
      await new Promise((resolve) => setTimeout(resolve, 450));
      const current = config.identity();
      const actor = config.actor();
      if (
        simulateRevocation ||
        !initial ||
        !current ||
        !actor ||
        initial.scope !== current.scope ||
        initial.userId !== current.userId
      )
        return "forbidden" as const;
      const currentDetail = this.detail(actor, id, config.memberships());
      if (
        !currentDetail ||
        (audience === "internal" && !currentDetail.internal)
      )
        return "forbidden" as const;
      if (!currentDetail.canReply) return "invalid" as const;
      if (currentDetail.version !== expectedVersion) return "stale" as const;
      const at = new Date().toISOString();
      const row = { ...currentDetail.row };
      if (audience === "public") row.updated = at.slice(0, 10);
      const resumed =
        audience === "public" &&
        row.state === "Chờ bổ sung" &&
        row.requesterId === actor.user.id;
      let firstResponseAt = currentDetail.firstResponseAt;
      if (audience === "public" && currentDetail.internal && !firstResponseAt) {
        firstResponseAt = at;
        row.sla = "Phản hồi · Đã phản hồi";
      }
      if (resumed) row.state = "Đang xử lý";
      const previousEvents =
        conversations.get(id)?.events ??
        (records.has(id) ? [] : ticketFixtureEvents(currentDetail.row));
      const events: TicketEvent[] = [
        ...previousEvents,
        {
          id: `message-${expectedVersion}`,
          audience,
          kind: "message",
          actor: actor.user.display_name,
          at,
          text,
        },
      ];
      if (resumed)
        events.push({
          id: `resume-${expectedVersion}`,
          audience: "public",
          kind: "history",
          actor: actor.user.display_name,
          at,
          text: "Đã nhận phản hồi và tiếp tục xử lý.",
        });
      conversations.set(id, {
        row,
        events,
        version: expectedVersion + 1,
        firstResponseAt,
      });
      return "success" as const;
    },
    async transition(
      id: string,
      action: LifecycleAction,
      input: string,
      expectedVersion: number,
      simulateConflict: boolean,
    ) {
      const initial = config.identity();
      await new Promise((resolve) => setTimeout(resolve, 450));
      const current = config.identity();
      const actor = config.actor();
      if (
        !initial ||
        !current ||
        !actor ||
        initial.scope !== current.scope ||
        initial.userId !== current.userId
      )
        return "forbidden" as const;
      const detail = this.detail(actor, id, config.memberships());
      if (!detail || !detail.actions.includes(action))
        return "forbidden" as const;
      if (simulateConflict || detail.version !== expectedVersion)
        return "stale" as const;
      const reason = input.trim();
      if (
        reason.length > 10000 ||
        (action === "cancel" &&
          requiresCancellationReason(actor) &&
          reason.length < 10)
      )
        return "invalid" as const;
      const at = new Date().toISOString();
      const row = {
        ...detail.row,
        updated: at.slice(0, 10),
        state: lifecycleActions[action].state,
      };
      const previousEvents =
        conversations.get(id)?.events ??
        (records.has(id) ? [] : ticketFixtureEvents(detail.row));
      const transition: TicketEvent = {
        id: `state-${expectedVersion}`,
        audience: "public",
        kind: "history",
        actor: actor.user.display_name,
        at,
        text: `${detail.row.state} → ${row.state}`,
      };
      const events = [...previousEvents, transition];
      if (reason)
        events.push({
          ...transition,
          id: `reason-${expectedVersion}`,
          audience: detail.internal ? "internal" : "public",
          text: reason,
        });
      conversations.set(id, {
        row,
        events,
        version: expectedVersion + 1,
        firstResponseAt: detail.firstResponseAt,
      });
      return "success" as const;
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
        assigneeId: null,
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
