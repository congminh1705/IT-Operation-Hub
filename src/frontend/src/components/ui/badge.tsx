import type { ComponentProps } from "react";

export const statusTones = {
  active: "blue",
  ready: "green",
  done: "green",
  waiting: "amber",
  blocked: "rose",
  failed: "rose",
  overdue: "rose",
  locked: "gray",
  disabled: "gray",
  neutral: "gray",
} as const;
export function Badge({
  status,
  ...props
}: ComponentProps<"span"> & { status: keyof typeof statusTones }) {
  return (
    <span className="ui-badge" data-tone={statusTones[status]} {...props} />
  );
}
