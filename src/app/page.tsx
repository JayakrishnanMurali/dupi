"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Zap, Database, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-2 h-3 w-3" />
            Generate mock APIs instantly
          </Badge>

          <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
            From TypeScript to{" "}
            <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
              Mock API
            </span>
          </h1>

          <p className="text-muted-foreground mb-8 text-xl lg:text-2xl">
            Transform your TypeScript interfaces into realistic mock APIs with
            intelligent data generation. Perfect for frontend development and
            testing.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything you need for mock APIs
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features to accelerate your development workflow
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background border-0 shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Code className="text-primary h-6 w-6" />
                </div>
                <CardTitle>TypeScript Interface Parser</CardTitle>
                <CardDescription>
                  Automatically parse your TypeScript interfaces and generate
                  corresponding mock data structures.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background border-0 shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Database className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Realistic Data Generation</CardTitle>
                <CardDescription>
                  Generate realistic mock data based on your interface types
                  with intelligent defaults.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background border-0 shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Instant API Endpoints</CardTitle>
                <CardDescription>
                  Get live API endpoints immediately with full CRUD operations
                  and customizable responses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
                How it works
              </h2>
              <p className="text-muted-foreground text-lg">
                Three simple steps to get your mock API running
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                  1
                </div>
                <h3 className="mb-3 text-xl font-semibold">Define Interface</h3>
                <p className="text-muted-foreground">
                  Paste your TypeScript interface or upload a file with your
                  data models.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                  2
                </div>
                <h3 className="mb-3 text-xl font-semibold">Generate API</h3>
                <p className="text-muted-foreground">
                  Get a live API endpoint with realistic mock data generated
                  automatically.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                  3
                </div>
                <h3 className="mb-3 text-xl font-semibold">Integrate</h3>
                <p className="text-muted-foreground">
                  Use the API URL in your app and switch to real endpoints when
                  ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first mock API project and see the magic happen.
            </p>
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/signup">
                Create Your First Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
