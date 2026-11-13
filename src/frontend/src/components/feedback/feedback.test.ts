import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Feedback } from "./feedback";
import { FormErrors } from "./form-feedback";
import { Input } from "../ui/input";

describe("feedback semantics", () => {
  it("keeps failures and filtering separate from true empty data", () => {
    const failure = renderToStaticMarkup(
      createElement(Feedback, { kind: "error" }),
    );
    const empty = renderToStaticMarkup(
      createElement(Feedback, { kind: "empty" }),
    );
    expect(failure).toContain('role="alert"');
    expect(failure).not.toContain("Chưa có dữ liệu");
    expect(empty).not.toContain('role="alert"');
    expect(
      renderToStaticMarkup(createElement(Feedback, { kind: "filter-empty" })),
    ).toContain("Không có kết quả phù hợp");
  });
  it("marks loading as busy without inventing zero results", () => {
    const html = renderToStaticMarkup(
      createElement(Feedback, { kind: "loading" }),
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("0 kết quả");
  });
  it("preserves existing accessible help alongside a field error", () => {
    const html = renderToStaticMarkup(
      createElement(Input, {
        label: "Tên",
        id: "name",
        error: "Nhập tên",
        "aria-describedby": "help",
      }),
    );
    expect(html).toContain('aria-describedby="help name-error"');
  });
  it("omits an empty error summary and links real errors to their fields", () => {
    expect(
      renderToStaticMarkup(createElement(FormErrors, { errors: [] })),
    ).toBe("");
    const html = renderToStaticMarkup(
      createElement(FormErrors, {
        errors: [{ fieldId: "name", message: "Nhập tên" }],
      }),
    );
    expect(html).toContain('href="#name"');
    expect(html).toContain('role="alert"');
  });
});
