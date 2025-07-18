import { type NextRequest, NextResponse } from "next/server";
import { createDupiInstance } from "@/lib/dupi";
import type { CreateProjectRequest } from "@/lib/dupi/types";

const dupiInstance = createDupiInstance();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProjectRequest;

    if (!body.name || !body.interfaceCode) {
      return NextResponse.json(
        { success: false, error: "Name and interface code are required" },
        { status: 400 },
      );
    }

    const project = dupiInstance.createProject(body);

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
    const projects = dupiInstance.listActiveProjects();
    const stats = dupiInstance.getProjectStats();

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
