import type { IconName } from "@/lib/navigation";

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="shell-icon"
    >
      <use href={`/icons.svg#i-${name}`} />
    </svg>
  );
}
