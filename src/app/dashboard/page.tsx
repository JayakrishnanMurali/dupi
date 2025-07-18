"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useProjects } from "@/lib/hooks/use-projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FolderOpen,
  Activity,
  Database,
  Zap,
  TrendingUp,
  Calendar,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </div>
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <Icon className="text-primary h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="text-muted-foreground mt-4 flex items-center text-xs">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useProjects();

  // Show auth loading state only if we don't have data yet
  if (authLoading && !data) {
    return <DashboardSkeleton />;
  }

  // Show data loading state only if we have a user and the query is still loading
  if (user && isLoading && !data) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error Loading Dashboard
              </CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If we have data (even if empty), we should show the dashboard
  if (data && "projects" in data && "stats" in data) {
    const projects = data.projects?.slice(0, 5) ?? [];
    const stats = data.stats;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name ?? user?.email}!
              </p>
            </div>
            <Button onClick={() => router.push("/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Projects"
                value={stats.total_projects}
                icon={FolderOpen}
                description="Active projects"
              />
              <StatCard
                title="Total APIs"
                value={stats.total_endpoints}
                icon={Database}
                description="Generated endpoints"
              />
              <StatCard
                title="Active APIs"
                value={stats.active_endpoints}
                icon={Zap}
                description="Currently running"
              />
              <StatCard
                title="API Calls"
                value={stats.total_api_calls}
                icon={Activity}
                description="Total requests"
                trend="+12% from last month"
              />
            </div>
          )}

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Your latest mock API projects
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/projects")}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <FolderOpen className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    No projects yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first mock API project to get started!
                  </p>
                  <Button onClick={() => router.push("/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const hasActiveEndpoints =
                      project.stats.active_endpoints > 0;
                    const status =
                      project.stats.total_endpoints === 0
                        ? "Empty"
                        : hasActiveEndpoints
                          ? "Active"
                          : "No Active APIs";

                    return (
                      <div
                        key={project.id}
                        className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="font-semibold">{project.name}</h3>
                            <Badge
                              variant={
                                hasActiveEndpoints ? "default" : "secondary"
                              }
                            >
                              {status}
                            </Badge>
                            <Badge variant="outline">
                              {project.stats.total_endpoints} APIs
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-muted-foreground mb-2 text-sm">
                              {project.description}
                            </p>
                          )}
                          <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(
                                project.created_at!,
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {project.stats.active_endpoints} active
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push("/create")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Plus className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Project</h3>
                    <p className="text-muted-foreground text-sm">
                      Generate a new mock API
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push("/projects")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <FolderOpen className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Projects</h3>
                    <p className="text-muted-foreground text-sm">
                      View all your projects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push("/docs")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Activity className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Documentation</h3>
                    <p className="text-muted-foreground text-sm">
                      Learn how to use Dupi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
