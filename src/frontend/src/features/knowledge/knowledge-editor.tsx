"use client";

import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import {
  audienceNames,
  type Audience,
  type KnowledgeDraft,
} from "@/lib/demo/knowledge";

type Action = "draft" | "publish" | "access";
const confirmLabels = {
  draft: "Lưu bản nháp",
  publish: "Xác nhận công bố",
  access: "Xác nhận đổi phạm vi",
};

export function KnowledgeEditor({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { store, persona } = useSession();
  const entry = persona && store.knowledge.edit(persona, id);
  const [draft, setDraft] = useState<KnowledgeDraft>(() =>
    entry
      ? { ...(entry.draft ?? entry.current) }
      : { title: "", body: "", audience: "employees", note: "" },
  );
  const [audience, setAudience] = useState<Audience>(
    entry ? entry.audience : "employees",
  );
  const [revision, setRevision] = useState(entry ? entry.revision : 1);
  const [preview, setPreview] = useState<Action | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!entry)
    return (
      <Feedback
        kind="forbidden"
        title="Bạn chưa được cấp quyền biên tập hoặc công bố"
      />
    );

  function update<K extends keyof KnowledgeDraft>(
    key: K,
    value: KnowledgeDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setPreview(null);
    setError("");
    setMessage("");
  }

  function submit(action: Action) {
    const actor = store.getSnapshot();
    if (!actor) return;
    const input = action === "access" ? { ...draft, audience } : draft;
    const method =
      preview === action ? store.knowledge.commit : store.knowledge.preview;
    const problem = method(actor, id, revision, action, input);
    setError(problem ?? "");
    if (problem) return;
    if (preview === action) {
      setRevision(revision + 1);
      setPreview(null);
      setMessage(
        action === "draft"
          ? "Đã lưu bản nháp."
          : action === "publish"
            ? "Đã công bố phiên bản."
            : "Đã cập nhật phạm vi đọc.",
      );
    } else {
      setMessage("");
      setPreview(action);
    }
  }

  return (
    <div className="knowledge-reader">
      <section
        className="automation-panel automation-form"
        aria-labelledby="knowledge-edit-heading"
      >
        <h2 id="knowledge-edit-heading">Phiên bản &amp; quyền bài viết</h2>
        <p>
          {entry.permissions.author
            ? "Bạn có quyền biên tập bản nháp."
            : "Bạn có quyền công bố và quản lý phạm vi đọc."}
        </p>
        {entry.permissions.author && (
          <>
            <label>
              Tiêu đề *
              <input
                value={draft.title}
                maxLength={180}
                onChange={(event) => update("title", event.target.value)}
              />
            </label>
            <label>
              Nội dung *
              <textarea
                rows={6}
                value={draft.body}
                maxLength={6000}
                onChange={(event) => update("body", event.target.value)}
              />
            </label>
            <label>
              Phạm vi đọc dự kiến
              <select
                value={draft.audience}
                onChange={(event) =>
                  update("audience", event.target.value as Audience)
                }
              >
                {Object.entries(audienceNames).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ghi chú phiên bản
              <textarea
                rows={2}
                value={draft.note}
                maxLength={500}
                onChange={(event) => update("note", event.target.value)}
              />
            </label>
          </>
        )}
        {entry.permissions.publisher && (
          <>
            {entry.draft ? (
              <div className="automation-notice">
                <h3>{entry.draft.title}</h3>
                <p>{entry.draft.body}</p>
                <p>{audienceNames[entry.draft.audience]}</p>
              </div>
            ) : (
              <p>Chưa có bản nháp đã lưu.</p>
            )}
            <label>
              Phạm vi đọc hiện hành
              <select
                value={audience}
                onChange={(event) => {
                  setAudience(event.target.value as Audience);
                  setPreview(null);
                  setMessage("");
                }}
              >
                {Object.entries(audienceNames).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {preview && (
          <div className="automation-notice" role="status">
            {preview === "access"
              ? "Phạm vi đọc sau thay đổi · " + audienceNames[audience]
              : "Phiên bản v" +
                (entry.version + 1) +
                " · " +
                (preview === "publish" ? entry.draft?.title : draft.title)}
          </div>
        )}
        <div className="automation-actions">
          <button
            className="ui-button"
            type="button"
            data-variant="secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          {preview ? (
            <button
              className="ui-button"
              type="button"
              onClick={() => submit(preview)}
            >
              {confirmLabels[preview]}
            </button>
          ) : (
            <>
              {entry.permissions.author && (
                <button
                  className="ui-button"
                  type="button"
                  onClick={() => submit("draft")}
                >
                  Xem trước bản nháp
                </button>
              )}
              {entry.permissions.publisher && (
                <>
                  <button
                    className="ui-button"
                    type="button"
                    onClick={() => submit("publish")}
                  >
                    Review công bố phiên bản
                  </button>
                  <button
                    className="ui-button"
                    type="button"
                    data-variant="secondary"
                    onClick={() => submit("access")}
                  >
                    Xem trước quyền đọc
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>
      <aside className="automation-panel" aria-label="Vòng đời nội dung">
        <h2>Vòng đời nội dung</h2>
        <p>Đang công bố · v{entry.version}</p>
        <p>
          {entry.draft
            ? "Bản nháp · v" + (entry.version + 1)
            : "Chưa có bản nháp"}
        </p>
        <p>Quyền đọc hiện hành · {audienceNames[entry.audience]}</p>
      </aside>
    </div>
  );
}
