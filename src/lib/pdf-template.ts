import type { GuideContent } from "./gemini";

export type { GuideContent };

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCodeBlock(code: string, language: string): string {
  return `<div class="code-block">
    <div class="code-lang">${escapeHtml(language)}</div>
    <pre><code>${escapeHtml(code)}</code></pre>
  </div>`;
}

function formatNumberedLists(html: string): string {
  const startMatch = html.match(/\b1\)\s/);
  if (!startMatch || startMatch.index === undefined) return html;

  const before = html.substring(0, startMatch.index);
  const rest = html.substring(startMatch.index);

  const segments = rest.split(/(\d+)\)\s/);

  const items: string[] = [];
  let expectedNum = 1;

  for (let i = 1; i < segments.length - 1; i += 2) {
    const num = parseInt(segments[i]);
    const text = (segments[i + 1] || "").replace(/,\s*$/, "").trim();
    if (num !== expectedNum) break;
    items.push(text);
    expectedNum++;
  }

  if (items.length < 3) return html;

  let ol = '<ol class="step-list">';
  items.forEach((item) => (ol += `<li>${item}</li>`));
  ol += "</ol>";

  return before + ol;
}

export function renderProse(prose: string): string {
  let html = escapeHtml(prose);
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/● /g, '<span class="bullet">● </span>');
  html = html.replace(/- /g, '<span class="bullet">- </span>');
  html = formatNumberedLists(html);
  if (html.includes("|")) {
    const lines = html.split("<br>");
    const tableLines = lines.filter(
      (l) => l.includes("|") && l.trim().length > 3
    );
    if (tableLines.length >= 2) {
      const dataLines = tableLines.filter(
        (l) => !l.match(/^\s*[-|]+\s*$/)
      );
      if (dataLines.length > 1) {
        const headers = dataLines[0]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        const rows = dataLines.slice(1);

        let cards = '<div class="data-grid">';
        rows.forEach((row, idx) => {
          const cells = row
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);
          if (cells.length > 0) {
            const even = idx % 2 === 1 ? " even" : "";
            cards += `<div class="data-row${even}">`;
            cells.forEach((c, ci) => {
              const label = headers[ci] || "";
              cards += `<div class="data-field"><span class="data-label">${label}</span><span class="data-value">${c}</span></div>`;
            });
            cards += "</div>";
          }
        });
        cards += "</div>";

        const nonTableLines = lines.filter(
          (l) => !l.includes("|") || l.trim().length <= 3
        );
        html = nonTableLines.join("<br>") + cards;
      }
    }
  }
  return html;
}

