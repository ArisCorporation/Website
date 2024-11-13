import { chromium } from 'playwright';

async function generatePDF(url) {
  const browser = await chromium.launch(); // Launches bundled Chromium with all dependencies
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: true, // Keep the background images/colors
    displayHeaderFooter: false,
    forcePageBackground: true,
    landscape: false,
  });

  await browser.close();
  return pdfBuffer;
}

export default defineEventHandler(async (event: any) => {
  const pdfBuffer = await generatePDF(
    'http://localhost:3000/ams/toolbox/calculator-pdf?crews=[{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}}]&members=[{"id":1,"user":{"id":"09c71bb4-4404-4678-b0a3-5cd94871f504","first_name":"Aaron","last_name":"Price","full_name":"Aaron+Price","avatar":"335e56d2-5a17-4f75-8f7a-537430cfc92b","avatar_url":"https://cms.ariscorp.de/assets/335e56d2-5a17-4f75-8f7a-537430cfc92b"},"crew":{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},"is_external":false},{"id":2,"user":{"id":"54ee43a5-d877-4c11-aa61-31b1fea7d1a7","first_name":"Decon+Malcom","last_name":"Vorn","full_name":"Decon+Malcom+Vorn","avatar":"074bce0b-e23a-4d44-9f41-3004d7740f85","avatar_url":"https://cms.ariscorp.de/assets/074bce0b-e23a-4d44-9f41-3004d7740f85"},"crew":{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},"external":false,"external_name":""},{"id":3,"user":{"id":"052a2c25-b063-4a82-90cb-110d7f809cae","first_name":"Thomas","last_name":"Blakeney","full_name":"Thomas+Blakeney","avatar":"31733e00-f4ff-4ebf-9499-668508d6c0fc","avatar_url":"https://cms.ariscorp.de/assets/31733e00-f4ff-4ebf-9499-668508d6c0fc"},"crew":{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}},"external":false,"external_name":""}]&incomes=[{"id":1,"name":"RMC","value":"13000","member":{"id":3,"user":{"id":"052a2c25-b063-4a82-90cb-110d7f809cae","first_name":"Thomas","last_name":"Blakeney","full_name":"Thomas+Blakeney","avatar":"31733e00-f4ff-4ebf-9499-668508d6c0fc","avatar_url":"https://cms.ariscorp.de/assets/31733e00-f4ff-4ebf-9499-668508d6c0fc"},"crew":{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}},"external":false,"external_name":""}}]&expenses=[{"id":1,"name":"Sprit","value":"1500","member":{"id":3,"user":{"id":"052a2c25-b063-4a82-90cb-110d7f809cae","first_name":"Thomas","last_name":"Blakeney","full_name":"Thomas+Blakeney","avatar":"31733e00-f4ff-4ebf-9499-668508d6c0fc","avatar_url":"https://cms.ariscorp.de/assets/31733e00-f4ff-4ebf-9499-668508d6c0fc"},"crew":{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}},"external":false,"external_name":""}}]&steps={"incomes":[],"income_sum":0,"expenses":[],"members":[],"share":0}&options={"name":"","subtract_tax":true,"tax_rate":0.05,"edit_tax":false,"members":[{"id":1,"user":{"id":"09c71bb4-4404-4678-b0a3-5cd94871f504","first_name":"Aaron","last_name":"Price","full_name":"Aaron+Price","avatar":"335e56d2-5a17-4f75-8f7a-537430cfc92b","avatar_url":"https://cms.ariscorp.de/assets/335e56d2-5a17-4f75-8f7a-537430cfc92b"},"crew":{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},"is_external":false},{"id":2,"user":{"id":"54ee43a5-d877-4c11-aa61-31b1fea7d1a7","first_name":"Decon+Malcom","last_name":"Vorn","full_name":"Decon+Malcom+Vorn","avatar":"074bce0b-e23a-4d44-9f41-3004d7740f85","avatar_url":"https://cms.ariscorp.de/assets/074bce0b-e23a-4d44-9f41-3004d7740f85"},"crew":{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},"external":false,"external_name":""},{"id":3,"user":{"id":"052a2c25-b063-4a82-90cb-110d7f809cae","first_name":"Thomas","last_name":"Blakeney","full_name":"Thomas+Blakeney","avatar":"31733e00-f4ff-4ebf-9499-668508d6c0fc","avatar_url":"https://cms.ariscorp.de/assets/31733e00-f4ff-4ebf-9499-668508d6c0fc"},"crew":{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}},"external":false,"external_name":""}],"manager":{"id":1,"user":null,"crew":null,"is_external":false},"crews":[{"id":1,"name":"Salvage","ship":{"id":"0b060746-f724-43cf-ad8f-7086feec2228","name":"Reclaimer","manufacturer":{"name":"Aegis+Dynamics"}}},{"id":2,"name":"Cargo","ship":{"id":"03012a07-fe69-4d0e-ac20-ca64c99052c8","name":"Zeus+Mk+II+CL","manufacturer":{"name":"Roberts+Space+Industries"}}}]}', // your long query string
  );

  // Set the headers for the response to display PDF in the browser
  event.res.setHeader('Content-Type', 'application/pdf');
  event.res.setHeader('Content-Disposition', 'inline; filename="generated.pdf"');
  event.res.setHeader('Content-Length', pdfBuffer.length.toString());

  // Send the PDF buffer as the response
  event.res.end(pdfBuffer);
});
