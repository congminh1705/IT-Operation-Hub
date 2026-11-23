import { expect, test } from "@playwright/test";
import { captureMonitoring, loginMonitoring } from "./monitoring-helpers";

test("notification badge, unread filter, revoked target and own ticket", async ({
  page,
  context,
}) => {
  await loginMonitoring(page, "requester", "/dashboard");
  const bell = page.locator("a.notice-bell");
  await expect(bell).toContainText("2");
  await bell.focus();
  await expect(bell).toBeFocused();
  await bell.press("Enter");
  const list = page.getByRole("region", { name: "Thông báo của bạn" });
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list).not.toContainText(/TKT-999999|nội bộ/);
  if (process.env.TICKET_DETAIL_DESIGN_URL)
    await captureMonitoring(page, context, "FE-17.01", "notifications");
  await list.getByRole("button", { name: "Chưa đọc", exact: true }).click();
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await list.getByRole("button", { name: "Mở thông báo" }).first().click();
  await expect(list.getByRole("alert")).toContainText(
    "Hồ sơ không còn khả dụng",
  );
  await expect(bell).toContainText("1");
  await list.getByRole("button", { name: "Mở yêu cầu" }).click();
  await expect(page).toHaveURL(/\/tickets\/TKT-000129/);
  await bell.click();
  await expect(bell).not.toContainText(/[0-9]/);
  await loginMonitoring(page, "it_manager", "/notifications");
  await expect(list).toContainText("3 thông báo chưa đọc");
  await expect(list).toContainText("cập nhật nội bộ");
});
