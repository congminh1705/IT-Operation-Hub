"use client";

import { useRef, useState } from "react";
import { TicketUpload } from "./ticket-upload";
import type {
  UploadedAttachment,
  AttachmentTarget,
  UploadFixture,
} from "@/lib/demo/ticket-attachments";
import { TicketAttachmentPicker } from "./ticket-attachment-picker";
import { useSession } from "@/features/auth/session";

type Audience = "public" | "internal";

export function TicketReplyComposer({
  id,
  view,
  version,
  internal,
  simulateRevocation,
  uploadFixture,
  onPosted,
  onRevoked,
}: {
  id: string;
  view: Audience | "history";
  version: number;
  internal: boolean;
  simulateRevocation: boolean;
  uploadFixture?: UploadFixture;
  onPosted: () => void;
  onRevoked: (draft: string) => void;
}) {
  const { store } = useSession();
  const [drafts, setDrafts] = useState({ public: "", internal: "" });
  const [files, setFiles] = useState<Record<Audience, File[]>>({
    public: [],
    internal: [],
  });
  const [preview, setPreview] = useState<{
    audience: Audience;
    text: string;
    version: number;
  } | null>(null);
  const [saved, setSaved] = useState<{
    target: AttachmentTarget;
    files: UploadedAttachment[];
  }>();
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const lock = useRef(false);
  const currentPreview = preview?.audience === view ? preview : null;
  if (saved)
    return (
      <TicketUpload
        target={saved.target}
        files={saved.files}
        fixture={uploadFixture}
        label="Nội dung trao đổi đã lưu"
        onClose={() => {
          setSaved(undefined);
          onPosted();
        }}
      />
    );
  if (view === "history") return null;
  const isInternal = view === "internal";

  async function confirm() {
    if (!currentPreview || lock.current) return;
    const identity = store.identity();
    if (!identity) return;
    lock.current = true;
    setSending(true);
    const outcome = await store.tickets.postMessage(
      id,
      currentPreview.audience,
      currentPreview.text,
      currentPreview.version,
      simulateRevocation,
    );
    lock.current = false;
    setSending(false);
    if (outcome === "forbidden") {
      onRevoked(drafts[currentPreview.audience]);
      return;
    }
    setPreview(null);
    if (typeof outcome === "string") {
      setFeedback("Chưa gửi được. Kiểm tra lại bản nháp và xem trước lần nữa.");
      return;
    }
    setDrafts((current) => ({ ...current, [currentPreview.audience]: "" }));
    const selected = files[currentPreview.audience];
    if (selected.length) {
      const batch = crypto.randomUUID();
      setSaved({
        target: {
          ticketId: id,
          eventId: outcome.eventId,
          owner: identity.userId,
          scope: identity.scope,
        },
        files: selected.map(({ name, type, size }, index) => ({
          name,
          type,
          size,
          id: batch + "-" + index,
        })),
      });
      setFiles((previous) => ({ ...previous, [currentPreview.audience]: [] }));
    }
    setFeedback("Đã gửi nội dung.");
    onPosted();
  }

  return (
    <div className="ticket-reply">
      {feedback && <p role="status">{feedback}</p>}
      {currentPreview ? (
        <section aria-label="Xem trước nội dung">
          <h3>
            {isInternal
              ? "Xem trước ghi chú nội bộ"
              : "Xem trước phản hồi công khai"}
          </h3>
          <p className="ticket-reply-preview">{currentPreview.text}</p>
          {!!files[view].length && (
            <ul aria-label="Tệp trong bản xem trước">
              {files[view].map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
          <div className="ticket-history-controls">
            <button
              className="ui-button"
              type="button"
              disabled={sending}
              onClick={confirm}
            >
              {sending ? "Đang gửi…" : "Xác nhận gửi"}
            </button>
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              disabled={sending}
              onClick={() => setPreview(null)}
            >
              Quay lại chỉnh sửa
            </button>
          </div>
        </section>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const text = drafts[view].trim();
            if (!text) {
              setFeedback("Nhập nội dung trước khi xem trước.");
              return;
            }
            setFeedback("");
            setPreview({ audience: view, text, version });
          }}
        >
          <label htmlFor="ticket-reply">
            {isInternal
              ? "Nội dung ghi chú nội bộ"
              : internal
                ? "Nội dung công khai"
                : "Phản hồi cho IT"}
          </label>
          <textarea
            id="ticket-reply"
            className="ticket-reply-input"
            required
            maxLength={4000}
            value={drafts[view]}
            onChange={(event) => {
              const text = event.target.value;
              setDrafts((current) => ({ ...current, [view]: text }));
            }}
          />
          <TicketAttachmentPicker
            key={view}
            files={files[view]}
            onChange={(next) =>
              setFiles((previous) => ({ ...previous, [view]: next }))
            }
          />
          <button className="ui-button" type="submit">
            {isInternal ? "Xem trước ghi chú" : "Xem trước phản hồi"}
          </button>
        </form>
      )}
    </div>
  );
}
