import { NextRequest, NextResponse } from 'next/server';
import { createDupiInstance } from '@/lib/dupi';

const dupiInstance = createDupiInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const project = dupiInstance.getProject(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const success = dupiInstance.deactivateProject(projectId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Project deactivated successfully' },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}