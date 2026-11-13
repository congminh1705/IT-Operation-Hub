"use client";

import Link from "next/link";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Feedback, type FeedbackKind } from "@/components/feedback/feedback";
import {
  FormErrors,
  focusFirstInvalid,
} from "@/components/feedback/form-feedback";

export default function FeedbackPreview() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"error" | "conflict" | null>(null);
  const [outcome, setOutcome] = useState<"error" | "conflict">("error");
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    if (draft.trim().length < 5) {
      setError(
        "Nhập nội dung minh họa từ 5 ký tự. Nội dung hiện có được giữ lại để bạn sửa.",
      );
      requestAnimationFrame(() => focusFirstInvalid(form));
      return;
    }
    setError("");
    setResult(null);
    setSending(true);
    timer.current = setTimeout(() => {
      setSending(false);
      setResult(outcome);
      timer.current = null;
    }, 700);
  }

  const kinds: FeedbackKind[] = [
    "loading",
    "empty",
    "filter-empty",
    "error",
    "forbidden",
    "conflict",
  ];
  return (
    <main className="primitive-preview feedback-preview">
      <h1>Phản hồi & hộp thoại</h1>
      <p className="ui-description">
        FE-02.02 · Dữ liệu DEMO · Thành phần dùng chung, chưa có thao tác nghiệp
        vụ.
      </p>
      <div className="ui-preview-toolbar">
        <Button id="dialog-trigger" onClick={() => setOpen(true)}>
          Mở hộp thoại minh họa
        </Button>
        <Link href="/preview/primitives">Xem primitive</Link>
      </div>
      <div className="feedback-grid">
        {kinds.map((kind) => (
          <Feedback
            key={kind}
            kind={kind}
            action={
              kind === "loading"
                ? undefined
                : {
                    label:
                      kind === "filter-empty"
                        ? "Xóa bộ lọc"
                        : kind === "error"
                          ? "Thử lại"
                          : kind === "conflict"
                            ? "Tải lại để kiểm tra"
                            : "Xem minh họa",
                    onClick: () =>
                      setNotice(
                        "Đã chọn thao tác minh họa. Không có dữ liệu nghiệp vụ được thay đổi.",
                      ),
                  }
            }
          />
        ))}
      </div>
      <p role="status" className="ui-preview-notice">
        {notice}
      </p>
      <Dialog
        open={open}
        title="Kiểm tra nội dung minh họa"
        description="Chưa gửi thay đổi. Đóng hộp thoại vẫn giữ nội dung bạn đang soạn trong phiên này."
        onRequestClose={() => setOpen(false)}
      >
        <form noValidate onSubmit={submit} aria-busy={sending || undefined}>
          <FormErrors
            errors={error ? [{ fieldId: "demo-draft", message: error }] : []}
          />
          <Input
            id="demo-draft"
            label="Nội dung minh họa"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            error={error}
            readOnly={sending}
            required
            aria-describedby="demo-draft-help"
          />
          <p id="demo-draft-help" className="ui-field-hint">
            Chỉ nhập dữ liệu giả. Khi mô phỏng lỗi hoặc xung đột, nội dung không
            bị xóa.
          </p>
          <div className="ui-field ui-demo-outcome">
            <label htmlFor="demo-outcome">Kết quả mô phỏng</label>
            <select
              id="demo-outcome"
              value={outcome}
              disabled={sending}
              onChange={(e) => {
                setResult(null);
                setOutcome(e.target.value as "error" | "conflict");
              }}
            >
              <option value="error">Lỗi tải/gửi</option>
              <option value="conflict">Dữ liệu đã thay đổi</option>
            </select>
          </div>
          {result && (
            <Feedback
              kind={result}
              action={
                result === "conflict"
                  ? {
                      label: "Tải lại để kiểm tra",
                      onClick: () => {
                        setResult(null);
                        setNotice(
                          "Đã kiểm tra lại dữ liệu DEMO. Bản nháp được giữ nguyên; chưa gửi lại thay đổi.",
                        );
                      },
                    }
                  : undefined
              }
            />
          )}
          <p role="status" className="ui-submit-status">
            {sending ? "Đang gửi minh họa…" : ""}
          </p>
          <div className="ui-form-actions">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Để sau
            </Button>
            <Button type="submit" loading={sending}>
              Gửi minh họa
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}
