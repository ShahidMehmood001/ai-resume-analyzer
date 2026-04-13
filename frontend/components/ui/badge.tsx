import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border border-[var(--color-border)]",
        outline:
          "border border-[var(--color-border)] text-[var(--color-muted-foreground)]",
        destructive:
          "bg-red-500/15 text-red-600 border border-red-200 dark:text-red-400 dark:border-red-900",
        success:
          "bg-emerald-500/15 text-emerald-700 border border-emerald-200 dark:text-emerald-400 dark:border-emerald-900",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
