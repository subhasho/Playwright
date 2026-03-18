import { test, expect, Locator } from '@playwright/test';

test('verify playwright locators', async ({ page }) => {
  await page.goto('https://www.stage.xometry.net/quoting/quote/staff/');

  const logo: Locator = page.getByAltText('Xometry');
  await logo.click();
  await expect(logo).toBeVisible();

  // Enter username and proceed
  await page.fill('#username', 'ohalsubhash823@gmail.com');
  await page.click('button:has-text("Continue")');

    // Wait for password input to appear, then enter password
    await page.waitForSelector('#password', { timeout: 5000 });
    await page.fill('#password', 'Password!123');   
});

