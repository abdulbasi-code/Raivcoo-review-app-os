import { Skeleton } from "@/components/ui/skeleton";

export function Loading2() {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="border rounded-[20px] mb-4 p-4">
        <div className="flex flex-row items-start gap-4">
          {/* Avatar & Status */}
          <div className="relative">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-2">
            <div className="flex">
              <div className="flex-1 space-y-2">
                <Skeleton className="md:h-8 h-5 sm:w-48 w-20" />
                <Skeleton className="h-5 sm:w-32 w-10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-20 w-full  " />
          </div>

          {/* Top Right Actions */}
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="">
          <div className="flex justify-center w-full">
            {["Videos", "About Me", "Pricing"].map((tab) => (
              <Skeleton key={tab} className="h-10 flex-1 w-32 mx-1" />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Video Grid */}
        <div className="space-y-8">
          {[1, 2, 3].map((section) => (
            <div key={section} className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((video) => (
                  <div key={video} className="space-y-3">
                    <Skeleton className="aspect-video rounded-xl" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Client Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4].map((client) => (
              <div
                key={client}
                className="flex flex-col items-center space-y-2"
              >
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
