import type { DemoPersona } from "./fixtures";

export type ChatAudience = "PUBLIC" | "INTERNAL";
export type ChatMessage = { id: number; prompt: string; answer: string | null };
type Conversation = {
  id: string;
  owner: string;
  title: string;
  audience: ChatAudience;
  messages: ChatMessage[];
};
type Identity = { userId: string; scope: string };
export const canUseChatAudience = (
  actor: DemoPersona,
  audience: ChatAudience,
) =>
  actor.user.active &&
  (audience === "PUBLIC" ||
    (audience === "INTERNAL" && actor.user.role !== "REQUESTER"));

export function createAssistant(
  getActor: () => DemoPersona | null,
  identity: () => Identity | null,
) {
  const records = new Map<string, Conversation>();
  const seeded = new Set<string>();
  let sequence = 1;
  const actorRecord = (id: string) => {
    const actor = getActor();
    const row = records.get(id);
    return actor &&
      row?.owner === actor.user.id &&
      canUseChatAudience(actor, row.audience)
      ? row
      : null;
  };

  return {
    list() {
      const actor = getActor();
      if (!actor?.user.active) return [];
      const owner = actor.user.id;
      if (!seeded.has(owner)) {
        seeded.add(owner);
        const id = "CHAT-" + sequence++;
        records.set(id, {
          id,
          owner,
          title: "Hướng dẫn hỗ trợ DEMO",
          audience: "PUBLIC",
          messages: [
            {
              id: sequence++,
              prompt: "Tôi có thể tìm hướng dẫn ở đâu?",
              answer:
                "Mở Kho kiến thức để tìm bài đã công bố trong phạm vi của bạn.",
            },
          ],
        });
      }
      return [...records.values()]
        .filter(
          (row) =>
            row.owner === owner && canUseChatAudience(actor, row.audience),
        )
        .map(({ id, title, audience }) => ({ id, title, audience }));
    },
    create(audience: ChatAudience) {
      const actor = getActor();
      if (!actor || !canUseChatAudience(actor, audience)) return null;
      const id = "CHAT-" + sequence++;
      records.set(id, {
        id,
        owner: actor.user.id,
        title: "Hội thoại mới",
        audience,
        messages: [],
      });
      return id;
    },
    read(id: string) {
      const row = actorRecord(id);
      return row ? structuredClone(row) : null;
    },
    remove(id: string) {
      return !!actorRecord(id) && records.delete(id);
    },
    async send(
      id: string | undefined,
      audience: ChatAudience,
      text: string,
      signal: AbortSignal,
      fail = false,
    ) {
      const actor = getActor();
      const start = identity();
      const prompt = text.trim();
      if (
        !start ||
        !actor ||
        !canUseChatAudience(actor, audience) ||
        (id && !actorRecord(id)) ||
        !prompt ||
        prompt.length > 1800
      )
        return { kind: "invalid" } as const;
      await new Promise((resolve) => setTimeout(resolve, 650));
      if (signal.aborted) return { kind: "cancelled" } as const;
      const current = identity();
      if (
        !current ||
        current.scope !== start.scope ||
        current.userId !== start.userId
      )
        return { kind: "invalid" } as const;
      if (fail) return { kind: "error" } as const;
      const target = id ?? this.create(audience);
      const row = target && actorRecord(target);
      if (!row) return { kind: "invalid" } as const;
      if (!row.messages.length) row.title = prompt.slice(0, 56);
      row.messages.push({
        id: sequence++,
        prompt,
        answer:
          row.audience === "PUBLIC"
            ? "Phản hồi DEMO công khai. Bạn có thể tra cứu hướng dẫn hoặc tạo yêu cầu hỗ trợ."
            : "Phản hồi DEMO nội bộ. Kiểm tra phạm vi của hồ sơ trước khi chia sẻ thông tin.",
      });
      return { kind: "success", id: row.id } as const;
    },
  };
}
