import { createDemoFixtures, type DemoPersona } from "./fixtures";

export const knowledgeCategories = [
  "Mạng & kết nối",
  "Thiết bị",
  "Phần mềm",
] as const;
export type Audience = "employees" | "support";
export const audienceNames = {
  employees: "Nhân viên được cấp quyền",
  support: "Nhóm IT Support",
};
export type KnowledgeVersion = {
  version: number;
  title: string;
  body: string;
  audience: Audience;
  date: string;
  note: string;
};
export type KnowledgeDraft = Pick<
  KnowledgeVersion,
  "title" | "body" | "audience" | "note"
>;
type KnowledgeAction = "draft" | "publish" | "access";
const { TECHNICIAN, IT_MANAGER } = createDemoFixtures().personas;
const grants: Record<string, { author: string; publisher: string }> = {
  "KB-014": { author: TECHNICIAN.user.id, publisher: IT_MANAGER.user.id },
};
type Article = {
  id: string;
  category: (typeof knowledgeCategories)[number];
  summary: string;
  versions: KnowledgeVersion[];
  draft?: KnowledgeDraft;
  audience?: Audience;
  revision?: number;
};
function article(
  id: string,
  category: Article["category"],
  title: string,
  summary: string,
  body: string,
  audience: Audience = "employees",
): Article {
  return {
    id,
    category,
    summary,
    versions: [
      {
        version: 1,
        title,
        body: summary,
        audience,
        date: "2026-10-20",
        note: "Bản công bố đầu tiên",
      },
      {
        version: 2,
        title,
        body,
        audience,
        date: "2026-11-06",
        note: "Cập nhật hướng dẫn DEMO",
      },
    ],
  };
}
export function createKnowledge() {
  const articles = [
    article(
      "KB-014",
      "Mạng & kết nối",
      "Kết nối VPN trên laptop Windows",
      "Thiết lập client, kiểm tra kết nối và xử lý lỗi thường gặp.",
      "Dùng thiết bị công ty và tài khoản được cấp quyền.\nMở ứng dụng VPN do IT cài đặt và chọn cấu hình công ty.\nNếu gặp lỗi, ghi lại thông báo và gửi yêu cầu hỗ trợ.",
    ),
    article(
      "KB-021",
      "Thiết bị",
      "Kết nối máy in văn phòng",
      "Kiểm tra thiết bị, driver và bản in thử.",
      "Kiểm tra máy in đã bật.\nChọn máy in được IT cấp quyền và in một trang thử.",
    ),
    article(
      "KB-035",
      "Phần mềm",
      "Khắc phục lỗi đăng nhập ứng dụng",
      "Các bước tự kiểm tra trước khi gửi yêu cầu.",
      "Kiểm tra tên tài khoản và kết nối.\nNếu lỗi tiếp diễn, gửi yêu cầu với mã lỗi.",
    ),
    article(
      "KB-040",
      "Mạng & kết nối",
      "Bàn giao cấu hình nội bộ DEMO",
      "Hướng dẫn mẫu cho nhóm IT Support.",
      "Ghi nhận phiên bản cấu hình vào nhật ký DEMO.",
      "support",
    ),
  ];
  articles[0].draft = {
    title: "Kết nối VPN trên laptop Windows",
    body: "Dùng thiết bị công ty và ứng dụng VPN do IT cung cấp. Khi có lỗi, ghi lại thông báo để IT hỗ trợ.",
    audience: "employees",
    note: "Cập nhật bước hỗ trợ DEMO",
  };
  const allowed = (
    actor: DemoPersona,
    teams: readonly string[],
    audience: Audience,
  ) =>
    actor.user.active &&
    (audience === "employees" || teams.includes("support"));
  function visible(actor: DemoPersona, teams: readonly string[], row: Article) {
    return (
      allowed(actor, teams, row.versions.at(-1)!.audience) &&
      (!row.audience || allowed(actor, teams, row.audience))
    );
  }
  function access(actor: DemoPersona, id: string) {
    const grant = actor.user.active ? grants[id] : undefined;
    return {
      author: grant?.author === actor.user.id,
      publisher: grant?.publisher === actor.user.id,
    };
  }
  function validate(
    actor: DemoPersona,
    id: string,
    expected: number,
    action: KnowledgeAction,
    draft: KnowledgeDraft,
  ) {
    const permissions = access(actor, id);
    if (!(action === "draft" ? permissions.author : permissions.publisher))
      return "Bạn chưa được cấp quyền cho thao tác này.";
    const row = articles.find((item) => item.id === id);
    if (!row || (row.revision ?? 1) !== expected)
      return "Bài viết đã đổi. Đóng form và xem lại phiên bản.";
    if (!Object.hasOwn(audienceNames, draft.audience))
      return "Chọn phạm vi đọc hợp lệ.";
    if (
      action === "draft" &&
      (draft.title.trim().length < 5 ||
        draft.title.trim().length > 180 ||
        draft.body.trim().length < 10 ||
        draft.body.trim().length > 6000 ||
        draft.note.trim().length > 500)
    )
      return "Nhập tiêu đề từ 5 đến 180 và nội dung từ 10 đến 6.000 ký tự.";
    if (action === "publish" && !row.draft)
      return "Chưa có bản nháp đã lưu để công bố.";
    return null;
  }
  return {
    access,
    edit(actor: DemoPersona, id: string) {
      const permissions = access(actor, id);
      if (!permissions.author && !permissions.publisher) return null;
      const row = articles.find((item) => item.id === id);
      if (!row) return null;
      const current = row.versions.at(-1)!;
      return {
        permissions,
        revision: row.revision ?? 1,
        version: current.version,
        audience: row.audience ?? current.audience,
        draft: row.draft ? { ...row.draft } : null,
        current: { ...current },
      };
    },
    preview: validate,
    commit(
      actor: DemoPersona,
      id: string,
      expected: number,
      action: KnowledgeAction,
      draft: KnowledgeDraft,
    ) {
      const error = validate(actor, id, expected, action, draft);
      if (error) return error;
      const row = articles.find((item) => item.id === id)!;
      if (action === "draft") {
        row.draft = {
          title: draft.title.trim(),
          body: draft.body.trim(),
          audience: draft.audience,
          note: draft.note.trim(),
        };
      } else if (action === "publish") {
        const version = row.versions.at(-1)!.version + 1;
        row.versions.push({
          ...row.draft!,
          version,
          date: new Date().toISOString().slice(0, 10),
        });
        row.summary = row.draft!.body.split("\n")[0].slice(0, 160);
        row.draft = undefined;
        row.audience = undefined;
      } else row.audience = draft.audience;
      row.revision = expected + 1;
      return null;
    },
    list(actor: DemoPersona, teams: readonly string[]) {
      return articles
        .filter((row) => visible(actor, teams, row))
        .map(({ id, category, summary, versions }) => {
          const { version, title } = versions.at(-1)!;
          return { id, category, summary, version, title };
        });
    },
    read(
      actor: DemoPersona,
      teams: readonly string[],
      id: string,
      version?: number,
    ) {
      const row = articles.find((item) => item.id === id);
      if (!row || !visible(actor, teams, row)) return null;
      const versions = row.versions.filter((item) =>
        allowed(actor, teams, item.audience),
      );
      const selected =
        version === undefined
          ? versions.find((item) => item === row.versions.at(-1))
          : versions.find((item) => item.version === version);
      return selected
        ? {
            id: row.id,
            category: row.category,
            versions: versions.map(({ version, date }) => ({ version, date })),
            selected: { ...selected },
            audience: row.audience ?? selected.audience,
          }
        : null;
    },
  };
}
