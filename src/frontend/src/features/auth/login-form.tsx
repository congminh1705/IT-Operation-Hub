"use client";
import { useEffect, useRef, useState } from "react";
import { createDemoGateway } from "@/lib/demo/gateway";
import { createDemoFixtures } from "@/lib/demo/fixtures";
import { loginMarkup } from "./login-markup";
import "./login.css";

export function LoginForm() {
  const root = useRef<HTMLDivElement>(null);
  const [adapter] = useState(createDemoGateway);
  useEffect(() => {
    const host = root.current!;
    const email = host.querySelector<HTMLInputElement>("#login-email")!;
    const password = host.querySelector<HTMLInputElement>("#login-password")!;
    const form = host.querySelector<HTMLFormElement>("form")!;
    const button = host.querySelector<HTMLButtonElement>("#access-submit")!;
    const summary = host.querySelector<HTMLElement>("#access-summary")!;
    const toggle = host.querySelector<HTMLButtonElement>("#access-toggle")!;
    let busy = false,
      alive = true;
    const events = new AbortController();
    const options = { signal: events.signal };
    const error = (field: HTMLInputElement, text: string) => {
      field.setAttribute("aria-invalid", String(!!text));
      host.querySelector(
        `#access-${field === email ? "email" : "password"}-error`,
      )!.textContent = text;
    };
    const validate = () => {
      error(
        email,
        !email.value.trim()
          ? "Nhập email công việc."
          : email.validity.typeMismatch
            ? "Email chưa đúng định dạng."
            : "",
      );
      error(password, !password.value ? "Nhập mật khẩu." : "");
      return !email.value.trim() || email.validity.typeMismatch
        ? email
        : !password.value
          ? password
          : null;
    };
    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        if (busy) return;
        const invalid = validate();
        if (invalid) {
          invalid.focus();
          return;
        }
        busy = true;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.querySelector("span")!.textContent = "Đang kiểm tra…";
        try {
          const result = await adapter.gateway.login({
            email: email.value,
            password: password.value,
          });
          if (!alive) return;
          summary.textContent =
            result.kind === "success"
              ? "Đăng nhập DEMO thành công. Điều hướng phiên sẽ được tích hợp ở bước tiếp theo."
              : result.kind === "unauthenticated"
                ? "Không thể đăng nhập. Kiểm tra thông tin hoặc liên hệ Admin."
                : result.kind === "pending" || result.kind === "unknown"
                  ? "Chưa xác nhận được kết quả. Vui lòng thử lại."
                  : "Chưa thể kết nối. Vui lòng thử lại.";
          password.value = "";
          summary.focus();
        } catch {
          if (alive) {
            summary.textContent =
              "Chưa thể kết nối. Kiểm tra mạng rồi thử lại.";
            summary.focus();
          }
        } finally {
          if (alive) {
            busy = false;
            button.disabled = false;
            button.removeAttribute("aria-busy");
            button.querySelector("span")!.textContent = "Đăng nhập";
          }
        }
      },
      options,
    );
    toggle.addEventListener(
      "click",
      () => {
        const start = password.selectionStart,
          end = password.selectionEnd,
          direction = password.selectionDirection;
        const visible = password.type === "password";
        password.type = visible ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(visible));
        toggle.setAttribute(
          "aria-label",
          visible ? "Ẩn mật khẩu" : "Hiện mật khẩu",
        );
        password.focus();
        if (start !== null)
          password.setSelectionRange(start, end, direction ?? undefined);
      },
      options,
    );
    for (const input of [email, password]) {
      input.addEventListener(
        "input",
        () => {
          error(input, "");
          summary.textContent = "";
        },
        options,
      );
      input.addEventListener(
        "blur",
        () => {
          if (input.value) validate();
        },
        options,
      );
    }
    const caps = (event: KeyboardEvent) => {
      host.querySelector<HTMLElement>("#access-caps")!.hidden =
        !event.getModifierState("CapsLock");
    };
    password.addEventListener("keydown", caps, options);
    password.addEventListener("keyup", caps, options);
    host.querySelector("[data-access-help]")!.addEventListener(
      "click",
      () => {
        summary.textContent =
          "Liên hệ Admin qua kênh hỗ trợ nội bộ. Không gửi mật khẩu trong ticket.";
        summary.focus();
      },
      options,
    );
    return () => {
      alive = false;
      events.abort();
      password.value = "";
      adapter.controls.reset();
    };
  }, [adapter]);
  return (
    <div className="login-root readable-ui" data-surface="graphite">
      <div ref={root} dangerouslySetInnerHTML={{ __html: loginMarkup }} />
      <details className="login-demo">
        <summary>Tài khoản DEMO — dữ liệu giả lập</summary>
        <p>Chỉ dùng mật khẩu thử bất kỳ, không dùng mật khẩu thật.</p>
        {Object.values(createDemoFixtures().personas).map(({ user }) => (
          <button
            key={user.id}
            type="button"
            onClick={() => {
              const input =
                root.current!.querySelector<HTMLInputElement>("#login-email")!;
              input.value = user.email!;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.focus();
            }}
          >
            {user.role}
          </button>
        ))}
      </details>
    </div>
  );
}
