import { test, expect } from '@playwright/test';

test('verify Google page title', async ({ page }) => {
    await page.goto('https://www.google.com/');
    const title = await page.title();
    console.log('Title:', title);
    await expect(page).toHaveTitle('Google');
});

test('fill login form with username and password', async ({ page }) => {
    // Demo login page: https://the-internet.herokuapp.com/login
    await page.goto('https://www.stage.xometry.net/quoting/quote/staff/');

    // Enter username (email) and click Continue
    await page.fill('#username', 'ohalsubhash823@gmail.com');
    await page.click('button:has-text("Continue")');

    // Wait for password input to appear, then enter password
    await page.waitForSelector('#password', { timeout: 5000 });
    await page.fill('#password', 'Password!123');

    // Click the Continue button after entering the password
    await page.click('button:has-text("Continue")');

    // Wait for navigation or network idle to ensure login finished
    await page.waitForLoadState('networkidle');

    // Optionally verify successful login by checking URL or a post-login selector
    await expect(page).toHaveURL(/secure|dashboard|quoting/);

        // Click 'View Quoting Home' if available and wait for navigation
        const viewQuoting = page.locator('text=View Quoting Home');
        if (await viewQuoting.count() > 0) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                viewQuoting.click(),
            ]);
            await expect(page).toHaveURL(/quoting|quote|home/);
        }
        
        // Click 'Recent CAD Files' if present on the quoting home and handle popup/dialog
        const recentCad = page.locator('text=Recent CAD Files');
        if (await recentCad.count() > 0) {
            // Accept any modal dialog that may appear
            page.on('dialog', async (dialog) => {
                try { await dialog.accept(); } catch (e) { /* ignore */ }
            });

            // Click and handle either an in-page navigation or a popup window
            const [popup] = await Promise.all([
                page.waitForEvent('popup').catch(() => null),
                (async () => { await recentCad.click(); return null; })(),
            ]);

            if (popup) {
                await popup.waitForLoadState('networkidle');
                await expect(popup).toHaveURL(/recent|cad|files/);
                // Optionally close the popup after verification
                await popup.close();
            } else {
                // If no popup, wait for navigation on the same page
                await page.waitForLoadState('networkidle');
                await expect(page).toHaveURL(/recent|cad|files/);
            }
        }
});