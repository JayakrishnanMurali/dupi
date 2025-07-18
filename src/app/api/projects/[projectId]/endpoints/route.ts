import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProjectService } from "@/lib/supabase/project-service";
import type { CreateEndpointRequest } from "@/lib/supabase/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const body = (await request.json()) as CreateEndpointRequest;
    
    // Remove project_id from body if present since we get it from URL
    delete body.project_id;

    if (!body.name || !body.interface_code) {
      return NextResponse.json(
        { success: false, error: "Endpoint name and interface code are required" },
        { status: 400 }
      );
    }

    const endpointRequest: CreateEndpointRequest = {
      ...body,
      project_id: projectId,
    };

    const projectService = new SupabaseProjectService();
    const endpoint = await projectService.createEndpoint(user.id, endpointRequest);

    return NextResponse.json({
      success: true,
      data: endpoint,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const projectService = new SupabaseProjectService();
    
    // Verify user owns the project
    const project = await projectService.getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const endpoints = await projectService.getProjectEndpoints(projectId);

    return NextResponse.json({
      success: true,
      data: endpoints,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}