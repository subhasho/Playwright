const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    'file:///C:/Users/subhashohal/Downloads/outsourcing-service-master/outsourcing-service-master/bruno-api/outsourcing-service-report.html',
    { waitUntil: 'networkidle' }
  );

  await page.pdf({
    path: 'outsourcing-service-report.pdf',
    format: 'A4',
    printBackground: true
  });

  await browser.close();
})();
