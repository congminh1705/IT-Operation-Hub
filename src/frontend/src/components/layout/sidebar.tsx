"use client";

import Link from "next/link";
import type { DemoPersona } from "@/lib/demo/fixtures";
import { getNavigation, activeNavigation } from "@/lib/navigation";
import { Icon } from "./icon";
import { AccountSummary } from "./account-menu";

export function SidebarContent({
  persona,
  pathname,
  scope,
  prefix = "",
  onNavigate,
}: {
  persona: DemoPersona;
  pathname: string;
  scope?: string;
  prefix?: string;
  onNavigate?: () => void;
}) {
  const items = getNavigation(persona),
    active = activeNavigation(persona, pathname, scope);
  return (
    <>
      <Link
        href={`${prefix}/dashboard`}
        className="shell-brand"
        onClick={onNavigate}
      >
        <span>
          <Icon name="toolbox" />
        </span>
        <div>
          <strong>IT Operations</strong>
          <small>Hub · Không gian nội bộ</small>
        </div>
      </Link>
      <div className="shell-organization">
        <Icon name="building" />
        <div>
          <strong>IT Operations Hub</strong>
          <small>Tổ chức DEMO</small>
        </div>
      </div>
      <nav className="shell-navigation" aria-label="Điều hướng chính">
        {(
          [
            ["workspace", "Không gian làm việc"],
            ["monitoring", "Theo dõi"],
            ["admin", "Quản trị"],
          ] as const
        ).map(([group, label]) => {
          const children = items.filter((item) => item.group === group);
          return children.length ? (
            <div key={group} className="shell-nav-group">
              <h2>{label}</h2>
              <ul>
                {children.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`${prefix}${item.href}`}
                      onClick={onNavigate}
                      aria-current={active?.id === item.id ? "page" : undefined}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })}
      </nav>
      <AccountSummary
        persona={persona}
        prefix={prefix}
        onNavigate={onNavigate}
      />
    </>
  );
}
