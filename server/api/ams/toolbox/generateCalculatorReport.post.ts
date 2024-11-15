import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  // Hole den HTML-Inhalt aus dem Request-Body
  const body = await readBody(event);
  const { htmlContent } = body;

  // Starte Puppeteer und öffne eine neue Seite
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Setze den HTML-Inhalt auf die Seite
  await page.setContent(htmlContent);

  // Erstelle das PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0.0in', right: '0.0in', bottom: '0.0in', left: '0.0in' },
  });

  // Schließe den Browser
  await browser.close();

  // Setze die richtigen Header und sende das PDF zurück
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  });
});
