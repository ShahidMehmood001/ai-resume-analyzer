"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Briefcase, Brain, Moon, Sun, Upload, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",           label: "Dashboard",  icon: BarChart3 },
  { href: "/upload",     label: "Upload",      icon: Upload    },
  { href: "/candidates", label: "Candidates",  icon: Users     },
  { href: "/jobs",       label: "Jobs",        icon: Briefcase },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — theme is unknown on server
  useEffect(() => { setMounted(true); }, []);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 flex w-60 flex-col",
      "border-r border-[var(--color-border)] bg-[var(--color-card)]",
    )}>
      {/* Wordmark */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div className="leading-none">
          <p className="text-[13px] font-semibold tracking-tight">Resume AI</p>
          <p className="text-[10px] text-[var(--color-muted-foreground)]">Analysis Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2",
                "text-[13px] font-medium transition-colors duration-100",
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="shrink-0 border-t border-[var(--color-border)] p-2.5">
        {mounted ? (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-[var(--radius)] px-3 py-2",
              "text-[13px] font-medium text-[var(--color-muted-foreground)]",
              "transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]",
            )}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 shrink-0" />
              : <Moon className="h-4 w-4 shrink-0" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        ) : (
          <div className="h-9" />
        )}
      </div>
    </aside>
  );
}
