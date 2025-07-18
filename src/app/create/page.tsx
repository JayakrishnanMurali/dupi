"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateProject } from "@/lib/hooks/use-projects";
import type { CreateProjectParams } from "@/lib/api/types";
import { ArrowLeft, Plus, Sparkles, Code, Database } from "lucide-react";

function CreateProjectSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateProjectPage() {
  const router = useRouter();
  const createProjectMutation = useCreateProject();

  const [formData, setFormData] = useState<CreateProjectParams>({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const project = await createProjectMutation.mutateAsync(formData);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleInputChange = (
    field: keyof CreateProjectParams,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (createProjectMutation.isPending) {
    return <CreateProjectSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Project
            </h1>
            <p className="text-muted-foreground">
              Set up a new project to organize your mock APIs
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Plus className="text-primary h-4 w-4" />
              </div>
              <div>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Create a new project to organize your mock APIs. You can add
                  multiple API endpoints to each project.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., E-commerce API, User Management System"
                  className="h-11"
                />
                <p className="text-muted-foreground text-sm">
                  Choose a descriptive name for your project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Briefly describe what this project is for..."
                />
                <p className="text-muted-foreground text-sm">
                  Add an optional description to help identify this project
                  later
                </p>
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <Sparkles className="text-primary h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-primary font-semibold">
                        What&apos;s Next?
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        After creating your project, you&apos;ll be able to add
                        multiple API endpoints, each with its own TypeScript
                        interface and mock data generation.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Code className="mr-1 h-3 w-3" />
                          TypeScript Interfaces
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Database className="mr-1 h-3 w-3" />
                          Mock Data Generation
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          Multiple Endpoints
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    createProjectMutation.isPending || !formData.name.trim()
                  }
                  className="flex-1"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/projects")}
                >
                  Cancel
                </Button>
              </div>
            </form>

            {createProjectMutation.error && (
              <Card className="border-destructive/50 bg-destructive/5 mt-4">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">
                    Failed to create project:{" "}
                    {createProjectMutation.error.message}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
