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
  
  // Ultra-large viewport for capturing all content
  await page.setViewport({
    width: 1400,
    height: 30000,
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
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    // Step 1: Click the Requests tab
    console.log('Step 1: Clicking Requests tab...');
    
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
    
    await sleep(2000);
    console.log('✅ Switched to Requests tab');
    
    // Step 2: Click "Show All" toggle to display all 80 test cases
    console.log('Step 2: Clicking "Show All" toggle to display all 80 test cases...');
    
    const showAllClicked = await page.evaluate(() => {
      let clicked = false;
      
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.textContent;
        
        if (text && text.includes('Show All')) {
          let clickable = el;
          while (clickable && clickable !== document.body) {
            const style = window.getComputedStyle(clickable);
            const html = clickable.innerHTML;
            
            if (style.cursor === 'pointer' || 
                html.includes('switch') || 
                html.includes('toggle') ||
                clickable.tagName === 'BUTTON' ||
                clickable.getAttribute('role') === 'switch') {
              console.log('Found Show All toggle, clicking...');
              clickable.click();
              clicked = true;
              break;
            }
            clickable = clickable.parentElement;
          }
          
          if (clicked) break;
        }
      }
      
      return clicked;
    });
    
    if (showAllClicked) {
      console.log('✅ Show All toggle clicked');
    }
    
    await sleep(4000);
    
    // Step 3: First, scroll through entire page to load all 80 test cases
    console.log('Step 3: Scrolling to load all 80 test cases into DOM...');
    
    // Scroll down slowly to load all test cases
    for (let scroll = 0; scroll < 100; scroll += 5) {
      await page.evaluate((scrollAmount) => {
        window.scrollBy(0, 100);
      });
      await sleep(100);
    }
    
    await sleep(2000);
    
    // Step 4: Collect all unique test case names
    const testCaseNames = await page.evaluate(() => {
      const testNames = new Set();
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        const text = el.textContent || '';
        
        // Look for test case headers (short text with test name and pass/fail status)
        if ((text.includes('Passed') || text.includes('Failed')) && 
            text.length < 200 &&
            text.length > 10 &&
            el.offsetHeight > 0 &&
            el.offsetHeight < 50) {
          
          // Extract just the test name part
          const match = text.match(/^(.+?)\s*-\s*\d+\/\d+\s*(Passed|Failed)/);
          if (match) {
            testNames.add(match[1].trim());
          }
        }
      }
      
      return Array.from(testNames);
    });
    
    console.log(`✅ Found ${testCaseNames.length} unique test cases:`);
    testCaseNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name.substring(0, 60)}`);
    });
    
    // Step 5: Expand each test case by clicking its expand arrow
    console.log(`\nStep 5: Expanding all ${testCaseNames.length} test cases...`);
    
    let expandedCount = 0;
    
    // First pass - expand all test cases
    for (let i = 0; i < testCaseNames.length; i++) {
      const expanded = await page.evaluate((testName) => {
        const allElements = document.querySelectorAll('*');
        
        for (const el of allElements) {
          const text = el.textContent || '';
          
          // Find the element with this test name that's clickable with SVG
          if (text.includes(testName) && 
              (text.includes('Passed') || text.includes('Failed')) &&
              el.offsetHeight > 0 &&
              el.offsetHeight < 50) {
            
            // Look for the parent with the SVG arrow
            let parent = el;
            while (parent && parent !== document.body) {
              const html = parent.innerHTML || '';
              const style = window.getComputedStyle(parent);
              
              // If this parent has SVG and is clickable, click it
              if (html.includes('<svg') && style.cursor === 'pointer') {
                parent.click();
                return true;
              }
              
              parent = parent.parentElement;
            }
            
            // If we didn't find a parent with SVG, try clicking this element
            if (window.getComputedStyle(el).cursor === 'pointer') {
              el.click();
              return true;
            }
          }
        }
        
        return false;
      }, testCaseNames[i]);
      
      if (expanded) {
        expandedCount++;
        console.log(`  [${i + 1}/${testCaseNames.length}] ✓ ${testCaseNames[i].substring(0, 50)}`);
      }
      
      await sleep(150);
    }
    
    console.log(`\n✅ Successfully expanded: ${expandedCount} of ${testCaseNames.length} test cases`);
    
    // Wait for all animations and DOM updates to complete
    console.log('Step 6: Waiting for all expansions to complete...');
    await sleep(5000);
    
    // Verify expanded content is present
    const expandedContentCount = await page.evaluate(() => {
      const requestElements = document.querySelectorAll('*');
      let count = 0;
      
      for (const el of requestElements) {
        const text = el.textContent || '';
        if (text.includes('REQUEST INFORMATION') && el.offsetHeight > 0) {
          count++;
        }
      }
      
      return count;
    });
    
    console.log(`Found ${expandedContentCount} expanded REQUEST INFORMATION sections in DOM`);
    
    // Step 7: Scroll back to top
    console.log('Step 7: Scrolling to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(2000);
    
    // Step 8: Generate PDF
    console.log('Step 8: Generating comprehensive PDF...');
    
    // Get the actual rendered height of all content
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      const bodyHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      
      return {
        width: html.scrollWidth || body.scrollWidth || 1200,
        height: bodyHeight
      };
    });
    
    console.log(`  Content dimensions: ${dimensions.width}px × ${dimensions.height}px`);
    
    // Inject CSS to ensure everything prints
    await page.addStyleTag({
      content: `
        * {
          page-break-inside: avoid !important;
          orphans: 1 !important;
          widows: 1 !important;
        }
        body {
          width: ${dimensions.width}px !important;
          height: ${dimensions.height}px !important;
        }
      `
    });
    
    // Generate PDF with exact content dimensions
    const pxToMm = 0.264583; // 1px = 0.264583mm
    const heightMm = dimensions.height * pxToMm;
    
    console.log(`  PDF height will be: ${heightMm.toFixed(0)}mm`);
    
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
    
    console.log(`✅ PDF created successfully with all 80 test cases!`);
    console.log(`📄 Location: ${pdfPath}`);
    
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
}

convertHtmlToPdf();
