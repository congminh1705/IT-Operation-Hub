import type { DemoPersona } from "./fixtures";

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
type Article = {
  id: string;
  category: (typeof knowledgeCategories)[number];
  summary: string;
  versions: KnowledgeVersion[];
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
  const allowed = (
    actor: DemoPersona,
    teams: readonly string[],
    audience: Audience,
  ) =>
    actor.user.active &&
    (audience === "employees" || teams.includes("support"));
  function visible(actor: DemoPersona, teams: readonly string[], row: Article) {
    return allowed(actor, teams, row.versions.at(-1)!.audience);
  }
  return {
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
          ? row.versions.at(-1)
          : versions.find((item) => item.version === version);
      return selected
        ? {
            id: row.id,
            category: row.category,
            versions: versions.map(({ version, date }) => ({ version, date })),
            selected: { ...selected },
          }
        : null;
    },
  };
}
