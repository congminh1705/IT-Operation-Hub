"use client";
import { useId, type ComponentProps } from "react";

export function Input({
  label,
  error,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; error?: string }) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="ui-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          error ? `${inputId}-error` : props["aria-describedby"]
        }
      />
      {error && <small id={`${inputId}-error`}>{error}</small>}
    </div>
  );
}
