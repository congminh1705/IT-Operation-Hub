"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import { roleLabels } from "@/lib/navigation";
import { departments, type DirectoryUser } from "@/lib/demo/user-directory";
import type { AccessChange } from "@/lib/demo/access-impact";
import type { Role } from "@/lib/api/types";

export function AccessReview({
  user,
  onClose,
}: {
  user: DirectoryUser;
  onClose: () => void;
}) {
  const { store } = useSession();
  const [kind, setKind] = useState<AccessChange["kind"]>(
    user.active ? "role" : "unlock",
  );
  const [role, setRole] = useState<Role>(user.role);
  const [department, setDepartment] = useState(user.department);
  const [emergency, setEmergency] = useState(false);
  const [impact, setImpact] =
    useState<ReturnType<typeof store.directory.reviewAccess>>();
  const title = useRef<HTMLHeadingElement>(null);
  const result = useRef<HTMLHeadingElement>(null);
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const change: AccessChange =
      kind === "role"
        ? { kind, role }
        : kind === "department"
          ? { kind, department }
          : kind === "lock"
            ? { kind, emergency }
            : { kind };
    setImpact(store.directory.reviewAccess(user.email, change));
    requestAnimationFrame(() => result.current?.focus());
  }
  return (
    <section
      className="directory-panel directory-card access-review"
      aria-labelledby="access-review-title"
    >
      <h2 id="access-review-title" tabIndex={-1} ref={title}>
        Xem trước thay đổi quyền
      </h2>
      <p>
        {user.name} · {user.email}
      </p>
      <form
        onSubmit={review}
        className="access-review-form"
        onChange={() => setImpact(undefined)}
      >
        <label>
          Thao tác
          <select
            aria-label="Thao tác"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as AccessChange["kind"])
            }
          >
            <option value="role">Đổi vai trò</option>
            <option value="department">Đổi phòng ban</option>
            {user.active ? (
              <option value="lock">Khóa tài khoản</option>
            ) : (
              <option value="unlock">Mở khóa tài khoản</option>
            )}
          </select>
        </label>
        {kind === "role" && (
          <label>
            Vai trò mới
            <select
              aria-label="Vai trò mới"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === "department" && (
          <label>
            Phòng ban mới
            <select
              aria-label="Phòng ban mới"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}
        {kind === "lock" && (
          <label className="access-emergency">
            <input
              type="checkbox"
              checked={emergency}
              onChange={(event) => setEmergency(event.target.checked)}
            />
            Tình huống thu hồi khẩn cấp DEMO
          </label>
        )}
        <div className="directory-actions">
          <Button variant="secondary" onClick={onClose}>
            Đóng xem trước
          </Button>
          <Button type="submit">Xem tác động</Button>
        </div>
      </form>
      {impact === null && (
        <p role="alert">Không thể xem tác động cho tài khoản này.</p>
      )}
      {impact && (
        <section
          className="directory-preview access-result"
          aria-labelledby="access-result-title"
        >
          <h3 id="access-result-title" tabIndex={-1} ref={result}>
            Tác động dự kiến
          </h3>
          <dl>
            <dt>Hiện tại</dt>
            <dd>
              {roleLabels[impact.current.role]} · {impact.current.department} ·{" "}
              {impact.current.active ? "Đang hoạt động" : "Đã khóa"}
            </dd>
            <dt>Đề xuất</dt>
            <dd>
              {roleLabels[impact.proposed.role]} · {impact.proposed.department}{" "}
              · {impact.proposed.active ? "Đang hoạt động" : "Đã khóa"}
            </dd>
          </dl>
          <p>
            {impact.session === "revoke"
              ? "Nếu áp dụng, phiên cũ sẽ bị thu hồi và người dùng phải đăng nhập lại."
              : impact.session === "no-restore"
                ? "Mở khóa không khôi phục phiên cũ. Người dùng phải đăng nhập lại."
                : "Không có thay đổi phiên dự kiến."}
          </p>
          {impact.affected.length ? (
            <ul>
              {impact.affected.map((item) => (
                <li key={item.id}>
                  <strong>{item.id}</strong> · {item.title} · {item.state}
                  <br />
                  {item.candidate
                    ? "Ứng viên bàn giao DEMO: " + item.candidate
                    : "Chưa có người thay thế đủ điều kiện."}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có công việc đang giao bị ảnh hưởng trong fixture.</p>
          )}
          {impact.blockers.length > 0 && (
            <div className="access-blocked" role="status">
              <strong>Bị chặn</strong>
              <ul>
                {impact.blockers.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          {impact.emergency && (
            <p className="directory-note">
              Thu hồi khẩn cấp cần xử lý riêng. Quy trình bàn giao khi chưa có
              người thay thế còn chờ quyết định nghiệp vụ. Bản xem trước không
              xác nhận đã thu hồi hoặc khóa tài khoản.
            </p>
          )}
          <p>
            Chỉ xem trước DEMO. Chưa cập nhật tài khoản, phiên hoặc công việc.
          </p>
        </section>
      )}
    </section>
  );
}
