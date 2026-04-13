import { Sidebar } from "./sidebar";

interface ShellProps {
  children: React.ReactNode;
  /** Optional extra padding override */
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 pl-60 min-h-screen">
        <div
          className={`mx-auto max-w-screen-xl px-8 py-7 animate-[fadeIn_0.28s_ease-out] ${className ?? ""}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
