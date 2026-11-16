"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

export type DialogProps = {
  open: boolean;
  title: string;
  description: string;
  onRequestClose: () => void;
  children: ReactNode;
  id?: string;
  className?: string;
};

/** Native showModal supplies top-layer rendering, inert background and focus containment. */
export function Dialog({
  open,
  title,
  description,
  onRequestClose,
  children,
  id: dialogId,
  className = "",
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      node.showModal();
    }
    const overflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      if (node.open) node.close();
      document.body.style.overflow = overflow;
      if (opener.current?.isConnected)
        opener.current.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      id={dialogId}
      className={`ui-dialog ${className}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const stops = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]",
          ),
        ).filter(
          (node) => node.tabIndex >= 0 && node.getClientRects().length > 0,
        );
        const first = stops[0],
          last = stops[stops.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      aria-modal="true"
    >
      <header className="ui-dialog-header">
        <h2 id={`${id}-title`}>{title}</h2>
        <Button
          variant="secondary"
          onClick={onRequestClose}
          aria-label="Đóng hộp thoại"
        >
          Đóng
        </Button>
      </header>
      <div className="ui-dialog-body">
        <p id={`${id}-description`} className="ui-description">
          {description}
        </p>
        {children}
      </div>
    </dialog>
  );
}
