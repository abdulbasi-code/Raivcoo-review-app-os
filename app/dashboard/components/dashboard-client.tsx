// app/dashboard/components/dashboard-client.tsx

"use client";

import { useState, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Film,
  Calendar,
  CheckCircle2,
  CircleDot,
  ChevronRight,
  Truck,
  FolderOpenDot,
  History,
  BarChart,
  Lock,
  Folders,
} from "lucide-react";
import Link from "next/link";
import { RevButtons } from "@/components/ui/RevButtons";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  formatFullDate,
  formatStatus,
  getStatusDescription,
  getStatusDotColor,
  isDeadlineApproaching,
  Project,
  ProjectTrack,
  Stats,
} from "./libs";
import { ProjectCardSkeleton, StatCardSkeleton } from "./dashboard-loading";
import { Badge } from "@/components/ui/badge";

export function DashboardClient({
  recentProjects,
  stats,
}: {
  recentProjects: Project[];
  stats: Stats;
}) {
  const [showAllTimeStats, setShowAllTimeStats] = useState(false);

  const currentStats = showAllTimeStats ? stats.allTime : stats.monthly;

  return (
    <div className="min-h-screen md:p-6 py-3 space-y-6">
      {/* Header - loads immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
            Dashboard
          </h1>
        </div>
        <Button
          onClick={() => setShowAllTimeStats(!showAllTimeStats)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          {showAllTimeStats ? (
            <>
              <Calendar className="h-4 w-4" />
              Show Monthly Stats
            </>
          ) : (
            <>
              <History className="h-4 w-4" />
              Show All-time Stats
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview - with Suspense */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid
          currentStats={currentStats}
          showAllTimeStats={showAllTimeStats}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="grid gap-6">
        {/* Recent Projects Section - with Suspense */}
        <Suspense fallback={<RecentProjectsSkeleton />}>
          <RecentProjectsSection recentProjects={recentProjects} />
        </Suspense>

        {/* Analytics Section - with Suspense */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsSection stats={stats} />
        </Suspense>
      </div>
    </div>
  );
}

// Stats Grid Component
function StatsGrid({ currentStats, showAllTimeStats }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title={`${showAllTimeStats ? "All-time" : "Monthly"} Active Projects`}
        value={currentStats.activeProjects}
        icon={<CircleDot className="h-4 w-4" />}
        variant="active"
      />
      <StatCard
        title={`${showAllTimeStats ? "All-time" : "Monthly"} Pending Review`}
        value={currentStats.pendingProjects}
        icon={<Clock className="h-4 w-4" />}
        variant="pending"
      />
      <StatCard
        title={`${showAllTimeStats ? "All-time" : "Monthly"} Completed`}
        value={currentStats.completedProjects}
        icon={<CheckCircle2 className="h-4 w-4" />}
        variant="completed"
      />
    </div>
  );
}

// Recent Projects Section Component
function RecentProjectsSection({
  recentProjects,
}: {
  recentProjects: Project[];
}) {
  const mostRecentProject =
    recentProjects.length > 0 ? recentProjects[0] : null;

  const calculateTrackProgress = (track: ProjectTrack | undefined | null) => {
    if (!track || !track.steps?.length) return 0;
    const completedSteps = track.steps.filter(
      (step) => step.status === "completed"
    ).length;
    return Math.round((completedSteps / track.steps.length) * 100);
  };

  const trackProgress = mostRecentProject?.latestTrack
    ? calculateTrackProgress(mostRecentProject.latestTrack)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-[#164E63]/40 text-cyan-500 hover:bg-[#164E63]/60 p-1 rounded-[5px] border-2">
            <Folders className="h-5 w-5" />
          </div>
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mostRecentProject ? (
          <>
            {/* Main Project Card */}
            <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
              <div className="flex items-start justify-between">
                <div className="relative w-fit">
                  <h3 className="text-xl font-semibold text-white">
                    {mostRecentProject.title}
                  </h3>
                  <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <div
                        className={cn(
                          "absolute -top-0 border-2 -right-4 size-3 rounded-full cursor-default",
                          getStatusDotColor(mostRecentProject.status)
                        )}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="text-sm max-w-xs">
                      <p className="font-medium">
                        {formatStatus(mostRecentProject.status)}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {getStatusDescription(mostRecentProject.status)}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <Link href={`/dashboard/projects/${mostRecentProject.id}`}>
                  <RevButtons
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </RevButtons>
                </Link>
              </div>

              {/* Project Progress */}
              {mostRecentProject.latestTrack && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        Round {mostRecentProject.latestTrack.round_number}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground text-sm">
                        {mostRecentProject.latestTrack.steps?.filter(
                          (s) => s.status === "completed"
                        ).length || 0}
                        /{mostRecentProject.latestTrack.steps?.length || 0}{" "}
                        steps
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {trackProgress}%
                    </span>
                  </div>
                  <Progress value={trackProgress} />
                </div>
              )}

              {/* Project Metadata */}
              <div className="flex gap-4 w-full md:w-auto flex-wrap justify-between items-center text-sm">
                <Badge
                  variant="outline"
                  className="flex justify-center w-full md:w-fit items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <p>Created</p>
                  <p>{formatFullDate(mostRecentProject.created_at)}</p>
                </Badge>
                {mostRecentProject.deadline && (
                  <Badge
                    variant={
                      isDeadlineApproaching(mostRecentProject.deadline)
                        ? "warning"
                        : "outline"
                    }
                    className="flex justify-center w-full md:w-fit items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    <p>Deadline</p>
                    <p>{formatFullDate(mostRecentProject.deadline)}</p>
                  </Badge>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4">
                <Link href={`/dashboard/projects/${mostRecentProject.id}`}>
                  <RevButtons variant="default" size="sm" className="gap-1">
                    <FolderOpenDot className="h-4 w-4" />
                    View Project
                  </RevButtons>
                </Link>
                <Link href={`/live-track/${mostRecentProject.id}`}>
                  <RevButtons variant="outline" size="sm" className="gap-1">
                    <Truck className="h-4 w-4" />
                    Live Track
                  </RevButtons>
                </Link>
              </div>
            </div>

            {/* Additional Projects List */}
            {recentProjects.length > 1 && (
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">
                  Other Recent Projects
                </h4>
                {recentProjects.slice(1).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between px-3 py-3 border-2 border-dashed hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="relative w-fit">
                        <h3 className="font-semibold">{project.title}</h3>
                        <HoverCard openDelay={0} closeDelay={0}>
                          <HoverCardTrigger asChild>
                            <div
                              className={cn(
                                "absolute -top-0 border-2 -right-4 size-3 rounded-full cursor-default",
                                getStatusDotColor(project.status)
                              )}
                            />
                          </HoverCardTrigger>
                          <HoverCardContent
                            side="top"
                            className="text-sm max-w-xs"
                          >
                            <p className="font-medium">
                              {formatStatus(project.status)}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                              {getStatusDescription(project.status)}
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>

                      {project.latestTrack && (
                        <div className="flex items-center mt-1 gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Round {project.latestTrack.round_number}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <RevButtons
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </RevButtons>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Film className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No active projects</p>
            <Link href="/dashboard/projects/new">
              <RevButtons variant="outline">Create Project</RevButtons>
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link href="/dashboard/projects" className="w-full">
          <RevButtons variant="outline" className="w-full">
            View All Projects
          </RevButtons>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Analytics Section Component
function AnalyticsSection({ stats }: { stats: Stats }) {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-[#064E3B]/40 text-green-500 hover:bg-[#064E3B]/60 p-1 rounded-[5px] border-2">
            <BarChart className="h-5 w-5" />
          </div>
          Monthly Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Project completion rate: {calculateCompletionRate(stats.monthly)}%
          </p>
          <p>
            Average project duration:{" "}
            {stats.monthly.completedProjects > 0 ? "7 days" : "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton components for Suspense fallbacks
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

function RecentProjectsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProjectCardSkeleton isMain={true} />
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
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
            <div
              key={i}
              className="h-5 w-full bg-muted animate-pulse rounded"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function calculateCompletionRate(stats: {
  completedProjects: number;
  activeProjects: number;
  pendingProjects: number;
}) {
  const total =
    stats.completedProjects + stats.activeProjects + stats.pendingProjects;
  if (total === 0) return 0;
  return Math.round((stats.completedProjects / total) * 100);
}

function StatCard({
  title,
  value,
  icon,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "active" | "pending" | "completed" | "default";
}) {
  const iconClasses = {
    active: "bg-[#1E3A8A]/40 text-[#3B82F6]",
    pending: "bg-[#783F04]/40 text-[#F59E0B]",
    completed: "bg-[#064E3B]/40 text-[#10B981]",
    default: "bg-gray-700 text-gray-300",
  };

  return (
    <Card className="hover:shadow-sm transition-shadow border-2 border-dashed">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div
            className={`rounded-[5px] flex items-center border-2 justify-center size-8 ${iconClasses[variant]}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
