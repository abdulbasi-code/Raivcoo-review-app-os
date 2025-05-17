import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar skeleton */}
      <div className="hidden md:block w-64 bg-background border-r p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-4 md:p-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
