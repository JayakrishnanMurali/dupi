"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useProjects, useDeleteProject } from "@/lib/hooks/use-projects";
import { useAuth } from "@/lib/auth/context";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show data loading state only if we have a user and no data yet
  if (user && isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">My Projects</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + New Project
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ← Home
              </Button>
            </div>
          </div>

          {/* Stats */}
          {data?.stats && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {data.stats.active}
                </div>
                <div className="text-lg">Active Projects</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {data.stats.total}
                </div>
                <div className="text-lg">Total Projects</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {data.stats.expired}
                </div>
                <div className="text-lg">Expired</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-gray-400">
                  {data.stats.inactive}
                </div>
                <div className="text-lg">Inactive</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
              <p className="text-red-300">{error.message}</p>
            </div>
          )}

          {/* Projects List */}
          {!data?.projects || data.projects.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold">No Projects Yet</h2>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.projects.map((project) => {
                const expiresIn = Math.ceil(
                  (new Date(project.expires_at).getTime() - Date.now()) /
                    (1000 * 60 * 60),
                );
                const isExpired = expiresIn <= 0;

                return (
                  <div
                    key={project.id}
                    className="rounded-xl border border-white/20 bg-white/10 p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="flex-1 truncate text-xl font-bold">
                        {project.name}
                      </h3>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          isExpired ? "bg-red-600" : "bg-green-600"
                        }`}
                      >
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>

                    {project.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-slate-300">
                        {project.description}
                      </p>
                    )}

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Method:</span>
                        <span className="rounded bg-blue-600 px-2 py-1 text-xs">
                          {project.http_method}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Expires:</span>
                        <span
                          className={
                            isExpired ? "text-red-300" : "text-yellow-300"
                          }
                        >
                          {isExpired ? "Expired" : `${expiresIn}h`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>
                          {new Date(project.created_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="flex-1 bg-blue-600 py-2 text-sm hover:bg-blue-700"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deleteProjectMutation.isPending}
                        className="bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
                      >
                        {deleteProjectMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
