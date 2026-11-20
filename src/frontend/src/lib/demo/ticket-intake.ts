import type { DemoPersona } from "./fixtures";
import {
  attachmentError,
  demoAttachmentFixtures,
  syntheticAttachmentMime,
  maxAttachments,
  type UploadedAttachment,
  type TicketAttachment,
  type AttachmentTarget,
} from "./ticket-attachments";
import { projectTicketSla, type TicketSlaSeed } from "./ticket-sla";
import {
  allowedLifecycleActions,
  lifecycleActions,
  lifecycleTextMinimum,
  type LifecycleAction,
} from "./ticket-lifecycle";
import type { TicketDraft } from "./ticket-draft";
import { scopedTicketRows, ticketStates, type TicketRow } from "./ticket-list";
import {
  baseline,
  priorities,
  type Budgets,
  type Priority,
} from "./sla-policy";
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
  createdAt: number;
  draft: TicketDraft;
  budget: { version: number; budgets: Budgets };
};
type Conversation = {
  row: TicketRow;
  events: TicketEvent[];
  version: number;
  firstResponseAt: string | null;
};
export type RoutingChange =
  | { kind: "claim" }
  | { kind: "assign"; teamId: string; assigneeId: string; reason: string }
  | { kind: "priority"; priority: Priority; reason: string };
type Outcome =
  { kind: "success"; id: string } | { kind: "failure" | "stale" | "unknown" };

