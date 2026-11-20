"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import type {
  AttachmentTarget,
  UploadedAttachment,
  UploadFixture,
} from "@/lib/demo/ticket-attachments";

type Status =
  "running" | "partial" | "unknown" | "failed" | "cancelled" | "success";
export function TicketUpload({
  target,
  files,
  fixture,
  label,
  onClose,
}: {
  target: AttachmentTarget;
  files: UploadedAttachment[];
  fixture?: UploadFixture;
  label: string;
  onClose: () => void;
}) {
  const { store } = useSession();
  const [status, setStatus] = useState<Status>("running");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [completed, setCompleted] = useState(0);
  useEffect(() => {
    if (status !== "running") return;
    const timers = [
      setTimeout(() => setProgress(40), 220),
      setTimeout(() => setProgress(75), 480),
      setTimeout(() => {
        if (attempt === 0 && fixture === "upload-unknown") {
          setStatus("unknown");
          return;
        }
        if (attempt === 0 && fixture === "upload-failure") {
          setStatus("failed");
          return;
        }
        const partial = attempt === 0 && fixture === "upload-partial";
        const end = partial
          ? Math.max(completed, files.length - 1)
          : files.length;
        if (
          !store.tickets.saveAttachments(target, files.slice(completed, end))
        ) {
          setStatus("failed");
          return;
        }
        setCompleted(end);
        setProgress(100);
        setStatus(partial ? "partial" : "success");
      }, 820),
    ];
    return () => timers.forEach(clearTimeout);
  }, [status, store, target, files, fixture, attempt, completed]);
  const messages = {
    running: "Đang tải tệp DEMO…",
    partial: "Một số tệp chưa tải được do lỗi lưu trữ DEMO.",
    unknown: "Chưa xác nhận được kết quả tải tệp.",
    failed: "Không tải được tệp.",
    cancelled: "Đã hủy tải tệp.",
    success: "Đã tải xong tệp DEMO.",
  };
  return (
    <section
      className="directory-preview ticket-upload"
      aria-label="Kết quả tải tệp"
    >
      <h2>{label}</h2>
      <p
        role={
          status === "unknown" || status === "failed" || status === "partial"
            ? "alert"
            : "status"
        }
      >
        {messages[status]}
      </p>
      {status === "running" && (
        <progress aria-label="Tiến độ tải tệp" value={progress} max={100} />
      )}
      <ul aria-label="Trạng thái theo tệp">
        {files.map((file, index) => (
          <li key={file.id}>
            {file.name} ·{" "}
            {index < completed
              ? "Đã tải"
              : status === "unknown"
                ? "Chưa xác nhận"
                : "Chưa tải"}
          </li>
        ))}
      </ul>
      <div className="ticket-history-controls">
        {status === "running" && (
          <Button variant="secondary" onClick={() => setStatus("cancelled")}>
            Hủy tải tệp
          </Button>
        )}
        {status === "unknown" && (
          <Button
            onClick={() => {
              const confirmed = store.tickets.checkAttachments(target, files);
              if (confirmed) setCompleted(files.length);
              setStatus(confirmed ? "success" : "failed");
            }}
          >
            Kiểm tra kết quả tải
          </Button>
        )}
        {(status === "partial" ||
          status === "failed" ||
          status === "cancelled") && (
          <Button
            onClick={() => {
              setAttempt((value) => value + 1);
              setProgress(0);
              setStatus("running");
            }}
          >
            Tải lại tệp chưa hoàn tất
          </Button>
        )}
        {status !== "running" && status !== "unknown" && (
          <Button variant="secondary" onClick={onClose}>
            Về chi tiết yêu cầu
          </Button>
        )}
      </div>
    </section>
  );
}
