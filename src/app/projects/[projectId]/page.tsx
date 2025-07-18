"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/hooks/use-projects";
import {
  useCreateEndpoint,
  useDeleteEndpoint,
} from "@/lib/hooks/use-endpoints";
import { useGenerateMockData } from "@/lib/hooks/use-mock-data";
import { useAuth } from "@/lib/auth/context";
import type { CreateEndpointParams } from "@/lib/api/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { user, loading: authLoading } = useAuth();
  const { data: project, isLoading, error } = useProject(projectId);
  const createEndpointMutation = useCreateEndpoint();
  const deleteEndpointMutation = useDeleteEndpoint();
  const generateMockDataMutation = useGenerateMockData();

  const [showCreateEndpoint, setShowCreateEndpoint] = useState(false);
  const [mockData, setMockData] = useState<
    Record<string, unknown> | unknown[] | null
  >(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    null,
  );

  // Show auth loading state only if we don't have data yet
  if (authLoading && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show data loading state only if we have a user and no data yet
  if (user && isLoading && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-xl">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Project Not Found</h1>
          <p className="mb-6 text-red-300">{error?.message}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateEndpoint = async (formData: FormData) => {
    const data: CreateEndpointParams = {
      project_id: projectId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      interface_code: formData.get("interface_code") as string,
      http_method: (formData.get("http_method") as any) || "GET",
      expected_status_codes: [200],
      expiration_hours: 24,
    };

    try {
      await createEndpointMutation.mutateAsync(data);
      setShowCreateEndpoint(false);
    } catch (error) {
      console.error("Failed to create endpoint:", error);
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    try {
      await deleteEndpointMutation.mutateAsync({
        endpointId,
        project_id: projectId,
      });
    } catch (error) {
      console.error("Failed to delete endpoint:", error);
    }
  };

  const handleGenerateMockData = async (endpointId: string, count?: number) => {
    try {
      const data = await generateMockDataMutation.mutateAsync({
        endpointId,
        count,
      });
      setMockData(data as Record<string, unknown> | unknown[] | null);
      setSelectedEndpointId(endpointId);
    } catch (error) {
      console.error("Failed to generate mock data:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const endpoints = project.endpoints || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-xl text-slate-300">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowCreateEndpoint(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                + New API
              </Button>
              <Button
                onClick={() => router.push("/projects")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ← Back to Projects
              </Button>
            </div>
          </div>

          {/* Project Info */}
          <div className="mb-8 rounded-xl border border-white/20 bg-white/10 p-6">
            <h2 className="mb-4 text-2xl font-bold">Project Overview</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {endpoints.length}
                </div>
                <div className="text-sm text-slate-300">Total APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {
                    endpoints.filter(
                      (e) =>
                        e.status === "active" &&
                        new Date(e.expires_at) > new Date(),
                    ).length
                  }
                </div>
                <div className="text-sm text-slate-300">Active APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {
                    endpoints.filter(
                      (e) =>
                        e.status === "expired" ||
                        new Date(e.expires_at) <= new Date(),
                    ).length
                  }
                </div>
                <div className="text-sm text-slate-300">Expired APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">
                  {endpoints.filter((e) => e.status === "inactive").length}
                </div>
                <div className="text-sm text-slate-300">Inactive APIs</div>
              </div>
            </div>
          </div>

          {/* Endpoints List */}
          <div className="mb-8 rounded-xl border border-white/20 bg-white/10 p-6">
            <h2 className="mb-6 text-2xl font-bold">API Endpoints</h2>

            {endpoints.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="mb-4 text-xl font-semibold">
                  No API endpoints yet
                </h3>
                <p className="mb-6 text-slate-300">
                  Create your first API endpoint to start generating mock data!
                </p>
                <Button
                  onClick={() => setShowCreateEndpoint(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create First API
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {endpoints.map((endpoint) => {
                  const expiresIn = Math.ceil(
                    (new Date(endpoint.expires_at).getTime() - Date.now()) /
                      (1000 * 60 * 60),
                  );
                  const isExpired = expiresIn <= 0;
                  const apiUrl = `${window.location.origin}/api/mock/${endpoint.endpoint_id}`;

                  return (
                    <div
                      key={endpoint.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-6"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {endpoint.name}
                            </h3>
                            <span
                              className={`rounded px-2 py-1 text-xs ${
                                isExpired ? "bg-red-600" : "bg-green-600"
                              }`}
                            >
                              {isExpired ? "Expired" : "Active"}
                            </span>
                            <span className="rounded bg-blue-600 px-2 py-1 text-xs">
                              {endpoint.http_method}
                            </span>
                          </div>
                          {endpoint.description && (
                            <p className="mb-2 text-sm text-slate-300">
                              {endpoint.description}
                            </p>
                          )}
                          <div className="text-sm text-slate-400">
                            Expires:{" "}
                            {isExpired ? "Expired" : `in ${expiresIn} hours`} |{" "}
                            Created:{" "}
                            {new Date(endpoint.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleGenerateMockData(endpoint.endpoint_id)
                            }
                            disabled={
                              generateMockDataMutation.isPending || isExpired
                            }
                            className="bg-blue-600 px-3 py-2 text-sm hover:bg-blue-700"
                          >
                            Test API
                          </Button>
                          <Button
                            onClick={() => handleDeleteEndpoint(endpoint.id)}
                            disabled={deleteEndpointMutation.isPending}
                            className="bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4 flex gap-2">
                        <code className="flex-1 rounded bg-black/30 p-3 font-mono text-sm break-all">
                          {apiUrl}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(apiUrl)}
                          className="bg-gray-600 px-3 hover:bg-gray-700"
                        >
                          Copy
                        </Button>
                      </div>

                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white">
                          View Interface Code
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-black/30 p-4 font-mono text-xs">
                          <code>{endpoint.interface_code}</code>
                        </pre>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mock Data Preview */}
          {mockData && selectedEndpointId && (
            <div className="mb-8 rounded-xl border border-white/20 bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Generated Mock Data</h2>
              <pre className="overflow-x-auto rounded bg-black/30 p-4 text-sm">
                <code>{JSON.stringify(mockData, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Create Endpoint Form */}
          {showCreateEndpoint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-xl bg-slate-800 p-6">
                <h2 className="mb-6 text-2xl font-bold">
                  Create New API Endpoint
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateEndpoint(new FormData(e.currentTarget));
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      API Name
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full rounded bg-slate-700 p-3 text-white"
                      placeholder="e.g., User API"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Description (optional)
                    </label>
                    <input
                      name="description"
                      className="w-full rounded bg-slate-700 p-3 text-white"
                      placeholder="e.g., Manages user data and authentication"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      HTTP Method
                    </label>
                    <select
                      name="http_method"
                      className="w-full rounded bg-slate-700 p-3 text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      TypeScript Interface
                    </label>
                    <textarea
                      name="interface_code"
                      required
                      rows={8}
                      className="w-full rounded bg-slate-700 p-3 font-mono text-sm text-white"
                      placeholder={`interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}`}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={createEndpointMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createEndpointMutation.isPending
                        ? "Creating..."
                        : "Create API"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCreateEndpoint(false)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
