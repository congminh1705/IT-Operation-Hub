"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/features/auth/session";
import { Feedback } from "@/components/feedback/feedback";
import { audienceNames, knowledgeCategories } from "@/lib/demo/knowledge";
import { normalizeTicketText } from "@/lib/demo/ticket-list";
import "../automation/automation.css";
import "./knowledge.css";

export function KnowledgeScreen({
  id,
  version,
}: {
  id?: string;
  version?: number;
}) {
  const { persona, store } = useSession();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  if (!persona) return null;
  const teams = store.teams.ownTeamIds();
  const article = id ? store.knowledge.read(persona, teams, id, version) : null;
  if (id && !article)
    return (
      <Feedback
        kind="empty"
        title="Không tìm thấy nguồn có thể đọc"
        description="Kiểm tra lại liên kết hoặc quay về kho kiến thức."
      />
    );
  const rows = store.knowledge
    .list(persona, teams)
    .filter(
      (row) =>
        (!category || row.category === category) &&
        normalizeTicketText(
          [row.id, row.title, row.summary].join(" "),
        ).includes(normalizeTicketText(query.trim())),
    );
  return (
    <div className="automation knowledge">
      {article ? (
        <>
          <div>
            <Link
              href="/knowledge"
              className="ui-button"
              data-variant="secondary"
            >
              Về kho kiến thức
            </Link>
          </div>
          <div className="knowledge-reader">
            <article className="automation-panel">
              <p className="knowledge-meta">
                {article.id} · v{article.selected.version} · Đã công bố
              </p>
              <h2>{article.selected.title}</h2>
              <p className="knowledge-meta">
                IT Support · {article.selected.date}
              </p>
              <h3>Hướng dẫn</h3>
              {article.selected.body.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <Link
                href="/tickets/new"
                className="ui-button"
                data-variant="secondary"
              >
                Tạo yêu cầu hỗ trợ
              </Link>
            </article>
            <aside className="automation-panel" aria-label="Nguồn và phạm vi">
              <h2>Nguồn &amp; phạm vi</h2>
              <dl>
                <dt>Phạm vi đọc</dt>
                <dd>{audienceNames[article.selected.audience]}</dd>
                <dt>Phiên bản đang mở</dt>
                <dd>v{article.selected.version}</dd>
              </dl>
              <ul>
                {article.versions.map((entry) => (
                  <li key={entry.version}>
                    <Link
                      aria-current={
                        entry.version === article.selected.version
                          ? "page"
                          : undefined
                      }
                      href={`/knowledge?id=${article.id}&version=${entry.version}`}
                    >
                      Nguồn v{entry.version} · {entry.date}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </>
      ) : (
        <section className="automation-panel" aria-labelledby="knowledge-list">
          <h2 id="knowledge-list">Tìm hướng dẫn để tiếp tục công việc</h2>
          <p>Chỉ tìm trong bài đã công bố mà bạn được phép đọc.</p>
          <div className="automation-actions knowledge-filters">
            <label>
              Tìm trong danh sách
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Danh mục
              <select
                aria-label="Danh mục"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {knowledgeCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <p role="status">{rows.length} bài viết</p>
          {rows.length ? (
            <ul className="knowledge-list">
              {rows.map((row) => (
                <li key={row.id}>
                  <span className="knowledge-meta">{row.category}</span>
                  <h3>
                    <Link href={`/knowledge?id=${row.id}`}>{row.title}</Link>
                  </h3>
                  <p>{row.summary}</p>
                  <span className="knowledge-meta">
                    Đã công bố · v{row.version}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Không tìm thấy bài viết phù hợp.</p>
          )}
          <Link href="/tickets/new">Vẫn cần hỗ trợ? Tạo yêu cầu</Link>
        </section>
      )}
    </div>
  );
}
