"use client";

import { useState } from "react";
import Link from "next/link";
import { readApprovalProposal } from "@/lib/demo/approval-proposal";
import { useSession } from "@/features/auth/session";
import {
  assistantIntent,
  assistantIntentOptions,
} from "@/lib/demo/assistant-intents";

export function AssistantActions() {
  const { persona, store } = useSession();
  const [intent, setIntent] = useState("");
  const [target, setTarget] = useState("");
  const [review, setReview] = useState(false);
  if (!persona) return null;
  const action = intent ? assistantIntent(intent, persona.user.role) : null;
  const teams = store.teams.ownTeamIds();
  const proposal =
    action?.kind === "allowed" && action.resource === "proposal"
      ? readApprovalProposal(persona, false)
      : null;
  const needsTarget = action?.kind === "allowed" && action.resource !== "none";
  const options =
    action?.kind !== "allowed"
      ? []
      : action.resource === "asset"
        ? store.assets
            .list(persona, teams, "work")
            .map(({ id, code, model }) => ({ id, label: code + " · " + model }))
        : action.resource === "task"
          ? store.work
              .list(persona, teams, "work")
              .filter(
                (row) =>
                  persona.user.role !== "TECHNICIAN" ||
                  row.assigneeId === persona.user.id,
              )
              .map(({ id, title }) => ({ id, label: id + " · " + title }))
          : proposal
            ? [{ id: proposal.id, label: proposal.id + " · " + proposal.task }]
            : [];
  const ticket =
    action?.kind === "allowed" &&
    action.resource === "ticket" &&
    /^TKT-\d{6,}$/.test(target)
      ? store.tickets.detail(persona, target, teams)
      : null;
  const selected = ticket
    ? { id: ticket.row.id, label: ticket.row.id + " · " + ticket.row.title }
    : options.find((item) => item.id === target);
  const ticketAction = action?.kind === "allowed" ? action.id : null;
  const ticketAllowed =
    ticket &&
    ((ticketAction === "reply" && ticket.canReply) ||
      (ticketAction === "note" && ticket.internal && ticket.canReply) ||
      (ticketAction === "accept" && ticket.actions.includes("close")) ||
      (ticketAction === "ticketState" &&
        ticket.internal &&
        ticket.actions.some((item) => item !== "close")));
  const managementHref =
    selected && ticketAction === "progress"
      ? `/work?scope=team&task=${selected.id}`
      : selected && ticketAction === "asset"
        ? `/assets?scope=work&id=${selected.id}&lifecycle=1`
        : selected && ticketAction === "approval"
          ? "/approvals"
          : ticket?.assignable && ticketAction === "assignment"
            ? `/tickets/${ticket.row.id}#ticket-routing`
            : ticketAction === "admin"
              ? "/admin/users/new"
              : undefined;
  const formHref =
    ticketAction === "create"
      ? "/tickets/new"
      : ticketAllowed
        ? `/tickets/${ticket.row.id}${ticketAction === "note" ? "?view=internal#ticket-reply" : ticketAction === "reply" ? "#ticket-reply" : "#ticket-actions"}`
        : managementHref;
  const ticketFormUnavailable = ticket && !ticketAllowed && !managementHref;
  return (
    <section
      className="assistant-cards"
      id="assistant-action-selector"
      aria-label="Thao tác được hỗ trợ"
      tabIndex={-1}
    >
      <h3>Thao tác được hỗ trợ</h3>
      <label>
        Thao tác
        <select
          value={intent}
          onChange={(event) => {
            setIntent(event.target.value);
            setTarget("");
            setReview(false);
          }}
        >
          <option value="">Chọn thao tác</option>
          {assistantIntentOptions.map(([value, item]) => (
            <option key={value} value={value}>
              {item.label}
            </option>
          ))}
          <option value="unsupported">Thao tác khác</option>
        </select>
      </label>
      {action?.kind === "denied" && (
        <p role="alert">Vai trò hiện tại không được phép mở thao tác này.</p>
      )}
      {action?.kind === "unsupported" && (
        <p role="status">
          Chưa hỗ trợ thao tác này. Dùng biểu mẫu thủ công theo quyền hiện tại.
        </p>
      )}
      {action?.kind === "allowed" && (
        <>
          {action.resource === "ticket" ? (
            <label>
              Mã ticket đích
              <input
                value={target}
                maxLength={20}
                onChange={(event) => {
                  setTarget(event.target.value.trim().toUpperCase());
                  setReview(false);
                }}
              />
            </label>
          ) : (
            needsTarget && (
              <label>
                Hồ sơ đích
                <select
                  value={target}
                  onChange={(event) => {
                    setTarget(event.target.value);
                    setReview(false);
                  }}
                >
                  <option value="">Chọn hồ sơ</option>
                  {options.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          )}
          <div>
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              disabled={needsTarget && !target}
              onClick={() => setReview(true)}
            >
              Kiểm tra thao tác
            </button>
          </div>
          {review &&
            (needsTarget && !selected ? (
              <p role="alert">Không tìm thấy hồ sơ trong phạm vi của bạn.</p>
            ) : (
              <>
                <p role="status">
                  {action.label}
                  {selected ? " · " + selected.label : ""} · Chưa thực hiện
                </p>
                {ticketFormUnavailable && (
                  <p role="alert">
                    Quyền hoặc trạng thái hiện tại không cho phép thao tác này.
                  </p>
                )}
                {formHref && (
                  <Link
                    href={formHref}
                    className="ui-button"
                    data-variant="secondary"
                  >
                    Mở biểu mẫu xác nhận
                  </Link>
                )}
              </>
            ))}
        </>
      )}
    </section>
  );
}
