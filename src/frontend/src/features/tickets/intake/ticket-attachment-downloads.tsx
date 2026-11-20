"use client";
import { useRef, useState } from "react";
import { useSession } from "@/features/auth/session";
import type { TicketAttachment } from "@/lib/demo/ticket-attachments";

function demoPdf() {
  const line = "BT /F1 22 Tf 38 92 Td (IT Operations Hub - DEMO) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 160] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " + line.length + " >>\nstream\n" + line + "\nendstream",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, index) => {
    const offset = pdf.length;
    pdf += index + 1 + " 0 obj\n" + body + "\nendobj\n";
    return offset;
  });
  const start = pdf.length;
  pdf +=
    "xref\n0 6\n0000000000 65535 f \n" +
    offsets
      .map((offset) => String(offset).padStart(10, "0") + " 00000 n \n")
      .join("");
  pdf +=
    "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + start + "\n%%EOF\n";
  return new Blob([pdf], { type: "application/pdf" });
}

function demoFile(mime: string): Promise<Blob | null> {
  if (mime === "application/pdf") return Promise.resolve(demoPdf());
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 120;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.fillStyle = "#eff3f1";
  context.fillRect(0, 0, 360, 120);
  context.fillStyle = "#087f78";
  context.font = "24px sans-serif";
  context.fillText("IT Operations Hub · DEMO", 25, 65);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob?.type === mime ? blob : null), mime),
  );
}

export function TicketAttachmentDownloads({
  ticketId,
  files,
  simulateTransfer,
  onForbidden,
}: {
  ticketId: string;
  files: TicketAttachment[];
  simulateTransfer: boolean;
  onForbidden: () => void;
}) {
  const { store } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  if (!files.length) return null;
  async function download(fileId: string) {
    const identity = store.identity();
    if (!identity || busy.current) return;
    busy.current = true;
    setActive(fileId);
    setMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 180));
      const result = store.tickets.attachmentForDownload(
        ticketId,
        fileId,
        identity.scope,
        simulateTransfer,
      );
      if (result.kind === "forbidden") {
        onForbidden();
        return;
      }
      if (result.kind === "missing") {
        setMessage("Tệp không còn trong phiên DEMO.");
        return;
      }
      const blob = await demoFile(result.mime);
      const confirmed = store.tickets.attachmentForDownload(
        ticketId,
        fileId,
        identity.scope,
        simulateTransfer,
      );
      if (confirmed.kind === "forbidden") {
        onForbidden();
        return;
      }
      if (!blob || confirmed.kind !== "success") {
        setMessage("Không thể tải tệp DEMO.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DEMO-" + confirmed.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      busy.current = false;
      setActive(null);
    }
  }
  return (
    <div className="ticket-attachment-picker">
      <ul aria-label="Tệp đính kèm DEMO">
        {files.map((file) => (
          <li key={file.id}>
            <span>
              {file.name} · {file.size.toLocaleString("vi-VN")} byte
            </span>{" "}
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              disabled={!!active}
              aria-label={"Tải " + file.name}
              onClick={() => void download(file.id)}
            >
              {active === file.id ? "Đang tải…" : "Tải xuống"}
            </button>
          </li>
        ))}
      </ul>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
