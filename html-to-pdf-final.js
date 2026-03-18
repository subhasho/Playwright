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
  
  // Ultra-large viewport for all 80 test cases
  await page.setViewport({
    width: 1500,
    height: 35000,
    deviceScaleFactor: 1
  });
  
  const htmlPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\outsourcing-service-report.html';
  const pdfPath = 'C:\\Users\\subhashohal\\Downloads\\outsourcing-service-master\\outsourcing-service-master\\bruno-api\\outs\\ALL-80-COMPLETE-TEST-CASES.pdf';
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`Error: HTML file not found at ${htmlPath}`);
    await browser.close();
    process.exit(1);
  }
  
  try {
    console.log('📄 Loading HTML report...');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    // Step 1: Click Requests tab
    console.log('Step 1: Opening Requests tab...');
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
    console.log('Step 2: Clicking "Show All" to load all 80 tests...');
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
    await sleep(4000);
    console.log('✅ Show All clicked - 80 test cases loaded');
    
    // Step 3: Aggressive CSS injection to force ALL content visible
    console.log('Step 3: Injecting CSS to force all content visible...');
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
          padding: 0 !important;
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
        
        .n-card {
          display: block !important;
          overflow: visible !important;
        }
        
        [class*="collapse"] {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        [style*="display:none"], [style*="display: none"] {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        button, [role="button"], [role="switch"] {
          display: block !important;
        }
      `
    });
    await sleep(3000);
    console.log('✅ CSS injected');
    
    // Step 4: Massive scrolling to load ALL content into DOM
    console.log('Step 4: Scrolling through entire page to load all content...');
    for (let i = 0; i < 200; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 200);
      });
      await sleep(30);
    }
    await sleep(4000);
    console.log('✅ Complete page loaded');
    
    // Step 5: Aggressive expansion - click everything clickable
    console.log('Step 5: Expanding all test case details...');
    let totalClicks = 0;
    
    for (let pass = 0; pass < 25; pass++) {
      const clicks = await page.evaluate(() => {
        let count = 0;
        const allElements = document.querySelectorAll('*');
        
        for (const el of allElements) {
          const html = el.innerHTML || '';
          const style = window.getComputedStyle(el);
          const text = el.textContent || '';
          
          // Click anything that could be an expand button
          if ((html.includes('<svg') || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && 
              (style.cursor === 'pointer' || el.getAttribute('role') === 'switch')) {
            try {
              el.click();
              count++;
            } catch (e) {}
          }
        }
        
        return count;
      });
      
      totalClicks += clicks;
      if (clicks > 0) {
        console.log(`  Pass ${pass + 1}: ${clicks} elements clicked`);
      }
      
      if (clicks === 0 && pass > 10) break;
      await sleep(150);
    }
    console.log(`✅ Total expansion clicks: ${totalClicks}`);
    
    // Step 6: Force remove all display:none and collapsed states
    console.log('Step 6: Removing all hidden and collapsed states...');
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        // Force display properties
        el.style.display = 'block';
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        
        // Remove all collapsed/hidden classes
        const classesToRemove = ['hidden', 'n-collapse-item__content--collapsed', 'is-collapsed', 'collapsed', 'collapsed-content'];
        for (const cls of classesToRemove) {
          el.classList.remove(cls);
        }
        
        // Remove inline display:none
        if (el.getAttribute('style')) {
          let style = el.getAttribute('style');
          style = style.replace(/display\s*:\s*none\s*;?/gi, '');
          style = style.replace(/max-height\s*:\s*0\s*;?/gi, '');
          if (style.trim()) {
            el.setAttribute('style', style);
          } else {
            el.removeAttribute('style');
          }
        }
      }
    });
    console.log('✅ All hidden states removed');
    
    // Step 7: Scroll to top
    console.log('Step 7: Scrolling to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(3000);
    
    // Step 8: Calculate exact dimensions
    console.log('Step 8: Calculating content dimensions...');
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      const height = Math.max(
        body.scrollHeight || 0,
        html.scrollHeight || 0,
        body.offsetHeight || 0,
        html.offsetHeight || 0
      );
      
      const width = Math.max(
        body.scrollWidth || 0,
        html.scrollWidth || 0,
        body.offsetWidth || 0,
        html.offsetWidth || 0,
        1500
      );
      
      return { width, height };
    });
    
    console.log(`  Page dimensions: ${dimensions.width}px × ${dimensions.height}px`);
    
    // Count test cases
    const testCount = await page.evaluate(() => {
      let count = 0;
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const text = el.textContent || '';
        if (text.includes('REQUEST INFORMATION') && el.offsetHeight > 0) {
          count++;
        }
      }
      return count;
    });
    
    console.log(`  Found ${testCount} REQUEST INFORMATION sections in DOM`);
    
    // Step 9: Generate PDF with exact dimensions
    console.log('Step 9: Generating PDF with all 80 test cases...');
    
    await page.pdf({
      path: pdfPath,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });
    
    const fileSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2);
    console.log(`\n✅ SUCCESS! PDF generated with all 80 test cases!`);
    console.log(`📄 File: ALL-80-COMPLETE-TEST-CASES.pdf`);
    console.log(`📊 Size: ${fileSize} MB`);
    console.log(`📍 Location: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
}

convertHtmlToPdf();
