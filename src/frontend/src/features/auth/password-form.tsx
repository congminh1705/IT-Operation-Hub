"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { AccountGateway } from "@/lib/api/types";
import { useSession } from "./session";
import "./profile-form.css";
import "./password-form.css";

const fields = [
  ["old-password", "Mật khẩu hiện tại", "current-password"],
  ["new-password", "Mật khẩu mới", "new-password"],
  ["confirm-password", "Nhập lại mật khẩu mới", "new-password"],
] as const;

export function PasswordForm() {
  const { store } = useSession();
  return (
    <PasswordEditor
      demo
      changePassword={store.adapter.gateway.changeOwnPassword}
      invalidate={store.invalidate}
    />
  );
}

export function PasswordEditor({
  demo = false,
  changePassword,
  invalidate,
}: {
  demo?: boolean;
  changePassword: AccountGateway["changeOwnPassword"];
  invalidate?: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<{ text: string; field?: string }>();

  function showError(text: string, field?: string) {
    setError({ text, field });
    requestAnimationFrame(() => {
      if (field)
        (
          form.current?.elements.namedItem(field) as HTMLInputElement | null
        )?.focus();
      else feedback.current?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const current = String(data.get("old-password") ?? "");
    const next = String(data.get("new-password") ?? "");
    if (!current.trim())
      return showError("Nhập mật khẩu hiện tại.", "old-password");
    if (!next.trim()) return showError("Nhập mật khẩu mới.", "new-password");
    if (next !== data.get("confirm-password"))
      return showError("Hai mật khẩu mới chưa khớp.", "confirm-password");
    inFlight.current = true;
    setBusy(true);
    setError(undefined);
    setVisible({});
    try {
      const result = await changePassword({
        current_password: current,
        new_password: next,
      });
      if (result.kind === "success") formElement.reset();
      else if (result.kind === "unauthenticated") {
        formElement.reset();
        invalidate?.();
      } else if (result.kind === "validation") {
        const invalidNew = !!result.error.field_errors?.new_password;
        if (invalidNew)
          showError(
            "Chọn mật khẩu mới hợp lệ và khác mật khẩu hiện tại.",
            "new-password",
          );
        else showError("Mật khẩu hiện tại không đúng.", "old-password");
      } else showError("Chưa xác nhận đổi mật khẩu. Vui lòng thử lại.");
    } catch {
      showError("Không kết nối được. Vui lòng thử lại.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      ref={form}
      className="profile-panel profile-form password-form"
      onSubmit={submit}
      noValidate
      aria-busy={busy}
    >
      <p id="password-demo-help">
        {demo
          ? "Chỉ dùng giá trị thử nghiệm. Chính sách mật khẩu thật chưa được áp dụng."
          : "Nhập mật khẩu mới và xác nhận lại để đổi mật khẩu."}
      </p>
      {fields.map(([id, label, autofill]) => (
        <div className="password-field" key={id}>
          <label htmlFor={id}>{label} *</label>
          <div className="password-input">
            <input
              id={id}
              name={id}
              type={visible[id] ? "text" : "password"}
              autoComplete={autofill}
              required
              readOnly={busy}
              aria-invalid={error?.field === id}
              aria-describedby={
                error?.field === id ? "password-error" : "password-demo-help"
              }
              onChange={() => {
                if (error?.field === id) setError(undefined);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              aria-pressed={!!visible[id]}
              aria-label={(visible[id] ? "Ẩn " : "Hiện ") + label.toLowerCase()}
              onClick={() =>
                setVisible((value) => ({ ...value, [id]: !value[id] }))
              }
            >
              {visible[id] ? "Ẩn" : "Hiện"}
            </Button>
          </div>
        </div>
      ))}
      {error && (
        <p id="password-error" role="alert" tabIndex={-1} ref={feedback}>
          {error.text}
        </p>
      )}
      <div className="password-note">
        <strong>Mật khẩu không đi qua AI</strong>
        <p>
          {demo
            ? "Đổi mật khẩu trong DEMO sẽ kết thúc phiên hiện tại và yêu cầu đăng nhập lại."
            : "Đổi mật khẩu sẽ kết thúc các phiên đang mở. Hãy đăng nhập lại bằng mật khẩu mới."}
        </p>
      </div>
      <div className="profile-actions">
        <Link
          href="/profile"
          className="ui-button"
          data-variant="secondary"
          onClick={() => form.current?.reset()}
        >
          Hủy
        </Link>
        <Button type="submit" disabled={busy}>
          {busy ? "Đang xử lý…" : demo ? "Đổi mật khẩu DEMO" : "Đổi mật khẩu"}
        </Button>
      </div>
    </form>
  );
}