export function createTicketIntake(config: {
  identity: () => { userId: string; scope: string } | null;
  actor: () => DemoPersona | null;
  memberships: () => string[];
  isTeamMember: (teamId: string, userId: string) => boolean;
  intake: () => { id: string; name: string } | undefined;
  snapshot: () => RecordSnapshot["budget"];
  teams: () => {
    id: string;
    name: string;
    active: boolean;
    members: string[];
  }[];
  people: () => { id: string; display_name: string }[];
}) {
  const records = new Map<string, RecordSnapshot>();
  const committed = new Map<string, { owner: string; id: string }>();
  const conversations = new Map<string, Conversation>();
  const clockSeeds = new Map<string, TicketSlaSeed>();
  const uploads = new Map<string, UploadedAttachment & AttachmentTarget>();
  let sequence = 152;
  return {
    rows: () => [
      ...[...conversations.values()].map(({ row }) => ({ ...row })),
      ...[...records.values()]
        .filter(({ row }) => !conversations.has(row.id))
        .map(({ row }) => ({ ...row })),
    ],
    detail(
      persona: DemoPersona,
      id: string,
      memberships: string[],
      now = Date.now(),
    ) {
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
      let seed = clockSeeds.get(id);
      if (!seed) {
        const createdAt =
          stored?.createdAt ?? Date.parse(`${row.updated}T09:00:00+07:00`);
        const initialMinutes =
          row.state === "Chờ bổ sung"
            ? 35
            : row.state === "Đã giải quyết" || row.state === "Hoàn tất"
              ? 60
              : 0;
        seed = {
          createdAt,
          state: row.state,
          stateAt: createdAt + initialMinutes * 60000,
        };
        clockSeeds.set(id, seed);
      }
      const sla = projectTicketSla({
        seed,
        events: baseEvents,
        firstResponseAt,
        now,
        priority: row.priority,
        budgets: stored?.budget.budgets ?? baseline,
      });
      const events = projectTicketEvents(baseEvents, internal);
      const attachments: TicketAttachment[] = [
        ...demoAttachmentFixtures(id),
        ...[...uploads.values()]
          .filter((file) => file.ticketId === id)
          .map(({ id, name, size, type, eventId }) => ({
            id,
            name,
            size,
            type,
            eventId,
          })),
      ].filter(
        (file) =>
          !file.eventId || events.some((event) => event.id === file.eventId),
      );
      return {
        row,
        draft: stored ? structuredClone(stored.draft) : null,
        budget: stored
          ? {
              version: stored.budget.version,
              ...stored.budget.budgets[row.priority],
            }
          : { version: 3, ...baseline[row.priority] },
        sla,
        attachments,
        assignable:
          internal &&
          persona.scope.tickets === "organization" &&
          row.state !== "Đã hủy" &&
          row.state !== "Hoàn tất",
        claimable:
          internal &&
          memberships.includes(row.teamId) &&
          !row.assigneeId &&
          (row.state === "Đang chờ tiếp nhận" || row.state === "Đã tiếp nhận"),
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
      if (
        audience === "public" &&
        currentDetail.internal &&
        row.requesterId !== actor.user.id &&
        !firstResponseAt
      ) {
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
          authorId: actor.user.id,
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
          authorId: actor.user.id,
          at,
          text: "Đã nhận phản hồi và tiếp tục xử lý.",
          state: row.state,
        });
      conversations.set(id, {
        row,
        events,
        version: expectedVersion + 1,
        firstResponseAt,
      });
      return {
        kind: "success",
        eventId: `message-${expectedVersion}`,
      } as const;
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
        reason.length < lifecycleTextMinimum(action, actor)
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
        state: row.state,
      };
      const events = [...previousEvents, transition];
      const publicMessage = action === "wait" || action === "resolve";
      if (reason)
        events.push({
          ...transition,
          id: `reason-${expectedVersion}`,
          audience: publicMessage || !detail.internal ? "public" : "internal",
          kind: publicMessage ? "message" : "history",
          text: reason,
          state: undefined,
          purpose:
            action === "wait"
              ? "question"
              : action === "resolve"
                ? "solution"
                : undefined,
        });
      const firstResponseAt =
        detail.firstResponseAt ??
        (publicMessage && detail.internal && actor.user.id !== row.requesterId
          ? at
          : null);
      if (firstResponseAt && !detail.firstResponseAt)
        row.sla = "Phản hồi · Đã phản hồi";
      conversations.set(id, {
        row,
        events,
        version: expectedVersion + 1,
        firstResponseAt,
      });
      return "success" as const;
    },
    async changeRouting(
      id: string,
      change: RoutingChange,
      expectedVersion: number,
      simulateConflict = false,
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
      if (!detail || !detail.internal) return "forbidden" as const;
      if (expectedVersion !== detail.version || simulateConflict)
        return "stale" as const;
      if (change.kind === "claim" ? !detail.claimable : !detail.assignable)
        return "forbidden" as const;
      const row = { ...detail.row };
      const reason = change.kind === "claim" ? "" : change.reason.trim();
      if (
        change.kind !== "claim" &&
        (reason.length < 10 || reason.length > 10000)
      )
        return "invalid" as const;
      let description: string;
      if (change.kind === "priority") {
        if (
          !priorities.includes(change.priority) ||
          change.priority === row.priority
        )
          return "invalid" as const;
        description = `Ưu tiên: ${row.priority} → ${change.priority}`;
        row.priority = change.priority;
      } else if (change.kind === "claim") {
        description = `Tự nhận xử lý: ${actor.user.display_name}`;
        row.assignee = actor.user.display_name;
        row.assigneeId = actor.user.id;
      } else {
        const team = config
          .teams()
          .find((entry) => entry.active && entry.id === change.teamId);
        const assignee = config
          .people()
          .find((entry) => entry.id === change.assigneeId);
        const activeWork =
          row.state === "Đang xử lý" || row.state === "Chờ bổ sung";
        if (
          !team ||
          (change.assigneeId &&
            (!assignee || !team.members.includes(assignee.id))) ||
          (activeWork && !assignee)
        )
          return "invalid" as const;
        description = `Phân công: ${row.team} / ${row.assignee} → ${team.name} / ${assignee?.display_name ?? "Chưa phân công"}`;
        row.team = team.name;
        row.teamId = team.id;
        row.assignee = assignee?.display_name ?? "Chưa phân công";
        row.assigneeId = assignee?.id ?? null;
      }
      const at = new Date().toISOString();
      const previous =
        conversations.get(id)?.events ??
        (records.has(id) ? [] : ticketFixtureEvents(detail.row));
      const event: TicketEvent = {
        id: `routing-${expectedVersion}`,
        audience: "internal",
        kind: "history",
        actor: actor.user.display_name,
        at,
        text: reason ? `${description}. ${reason}` : description,
        priorPriority:
          change.kind === "priority" ? detail.row.priority : undefined,
      };
      conversations.set(id, {
        row,
        events: [...previous, event],
        firstResponseAt: detail.firstResponseAt,
        version: detail.version + 1,
      });
      return "success" as const;
    },
    saveAttachments(
      target: AttachmentTarget,
      files: readonly UploadedAttachment[],
    ) {
      const identity = config.identity();
      const actor = config.actor();
      if (
        !identity ||
        !actor ||
        identity.scope !== target.scope ||
        identity.userId !== target.owner
      )
        return false;
      const detail = this.detail(actor, target.ticketId, config.memberships());
      if (!detail) return false;
      if (target.eventId) {
        const message = detail.events.find(
          (event) => event.id === target.eventId && event.kind === "message",
        );
        if (!message || message.authorId !== actor.user.id) return false;
      } else if (detail.row.requesterId !== actor.user.id) {
        return false;
      }
      if (files.length > maxAttachments || files.some(attachmentError))
        return false;
      const prior = [...uploads.values()].filter(
        (file) =>
          file.ticketId === target.ticketId && file.eventId === target.eventId,
      );
      if (
        prior.length + files.filter((file) => !uploads.has(file.id)).length >
        maxAttachments
      )
        return false;
      for (const file of files) {
        if (!uploads.has(file.id)) uploads.set(file.id, { ...file, ...target });
      }
      return true;
    },
    attachmentForDownload(
      ticketId: string,
      fileId: string,
      expectedScope: string,
      simulateTransfer = false,
    ) {
      const identity = config.identity();
      const actor = config.actor();
      if (!identity || !actor || identity.scope !== expectedScope)
        return { kind: "forbidden" } as const;
      // Synthetic transfer fixture revokes a technician's team scope at request time.
      const memberships = simulateTransfer ? [] : config.memberships();
      const detail = this.detail(actor, ticketId, memberships);
      const file = detail?.attachments.find((item) => item.id === fileId);
      if (!file) return { kind: "forbidden" } as const;
      const mime = syntheticAttachmentMime(file);
      if (file.missing || !mime) return { kind: "missing" } as const;
      return { kind: "success", name: file.name, mime } as const;
    },
    checkAttachments(
      target: AttachmentTarget,
      files: readonly UploadedAttachment[],
    ) {
      const identity = config.identity();
      return (
        identity?.scope === target.scope &&
        identity.userId === target.owner &&
        files.every(({ id }) => {
          const file = uploads.get(id);
          return (
            file?.scope === target.scope &&
            file.ticketId === target.ticketId &&
            file.eventId === target.eventId
          );
        })
      );
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
        createdAt: Date.now(),
        budget: config.snapshot(),
      });
      committed.set(intent, { owner: identity.userId, id });
      return { kind: "success", id };
    },
  };
}
