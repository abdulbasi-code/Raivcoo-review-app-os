import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className=" p-4 mt-8">
      <Skeleton className="h-12 w-3/4 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-1/3 mt-6" />
    </div>
  );
}
