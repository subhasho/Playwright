const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function convertHtmlToPdf() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to capture all content
  await page.setViewport({
    width: 1600,
    height: 25000,
    deviceScaleFactor: 1
  });
  
  const htmlPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\outsourcing-service-report.html';
  const pdfPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\ALL-80-TEST-CASES.pdf';
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`Error: HTML file not found at ${htmlPath}`);
    await browser.close();
    process.exit(1);
  }
  
  try {
    console.log('📄 Loading HTML file...');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    // Step 1: Click Requests tab
    console.log('Step 1: Navigating to Requests tab...');
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent.trim() === 'Requests' && el.offsetHeight < 100 && el.offsetWidth < 200) {
          el.click();
          break;
        }
      }
    });
    await sleep(2000);
    console.log('✅ Requests tab opened');
    
    // Step 2: Click "Show All"
    console.log('Step 2: Clicking Show All...');
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent.includes('Show All')) {
          let parent = el;
          while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.cursor === 'pointer') {
              parent.click();
              break;
            }
            parent = parent.parentElement;
          }
          break;
        }
      }
    });
    await sleep(3000);
    console.log('✅ Show All clicked');
    
    // Step 3: Massive CSS injection to force all content visible
    console.log('Step 3: Injecting CSS...');
    await page.addStyleTag({
      content: `
        html, body, * {
          max-height: none !important;
          height: auto !important;
          display: block !important;
          overflow: visible !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          margin: 0 !important;
        }
        
        .n-collapse-item__content {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
          height: auto !important;
        }
        
        .n-collapse-item__content--collapsed {
          display: block !important;
          max-height: none !important;
        }
        
        [class*="collapse"] {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        [style*="display:none"], [style*="display: none"] {
          display: block !important;
          max-height: none !important;
        }
      `
    });
    await sleep(3000);
    console.log('✅ CSS injected');
    
    // Step 4: Scroll repeatedly to load all content
    console.log('Step 4: Scrolling to load all content...');
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });
      await sleep(50);
    }
    await sleep(3000);
    console.log('✅ Scrolling complete');
    
    // Step 5: Click all expand buttons aggressively
    console.log('Step 5: Expanding all sections...');
    let totalClicks = 0;
    
    for (let pass = 0; pass < 15; pass++) {
      const clicks = await page.evaluate(() => {
        let count = 0;
        
        // Get all elements with SVG (expand arrows)
        const allElements = document.querySelectorAll('*');
        
        for (const el of allElements) {
          const html = el.innerHTML || '';
          const style = window.getComputedStyle(el);
          
          // Click anything that looks like an expand button
          if ((html.includes('<svg') || el.tagName === 'BUTTON') && 
              (style.cursor === 'pointer' || el.getAttribute('role') === 'button')) {
            try {
              el.click();
              count++;
            } catch (e) {}
          }
        }
        
        return count;
      });
      
      totalClicks += clicks;
      console.log(`  Pass ${pass + 1}: ${clicks} clicks`);
      
      if (clicks === 0 && pass > 5) break;
      await sleep(200);
    }
    console.log(`✅ Total expansion clicks: ${totalClicks}`);
    
    // Step 6: Remove all display:none
    console.log('Step 6: Removing hidden styles...');
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        el.style.display = '';
        el.style.maxHeight = '';
        el.style.overflow = '';
        el.style.height = '';
        el.classList.remove('hidden', 'n-collapse-item__content--collapsed');
        
        if (el.getAttribute('style') === '') {
          el.removeAttribute('style');
        }
      }
    });
    console.log('✅ Hidden styles removed');
    
    // Step 7: Final scroll to top
    console.log('Step 7: Scrolling to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(3000);
    
    // Step 8: Get actual content height
    console.log('Step 8: Calculating PDF dimensions...');
    const pageHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight || document.body.scrollHeight;
    });
    
    console.log(`  Page height: ${pageHeight}px`);
    
    // Step 9: Generate PDF
    console.log('Step 9: Generating PDF with all 80 test cases...');
    
    await page.pdf({
      path: pdfPath,
      width: '1600px',
      height: `${pageHeight}px`,
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`📄 Saved to: ${pdfPath}`);
    console.log(`📊 File size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error:', error.message);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
}

convertHtmlToPdf();
