// app/dashboard/components/dashboard-loading.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Film,
  Users,
  BarChart,
  CircleDot,
  Clock,
  CheckCircle2,
} from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid gap-6">
        {/* Recent Projects skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProjectCardSkeleton isMain={true} />
            <div className="space-y-4">
              <Skeleton className="h-4 w-48 mb-4" />
              {[1, 2].map((i) => (
                <ProjectCardSkeleton key={i} isMain={false} />
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        {/* Recent Clients skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ClientCardSkeleton key={i} />
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        {/* Analytics skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component skeletons
export function StatCardSkeleton() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-[5px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton({ isMain }: { isMain: boolean }) {
  if (isMain) {
    return (
      <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
        <div className="flex items-start justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-3 border-2 border-dashed rounded-lg">
      <div className="flex items-center gap-3">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
      <Skeleton className="h-9 w-9" />
    </div>
  );
}

export function ClientCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-9" />
    </div>
  );
}
