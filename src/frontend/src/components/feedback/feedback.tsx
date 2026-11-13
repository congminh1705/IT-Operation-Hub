"use client";

import { Button } from "../ui/button";

export const feedbackContent = {
  loading: {
    title: "Đang tải dữ liệu",
    description: "Vui lòng chờ trong khi nội dung được tải.",
    tone: "info",
  },
  empty: {
    title: "Chưa có dữ liệu",
    description: "Nội dung sẽ xuất hiện khi có bản ghi đầu tiên.",
    tone: "neutral",
  },
  "filter-empty": {
    title: "Không có kết quả phù hợp",
    description: "Thử từ khóa khác hoặc bỏ bớt điều kiện lọc.",
    tone: "neutral",
  },
  error: {
    title: "Chưa tải được dữ liệu",
    description:
      "Kiểm tra kết nối rồi thử lại. Nội dung bạn đang soạn được giữ nguyên.",
    tone: "error",
  },
  forbidden: {
    title: "Bạn không có quyền truy cập",
    description:
      "Liên hệ người quản lý nếu bạn cần quyền sử dụng chức năng này.",
    tone: "error",
  },
  conflict: {
    title: "Dữ liệu đã thay đổi",
    description:
      "Tải lại phiên bản hiện tại và kiểm tra trước khi gửi lại. Không tự ghi đè thay đổi của người khác.",
    tone: "warning",
  },
} as const;

export type FeedbackKind = keyof typeof feedbackContent;
export type FeedbackProps = {
  kind: FeedbackKind;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

/** Explicit state: a failed read is never inferred to be an empty result. */
export function Feedback({ kind, title, description, action }: FeedbackProps) {
  const content = feedbackContent[kind];
  const urgent = kind === "error" || kind === "conflict";
  return (
    <section
      className="ui-feedback"
      data-kind={kind}
      data-tone={content.tone}
      role={urgent ? "alert" : "status"}
      aria-busy={kind === "loading" || undefined}
    >
      <span className="ui-feedback-mark" aria-hidden="true">
        {kind === "loading"
          ? "…"
          : content.tone === "error" || content.tone === "warning"
            ? "!"
            : "i"}
      </span>
      <div>
        <h2>{title ?? content.title}</h2>
        <p>{description ?? content.description}</p>
        {kind === "loading" && (
          <div className="ui-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        {action && (
          <Button
            variant={kind === "error" ? "primary" : "secondary"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </section>
  );
}
