import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProjectService } from "@/lib/supabase/project-service";
import type { UpdateEndpointRequest } from "@/lib/supabase/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
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

    const { endpointId } = params;
    const projectService = new SupabaseProjectService();
    
    // Get endpoint by UUID (for authenticated access)
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .select(`
        *,
        projects!inner (
          user_id
        )
      `)
      .eq('id', endpointId)
      .single();

    if (error || !endpoint) {
      return NextResponse.json(
        { success: false, error: "Endpoint not found" },
        { status: 404 }
      );
    }

    // Verify user owns the endpoint
    if (endpoint.projects?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

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
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
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

    const { endpointId } = params;
    const body = (await request.json()) as UpdateEndpointRequest;

    const projectService = new SupabaseProjectService();
    const endpoint = await projectService.updateEndpoint(endpointId, user.id, body);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
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

    const { endpointId } = params;
    const projectService = new SupabaseProjectService();
    const success = await projectService.deleteEndpoint(endpointId, user.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Endpoint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Endpoint deleted successfully" },
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