export const GUIDE_STYLES = `
    @page {
      size: A4;
      margin: 40px 44px 40px 44px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Archivo', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #000000;
    }

    /* Rokt Brand Colors */
    /* Beetroot: #C20075, Wine: #480029, Black: #000, White: #FFF */
    /* Gray 900: #6E6E73, Gray 800: #86868b, Gray 600: #E0E0E4, Gray 300: #F8F8FA */

    .header-bar {
      background: #C20075;
      margin: -10px -10px 18px -10px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-bar .logo {
      font-family: 'Archivo', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }

    .header-bar .separator {
      width: 1px;
      height: 20px;
      background: rgba(255,255,255,0.3);
    }

    .header-bar .subtitle {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.5px;
    }

    h1 {
      font-family: 'Archivo', sans-serif;
      font-size: 22px;
      font-weight: 500;
      color: #000000;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 3px solid #C20075;
      letter-spacing: -0.3px;
    }

    h2 {
      font-family: 'Archivo', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      margin-top: 0;
      margin-bottom: 4px;
      letter-spacing: -0.2px;
    }

    .section {
      margin-bottom: 0;
      padding: 10px 0;
      border-top: 1px solid #E0E0E4;
    }

    .section:first-child {
      border-top: none;
      padding-top: 0;
    }

    .prose {
      margin-bottom: 6px;
      color: #6E6E73;
      font-weight: 400;
    }

    .prose .bullet {
      color: #C20075;
      font-weight: 500;
    }

    .triggering-rules {
      background: #F8F8FA;
      border-left: 3px solid #C20075;
      padding: 5px 10px;
      margin: 4px 0;
      font-size: 10.5px;
      color: #000000;
      page-break-inside: avoid;
    }

    .triggering-rules strong {
      font-weight: 500;
    }

    .code-block {
      background: #F8F8FA;
      border: 1px solid #E0E0E4;
      border-radius: 4px;
      margin: 6px 0;
      overflow: hidden;
    }

    .code-lang {
      background: #E0E0E4;
      padding: 3px 10px;
      font-family: 'Roboto Mono', monospace;
      font-size: 9px;
      font-weight: 400;
      text-transform: uppercase;
      color: #6E6E73;
      letter-spacing: 0.5px;
    }

    .code-block pre {
      padding: 10px;
      overflow-x: auto;
      font-size: 9.5px;
      line-height: 1.5;
    }

    .code-block code {
      font-family: 'Roboto Mono', monospace;
      white-space: pre-wrap;
      word-break: break-all;
      color: #000000;
    }

    .summary-section {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid #E0E0E4;
    }

    .summary-section h2 {
      font-size: 14px;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 8px;
    }

    th {
      background: #C20075;
      color: #FFFFFF;
      padding: 6px 8px;
      text-align: left;
      font-family: 'Archivo', sans-serif;
      font-weight: 500;
      font-size: 9.5px;
    }

    td {
      padding: 5px 8px;
      border-bottom: 1px solid #E0E0E4;
      vertical-align: top;
      color: #000000;
    }

    tr:nth-child(even) td {
      background: #F8F8FA;
    }

    .step-list {
      list-style: none;
      counter-reset: step-counter;
      margin: 6px 0;
      padding: 0;
      border: 1px solid #E0E0E4;
      border-left: 3px solid #C20075;
      border-radius: 6px;
      overflow: hidden;
    }

    .step-list li {
      counter-increment: step-counter;
      padding: 7px 12px 7px 32px;
      position: relative;
      border-bottom: 1px solid #E0E0E4;
      font-size: 10.5px;
      color: #000000;
      line-height: 1.5;
    }

    .step-list li:last-child {
      border-bottom: none;
    }

    .step-list li:nth-child(even) {
      background: #F8F8FA;
    }

    .step-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 10px;
      top: 7px;
      color: #C20075;
      font-weight: 600;
      font-size: 11px;
      font-family: 'Archivo', sans-serif;
    }

    .data-grid {
      margin: 6px 0;
      border: 1px solid #E0E0E4;
      border-left: 3px solid #C20075;
      border-radius: 6px;
      overflow: hidden;
    }

    .data-row {
      display: flex;
      padding: 7px 14px;
      border-bottom: 1px solid #E0E0E4;
      gap: 12px;
    }

    .data-row:last-child {
      border-bottom: none;
    }

    .data-row.even {
      background: #F8F8FA;
    }

    .data-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .data-label {
      font-size: 7.5px;
      font-family: 'Archivo', sans-serif;
      font-weight: 500;
      color: #86868b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-value {
      font-size: 10px;
      font-family: 'Roboto Mono', monospace;
      color: #000000;
      font-weight: 400;
      word-break: break-word;
    }

    .footer {
      margin-top: 16px;
      padding-top: 8px;
      border-top: 1px solid #E0E0E4;
      text-align: center;
      font-family: 'Roboto Mono', monospace;
      font-size: 9px;
      color: #86868b;
      letter-spacing: 0.3px;
    }`;

export function renderGuideBody(content: GuideContent, logoDataUrl?: string): string {
  const sectionsHtml = content.sections
    .map(
      (section) => `
      <div class="section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="prose">${renderProse(section.prose)}</div>
        ${
          section.triggeringRules
            ? `<div class="triggering-rules"><strong>Triggering Rules:</strong> ${escapeHtml(section.triggeringRules)}</div>`
            : ""
        }
        ${section.codeBlocks.map((cb) => renderCodeBlock(cb.code, cb.language)).join("")}
      </div>`
    )
    .join("");

  const summaryRows = content.summaryTable
    .map(
      (row) => `
      <tr>
        <td><strong>${escapeHtml(row.component)}</strong></td>
        <td>${escapeHtml(row.purpose)}</td>
        <td>${escapeHtml(row.triggeringLogic)}</td>
        <td>${escapeHtml(row.requirementLevel)}</td>
      </tr>`
    )
    .join("");

  return `
  <div class="header-bar">
    ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Rokt" style="height:22px; filter:invert(1);" />` : '<span class="logo">rokt</span>'}
    <span class="separator"></span>
    <span class="subtitle">Integration guide</span>
  </div>

  <h1>${escapeHtml(content.title)}</h1>

  ${sectionsHtml}

  <div class="summary-section">
    <h2>Rokt SDK Component Summary</h2>
    <table>
      <thead>
        <tr>
          <th style="width:18%">Component</th>
          <th style="width:32%">Purpose</th>
          <th style="width:30%">Triggering Logic</th>
          <th style="width:20%">Requirement Level</th>
        </tr>
      </thead>
      <tbody>
        ${summaryRows}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Copyright &copy; Rokt ${new Date().getFullYear()} &mdash; All rights reserved
  </div>`;
}

export function buildPdfHtml(content: GuideContent, logoDataUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
  <style>${GUIDE_STYLES}</style>
</head>
<body>
  ${renderGuideBody(content, logoDataUrl)}
</body>
</html>`;
}
