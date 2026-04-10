import { Shell } from "@/components/layout/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Shell>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </Shell>
  );
}
