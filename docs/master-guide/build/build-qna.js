// Build script for Interview Q&A PDF
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHAPTERS_DIR = path.join(ROOT, 'chapters');
const OUT_HTML = path.join(ROOT, 'SkillSync_Interview_QnA.html');
const OUT_PDF = path.join(ROOT, 'SkillSync_Interview_QnA.pdf');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false });
md.use(anchor, {
  permalink: false,
  slugify: (s) => String(s).trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
});

const file = path.join(CHAPTERS_DIR, '10-interview-qna.md');
const mdContent = fs.readFileSync(file, 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SkillSync Interview Q&A</title><style>${css}</style></head><body>${md.render(mdContent)}</body></html>`;

fs.writeFileSync(OUT_HTML, html, 'utf8');
console.log(`HTML written: ${OUT_HTML} (${(html.length / 1024).toFixed(1)} KB)`);

(async () => {
  console.log('Launching Chromium...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + OUT_HTML.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120_000 });
  await page.emulateMediaType('print');
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await browser.close();
  const size = fs.statSync(OUT_PDF).size;
  console.log(`\n✅ Done. PDF: ${OUT_PDF}`);
  console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
})().catch(err => { console.error(err); process.exit(1); });
