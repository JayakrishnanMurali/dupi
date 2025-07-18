import { NextRequest, NextResponse } from 'next/server';
import { createDupiInstance } from '@/lib/dupi';

const dupiInstance = createDupiInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : undefined;

    if (count && (isNaN(count) || count < 1 || count > 100)) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    const mockData = dupiInstance.generateMockResponse(projectId, count);

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
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
  try {
    const { projectId } = params;
    const body = await request.json();
    const count = body.count as number | undefined;

    if (count && (typeof count !== 'number' || count < 1 || count > 100)) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    const mockData = dupiInstance.generateMockResponse(projectId, count);

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
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