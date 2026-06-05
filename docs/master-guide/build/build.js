// SkillSync Master Guide — PDF Build Pipeline
// Reads chapter markdown files, renders to HTML, generates PDF via Puppeteer.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHAPTERS_DIR = path.join(ROOT, 'chapters');
const OUT_HTML = path.join(ROOT, 'SkillSync_MasterGuide.html');
const OUT_PDF = path.join(ROOT, 'SkillSync_MasterGuide.pdf');

// ---------- Markdown-it setup ----------
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
});

md.use(anchor, {
  permalink: false,
  slugify: (s) => String(s).trim().toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-'),
});

// Callout blockquotes: first line starts with NOTE:, TIP:, WARN:
const defaultBqOpen = md.renderer.rules.blockquote_open || ((tokens, i, opts, env, self) => self.renderToken(tokens, i, opts));
md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
  // Look ahead for first inline token text
  let klass = '';
  for (let j = idx + 1; j < tokens.length && tokens[j].type !== 'blockquote_close'; j++) {
    if (tokens[j].type === 'inline') {
      const t = tokens[j].content.trim();
      if (/^NOTE[: ]/i.test(t)) klass = 'note';
      else if (/^TIP[: ]/i.test(t)) klass = 'tip';
      else if (/^WARN[ING]*[: ]/i.test(t)) klass = 'warn';
      break;
    }
  }
  if (klass) tokens[idx].attrJoin('class', klass);
  return defaultBqOpen(tokens, idx, options, env, self);
};

// ---------- Read chapters ----------
function listChapters() {
  return fs.readdirSync(CHAPTERS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();
}

function concatMarkdown() {
  const files = listChapters();
  console.log(`Found ${files.length} chapter files:`);
  files.forEach(f => console.log('  -', f));
  return files.map(f => fs.readFileSync(path.join(CHAPTERS_DIR, f), 'utf8')).join('\n\n');
}

// ---------- Render to HTML ----------
function renderHTML(markdownBody) {
  const body = md.render(markdownBody);
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SkillSync Master Guide</title>
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

// ---------- Generate PDF ----------
async function generatePDF(htmlPath) {
  console.log('Launching Chromium via Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120_000 });
  await page.emulateMediaType('print');

  console.log('Generating PDF...');
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log('PDF written to:', OUT_PDF);
}

// ---------- Main ----------
(async function main() {
  const mdContent = concatMarkdown();
  const html = renderHTML(mdContent);
  fs.writeFileSync(OUT_HTML, html, 'utf8');
  console.log(`HTML written: ${OUT_HTML} (${(html.length / 1024).toFixed(1)} KB)`);
  await generatePDF(OUT_HTML);
  const size = fs.statSync(OUT_PDF).size;
  console.log(`\n✅ Done. PDF size: ${(size / 1024).toFixed(1)} KB`);
})().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
