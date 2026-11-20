import { createTicketIntake } from "../../lib/demo/ticket-intake";
import { createSlaPolicy } from "../../lib/demo/sla-policy";
import { createTeamDirectory } from "../../lib/demo/team-directory";
import { createOrganizationCatalog } from "../../lib/demo/organization-catalog";
import { createUserDirectory } from "../../lib/demo/user-directory";
import { createDemoGateway, type DemoAdapter } from "../../lib/demo/gateway";
import { createDemoFixtures, type DemoPersona } from "../../lib/demo/fixtures";
import type {
  LoginInput,
  ApiOutcome,
  ProfileUpdate,
  UserView,
} from "../../lib/api/types";
import type { QueryClient } from "../../lib/api/query-client";

/** Memory-only session. Epochs fence late auth responses as well as query results. */
export class SessionStore {
  private persona: DemoPersona | null = null;
  readonly sla = createSlaPolicy(() => this.persona?.user);
  readonly teams = createTeamDirectory(() => this.persona?.user);
  readonly catalog = createOrganizationCatalog(() => this.persona?.user);
  readonly directory = createUserDirectory(
    () => this.persona?.user,
    () =>
      this.catalog
        .list("departments")
        .find((row) => row.id === "dept-acc" && row.active)?.label,
  );
  readonly tickets = createTicketIntake({
    identity: () => this.identity(),
    actor: () => this.persona,
    memberships: () => this.teams.ownTeamIds(),
    isTeamMember: (teamId, userId) => this.teams.isMember(teamId, userId),
    intake: () => this.teams.intake(),
    snapshot: () => this.sla.snapshotTable(),
    teams: () => this.teams.routingOptions().teams,
    people: () => this.teams.routingOptions().people,
  });
  private epoch = 0;
  passwordChanged = false;
  private read = 0;
  private listeners = new Set<() => void>();
  constructor(
    private client: QueryClient,
    readonly adapter: DemoAdapter = createDemoGateway(),
  ) {}
  getSnapshot = () => this.persona;
  getServerSnapshot = () => null;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private emit() {
    this.listeners.forEach((listener) => listener());
  }
  invalidate = () => {
    this.epoch++;
    this.read++;
    this.persona = null;
    this.client.logout();
    this.emit();
  };
  connect = () => {
    const stopAdapter = this.adapter.subscribeInvalidation((event) => {
      this.passwordChanged = event === "password-changed";
      this.invalidate();
    });
    const stopQuery = this.client.onUnauthorized(this.invalidate);
    return () => {
      stopAdapter();
      stopQuery();
      this.invalidate();
    };
  };
  private apply(user: UserView) {
    if (!user.active) {
      this.invalidate();
      return;
    }
    this.client.setIdentity({
      userId: user.id,
      scope: `${user.role}:${user.version}:${this.epoch}`,
    });
    this.persona = { ...createDemoFixtures().personas[user.role], user };
    this.emit();
  }
  login = async (input: LoginInput): Promise<ApiOutcome<UserView>> => {
    this.invalidate();
    // Each login receives an isolated adapter state reset; no credential persistence.
    this.adapter.controls.reset();
    const epoch = this.epoch;
    const result = await this.adapter.gateway.login(input);
    if (epoch !== this.epoch)
      return {
        kind: "unknown",
        effect: "unconfirmed",
        message: "Phiên đã thay đổi. Vui lòng đăng nhập lại.",
      };
    if (result.kind === "success") this.apply(result.data);
    return result;
  };
  refresh = async () => {
    if (!this.persona) return;
    const epoch = this.epoch;
    const read = ++this.read;
    const result = await this.adapter.gateway.currentUser();
    if (epoch !== this.epoch || read !== this.read) return;
    if (result.kind === "success") this.apply(result.data);
    else this.invalidate();
  };
  updateOwnProfile = async (
    input: ProfileUpdate,
  ): Promise<ApiOutcome<UserView>> => {
    const epoch = this.epoch;
    const result = await this.adapter.gateway.updateOwnProfile(input);
    if (epoch !== this.epoch)
      return {
        kind: "unknown",
        effect: "unconfirmed",
        message: "Phiên đã thay đổi.",
      };
    if (result.kind === "unauthenticated") this.invalidate();
    if (
      result.kind === "success" &&
      result.data.id === this.persona?.user.id &&
      result.data.version >= this.persona.user.version
    ) {
      this.read++;
      this.apply(result.data);
    }
    return result;
  };
  logout = async () => {
    this.invalidate();
    this.adapter.controls.reset();
  };
  identity = () =>
    this.persona
      ? {
          userId: this.persona.user.id,
          scope: `${this.persona.user.role}:${this.persona.user.version}:${this.epoch}`,
        }
      : null;
}
