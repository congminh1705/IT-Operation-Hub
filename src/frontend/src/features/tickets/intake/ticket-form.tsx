"use client";
import type { WorkspaceSearch } from "@/components/layout/workspace-page";
import { submitFixtures } from "@/lib/demo/ticket-intake";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import {
  allowedAssets,
  derivePriority,
  readTicketDraft,
  type TicketDraft,
} from "@/lib/demo/ticket-draft";
import "@/features/administration/users-screen.css";
import "./ticket-form.css";

export function TicketForm({ search }: { search: WorkspaceSearch }) {
  const { persona, store } = useSession();
  const router = useRouter();
  const [type, setType] = useState("");
  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState("");
  const [onboarding, setOnboarding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<{ field: string; message: string }>();
  const [draft, setDraft] = useState<TicketDraft>();
  const [submission, setSubmission] = useState<
    "pending" | "failure" | "stale" | "unknown"
  >();
  const intent = useRef("");
  const busy = useRef(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  async function send() {
    if (!draft || !persona || busy.current || submission === "unknown") return;
    busy.current = true;
    setSubmission("pending");
    const result = await store.tickets.submit(
      persona,
      draft,
      intent.current,
      submitFixtures.find((item) => item === search.demo),
    );
    busy.current = false;
    if (result.kind === "success") {
      router.replace("/tickets/" + result.id);
      return;
    }
    setSubmission(result.kind);
    requestAnimationFrame(() => feedback.current?.focus());
  }
  const [files, setFiles] = useState<File[]>([]);
  const form = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  if (!persona) return null;
  const categories = store.catalog.activeLabels("categories");
  const priority = derivePriority(impact, urgency);
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!persona || draft) return;
    const data = new FormData(event.currentTarget);
    data.delete("files");
    for (const file of files) data.append("files", file);
    const result = readTicketDraft(data, persona, categories);
    if (!result.ok) {
      setError(result);
      const target = event.currentTarget.elements.namedItem(result.field);
      if (target instanceof HTMLElement) target.focus();
      return;
    }
    setError(undefined);
    intent.current = crypto.randomUUID();
    setSubmission(undefined);
    setDraft(result.draft);
    requestAnimationFrame(() => heading.current?.focus());
  }
  const invalid = (field: string) => ({
    "aria-invalid": error?.field === field,
    "aria-describedby":
      error?.field === field ? "ticket-draft-error" : undefined,
  });
  return (
    <div className="directory-grid">
      <form
        className="directory-panel directory-card ticket-create-form"
        ref={form}
        onSubmit={validate}
        onChange={() => {
          setDirty(true);
          setError(undefined);
        }}
      >
        <fieldset disabled={!!draft}>
          <div className="directory-pair">
            <label>
              Loại yêu cầu
              <select
                aria-label="Loại yêu cầu"
                name="type"
                required
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  if (e.target.value !== "service") setOnboarding(false);
                }}
                {...invalid("type")}
              >
                <option value="">Chọn loại yêu cầu</option>
                <option value="service">Yêu cầu dịch vụ</option>
                <option value="incident">Sự cố</option>
              </select>
            </label>
            <label>
              Danh mục
              <select
                aria-label="Danh mục"
                name="category"
                required
                defaultValue=""
                {...invalid("category")}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Tiêu đề
            <input
              name="title"
              required
              minLength={5}
              maxLength={180}
              {...invalid("title")}
            />
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={10000}
              {...invalid("description")}
            />
          </label>
          <div className="directory-pair">
            <label>
              Mức ảnh hưởng
              <select
                aria-label="Mức ảnh hưởng"
                name="impact"
                required
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                {...invalid("impact")}
              >
                <option value="">Chọn mức ảnh hưởng</option>
                <option value="low">Cá nhân</option>
                <option value="medium">Một nhóm</option>
                <option value="high">Nhiều phòng ban</option>
              </select>
            </label>
            <label>
              Mức khẩn cấp
              <select
                aria-label="Mức khẩn cấp"
                name="urgency"
                required
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                {...invalid("urgency")}
              >
                <option value="">Chọn mức khẩn cấp</option>
                <option value="low">Bình thường</option>
                <option value="medium">Cần sớm</option>
                <option value="high">Gián đoạn công việc</option>
              </select>
            </label>
          </div>
          <p>
            Ưu tiên dự kiến:{" "}
            <output data-testid="ticket-priority">
              {priority ?? "Chọn mức ảnh hưởng và khẩn cấp"}
            </output>
            . IT sẽ xác minh.
          </p>
          <label>
            Thiết bị liên quan
            <select
              aria-label="Thiết bị liên quan"
              name="asset"
              {...invalid("asset")}
            >
              <option value="">Không liên kết thiết bị</option>
              {allowedAssets(persona).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {type === "service" && (
            <label className="ticket-onboarding">
              <input
                type="checkbox"
                name="onboarding"
                value="yes"
                checked={onboarding}
                onChange={(e) => setOnboarding(e.target.checked)}
              />
              Chuẩn bị cho nhân sự mới (onboarding)
            </label>
          )}
          {onboarding && type === "service" && (
            <section
              className="directory-preview ticket-create-fields"
              aria-label="Thông tin onboarding"
            >
              <h2>Thông tin cần bổ sung cho onboarding</h2>
              <label>
                Danh sách nhân sự
                <textarea name="employees" required {...invalid("employees")} />
              </label>
              <label>
                Cấu hình hoặc mẫu thiết bị
                <input
                  name="configuration"
                  required
                  {...invalid("configuration")}
                />
              </label>
              <div className="directory-pair">
                <label>
                  Số lượng
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    {...invalid("quantity")}
                  />
                </label>
                <label>
                  Hạn bàn giao (GMT+7)
                  <input
                    name="deadline"
                    type="datetime-local"
                    required
                    {...invalid("deadline")}
                  />
                </label>
              </div>
            </section>
          )}
          <label>
            Tệp đính kèm DEMO
            <input
              ref={fileInput}
              name="files"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              multiple
              {...invalid("files")}
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
            />
          </label>
          {files.map((file, index) => (
            <p key={file.name + index}>
              {file.name} · {Math.ceil(file.size / 1024)} KB{" "}
              <Button
                variant="secondary"
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                  if (fileInput.current) fileInput.current.value = "";
                  setError(undefined);
                }}
              >
                Bỏ tệp
              </Button>
            </p>
          ))}
          <p className="directory-note">
            Nhóm tiếp nhận do cấu hình hệ thống xác định. IT xác minh ưu tiên và
            SLA.
          </p>
          <div className="directory-actions">
            <Button
              variant="secondary"
              onClick={() => {
                if (!dirty || window.confirm("Hủy yêu cầu đang soạn?"))
                  router.push("/tickets?scope=mine");
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Xem trước yêu cầu</Button>
          </div>
        </fieldset>
        {error && (
          <p role="alert" id="ticket-draft-error">
            {error.message}
          </p>
        )}
        {draft && (
          <section className="directory-preview access-result">
            <h2 tabIndex={-1} ref={heading}>
              Xem trước yêu cầu
            </h2>
            <p>
              {draft.title} · {draft.priority}
            </p>
            <p>{draft.category}</p>
            {!submission && <p>Chưa ghi nhận yêu cầu.</p>}
            {submission && (
              <p
                ref={feedback}
                tabIndex={-1}
                role={submission === "pending" ? "status" : "alert"}
              >
                {submission === "pending"
                  ? "Đang gửi yêu cầu…"
                  : submission === "failure"
                    ? "Chưa gửi được yêu cầu. Bản nháp vẫn còn."
                    : submission === "stale"
                      ? "Ngữ cảnh đã thay đổi. Kiểm tra lại bản nháp trước khi gửi."
                      : "Chưa xác nhận được kết quả. Kiểm tra trước khi gửi lại."}
              </p>
            )}
            {submission === "unknown" ? (
              <Button
                onClick={() => {
                  const result = store.tickets.check(intent.current);
                  if (result.kind === "success")
                    router.replace("/tickets/" + result.id);
                  else {
                    setSubmission("failure");
                    requestAnimationFrame(() => feedback.current?.focus());
                  }
                }}
              >
                Kiểm tra kết quả
              </Button>
            ) : (
              <Button
                disabled={submission === "pending" || submission === "stale"}
                onClick={() => void send()}
              >
                Xác nhận gửi
              </Button>
            )}
            <Button
              disabled={submission === "pending" || submission === "unknown"}
              onClick={() => {
                setDraft(undefined);
                setSubmission(undefined);
                requestAnimationFrame(() => {
                  const field = form.current?.elements.namedItem("title");
                  if (field instanceof HTMLElement) field.focus();
                });
              }}
            >
              Quay lại chỉnh sửa
            </Button>
          </section>
        )}
      </form>
      <aside className="directory-panel directory-card">
        <h2>Trước khi gửi</h2>
        <p>
          Cho IT biết vấn đề bắt đầu khi nào, có thông báo lỗi gì và ảnh hưởng
          đến ai. Không nhập mật khẩu, mã truy cập hoặc dữ liệu thật vào DEMO.
        </p>
        <h2>Sau khi gửi</h2>
        <p>
          IT tiếp nhận và phản hồi trong ứng dụng. Bạn có thể theo dõi yêu cầu
          của mình.
        </p>
      </aside>
    </div>
  );
}
