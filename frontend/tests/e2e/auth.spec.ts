import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display login page', async ({ page }) => {
        await expect(page).toHaveTitle(/Vidyaverse/);
        await expect(page.locator('text=Sign In')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'wrong@test.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        // First login
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL(/dashboard/);

        // Logout
        await page.click('[data-testid="user-menu"]');
        await page.click('text=Logout');

        // Should be back at login
        await expect(page).toHaveURL(/login|\/$/);
    });
});
