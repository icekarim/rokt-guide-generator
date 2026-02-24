import { NextRequest, NextResponse } from "next/server";
import { generateGuideContent, GenerateRequest } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.clientInfo?.companyName || !body.integrationType) {
      return NextResponse.json(
        { error: "Missing required fields: clientInfo.companyName and integrationType" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const content = await generateGuideContent(body);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate guide content", details: String(error) },
      { status: 500 }
    );
  }
}
