import { createDemoGateway, type DemoAdapter } from "../demo/gateway";
import {
  createHttpAccountGateway,
  type HttpAccountGateway,
} from "./http-account";

type DemoOptions = { mode: "demo" };
type RealOptions = {
  mode: "real";
  configuration?: { deployment: "same-origin"; fetcher?: typeof fetch };
};
type RealAdapter = { mode: "real"; gateway: HttpAccountGateway };

export function createAccountGateway(options: DemoOptions): DemoAdapter;
export function createAccountGateway(options: RealOptions): RealAdapter;
export function createAccountGateway(
  options: DemoOptions | RealOptions,
): DemoAdapter | RealAdapter {
  if (options?.mode === "demo") return createDemoGateway();
  if (
    options?.mode === "real" &&
    options.configuration?.deployment === "same-origin"
  ) {
    return {
      mode: "real",
      gateway: createHttpAccountGateway(options.configuration.fetcher),
    };
  }
  throw new Error(
    "Only explicit DEMO or configured real mode is supported. Real adapter selection is not implemented without same-origin configuration.",
  );
}
