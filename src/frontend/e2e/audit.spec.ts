import { expect, test } from "@playwright/test";
import { captureMonitoring, loginMonitoring } from "./monitoring-helpers";

const section = "Nhật ký hoạt động";

test("Manager searches, pages and returns to the same list", async ({
  page,
  context,
}) => {
  await loginMonitoring(page, "it_manager", "/audit");
  const audit = page.getByRole("region", { name: section });
  await expect(audit.getByRole("status")).toHaveText("6 sự kiện · Trang 1/2");
  if (process.env.TICKET_DETAIL_DESIGN_URL)
    await captureMonitoring(
      page,
      context,
      "FE-17.02",
      "audit",
      "audit-manager",
    );
  await audit.getByLabel("Kết quả").selectOption("success");
  await audit.getByRole("button", { name: "Lọc" }).click();
  await expect(audit.getByRole("status")).toHaveText("4 sự kiện · Trang 1/2");
  await audit.getByRole("link", { name: "Trang sau" }).click();
  await expect(audit.getByRole("status")).toHaveText("4 sự kiện · Trang 2/2");
  await audit.getByRole("link", { name: "TKT-000129" }).click();
  await expect(audit).toContainText("Đã xác nhận kết quả");
  await expect(audit).not.toContainText(
    /mật khẩu|token|tệp đính kèm|ghi chú nội bộ/i,
  );
  await page.goBack();
  await expect(audit.getByRole("status")).toHaveText("4 sự kiện · Trang 2/2");
  await audit.getByRole("link", { name: "TKT-000129" }).click();
  await audit.getByRole("link", { name: "Về danh sách" }).click();
  await expect(audit.getByRole("status")).toHaveText("4 sự kiện · Trang 2/2");
  await audit.getByLabel("Tìm nhật ký").fill("AST-000104");
  await audit.getByRole("button", { name: "Lọc" }).click();
  await expect(audit.getByRole("status")).toHaveText("1 sự kiện · Trang 1/1");
  await expect(audit.getByRole("link", { name: "AST-000104" })).toBeVisible();
  await audit.getByLabel("Thao tác").selectOption("Đổi trạng thái");
  await audit.getByRole("button", { name: "Lọc" }).click();
  await expect(audit.getByText("Không có sự kiện phù hợp.")).toBeVisible();
  await loginMonitoring(
    page,
    "it_manager",
    "/audit?scope=administration&entry=AUD-013",
  );
  await expect(audit.getByRole("alert")).toContainText(
    "Sự kiện không khả dụng",
  );
  await expect(audit).not.toContainText("USR-004");
});

test("Admin can inspect identity and SLA events and choose business scope", async ({
  page,
  context,
}) => {
  await loginMonitoring(page, "admin", "/audit");
  const audit = page.getByRole("region", { name: section });
  await expect(audit.getByRole("status")).toHaveText("4 sự kiện · Trang 1/2");
  await expect(audit.getByRole("link", { name: "USR-004" })).toBeVisible();
  await expect(audit.getByRole("link", { name: "SLA-001" })).toBeVisible();
  if (process.env.TICKET_DETAIL_DESIGN_URL)
    await captureMonitoring(page, context, "FE-17.02", "audit", "audit-admin");
  await audit.getByRole("link", { name: "USR-004" }).click();
  await expect(audit).toContainText("Quyết định phân quyền đã duyệt");
  await expect(audit).not.toContainText(
    /mật khẩu|token|tệp đính kèm|ghi chú nội bộ/i,
  );
  await audit.getByRole("link", { name: "Về danh sách" }).click();
  await audit.getByLabel("Phạm vi").selectOption("business");
  await audit.getByRole("button", { name: "Lọc" }).click();
  await expect(audit.getByRole("status")).toHaveText("6 sự kiện · Trang 1/2");
  await expect(audit.getByRole("link", { name: "USR-004" })).toHaveCount(0);
});

for (const role of ["requester", "technician"])
  test(`${role} cannot open the audit route or event`, async ({ page }) => {
    await loginMonitoring(page, role, "/audit?entry=AUD-013");
    await expect(page).toHaveURL(/\/audit/);
    await expect(
      page.getByText("Không có quyền truy cập", { exact: true }).last(),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: section })).toHaveCount(0);
    await expect(page.getByText("Quyết định phân quyền đã duyệt")).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("link", { name: "Nhật ký", exact: true }),
    ).toHaveCount(0);
  });
