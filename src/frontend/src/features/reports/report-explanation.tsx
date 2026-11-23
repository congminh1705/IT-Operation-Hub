"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/features/auth/session";
import type { WorkspaceSearch } from "@/components/layout/workspace-page";
import {
  readOrganizationReport,
  reportFilters,
  reportQuery,
  reportSnapshotLabel,
} from "@/lib/demo/organization-metrics";
import { OperationalFacts } from "./operational-facts";
import "./reports.css";

export function ReportExplanation({ search }: { search: WorkspaceSearch }) {
  const { store, persona } = useSession();
  const [now] = useState(Date.now);
  const at = typeof search.at === "string" ? Number(search.at) : NaN;
  if (
    !persona ||
    !Number.isSafeInteger(at) ||
    at < 1_000_000_000_000 ||
    at > now
  )
    return null;
  const filters = reportFilters(search, now);
  const report = readOrganizationReport(store, persona, filters);
  if (!report?.range) return null;
  return (
    <section
      className="automation-panel reports-view report-explanation"
      aria-label="Giải thích báo cáo"
      data-report-at={filters.at}
    >
      <h2>Giải thích báo cáo DEMO</h2>
      <p data-report-context>
        {filters.from} → {filters.to} ·{" "}
        {report.teams.find(([id]) => id === filters.team)?.[1] ??
          (filters.team ? "Nhóm không có dữ liệu" : "Toàn tổ chức")}{" "}
        · Snapshot {reportSnapshotLabel(filters.at)} GMT+7
      </p>
      <p>
        Hàng đợi hiện tại {report.population.MET01.length} · Giải quyết mới nhất
        trong kỳ {report.population.MET07.length}. Công việc và tải dùng
        snapshot hiện tại, kết quả hành động dùng kỳ đã chọn.
      </p>
      <OperationalFacts report={report} />
      <Link href={"/reports?" + reportQuery(filters) + "&tab=workload"}>
        Về báo cáo nguồn
      </Link>
    </section>
  );
}
