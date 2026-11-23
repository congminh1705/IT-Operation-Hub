"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useSession } from "@/features/auth/session";
import type { ChatAudience } from "@/lib/demo/assistant";

type Kind = "source" | "ticket" | "asset";
export function AssistantCards({
  audience,
  generationEnabled,
}: {
  audience: ChatAudience;
  generationEnabled: boolean;
}) {
  const { store, persona } = useSession();
  const [kind, setKind] = useState<Kind>("source");
  const [id, setId] = useState("");
  const [version, setVersion] = useState("2");
  const [query, setQuery] = useState<{
    kind: Kind;
    id: string;
    version: number;
  }>();
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState<"public" | "internal">(
    audience === "INTERNAL" ? "internal" : "public",
  );
  const [notice, setNotice] = useState("");
  useSyncExternalStore(
    store.knowledge.subscribe,
    store.knowledge.getSnapshot,
    store.knowledge.getSnapshot,
  );
  if (!persona) return null;
  const teams = store.teams.ownTeamIds();
  const ticket =
    query?.kind === "ticket"
      ? store.tickets.detail(persona, query.id, teams)
      : null;
  const visibleTicket =
    ticket && (audience === "PUBLIC" || ticket.internal) ? ticket : null;
  const asset =
    query?.kind === "asset"
      ? store.assets
          .list(persona, teams, audience === "PUBLIC" ? "mine" : "work")
          .find((entry) => entry.id === query.id || entry.code === query.id)
      : null;
  const source =
    query?.kind === "source"
      ? store.knowledge.citation(
          persona,
          audience === "PUBLIC" ? [] : teams,
          query.id,
          query.version,
        )
      : null;
  function stage() {
    const actor = store.getSnapshot();
    const identity = store.identity();
    const current =
      query &&
      actor &&
      store.tickets.detail(actor, query.id, store.teams.ownTeamIds());
    if (
      !current?.canReply ||
      !identity ||
      !draft.trim() ||
      (target === "internal"
        ? audience !== "INTERNAL" || !current.internal
        : target !== "public" || audience !== "PUBLIC")
    ) {
      setNotice("Không thể chuyển bản nháp vào phạm vi đã chọn.");
      return;
    }
    store.setAssistantDraft({
      id: current.row.id,
      audience: target,
      text: draft.trim(),
      scope: identity.scope,
    });
    setNotice("Bản nháp đã sẵn sàng để chèn trong form ticket.");
  }

  return (
    <section
      className="assistant-cards"
      id="assistant-lookup"
      aria-label="Tra cứu và bản nháp"
      tabIndex={-1}
    >
      <h3>Tra cứu và bản nháp</h3>
      <form
        className="automation-form"
        onSubmit={(event) => {
          event.preventDefault();
          setDraft("");
          setNotice("");
          setQuery({
            kind,
            id: id.trim().toUpperCase(),
            version: Number(version),
          });
        }}
      >
        <label>
          Loại hồ sơ
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as Kind)}
          >
            <option value="source">Nguồn kiến thức</option>
            <option value="ticket">Ticket</option>
            <option value="asset">Tài sản</option>
          </select>
        </label>
        <label>
          Mã hồ sơ
          <input
            value={id}
            required
            maxLength={32}
            onChange={(event) => setId(event.target.value)}
          />
        </label>
        {kind === "source" && (
          <label>
            Phiên bản nguồn
            <input
              type="number"
              required
              min={1}
              max={9999}
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </label>
        )}
        <div>
          <button type="submit" className="ui-button" data-variant="secondary">
            Tra cứu DEMO
          </button>
        </div>
      </form>
      {query && (
        <div className="automation-notice">
          {source ? (
            <Link href={`/knowledge?id=${source.id}&version=${source.version}`}>
              {source.id} · v{source.version} · {source.title}
            </Link>
          ) : asset ? (
            <Link href={`/assets?id=${asset.id}`}>
              {asset.code} · {asset.model}
            </Link>
          ) : visibleTicket ? (
            <>
              <Link href={`/tickets/${visibleTicket.row.id}`}>
                {visibleTicket.row.id} · {visibleTicket.row.title}
              </Link>
              <p>
                {visibleTicket.row.state} · {visibleTicket.row.category}
              </p>
              <p>
                Phạm vi bản tóm tắt:{" "}
                {audience === "PUBLIC" ? "Công khai" : "Nội bộ"}
              </p>
              {audience === "INTERNAL" && (
                <p>Nhóm tiếp nhận · {visibleTicket.row.team}</p>
              )}
              {visibleTicket.canReply && generationEnabled && (
                <button
                  type="button"
                  className="ui-button"
                  data-variant="secondary"
                  onClick={() => {
                    setDraft(
                      audience === "PUBLIC"
                        ? "Xin chào, vui lòng cho biết vấn đề còn tiếp diễn và thời điểm xảy ra gần nhất."
                        : "Ghi chú DEMO nội bộ: kiểm tra trạng thái và xác minh bước xử lý tiếp theo với nhóm phụ trách.",
                    );
                    setNotice("");
                  }}
                >
                  Tạo bản nháp DEMO
                </button>
              )}
            </>
          ) : (
            <p role="status">Chưa đủ nguồn có thể truy cập.</p>
          )}
        </div>
      )}
      {draft && visibleTicket && (
        <div className="automation-form">
          <label>
            Bản nháp DEMO
            <textarea
              rows={4}
              maxLength={4000}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setNotice("");
              }}
            />
          </label>
          <label>
            Đích bản nháp
            <select
              value={target}
              onChange={(event) => {
                setTarget(event.target.value as "public" | "internal");
                setNotice("");
              }}
            >
              <option value="public">Phản hồi công khai</option>
              {audience === "INTERNAL" && (
                <option value="internal">Ghi chú nội bộ</option>
              )}
            </select>
          </label>
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            onClick={stage}
          >
            Chuẩn bị chèn vào ticket
          </button>
          {notice && (
            <p role={notice.startsWith("Không thể") ? "alert" : "status"}>
              {notice}
            </p>
          )}
          {notice.startsWith("Bản nháp") && (
            <Link href={`/tickets/${visibleTicket.row.id}`}>
              Mở form ticket
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
