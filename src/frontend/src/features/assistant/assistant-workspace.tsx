"use client";

import { useState } from "react";
import { useSession } from "@/features/auth/session";
import { AutomationActivity } from "@/features/automation/automation-activity";
import { ApprovalProposal } from "@/features/automation/approval-proposal";
import { readApprovalProposal } from "@/lib/demo/approval-proposal";
import type { RunCase } from "@/lib/demo/automation-activity";
import { AssistantScreen } from "./assistant-screen";

export function AssistantWorkspace({ id }: { id?: string }) {
  const { persona, store } = useSession();
  const [scenario, setScenario] = useState<RunCase>("none");
  const [tab, setTab] = useState<"chat" | "activity">("chat");
  if (!persona) return null;
  const teams = store.teams.ownTeamIds();
  const hasActivity = store.automationActivity.cases(persona, teams).length > 0;
  const run = hasActivity
    ? store.automationActivity.read(persona, teams, scenario)
    : null;
  const proposal =
    run?.state === "proposed" && !run.policyCheck
      ? readApprovalProposal(persona, false)
      : null;

  return (
    <div
      className="assistant-composition"
      data-tab={tab}
      data-has-activity={hasActivity}
    >
      {hasActivity && (
        <nav
          className="assistant-mobile-switch automation-actions"
          aria-label="Vùng làm việc AI"
        >
          <button
            type="button"
            className="ui-button"
            data-variant={tab === "chat" ? undefined : "secondary"}
            aria-pressed={tab === "chat"}
            aria-controls="assistant-chat-pane"
            onClick={() => setTab("chat")}
          >
            Hội thoại
          </button>
          <button
            type="button"
            className="ui-button"
            data-variant={tab === "activity" ? undefined : "secondary"}
            aria-pressed={tab === "activity"}
            aria-controls="assistant-activity-pane"
            onClick={() => setTab("activity")}
          >
            Hoạt động
          </button>
        </nav>
      )}
      {proposal && run?.proposalId === proposal.id && (
        <section
          className="assistant-proposal"
          aria-label="Chi tiết đề xuất ngoại lệ"
        >
          <ApprovalProposal />
        </section>
      )}
      <div className="assistant-composition-grid">
        <div id="assistant-chat-pane" className="assistant-chat-pane">
          <AssistantScreen key={id ?? "new-chat"} id={id} />
        </div>
        {hasActivity && (
          <section
            id="assistant-activity-pane"
            className="assistant-activity-pane"
            aria-label="Hoạt động điều phối độc lập"
          >
            <h2>Hoạt động điều phối</h2>
            <AutomationActivity
              selectedScenario={scenario}
              onScenarioChange={setScenario}
            />
          </section>
        )}
      </div>
    </div>
  );
}
