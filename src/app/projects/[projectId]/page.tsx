"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/hooks/use-projects";
import { useGenerateMockData } from "@/lib/hooks/use-mock-data";
import { useAuth } from "@/lib/auth/context";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { user, loading: authLoading } = useAuth();
  const { data: project, isLoading, error } = useProject(projectId);
  const generateMockDataMutation = useGenerateMockData();
  const [mockData, setMockData] = useState<
    Record<string, unknown> | unknown[] | null
  >(null);

  const handleGenerateMockData = async (count?: number) => {
    if (!project) return;

    try {
      const data = await generateMockDataMutation.mutateAsync({
        endpointId: project.endpoint_id,
        count,
      });
      setMockData(data as Record<string, unknown> | unknown[] | null);
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

  const apiUrl = `${window.location.origin}/api/mock/${project.endpoint_id}`;
  const expiresIn = Math.ceil(
    (new Date(project.expires_at).getTime() - Date.now()) / (1000 * 60 * 60),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <Button
              onClick={() => router.push("/projects")}
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← Back to Projects
            </Button>
          </div>

          {project.description && (
            <p className="mb-8 text-xl text-slate-300">{project.description}</p>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Project Info */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Project Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Method:</span>
                  <span className="ml-2 rounded bg-blue-600 px-2 py-1 text-sm">
                    {project.http_method}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Status Codes:</span>
                  <span className="ml-2">
                    {project.expected_status_codes?.join(", ") ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Expires:</span>
                  <span className="ml-2 text-yellow-300">
                    in {expiresIn > 0 ? `${expiresIn} hours` : "Expired"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Created:</span>
                  <span className="ml-2">
                    {new Date(project.created_at!).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* API Endpoint */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">API Endpoint</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Mock API URL:
                  </label>
                  <div className="flex gap-2">
                    <code className="flex-1 rounded bg-black/30 p-3 font-mono text-sm break-all">
                      {apiUrl}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(apiUrl)}
                      className="bg-green-600 px-3 hover:bg-green-700"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Test API:</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateMockData()}
                      disabled={generateMockDataMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {generateMockDataMutation.isPending
                        ? "Generating..."
                        : "Generate Single"}
                    </Button>
                    <Button
                      onClick={() => handleGenerateMockData(5)}
                      disabled={generateMockDataMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Generate Array (5)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TypeScript Interface */}
          <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-6">
            <h2 className="mb-4 text-2xl font-bold">TypeScript Interface</h2>
            <pre className="overflow-x-auto rounded bg-black/30 p-4 font-mono text-sm">
              <code>{project.interface_code}</code>
            </pre>
          </div>

          {/* Mock Data Preview */}
          {mockData && (
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Generated Mock Data</h2>
              <pre className="overflow-x-auto rounded bg-black/30 p-4 text-sm">
                <code>{JSON.stringify(mockData, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Usage Examples */}
          <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-6">
            <h2 className="mb-4 text-2xl font-bold">Usage Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">cURL:</h3>
                <code className="block rounded bg-black/30 p-3 font-mono text-sm break-all">
                  curl &quot;{apiUrl}&quot;
                </code>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">JavaScript Fetch:</h3>
                <code className="block rounded bg-black/30 p-3 font-mono text-sm whitespace-pre">
                  {`fetch('${apiUrl}')
  .then(response => response.json())
  .then(data => console.log(data));`}
                </code>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Multiple Records:</h3>
                <code className="block rounded bg-black/30 p-3 font-mono text-sm break-all">
                  curl &quot;{apiUrl}?count=10&quot;
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
