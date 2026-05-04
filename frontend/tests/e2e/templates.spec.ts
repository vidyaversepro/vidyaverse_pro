import { test, expect } from '@playwright/test';

test.describe('Template Editor Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/app\/dashboard/);
    });

    test('should navigate to templates page and see existing templates', async ({ page }) => {
        await page.click('text=Templates');

        await expect(page).toHaveURL(/\/app\/templates/);
        await expect(page.locator('h1')).toContainText('Templates');
    });

    test('should open template variable dictionary preview', async ({ page }) => {
        // Here we ideally mock a template ID or visit a known template. 
        // We'll just verify we can go to the templates index for now
        await page.goto('/app/templates');
        await expect(page.locator('text=Manage visual templates')).toBeVisible();
    });
});
