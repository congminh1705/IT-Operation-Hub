"use client";
import { useId, useState } from "react";
import {
  attachmentAccept,
  selectAttachments,
} from "@/lib/demo/ticket-attachments";
import "./ticket-attachment-picker.css";
export function TicketAttachmentPicker({
  files,
  onChange,
  disabled,
}: {
  files: File[];
  onChange: (next: File[]) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [errors, setErrors] = useState<string[]>([]);
  return (
    <div className="ticket-attachment-picker">
      <label htmlFor={id}>Tệp đính kèm DEMO</label>
      <input
        id={id}
        name="files"
        type="file"
        accept={attachmentAccept}
        multiple
        disabled={disabled}
        aria-describedby={id + "-hint"}
        onChange={(event) => {
          const next = selectAttachments(
            files,
            Array.from(event.currentTarget.files ?? []),
          );
          event.currentTarget.value = "";
          setErrors(next.errors);
          onChange(next.files);
        }}
      />
      <p id={id + "-hint"}>
        PNG, JPEG, WebP hoặc PDF. Tối đa 5 tệp, mỗi tệp tối đa 10 MB.
      </p>
      {files.length > 0 && (
        <ul aria-label="Tệp đã chọn">
          {files.map((file, index) => (
            <li key={index}>
              {file.name} · {file.size.toLocaleString("vi-VN")} byte{" "}
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                disabled={disabled}
                aria-label={"Bỏ tệp " + file.name}
                onClick={() => {
                  setErrors([]);
                  onChange(files.filter((_, i) => i !== index));
                }}
              >
                Bỏ tệp
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
