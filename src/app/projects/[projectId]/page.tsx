"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProject } from "@/lib/hooks/use-projects";
import {
  useCreateEndpoint,
  useDeleteEndpoint,
} from "@/lib/hooks/use-endpoints";
import { useGenerateMockData } from "@/lib/hooks/use-mock-data";
import { useAuth } from "@/lib/auth/context";
import type { CreateEndpointParams } from "@/lib/api/types";
import {
  ArrowLeft,
  Plus,
  Database,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy,
  Play,
  Trash2,
  Code,
  Settings,
  ExternalLink,
  Terminal,
  Globe,
  Activity,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";

function ProjectDetailSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>

          {/* Project Info Skeleton */}
          <div className="from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-8">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-6 h-5 w-96" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
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

          {/* Endpoints Skeleton */}
          <Card className="from-background to-muted/30 border-0 bg-gradient-to-br shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-muted/50 from-background to-muted/20 rounded-xl border bg-gradient-to-r p-6"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "destructive";
  description?: string;
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    http_method: "GET" as const,
    interface_code: "",
  });

  // Show auth loading state only if we don't have data yet
  if (authLoading && !project) {
    return <ProjectDetailSkeleton />;
  }

  // Show data loading state only if we have a user and no data yet
  if (user && isLoading && !project) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl text-center">
            <Card className="border-destructive/50 bg-destructive/5 shadow-lg">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Project Not Found
                </CardTitle>
                <CardDescription>{error?.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/dashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateEndpointParams = {
      project_id: projectId,
      name: formData.name,
      description: formData.description || undefined,
      interface_code: formData.interface_code,
      http_method: formData.http_method,
      expected_status_codes: [200],
      expiration_hours: 24,
    };

    try {
      await createEndpointMutation.mutateAsync(data);
      setShowCreateEndpoint(false);
      setFormData({
        name: "",
        description: "",
        http_method: "GET",
        interface_code: "",
      });
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
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const endpoints = project.endpoints ?? [];
  const activeEndpoints = endpoints.filter(
    (e) => e.status === "active" && new Date(e.expires_at) > new Date(),
  );
  const expiredEndpoints = endpoints.filter(
    (e) => e.status === "expired" || new Date(e.expires_at) <= new Date(),
  );
  const inactiveEndpoints = endpoints.filter((e) => e.status === "inactive");

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground mt-3 text-lg">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Dialog
                open={showCreateEndpoint}
                onOpenChange={setShowCreateEndpoint}
              >
                <DialogTrigger asChild>
                  <Button
                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New API
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New API Endpoint</DialogTitle>
                    <DialogDescription>
                      Add a new API endpoint to your project with TypeScript
                      interface
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEndpoint} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">API Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., User API"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g., Manages user data and authentication"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="http_method">HTTP Method</Label>
                      <Select
                        value={formData.http_method}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            http_method: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interface_code">
                        TypeScript Interface
                      </Label>
                      <Textarea
                        id="interface_code"
                        value={formData.interface_code}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            interface_code: e.target.value,
                          }))
                        }
                        placeholder={`interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}`}
                        rows={8}
                        className="font-mono text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={createEndpointMutation.isPending}
                        className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
                      >
                        {createEndpointMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Creating...
                          </>
                        ) : (
                          "Create API"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateEndpoint(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() => router.push("/projects")}
                size="lg"
                className="shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Projects
              </Button>
            </div>
          </div>

          {/* Project Info Section */}
          <div className="from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-8">
            <div className="from-primary/10 absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br to-transparent"></div>
            <div className="from-primary/5 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr to-transparent"></div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <Cpu className="text-primary h-6 w-6" />
                <h2 className="text-xl font-semibold">Project Workspace</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="bg-background/50 border-primary/10 flex items-center gap-3 rounded-xl border p-4">
                  <Globe className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Project ID</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {project.id}
                    </p>
                  </div>
                </div>
                <div className="bg-background/50 border-primary/10 flex items-center gap-3 rounded-xl border p-4">
                  <Clock className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(project.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="bg-background/50 border-primary/10 flex items-center gap-3 rounded-xl border p-4">
                  <Activity className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-muted-foreground text-xs">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total APIs"
              value={endpoints.length}
              icon={Database}
              description="All endpoints"
            />
            <StatCard
              title="Active APIs"
              value={activeEndpoints.length}
              icon={CheckCircle}
              variant="success"
              description="Currently running"
            />
            <StatCard
              title="Expired APIs"
              value={expiredEndpoints.length}
              icon={Clock}
              variant="warning"
              description="Past expiration"
            />
            <StatCard
              title="Inactive APIs"
              value={inactiveEndpoints.length}
              icon={AlertTriangle}
              variant="destructive"
              description="Disabled endpoints"
            />
          </div>

          {/* Endpoints List */}
          <Card className="from-background to-muted/30 border-0 bg-gradient-to-br shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Layers className="text-primary h-6 w-6" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Manage your mock API endpoints and test data generation
                  </CardDescription>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Terminal className="h-4 w-4" />
                  {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {endpoints.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                    <Sparkles className="text-primary h-10 w-10" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">
                    Ready to Create Your First API?
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
                    Start building mock APIs with TypeScript interfaces and
                    generate realistic test data instantly.
                  </p>
                  <Button
                    onClick={() => setShowCreateEndpoint(true)}
                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create First API
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {endpoints.map((endpoint) => {
                    const expiresIn = Math.ceil(
                      (new Date(endpoint.expires_at).getTime() - Date.now()) /
                        (1000 * 60 * 60),
                    );
                    const isExpired = expiresIn <= 0;
                    const apiUrl = `${window.location.origin}/api/mock/${endpoint.endpoint_id}`;

                    return (
                      <Card
                        key={endpoint.id}
                        className="from-background to-muted/30 group border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3">
                                <h3 className="group-hover:text-primary text-lg font-semibold transition-colors">
                                  {endpoint.name}
                                </h3>
                                <Badge
                                  variant={
                                    isExpired ? "destructive" : "default"
                                  }
                                  className="transition-transform group-hover:scale-105"
                                >
                                  {isExpired ? "Expired" : "Active"}
                                </Badge>
                                <Badge variant="outline" className="font-mono">
                                  {endpoint.http_method}
                                </Badge>
                              </div>

                              {endpoint.description && (
                                <p className="text-muted-foreground text-sm">
                                  {endpoint.description}
                                </p>
                              )}

                              <div className="text-muted-foreground flex items-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {isExpired
                                    ? "Expired"
                                    : `Expires in ${expiresIn}h`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Settings className="h-3 w-3" />
                                  {new Date(
                                    endpoint.created_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <code className="bg-muted/50 border-muted/30 flex-1 rounded-lg border px-4 py-3 font-mono text-sm">
                                  {apiUrl}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(apiUrl)}
                                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="ml-6 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleGenerateMockData(endpoint.endpoint_id)
                                }
                                disabled={
                                  generateMockDataMutation.isPending ||
                                  isExpired
                                }
                                className="transition-colors hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-600"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Test
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteEndpoint(endpoint.id)
                                }
                                disabled={deleteEndpointMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Tabs defaultValue="interface" className="mt-6">
                            <TabsList className="bg-muted/50 grid w-full grid-cols-2">
                              <TabsTrigger
                                value="interface"
                                className="data-[state=active]:bg-background"
                              >
                                <Code className="mr-2 h-4 w-4" />
                                Interface
                              </TabsTrigger>
                              <TabsTrigger
                                value="mock-data"
                                className="data-[state=active]:bg-background"
                              >
                                <Database className="mr-2 h-4 w-4" />
                                Mock Data
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="interface" className="mt-4">
                              <ScrollArea className="bg-muted/30 border-muted/30 h-40 rounded-lg border p-4">
                                <pre className="font-mono text-xs">
                                  <code>{endpoint.interface_code}</code>
                                </pre>
                              </ScrollArea>
                            </TabsContent>
                            <TabsContent value="mock-data" className="mt-4">
                              {selectedEndpointId === endpoint.endpoint_id &&
                              mockData ? (
                                <ScrollArea className="bg-muted/30 border-muted/30 h-40 rounded-lg border p-4">
                                  <pre className="font-mono text-xs">
                                    <code>
                                      {JSON.stringify(mockData, null, 2)}
                                    </code>
                                  </pre>
                                </ScrollArea>
                              ) : (
                                <div className="bg-muted/30 border-muted/30 flex h-40 items-center justify-center rounded-lg border">
                                  <div className="text-center">
                                    <Database className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                    <p className="text-muted-foreground text-sm">
                                      Click "Test" to generate mock data
                                    </p>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
