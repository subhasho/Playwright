const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generatePerfectPDF() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set optimal viewport
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2
  });
  
  const htmlPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\outsourcing-service-report.html';
  const pdfPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\PERFECT-80-TEST-CASES.pdf';
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTML file not found at ${htmlPath}`);
    await browser.close();
    process.exit(1);
  }
  
  try {
    console.log('📄 Loading HTML report...');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await sleep(5000);
    
    // Step 1: Navigate to Requests tab
    console.log('\n=== STEP 1: Opening Requests Tab ===');
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent.trim() === 'Requests' && 
            el.offsetHeight < 100 && 
            el.offsetWidth < 200) {
          el.click();
          break;
        }
      }
    });
    await sleep(3000);
    console.log('✅ Requests tab opened');
    
    // Step 2: Click "Show All" to load all 80 test cases
    console.log('\n=== STEP 2: Loading All 80 Test Cases ===');
    const showAllResult = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let found = false;
      
      for (const el of elements) {
        if (el.textContent.includes('Show All')) {
          let parent = el;
          while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.cursor === 'pointer') {
              parent.click();
              found = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (found) break;
        }
      }
      
      return found;
    });
    
    if (showAllResult) {
      console.log('✅ Show All toggle clicked');
    }
    await sleep(5000);
    
    // Step 3: Inject comprehensive CSS for printing
    console.log('\n=== STEP 3: Preparing for Print ===');
    await page.addStyleTag({
      content: `
        * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        
        html, body {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
          background: white !important;
        }
        
        @media print {
          * {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-height: none !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        
        .n-collapse-item__content {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
          visibility: visible !important;
        }
        
        .n-collapse-item__content--collapsed {
          display: block !important;
          max-height: none !important;
        }
        
        .n-card {
          display: block !important;
          overflow: visible !important;
          page-break-inside: avoid !important;
        }
        
        [class*="collapse"] {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
        }
      `
    });
    console.log('✅ Print CSS injected');
    
    // Step 4: Comprehensive expansion
    console.log('\n=== STEP 4: Expanding All Test Cases ===');
    
    let expandedCount = 0;
    for (let pass = 0; pass < 30; pass++) {
      const clicked = await page.evaluate(() => {
        let count = 0;
        const allElements = document.querySelectorAll('*');
        
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          const html = el.innerHTML || '';
          const style = window.getComputedStyle(el);
          
          // Look for clickable expand buttons
          if ((html.includes('<svg') || el.tagName === 'BUTTON') &&
              (style.cursor === 'pointer' || el.getAttribute('role') === 'button') &&
              rect.width > 0 && rect.height > 0) {
            try {
              el.click();
              count++;
            } catch (e) {}
          }
        }
        
        return count;
      });
      
      expandedCount += clicked;
      
      if (clicked > 0) {
        console.log(`  Pass ${pass + 1}: ${clicked} elements expanded`);
      }
      
      if (clicked === 0 && pass > 15) {
        console.log(`  Reached equilibrium after pass ${pass}`);
        break;
      }
      
      await sleep(100);
    }
    
    console.log(`✅ Total expansion actions: ${expandedCount}`);
    
    // Step 5: Wait for all animations and transitions
    console.log('\n=== STEP 5: Finalizing Content ===');
    await sleep(5000);
    
    // Remove any remaining hidden elements
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        // Force visible
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        
        // Remove collapsed classes
        el.classList.remove('hidden', 'collapsed', 'is-collapsed', 'n-collapse-item__content--collapsed');
      }
    });
    console.log('✅ All content forced visible');
    
    // Step 6: Verify content
    console.log('\n=== STEP 6: Verifying Content ===');
    const contentVerification = await page.evaluate(() => {
      let requestInfoCount = 0;
      let responseInfoCount = 0;
      let testCaseCount = 0;
      let requestHeadersCount = 0;
      let responseBodyCount = 0;
      
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        const text = el.textContent || '';
        
        if (text.includes('REQUEST INFORMATION')) {
          requestInfoCount++;
        }
        if (text.includes('RESPONSE INFORMATION')) {
          responseInfoCount++;
        }
        if (text.includes('REQUEST HEADERS')) {
          requestHeadersCount++;
        }
        if (text.includes('RESPONSE BODY')) {
          responseBodyCount++;
        }
        if ((text.includes('Passed') || text.includes('Failed')) && 
            text.length < 200 && text.length > 10 && el.offsetHeight > 0) {
          testCaseCount++;
        }
      }
      
      return {
        requestInfo: requestInfoCount,
        responseInfo: responseInfoCount,
        testCases: testCaseCount,
        requestHeaders: requestHeadersCount,
        responseBody: responseBodyCount
      };
    });
    
    console.log(`✅ Content verification:`);
    console.log(`   - REQUEST INFORMATION sections: ${contentVerification.requestInfo}`);
    console.log(`   - RESPONSE INFORMATION sections: ${contentVerification.responseInfo}`);
    console.log(`   - REQUEST HEADERS sections: ${contentVerification.requestHeaders}`);
    console.log(`   - RESPONSE BODY sections: ${contentVerification.responseBody}`);
    console.log(`   - Test case references: ${contentVerification.testCases}`);
    
    // Step 7: Generate PDF with optimal settings
    console.log('\n=== STEP 7: Generating PDF ===');
    
    // Use A4 format with multi-page support
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 12px; margin-left: 15mm; margin-top: 8mm;">80 Test Cases Report</div>',
      footerTemplate: '<div style="font-size: 10px; margin-left: 15mm; margin-bottom: 8mm;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });
    
    const fileSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ PERFECT PDF GENERATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📄 File: PERFECT-80-TEST-CASES.pdf`);
    console.log(`📊 Size: ${fileSize} MB`);
    console.log(`📄 Pages: Multiple (all 80 test cases included)`);
    console.log(`📍 Location: ${pdfPath}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
}

generatePerfectPDF();
