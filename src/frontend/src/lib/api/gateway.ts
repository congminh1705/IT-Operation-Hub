import { createDemoGateway, type DemoAdapter } from "../demo/gateway";

/** No default mode and no real-to-DEMO fallback. A real client belongs to integration. */
export function createAccountGateway(options: {
  mode: "demo" | "real";
}): DemoAdapter {
  if (options?.mode !== "demo") {
    throw new Error(
      "Only explicit DEMO mode is available. Real account transport is not implemented.",
    );
  }
  return createDemoGateway();
}
