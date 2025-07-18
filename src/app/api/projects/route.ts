import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProjectService } from "@/lib/supabase/project-service";
import type { CreateProjectRequest } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateProjectRequest;

    if (!body.name || !body.interface_code) {
      return NextResponse.json(
        { success: false, error: "Name and interface code are required" },
        { status: 400 },
      );
    }

    const projectService = new SupabaseProjectService();
    const project = await projectService.createProject(user.id, body);

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const projectService = new SupabaseProjectService();
    const projects = await projectService.getUserProjects(user.id);
    const stats = await projectService.getProjectStats(user.id);

    return NextResponse.json({
      success: true,
      data: { projects, stats },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
