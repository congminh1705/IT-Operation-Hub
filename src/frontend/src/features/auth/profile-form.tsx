"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/navigation";
import type { AccountGateway, UserView } from "@/lib/api/types";
import { useSession } from "./session";
import "./profile-form.css";

export function ProfileForm({ user }: { user: UserView }) {
  const { store, refresh } = useSession();
  return (
    <ProfileEditor
      user={user}
      saveProfile={store.updateOwnProfile}
      reload={async () => {
        await refresh();
        return store.getSnapshot()?.user;
      }}
    />
  );
}

export function ProfileEditor({
  user,
  saveProfile,
  reload,
}: {
  user: UserView;
  saveProfile: AccountGateway["updateOwnProfile"];
  reload: () => Promise<UserView | undefined>;
}) {
  const [draft, setDraft] = useState<{ name: string; version: number }>();
  const [feedback, setFeedback] = useState<{
    text: string;
    kind: "field" | "error" | "conflict" | "success";
  }>();
  const [busy, setBusy] = useState(false);
  const request = useRef(false);
  const field = useRef<HTMLInputElement>(null);
  const message = useRef<HTMLParagraphElement>(null);
  const name = draft?.name ?? user.display_name;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current || !draft) return;
    if (!name.trim() || [...name.trim()].length > 120) {
      setFeedback({
        kind: "field",
        text: "Nhập họ và tên từ 1 đến 120 ký tự.",
      });
      field.current?.focus();
      return;
    }
    request.current = true;
    setBusy(true);
    setFeedback(undefined);
    try {
      const result = await saveProfile({
        display_name: name.trim(),
        expectedVersion: draft.version,
      });
      if (result.kind === "success") {
        setDraft(undefined);
        setFeedback({ kind: "success", text: "Đã lưu hồ sơ." });
        return;
      }
      if (result.kind === "validation") {
        setFeedback({
          kind: "field",
          text:
            result.error.field_errors?.display_name?.[0] ??
            result.error.message,
        });
        requestAnimationFrame(() => field.current?.focus());
        return;
      }
      if (result.kind === "conflict") {
        setFeedback({
          kind: "conflict",
          text: "Hồ sơ đã thay đổi. Tải bản hiện tại và kiểm tra lại tên trước khi lưu.",
        });
      } else {
        setFeedback({
          kind: "error",
          text: "Chưa xác nhận lưu hồ sơ. Tên đã nhập vẫn còn để bạn thử lại.",
        });
      }
      requestAnimationFrame(() => message.current?.focus());
    } catch {
      setFeedback({
        kind: "error",
        text: "Không kết nối được. Tên đã nhập vẫn còn để bạn thử lại.",
      });
      requestAnimationFrame(() => message.current?.focus());
    } finally {
      request.current = false;
      setBusy(false);
    }
  }

  async function reloadVersion() {
    if (request.current) return;
    request.current = true;
    setBusy(true);
    try {
      const current = await reload();
      if (current?.id === user.id) {
        setDraft({ name, version: current.version });
        setFeedback({
          kind: "success",
          text: `Tên hiện tại: ${current.display_name}. Kiểm tra bản nháp trước khi lưu.`,
        });
        field.current?.focus();
      }
    } finally {
      request.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="profile-grid">
      <form
        className="profile-panel profile-form"
        onSubmit={save}
        noValidate
        aria-busy={busy}
      >
        <label htmlFor="profile-name">Họ và tên *</label>
        <input
          id="profile-name"
          ref={field}
          value={name}
          required
          readOnly={busy}
          autoComplete="name"
          aria-invalid={feedback?.kind === "field"}
          aria-describedby={
            feedback?.kind === "field" ? "profile-feedback" : undefined
          }
          onChange={(event) => {
            setDraft({
              name: event.target.value,
              version: draft?.version ?? user.version,
            });
            if (feedback?.kind !== "conflict") setFeedback(undefined);
          }}
        />
        {feedback?.kind === "field" && (
          <p id="profile-feedback" role="alert">
            {feedback.text}
          </p>
        )}
        <label htmlFor="profile-email">Email công việc</label>
        <input
          id="profile-email"
          type="email"
          readOnly
          value={user.email ?? ""}
        />
        <p>
          Phòng ban và quyền do Admin quản lý. Bạn có thể cập nhật tên hiển thị.
        </p>
        {feedback && feedback.kind !== "field" && (
          <p
            ref={message}
            tabIndex={-1}
            data-state={feedback.kind}
            role={feedback.kind === "success" ? "status" : "alert"}
          >
            {feedback.text}
          </p>
        )}
        <div className="profile-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !draft}
            onClick={() => {
              setDraft(undefined);
              setFeedback(undefined);
              field.current?.focus();
            }}
          >
            Hủy
          </Button>
          {feedback?.kind === "conflict" ? (
            <Button
              type="button"
              disabled={busy}
              key="reload"
              onClick={(event) => {
                event.preventDefault();
                void reloadVersion();
              }}
            >
              Tải lại hồ sơ
            </Button>
          ) : (
            <Button
              type="submit"
              key="save"
              disabled={busy || !draft || name === user.display_name}
            >
              {busy ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          )}
        </div>
      </form>
      <aside className="profile-aside">
        <section className="profile-panel">
          <h2>Tài khoản hiện tại</h2>
          <dl>
            <dt>Vai trò</dt>
            <dd>{roleLabels[user.role]}</dd>
            <dt>Trạng thái</dt>
            <dd>
              <span className="profile-active">Đang hoạt động</span>
            </dd>
          </dl>
        </section>
        <section className="profile-panel">
          <h2>Bảo mật</h2>
          <Link className="shell-return-link" href="/profile/security">
            Đổi mật khẩu
          </Link>
        </section>
      </aside>
    </div>
  );
}
