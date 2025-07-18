import { NextRequest, NextResponse } from 'next/server';
import { SupabaseProjectService } from '@/lib/supabase/project-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const startTime = Date.now();
  
  try {
    const { projectId: endpointId } = params; // This is actually the endpoint_id from the URL
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : undefined;

    if (count && (isNaN(count) || count < 1 || count > 100)) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    const projectService = new SupabaseProjectService();
    const mockData = await projectService.generateMockData(endpointId, count);

    // Get endpoint for logging
    const endpoint = await projectService.getEndpoint(endpointId);
    const responseTime = Date.now() - startTime;

    // Log API usage (fire and forget)
    if (endpoint) {
      projectService.logApiUsage(
        endpoint.id,
        endpoint.project_id,
        '', // We don't have user_id for anonymous requests
        'GET',
        request.url,
        200,
        responseTime,
        request.headers.get('user-agent') ?? undefined,
        request.headers.get('x-forwarded-for') ?? undefined
      ).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      metadata: {
        endpoint_id: endpointId,
        project_id: endpoint?.project_id ?? '',
        generated_count: Array.isArray(mockData) ? mockData.length : 1,
      },
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const startTime = Date.now();
  
  try {
    const { projectId: endpointId } = params;
    const body = await request.json();
    const count = body.count as number | undefined;

    if (count && (typeof count !== 'number' || count < 1 || count > 100)) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    const projectService = new SupabaseProjectService();
    const mockData = await projectService.generateMockData(endpointId, count);

    // Get endpoint for logging
    const endpoint = await projectService.getEndpoint(endpointId);
    const responseTime = Date.now() - startTime;

    // Log API usage (fire and forget)
    if (endpoint) {
      projectService.logApiUsage(
        endpoint.id,
        endpoint.project_id,
        '', // We don't have user_id for anonymous requests
        'POST',
        request.url,
        200,
        responseTime,
        request.headers.get('user-agent') ?? undefined,
        request.headers.get('x-forwarded-for') ?? undefined
      ).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      metadata: {
        endpoint_id: endpointId,
        project_id: endpoint?.project_id ?? '',
        generated_count: Array.isArray(mockData) ? mockData.length : 1,
      },
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}