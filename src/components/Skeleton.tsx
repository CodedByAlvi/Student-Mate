import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-stone-200 dark:bg-stone-800", className)} />
  );
}

export function NoteSkeleton() {
  return (
    <div className="flex h-[260px] flex-col rounded-[2.5rem] border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900/40">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-8 w-1/2 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between pt-6 border-t border-stone-100 dark:border-stone-800/50">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Skeleton className="h-2 w-12 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <div className="flex -space-x-2">
            <Skeleton className="h-6 w-6 rounded-full border-2 border-white dark:border-stone-900" />
            <Skeleton className="h-6 w-6 rounded-full border-2 border-white dark:border-stone-900" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
