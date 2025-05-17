import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div>
      <Skeleton className="h-12 w-3/4 mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
