export type AuthMode = "demo" | "real";

export function authMode(value = process.env.ITOH_AUTH_MODE): AuthMode {
  if (value === undefined || value === "demo") return "demo";
  if (value === "real") return "real";
  throw new Error("ITOH_AUTH_MODE must be demo or real.");
}
