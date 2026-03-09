import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { buildPdfHtml } from "@/lib/pdf-template";
import { GuideContent } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { content, clientName, platform } = (await request.json()) as {
      content: GuideContent;
      clientName: string;
      platform: string;
    };

    if (!content || !content.sections) {
      return NextResponse.json(
        { error: "Missing content in request body" },
        { status: 400 }
      );
    }

    let logoDataUrl = "";
    const logoPath = path.join(process.cwd(), "public", "rokt-logo-black.png");
    try {
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      logoDataUrl = `data:image/png;base64,${logoBase64}`;
    } catch {
      // Logo file missing — buildPdfHtml will render a text fallback
    }

    const html = buildPdfHtml(content, logoDataUrl);

    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "50px",
        bottom: "50px",
        left: "50px",
        right: "50px",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width:100%; text-align:center; font-size:9px; color:#888; padding:0 50px;">
          <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    const pdfBuffer = Buffer.from(pdfUint8);
    const filename = `Rokt_${(clientName || "Client").replace(/\s+/g, "_")}_${(platform || "Integration").replace(/\s+/g, "_")}_Guide.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
