import type { ComponentProps } from "react";

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  loading = false,
  disabled,
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      className={`ui-button ${className}`}
      data-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    />
  );
}
