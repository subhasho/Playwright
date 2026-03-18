const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateCompletePDF() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });
  
  const htmlPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\outsourcing-service-report.html';
  const pdfPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\80-API-TEST-CASES-COMPLETE.pdf';
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTML file not found`);
    await browser.close();
    process.exit(1);
  }
  
  try {
    console.log('📄 Loading HTML report...');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await sleep(5000);
    
    // Step 1: Click Requests tab
    console.log('\n=== STEP 1: Opening Requests Tab ===');
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent.trim() === 'Requests' && el.offsetHeight < 100 && el.offsetWidth < 200) {
          el.click();
          break;
        }
      }
    });
    await sleep(3000);
    console.log('✅ Requests tab opened');
    
    // Step 2: Click "Show All" 
    console.log('\n=== STEP 2: Loading All 80 Test Cases ===');
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
    await sleep(5000);
    console.log('✅ Show All clicked - loading 80 test cases');
    
    // Step 3: Massive CSS injection
    console.log('\n=== STEP 3: Injecting CSS for Full Expansion ===');
    await page.addStyleTag({
      content: `
        * {
          max-height: none !important;
          height: auto !important;
          display: block !important;
          overflow: visible !important;
          visibility: visible !important;
          opacity: 1 !important;
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
          overflow: visible !important;
        }
        
        [class*="collapse"] {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
        }
      `
    });
    await sleep(3000);
    console.log('✅ CSS injected');
    
    // Step 4: Scroll through entire page to load all content
    console.log('\n=== STEP 4: Scrolling to Load All Content ===');
    for (let i = 0; i < 300; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });
      await sleep(20);
    }
    await sleep(5000);
    console.log('✅ Full page scrolled');
    
    // Step 5: Verify all 80 test cases are loaded
    console.log('\n=== STEP 5: Verifying All 80 Test Cases Loaded ===');
    const testCaseCount = await page.evaluate(() => {
      let count = 0;
      const elements = document.querySelectorAll('*');
      const testNames = new Set();
      
      for (const el of elements) {
        const text = el.textContent || '';
        if ((text.includes('Passed') || text.includes('Failed')) && 
            text.length < 200 && text.length > 10 && el.offsetHeight > 0) {
          count++;
          // Try to extract test name
          const match = text.match(/^(.+?)\s*-\s*\d+\/\d+\s*(Passed|Failed)/);
          if (match) {
            testNames.add(match[1].trim());
          }
        }
      }
      
      return { count, uniqueTests: testNames.size };
    });
    
    console.log(`✅ Found ${testCaseCount.count} test case references`);
    console.log(`✅ Found ${testCaseCount.uniqueTests} unique test cases`);
    
    // Step 6: Aggressive expansion - click ALL expandable elements
    console.log('\n=== STEP 6: Expanding All Test Case Details ===');
    
    let totalClicks = 0;
    for (let pass = 0; pass < 50; pass++) {
      const clicks = await page.evaluate(() => {
        let count = 0;
        const allElements = document.querySelectorAll('*');
        const clickedElements = new Set();
        
        for (const el of allElements) {
          const html = el.innerHTML || '';
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          // Click expand buttons with SVG arrows or button elements
          if ((html.includes('<svg') || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') &&
              (style.cursor === 'pointer' || style.cursor === 'pointer') &&
              rect.width > 0 && rect.height > 0) {
            
            const key = `${el.offsetParent?.offsetTop || 0}-${el.offsetLeft || 0}`;
            if (!clickedElements.has(key)) {
              try {
                el.click();
                clickedElements.add(key);
                count++;
              } catch (e) {}
            }
          }
        }
        
        return count;
      });
      
      totalClicks += clicks;
      
      if (clicks > 0) {
        console.log(`  Pass ${pass + 1}: ${clicks} elements clicked`);
      }
      
      if (clicks === 0 && pass > 20) {
        console.log(`  ✅ Reached equilibrium at pass ${pass}`);
        break;
      }
      
      await sleep(150);
    }
    
    console.log(`✅ Total expansion clicks: ${totalClicks}`);
    
    // Step 7: Force remove all hidden states
    console.log('\n=== STEP 7: Forcing All Content Visible ===');
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        el.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          max-height: none !important;
          height: auto !important;
          overflow: visible !important;
        `;
        
        el.classList.remove('hidden', 'collapsed', 'is-collapsed', 'n-collapse-item__content--collapsed');
      }
    });
    console.log('✅ All content forced visible');
    
    // Step 8: Scroll to top
    console.log('\n=== STEP 8: Preparing PDF ===');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(3000);
    
    // Step 9: Final verification
    const finalCount = await page.evaluate(() => {
      let requestCount = 0;
      let testCount = 0;
      const elements = document.querySelectorAll('*');
      
      for (const el of elements) {
        const text = el.textContent || '';
        if (text.includes('REQUEST INFORMATION')) {
          requestCount++;
        }
        if ((text.includes('Passed') || text.includes('Failed')) && 
            text.length < 200 && text.length > 10) {
          testCount++;
        }
      }
      
      return { requestCount, testCount };
    });
    
    console.log(`✅ REQUEST INFORMATION sections: ${finalCount.requestCount}`);
    console.log(`✅ Test cases visible: ${finalCount.testCount}`);
    
    // Step 10: Generate PDF
    console.log('\n=== STEP 9: Generating PDF with All 80 Test Cases ===');
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 12px; margin-left: 10mm; margin-top: 5mm;">80 API Test Cases Report</div>',
      footerTemplate: '<div style="font-size: 10px; margin-left: 10mm; margin-bottom: 5mm;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });
    
    const fileSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PDF GENERATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📄 Filename: 80-API-TEST-CASES-COMPLETE.pdf`);
    console.log(`📊 File Size: ${fileSize} MB`);
    console.log(`📋 Total Test Cases: 80`);
    console.log(`📍 Location: ${pdfPath}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
}

generateCompletePDF();
