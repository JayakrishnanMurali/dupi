"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useProjects } from "@/lib/hooks/use-projects";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useProjects();

  // Debug logging
  console.log("Dashboard state:", {
    user: !!user,
    authLoading,
    isLoading,
    hasData: !!data,
    error,
  });

  // Show auth loading state only if we don't have data yet
  if (authLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show data loading state only if we have a user and the query is still loading
  if (user && isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // If we have a user but no data and not loading, there might be an issue
  if (user && !isLoading && !data && !error) {
    console.warn("User authenticated but no projects data available");
  }

  // Show error state
  if (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Dashboard</h1>
          <p className="mb-6 text-red-300">{error.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If we have data (even if empty), we should show the dashboard
  // This handles the case where the API returns { projects: [], stats: {...} }
  if (data && !error) {
    const projects = data.projects.slice(0, 5) ?? [];
    const stats = data.stats;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="mt-2 text-xl text-slate-300">
                  Welcome back, {profile?.full_name ?? user?.email}!
                </p>
              </div>
              <Button
                onClick={() => router.push("/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + New Project
              </Button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.active}
                  </div>
                  <div className="text-lg">Active Projects</div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {stats.total}
                  </div>
                  <div className="text-lg">Total Projects</div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.expired}
                  </div>
                  <div className="text-lg">Expired</div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                  <div className="text-3xl font-bold text-gray-400">
                    {stats.inactive}
                  </div>
                  <div className="text-lg">Inactive</div>
                </div>
              </div>
            )}

            {/* Recent Projects */}
            <div className="mb-8 rounded-xl border border-white/20 bg-white/10 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent Projects</h2>
                <Button
                  onClick={() => router.push("/projects")}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  View All
                </Button>
              </div>

              {projects.length === 0 ? (
                <div className="py-12 text-center">
                  <h3 className="mb-4 text-xl font-semibold">
                    No projects yet
                  </h3>
                  <p className="mb-6 text-slate-300">
                    Create your first mock API project to get started!
                  </p>
                  <Button
                    onClick={() => router.push("/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const expiresIn = Math.ceil(
                      (new Date(project.expires_at).getTime() - Date.now()) /
                        (1000 * 60 * 60),
                    );
                    const isExpired = expiresIn <= 0;

                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {project.name}
                            </h3>
                            <span
                              className={`rounded px-2 py-1 text-xs ${
                                isExpired ? "bg-red-600" : "bg-green-600"
                              }`}
                            >
                              {isExpired ? "Expired" : "Active"}
                            </span>
                            <span className="rounded bg-blue-600 px-2 py-1 text-xs">
                              {project.http_method}
                            </span>
                          </div>
                          {project.description && (
                            <p className="mb-2 text-sm text-slate-300">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>
                              Created:{" "}
                              {new Date(
                                project.created_at!,
                              ).toLocaleDateString()}
                            </span>
                            <span>
                              Expires:{" "}
                              {isExpired ? "Expired" : `in ${expiresIn} hours`}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              router.push(`/projects/${project.id}`)
                            }
                            className="bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <button
                onClick={() => router.push("/create")}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-left transition-colors hover:bg-white/20"
              >
                <h3 className="mb-2 text-xl font-bold">Create Project</h3>
                <p className="text-slate-300">
                  Generate a new mock API from TypeScript interfaces
                </p>
              </button>

              <button
                onClick={() => router.push("/projects")}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-left transition-colors hover:bg-white/20"
              >
                <h3 className="mb-2 text-xl font-bold">Manage Projects</h3>
                <p className="text-slate-300">
                  View and manage all your mock API projects
                </p>
              </button>

              <button
                onClick={() => router.push("/docs")}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-left transition-colors hover:bg-white/20"
              >
                <h3 className="mb-2 text-xl font-bold">Documentation</h3>
                <p className="text-slate-300">
                  Learn how to integrate Dupi with your workflow
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="text-xl">Loading...</div>
    </div>
  );
}
