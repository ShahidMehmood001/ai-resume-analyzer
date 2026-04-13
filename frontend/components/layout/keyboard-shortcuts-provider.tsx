"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  const navigate = useCallback(
    (path: string) => {
      if (pathname !== path) router.push(path);
    },
    [router, pathname],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && helpOpen) {
        setHelpOpen(false);
        return;
      }
      if (isTypingTarget(e.target)) return;

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      if (!e.ctrlKey || !e.shiftKey) return;
      const k = e.key.toLowerCase();
      if (k === "h") {
        e.preventDefault();
        navigate("/");
      } else if (k === "u") {
        e.preventDefault();
        navigate("/upload");
      } else if (k === "c") {
        e.preventDefault();
        navigate("/candidates");
      } else if (k === "j") {
        e.preventDefault();
        navigate("/jobs");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, helpOpen]);

  return (
    <>
      {children}
      <button
        type="button"
        aria-label="Keyboard shortcuts"
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] shadow-md transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
      >
        <Keyboard className="h-4 w-4" />
      </button>
      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kbd-shortcuts-title"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-xl animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="kbd-shortcuts-title" className="text-lg font-semibold">
              Keyboard shortcuts
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Press <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-1 py-0.5 font-mono text-[10px]">?</kbd>{" "}
              anywhere (except when typing) to toggle this panel.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Dashboard</span>
                <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs">
                  Ctrl+Shift+H
                </kbd>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Upload</span>
                <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs">
                  Ctrl+Shift+U
                </kbd>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Candidates</span>
                <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs">
                  Ctrl+Shift+C
                </kbd>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Jobs</span>
                <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs">
                  Ctrl+Shift+J
                </kbd>
              </li>
            </ul>
            <Button className="mt-6 w-full" variant="secondary" onClick={() => setHelpOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
