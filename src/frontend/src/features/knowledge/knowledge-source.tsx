"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/features/auth/session";
import { indexLabels, type SourceAvailability } from "@/lib/demo/knowledge";

const unavailableLabels = {
  retired: "Đã ngừng sử dụng",
  revoked: "Đã thu hồi quyền đọc nguồn",
};

export function KnowledgeSource({
  id,
  version,
  state,
}: {
  id: string;
  version: number;
  state: keyof typeof indexLabels;
}) {
  const { store, persona } = useSession();
  const [showCitation, setShowCitation] = useState(false);
  const [confirmation, setConfirmation] = useState<SourceAvailability | null>(
    null,
  );
  if (!persona) return null;
  const knowledge = store.knowledge;
  const canManage = knowledge.access(persona, id).publisher;
  const citation = showCitation
    ? knowledge.citation(persona, store.teams.ownTeamIds(), id, version)
    : null;

  function advance(step: "retry" | "result") {
    const actor = store.getSnapshot();
    if (actor)
      knowledge.advanceIndex(
        actor,
        store.teams.ownTeamIds(),
        id,
        version,
        step,
      );
  }

  return (
    <section className="knowledge-source" aria-label="Chỉ mục và trích dẫn">
      <h3>Chỉ mục và trích dẫn</h3>
      <p role="status" data-index={state}>
        {indexLabels[state]}
      </p>
      {state === "ready" ? (
        <>
          <button
            className="ui-button"
            type="button"
            data-variant="secondary"
            aria-expanded={showCitation}
            onClick={() => setShowCitation((open) => !open)}
          >
            Trích dẫn DEMO
          </button>
          {citation && (
            <p aria-label="Trích dẫn đang mở">
              <Link
                href={`/knowledge?id=${citation.id}&version=${citation.version}`}
              >
                {citation.id} · v{citation.version} · {citation.title}
              </Link>
            </p>
          )}
        </>
      ) : (
        <p>Chưa đủ nguồn để trích dẫn phiên bản này.</p>
      )}
      {canManage && (
        <div className="automation-actions">
          {(state === "stale" || state === "pending") && (
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              onClick={() => advance("retry")}
            >
              Thử lại chỉ mục DEMO
            </button>
          )}
          {state === "indexing" && (
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              onClick={() => advance("result")}
            >
              Nhận kết quả chỉ mục DEMO
            </button>
          )}
          {confirmation ? (
            <>
              <p role="status">
                {confirmation === "revoked"
                  ? "Thu hồi quyền với mọi phiên bản và trích dẫn?"
                  : "Ngừng sử dụng mọi phiên bản của bài viết?"}
              </p>
              <button
                type="button"
                className="ui-button"
                onClick={() => {
                  const actor = store.getSnapshot();
                  if (actor) knowledge.makeUnavailable(actor, id, confirmation);
                }}
              >
                Xác nhận
              </button>
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => setConfirmation(null)}
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => setConfirmation("revoked")}
              >
                Thu hồi nguồn DEMO
              </button>
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => setConfirmation("retired")}
              >
                Ngừng sử dụng bài viết
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export function KnowledgeUnavailable({
  state,
}: {
  state?: SourceAvailability;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state) heading.current?.focus();
  }, [state]);
  return (
    <section
      className="automation-panel"
      aria-labelledby="knowledge-unavailable"
    >
      <h2 id="knowledge-unavailable" ref={heading} tabIndex={-1}>
        Không tìm thấy nguồn có thể đọc
      </h2>
      <p role="status">
        {state
          ? unavailableLabels[state]
          : "Kiểm tra lại liên kết hoặc quay về kho kiến thức."}
      </p>
      <Link href="/knowledge" className="ui-button" data-variant="secondary">
        Về kho kiến thức
      </Link>
    </section>
  );
}
