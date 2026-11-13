import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";

describe("primitive accessibility contracts", () => {
  it("prevents incidental form submission and disables loading actions", () => {
    const html = renderToStaticMarkup(
      createElement(Button, { loading: true }, "Đang lưu"),
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
  });
  it("associates the error with its labeled field", () => {
    const html = renderToStaticMarkup(
      createElement(Input, {
        id: "email",
        label: "Email",
        error: "Không hợp lệ",
      }),
    );
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-error"');
    expect(html).toContain('id="email-error"');
  });
  it("distinguishes waiting, blocked and locked without inferring from labels", () => {
    for (const [status, tone] of [
      ["waiting", "amber"],
      ["blocked", "rose"],
      ["locked", "gray"],
    ] as const) {
      expect(
        renderToStaticMarkup(createElement(Badge, { status }, "Trạng thái")),
      ).toContain(`data-tone="${tone}"`);
    }
  });
});
