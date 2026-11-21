"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import { canUseChatAudience, type ChatAudience } from "@/lib/demo/assistant";
import "../automation/automation.css";
import "./assistant.css";
import { AssistantCards } from "./assistant-cards";
import { AssistantActions } from "./assistant-actions";
import { AssistantSettings } from "./assistant-settings";
import {
  assistantFailures,
  assistantModes,
  type AssistantFailure,
} from "@/lib/demo/assistant-availability";

const labels = { PUBLIC: "Công khai", INTERNAL: "Nội bộ" };

export function AssistantScreen({ id }: { id?: string }) {
  const { store, persona } = useSession();
  const router = useRouter();
  const [audience, setAudience] = useState<ChatAudience>("PUBLIC");
  const inputKey = id ?? audience;
  const [text, setText] = useState(
    () => store.assistantInputs.get(inputKey) ?? "",
  );
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [fixture, setFixture] = useState<AssistantFailure>("none");
  const [confirm, setConfirm] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const availability = store.assistantAvailability;
  const settings = useSyncExternalStore(
    availability.subscribe,
    availability.getSnapshot,
    availability.getSnapshot,
  );
  const enabled = settings.mode === "enabled";
  const sendRequest = useRef<AbortController | null>(null);
  useEffect(() => () => sendRequest.current?.abort(), []);

  if (!persona) return null;
  const assistant = store.assistant;
  const list = assistant.list();
  const chat = id ? assistant.read(id) : null;
  function updateText(value: string) {
    setText(value);
    if (value) store.assistantInputs.set(inputKey, value);
    else store.assistantInputs.delete(inputKey);
  }
  function cancel() {
    sendRequest.current?.abort();
    sendRequest.current = null;
    setPending(false);
    setNotice("Đã hủy gửi. Nội dung đang soạn vẫn còn.");
  }

  async function send() {
    if (!enabled || !text.trim() || sendRequest.current || (id && !chat))
      return;
    const request = new AbortController();
    sendRequest.current = request;
    setPending(true);
    setNotice("");
    const outcome = await assistant.send(
      chat?.id,
      chat?.audience ?? audience,
      text,
      request.signal,
      fixture,
    );
    if (sendRequest.current !== request || request.signal.aborted) return;
    sendRequest.current = null;
    setPending(false);
    if (outcome.kind === "success") {
      updateText("");
      setNotice("Đã nhận phản hồi DEMO.");
      if (!chat) router.push("/assistant?id=" + outcome.id);
    } else {
      setNotice(
        "Chưa gửi được tin nhắn. " +
          (outcome.kind in assistantFailures
            ? assistantFailures[outcome.kind as AssistantFailure] + ". "
            : "") +
          "Nội dung đang soạn vẫn còn.",
      );
    }
  }

  return (
    <div className="automation assistant-workspace">
      <nav
        className="automation-panel assistant-history"
        aria-label="Hội thoại của tôi"
      >
        <h2>Hội thoại của tôi</h2>
        <Link className="ui-button" data-variant="secondary" href="/assistant">
          Hội thoại mới
        </Link>
        <ul>
          {list.map((item) => (
            <li key={item.id}>
              <Link
                aria-current={item.id === id ? "page" : undefined}
                href={`/assistant?id=${item.id}`}
              >
                {item.title}
              </Link>
              <small>{labels[item.audience]}</small>
            </li>
          ))}
        </ul>
      </nav>
      <section
        className="automation-panel assistant-chat"
        aria-label="Trò chuyện"
      >
        <h2>{chat?.title ?? "Trò chuyện với trợ lý"}</h2>
        <p>Trợ lý DEMO · Phản hồi mô phỏng</p>
        <p>Usage DEMO · Không có dữ liệu token hoặc chi phí nhà cung cấp.</p>
        {!enabled && (
          <p role="status">
            Trợ lý không khả dụng · {assistantModes[settings.mode]}. Nội dung
            đang soạn và biểu mẫu thủ công vẫn dùng được.
          </p>
        )}
        {id && !chat ? (
          <p role="alert">Không tìm thấy hội thoại có thể mở.</p>
        ) : (
          <>
            {chat && (
              <div className="automation-actions">
                <span>{labels[chat.audience]}</span>
                <button
                  className="ui-button"
                  data-variant="secondary"
                  type="button"
                  onClick={() => setConfirm(true)}
                >
                  Xóa hội thoại
                </button>
              </div>
            )}
            {chat?.messages.length ? (
              <ol className="assistant-messages" aria-label="Tin nhắn">
                {chat.messages.map((entry) => (
                  <li key={entry.id}>
                    <p>
                      <strong>Bạn</strong> · {entry.prompt}
                    </p>
                    <p>
                      <strong>Trợ lý DEMO</strong> · {entry.answer}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Chưa có tin nhắn. Đặt câu hỏi để bắt đầu.</p>
            )}
            <form
              className="automation-form"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              {!chat &&
                persona.user.role !== "REQUESTER" &&
                canUseChatAudience(persona, "INTERNAL") && (
                  <label>
                    Ngữ cảnh
                    <select
                      value={audience}
                      disabled={pending}
                      onChange={(event) => {
                        const next = event.target.value as ChatAudience;
                        setAudience(next);
                        setText(store.assistantInputs.get(next) ?? "");
                      }}
                    >
                      <option value="PUBLIC">Công khai</option>
                      <option value="INTERNAL">Nội bộ</option>
                    </select>
                  </label>
                )}
              <label>
                Tin nhắn
                <textarea
                  required
                  rows={3}
                  maxLength={1800}
                  value={text}
                  disabled={pending}
                  onChange={(event) => updateText(event.target.value)}
                />
              </label>
              <label>
                Tình huống phản hồi DEMO
                <select
                  value={fixture}
                  disabled={pending}
                  onChange={(event) =>
                    setFixture(event.target.value as AssistantFailure)
                  }
                >
                  {Object.entries(assistantFailures).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {pending ? (
                <p role="status">Đang tạo phản hồi DEMO…</p>
              ) : (
                notice && (
                  <p role={notice.startsWith("Chưa gửi") ? "alert" : "status"}>
                    {notice}
                  </p>
                )
              )}
              <div className="automation-actions">
                <button
                  type="submit"
                  className="ui-button"
                  disabled={!enabled || !text.trim() || pending}
                >
                  Gửi
                </button>
                {pending && (
                  <button
                    type="button"
                    className="ui-button"
                    data-variant="secondary"
                    onClick={cancel}
                  >
                    Hủy gửi
                  </button>
                )}
              </div>
            </form>
          </>
        )}
        {(!id || chat) && (
          <AssistantCards
            key={chat?.audience ?? audience}
            audience={chat?.audience ?? audience}
            generationEnabled={enabled}
          />
        )}
      </section>
      <aside
        className="automation-panel assistant-context"
        aria-label="Ngữ cảnh và hỗ trợ"
      >
        <h2>Ngữ cảnh</h2>
        <AssistantActions />
        <p>{labels[chat?.audience ?? audience]}</p>
        <Link href="/knowledge">Kho kiến thức</Link>
        <Link href="/tickets/new">Tạo yêu cầu hỗ trợ</Link>
        {persona.user.role === "ADMIN" && (
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            onClick={() => setSettingsOpen(true)}
          >
            Cấu hình nhanh DEMO
          </button>
        )}
      </aside>
      {settingsOpen && (
        <Dialog
          open
          title="Cấu hình nhanh DEMO"
          description="Thiết lập khả dụng của trợ lý trong phiên DEMO."
          onRequestClose={() => setSettingsOpen(false)}
        >
          <AssistantSettings onClose={() => setSettingsOpen(false)} />
        </Dialog>
      )}
      {confirm && chat && (
        <Dialog
          open
          title="Xóa hội thoại"
          description="Thao tác xóa các tin nhắn trong hội thoại này."
          onRequestClose={() => setConfirm(false)}
        >
          <div className="automation-actions">
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              onClick={() => setConfirm(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="ui-button"
              onClick={() => {
                cancel();
                if (assistant.remove(chat.id)) {
                  store.assistantInputs.delete(chat.id);
                  router.push("/assistant");
                }
                setConfirm(false);
              }}
            >
              Xác nhận xóa
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
