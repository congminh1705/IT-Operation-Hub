import type { UserView } from "../api/types";
import { createDemoFixtures } from "./fixtures";

export type TeamChange =
  | { action: "save"; teamId: string; name: string; scope: string }
  | { action: "intake" | "deactivate" | "clear-intake"; teamId: string }
  | { action: "add" | "remove"; teamId: string; memberId: string };

type Team = {
  id: string;
  name: string;
  scope: string;
  active: boolean;
  members: string[];
};
const people = Object.values(createDemoFixtures().personas)
  .map((item) => item.user)
  .filter((user) => user.active && user.role !== "REQUESTER");
const tech = people.find((user) => user.role === "TECHNICIAN")!;
const manager = people.find((user) => user.role === "IT_MANAGER")!;
const work = [
  {
    id: "TKT-000126",
    teamId: "support",
    memberId: tech.id,
    state: "Đang xử lý",
  },
  {
    id: "TASK-DEMO-17",
    teamId: "support",
    memberId: tech.id,
    state: "Chờ bổ sung",
  },
];

export function createTeamDirectory(getActor: () => UserView | undefined) {
  const teams: Team[] = [
    {
      id: "support",
      name: "IT Support",
      scope: "Thiết bị · Mạng · Phần mềm",
      active: true,
      members: [tech.id, manager.id],
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      scope: "Hạ tầng",
      active: true,
      members: [tech.id],
    },
    {
      id: "legacy",
      name: "Legacy DEMO",
      scope: "Lịch sử",
      active: false,
      members: [],
    },
  ];
  let intakeId = "support";
  const allowed = () => {
    const user = getActor();
    return user?.active && user.role === "ADMIN";
  };
  function preview(change: TeamChange) {
    const team = teams.find((item) => item.id === change.teamId);
    const affected =
      allowed() &&
      (change.action === "remove" || change.action === "deactivate")
        ? work.filter(
            (item) =>
              item.teamId === change.teamId &&
              (change.action === "deactivate" ||
                ("memberId" in change && item.memberId === change.memberId)),
          )
        : [];
    let error = "";
    if (!allowed()) error = "Bạn không có quyền quản lý nhóm.";
    else if (change.action === "clear-intake")
      error = "Phải duy trì đúng một nhóm tiếp nhận đang hoạt động.";
    else if (!team?.active && !(change.action === "save" && !change.teamId))
      error = "Chọn nhóm đang hoạt động.";
    else if (change.action === "deactivate" && team?.id === intakeId)
      error = "Chuyển nhóm tiếp nhận trước khi ngừng sử dụng.";
    else if (affected.length)
      error = "Cần bàn giao công việc đang phụ trách trước khi tiếp tục.";
    else if (change.action === "save") {
      const name = change.name.trim().normalize("NFC");
      if (
        !name ||
        [...name].length > 100 ||
        !change.scope.trim() ||
        [...change.scope.trim()].length > 160
      )
        error = "Nhập tên nhóm và phạm vi hợp lệ.";
      else if (
        teams.some(
          (item) =>
            item.id !== change.teamId &&
            item.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"),
        )
      )
        error = "Tên nhóm đã tồn tại.";
    } else if (change.action === "add" || change.action === "remove") {
      if (!people.some((user) => user.id === change.memberId))
        error = "Chọn thành viên IT hợp lệ.";
      else if (
        team?.members.includes(change.memberId) ===
        (change.action === "add")
      )
        error = "Thành viên đã ở trạng thái này.";
    }
    return { error, affected: affected.map((item) => ({ ...item })) };
  }
  return {
    intakeName: () => teams.find((team) => team.id === intakeId)?.name,
    list: () =>
      allowed()
        ? teams.map((team) => ({
            ...team,
            members: [...team.members],
            intake: team.id === intakeId,
          }))
        : [],
    people: () =>
      allowed()
        ? people.map(({ id, display_name }) => ({ id, display_name }))
        : [],
    preview,
    apply(change: TeamChange) {
      const result = preview(change);
      if (result.error) return result;
      const team = teams.find((item) => item.id === change.teamId);
      if (change.action === "save") {
        const fields = {
          name: change.name.trim().normalize("NFC"),
          scope: change.scope.trim(),
        };
        if (team) Object.assign(team, fields);
        else
          teams.push({
            id: crypto.randomUUID(),
            ...fields,
            active: true,
            members: [],
          });
      } else if (change.action === "intake") intakeId = change.teamId;
      else if (change.action === "deactivate" && team) team.active = false;
      else if (change.action === "add" && team)
        team.members.push(change.memberId);
      else if (change.action === "remove" && team)
        team.members = team.members.filter((id) => id !== change.memberId);
      return result;
    },
  };
}
