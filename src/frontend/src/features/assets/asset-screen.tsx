"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import { assetStates, managesAssets, type AssetState } from "@/lib/demo/assets";
import { AssetMetadataForm } from "./asset-metadata";
import { AssetLifecycle } from "./asset-lifecycle";
import { normalizeTicketText } from "@/lib/demo/ticket-list";
import "../automation/automation.css";
import "./assets.css";

export function AssetScreen({ scope, id }: { scope: string; id?: string }) {
  const { store, persona } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<AssetState | "">("");
  const [editing, setEditing] = useState(false);
  const [changing, setChanging] = useState(false);
  const [, refresh] = useState(0);
  if (!persona) return null;

  const own = scope === "mine" || persona.user.role === "REQUESTER";
  const listUrl = own ? "/assets?scope=mine" : "/assets?scope=work";
  const rows = store.assets.list(persona, store.teams.ownTeamIds(), scope);
  const asset = rows.find((row) => row.id === id);
  const filtered = rows.filter(
    (row) =>
      (!state || row.state === state) &&
      normalizeTicketText(
        [row.code, row.serial, row.model, row.type].join(" "),
      ).includes(normalizeTicketText(query.trim())),
  );

  if (id && !asset) return <Feedback kind="forbidden" />;
  const canEdit = managesAssets(persona);
  const canLink =
    asset &&
    store.assets.ticketOptions(persona).some((item) => item.id === asset.id);
  if (editing && canEdit)
    return (
      <div className="automation assets">
        <AssetMetadataForm
          asset={asset}
          onCancel={() => setEditing(false)}
          onSaved={(savedId) => {
            setEditing(false);
            refresh((value) => value + 1);
            router.push(`/assets?scope=work&id=${savedId}`);
          }}
        />
      </div>
    );

  return (
    <div className="automation assets">
      {asset ? (
        <>
          <div>
            <Link href={listUrl} className="ui-button" data-variant="secondary">
              Về danh sách tài sản
            </Link>
          </div>
          <section className="automation-panel" aria-label="Hồ sơ tài sản">
            <h2>{asset.model || asset.code}</h2>
            <p>
              {asset.code} · {asset.serial}
            </p>
            {canEdit && (
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => setEditing(true)}
              >
                Sửa thông tin
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                className="ui-button"
                onClick={() => setChanging(true)}
              >
                Cấp phát / thu hồi
              </button>
            )}
            {canLink && (
              <Link
                href={`/tickets/new?asset=${asset.id}`}
                className="ui-button"
                data-variant="secondary"
              >
                Yêu cầu hỗ trợ thiết bị
              </Link>
            )}
            <dl className="automation-facts">
              <div>
                <dt>Loại</dt>
                <dd>{asset.type}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd data-asset-state={asset.state}>
                  {assetStates[asset.state]}
                </dd>
              </div>
              <div>
                <dt>Người giữ</dt>
                <dd>{asset.holderLabel ?? "—"}</dd>
              </div>
              {asset.holderDepartment && (
                <div>
                  <dt>Phòng ban</dt>
                  <dd>{asset.holderDepartment}</dd>
                </div>
              )}
              <div>
                <dt>Bảo hành</dt>
                <dd>{asset.warranty || "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="automation-panel" aria-label="Lịch sử thiết bị">
            <h2>Lịch sử thiết bị</h2>
            {asset.history.length ? (
              <ol>
                {asset.history.map((entry, index) => (
                  <li key={entry.date + entry.summary + index}>
                    <time dateTime={entry.date}>{entry.date}</time> ·{" "}
                    {entry.summary}
                    {entry.holder ? ` · ${entry.holder}` : ""}
                    {entry.detail && <p>{entry.detail}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p>Chưa có lịch sử trong phạm vi của bạn.</p>
            )}
          </section>
          {changing && canEdit && (
            <AssetLifecycle
              asset={asset}
              onClose={() => {
                setChanging(false);
                refresh((value) => value + 1);
              }}
            />
          )}
          <section className="automation-panel" aria-label="Ticket liên quan">
            <h2>Ticket liên quan</h2>
            {asset.tickets.length ? (
              <ul>
                {asset.tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <Link href={`/tickets/${ticket.id}`}>
                      {ticket.id} · {ticket.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có ticket liên quan trong phạm vi của bạn.</p>
            )}
          </section>
        </>
      ) : (
        <section className="automation-panel" aria-labelledby="asset-list">
          <h2 id="asset-list">
            {own
              ? "Thiết bị đang được cấp cho bạn"
              : persona.user.role === "TECHNICIAN"
                ? "Thiết bị hỗ trợ"
                : "Danh mục tài sản"}
          </h2>
          {canEdit && !own && (
            <button
              type="button"
              className="ui-button"
              onClick={() => setEditing(true)}
            >
              Thêm tài sản
            </button>
          )}
          <div className="automation-actions asset-filters">
            <label>
              Tìm trong danh sách
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Lọc trạng thái
              <select
                value={state}
                onChange={(event) =>
                  setState(event.target.value as AssetState | "")
                }
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(assetStates).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p role="status">
            {filtered.length} / {rows.length} thiết bị
          </p>
          {filtered.length ? (
            <ul className={own ? "asset-cards" : "asset-table"}>
              {!own && (
                <li className="asset-column-headings" aria-hidden="true">
                  <span>Tài sản</span>
                  <span>Loại / Serial</span>
                  <span>Trạng thái</span>
                  <span>Người giữ / Phòng ban</span>
                  <span>Bảo hành</span>
                </li>
              )}
              {filtered.map((row) => (
                <li key={row.id}>
                  <Link href={`${listUrl}&id=${row.id}`}>
                    <strong>{row.code}</strong>
                    <span>{row.model}</span>
                  </Link>
                  {!own && (
                    <span>
                      <span className="asset-cell-label">Loại / Serial</span>
                      {row.type} / {row.serial || "—"}
                    </span>
                  )}
                  <span data-asset-state={row.state}>
                    <span className="asset-cell-label">Trạng thái</span>
                    {assetStates[row.state]}
                  </span>
                  <span>
                    <span className="asset-cell-label">Người giữ</span>
                    {row.holderLabel ?? "—"}
                    {!own && row.holderDepartment && (
                      <small className="asset-department">
                        {row.holderDepartment}
                      </small>
                    )}
                  </span>
                  {!own && (
                    <span>
                      <span className="asset-cell-label">Bảo hành</span>
                      {row.warranty || "—"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có tài sản phù hợp.</p>
          )}
        </section>
      )}
    </div>
  );
}
