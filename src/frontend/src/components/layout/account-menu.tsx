"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { DemoPersona } from "@/lib/demo/fixtures";
import { getAccountLinks, roleLabels } from "@/lib/navigation";

export function AccountSummary({
  persona,
  prefix = "",
  onNavigate,
}: {
  persona: DemoPersona;
  prefix?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="shell-account-summary">
      <Image src="/avatar-default.svg" width={36} height={36} alt="" />
      <div className="shell-account-info">
        <strong>{persona.user.display_name}</strong>
        <small>{roleLabels[persona.user.role]}</small>
      </div>
      {persona.navigation.includes("profile") && (
        <Link
          href={`${prefix}/profile`}
          onClick={onNavigate}
          className="shell-profile-link"
        >
          Hồ sơ
        </Link>
      )}
    </div>
  );
}

export function AccountMenu({
  persona,
  prefix = "",
}: {
  persona: DemoPersona;
  prefix?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      className="shell-account-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        className="shell-avatar-button"
        ref={button}
        type="button"
        aria-label={`Tài khoản: ${persona.user.display_name}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Image src="/avatar-default.svg" width={32} height={32} alt="" />
      </button>
      <nav
        id={id}
        aria-label="Tài khoản"
        hidden={!open}
        className="shell-account-popover"
      >
        <strong>{persona.user.display_name}</strong>
        <small>{roleLabels[persona.user.role]}</small>
        {getAccountLinks(persona).map((item, index) => (
          <Link
            key={item.id}
            ref={index === 0 ? first : undefined}
            href={`${prefix}${item.href}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
