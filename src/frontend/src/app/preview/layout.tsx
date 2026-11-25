import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { authMode } from "@/lib/api/auth-mode";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  if (authMode() === "real") notFound();
  return children;
}
