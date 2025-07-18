"use client";

import { useRouter } from "next/navigation";
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
import { useProjects, useDeleteProject } from "@/lib/hooks/use-projects";
import { useAuth } from "@/lib/auth/context";
import {
  Plus,
  Home,
  FolderOpen,
  Database,
  Zap,
  Calendar,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";

function ProjectsSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Hero Section Skeleton */}
          <div className="from-primary/10 via-primary/5 to-background relative overflow-hidden rounded-2xl bg-gradient-to-r p-8">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-6 h-5 w-96" />
            <Skeleton className="h-12 w-48" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="from-background to-muted/30 border-0 bg-gradient-to-br shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Projects Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="from-background to-muted/30 border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
  trend,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  trend?: { value: number; isPositive: boolean };
}) {
  const variantStyles = {
    default: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
    success:
      "bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-600",
    warning:
      "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-600",
    destructive: "bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-600",
  };

  return (
    <Card className="from-background to-muted/30 group border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp
                  className={`h-3 w-3 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
                />
                <span
                  className={
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl ${variantStyles[variant]} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectMutation.mutateAsync({ projectId });
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Show auth loading state only if we don't have data yet
  if (authLoading && !data) {
    return <ProjectsSkeleton />;
  }

  // Show data loading state only if we have a user and no data yet
  if (user && isLoading && !data) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                My Projects
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage and organize your mock API projects
              </p>
            </div>
            <Button
              onClick={() => router.push("/create")}
              className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </div>

          {/* Hero Section */}
          {!data?.projects || data.projects.length === 0 ? (
            <div className="from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-8">
              <div className="from-primary/10 absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br to-transparent"></div>
              <div className="from-primary/5 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr to-transparent"></div>
              <div className="relative z-10 text-center">
                <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                  <Sparkles className="text-primary h-10 w-10" />
                </div>
                <h2 className="mb-3 text-2xl font-bold">
                  Ready to Create Your First Project?
                </h2>
                <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
                  Start building mock APIs with TypeScript interfaces and
                  generate realistic test data instantly.
                </p>
                <Button
                  onClick={() => router.push("/create")}
                  className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create First Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-8">
              <div className="from-primary/10 absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br to-transparent"></div>
              <div className="from-primary/5 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr to-transparent"></div>
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <Activity className="text-primary h-6 w-6" />
                  <h2 className="text-xl font-semibold">Project Overview</h2>
                </div>
                <p className="text-muted-foreground">
                  You have {data.projects.length} project
                  {data.projects.length !== 1 ? "s" : ""} with a total of{" "}
                  {data.stats?.total_endpoints || 0} API endpoints.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {data?.stats && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Projects"
                value={data.stats.active_projects}
                icon={CheckCircle}
                variant="success"
                description="Currently running"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Total Projects"
                value={data.stats.total_projects}
                icon={FolderOpen}
                description="All projects"
              />
              <StatCard
                title="Expired Projects"
                value={data.stats.archived_projects}
                icon={Clock}
                variant="warning"
                description="Past expiration"
              />
              <StatCard
                title="Total APIs"
                value={data.stats.total_endpoints}
                icon={Database}
                description="Generated endpoints"
                trend={{ value: 8, isPositive: true }}
              />
            </div>
          )}

          {error && (
            <Card className="border-destructive/50 bg-destructive/5 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  <p className="text-destructive font-medium">
                    {error.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects List */}
          {data?.projects && data.projects.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Projects</h2>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  {data.projects.length} project
                  {data.projects.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.projects.map((project) => {
                  const hasActiveEndpoints = project.stats.active_endpoints > 0;
                  const status =
                    project.stats.total_endpoints === 0
                      ? "Empty"
                      : hasActiveEndpoints
                        ? "Active"
                        : "No Active APIs";

                  return (
                    <Card
                      key={project.id}
                      className="from-background to-muted/30 group cursor-pointer border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="group-hover:text-primary truncate text-lg transition-colors">
                              {project.name}
                            </CardTitle>
                            {project.description && (
                              <CardDescription className="mt-2 line-clamp-2 text-sm">
                                {project.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge
                            variant={
                              hasActiveEndpoints ? "default" : "secondary"
                            }
                            className="transition-transform group-hover:scale-105"
                          >
                            {status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Database className="h-3 w-3" />
                              Total APIs:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {project.stats.total_endpoints}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Zap className="h-3 w-3" />
                              Active APIs:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {project.stats.active_endpoints}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Created:
                            </span>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              {new Date(
                                project.created_at!,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/projects/${project.id}`);
                            }}
                            className="group-hover:border-primary group-hover:text-primary flex-1 transition-colors"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            disabled={deleteProjectMutation.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
