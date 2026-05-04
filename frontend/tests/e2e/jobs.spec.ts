import { test, expect } from '@playwright/test';

test.describe('Job Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/app\/dashboard/);
    });

    test('should navigate to background jobs page', async ({ page }) => {
        await page.click('text=Jobs');

        await expect(page).toHaveURL(/\/app\/jobs/);
        await expect(page.locator('h1')).toContainText('Background Jobs');
        
        // Check for table elements headers
        await expect(page.locator('th:has-text("Job ID / Type")')).toBeVisible();
        await expect(page.locator('th:has-text("Status")')).toBeVisible();
        await expect(page.locator('th:has-text("Progress")')).toBeVisible();
    });

    test('should switch job status filters', async ({ page }) => {
        await page.goto('/app/jobs');

        // Click on the 'completed' filter
        await page.click('button:has-text("completed")');
        
        // Active tab should have the primary color class, we can check for text or class updates
        // Just verify another tab can be clicked
        await page.click('button:has-text("processing")');
        
        // Verify refresh button exists
        await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    });
});
