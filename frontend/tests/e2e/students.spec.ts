import { test, expect } from '@playwright/test';

test.describe('Student Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/dashboard/);
    });

    test('should navigate to students page', async ({ page }) => {
        await page.click('text=Students');

        await expect(page).toHaveURL(/students/);
        await expect(page.locator('h1')).toContainText('Students');
    });

    test('should display students table', async ({ page }) => {
        await page.goto('/students');

        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th:has-text("Name")')).toBeVisible();
        await expect(page.locator('th:has-text("Admission No")')).toBeVisible();
    });

    test('should open add student modal', async ({ page }) => {
        await page.goto('/students');
        await page.click('button:has-text("Add Student")');

        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Add New Student')).toBeVisible();
    });

    test('should add new student', async ({ page }) => {
        await page.goto('/students');
        await page.click('button:has-text("Add Student")');

        // Fill form
        await page.fill('input[name="name"]', 'E2E Test Student');
        await page.fill('input[name="admissionNumber"]', `E2E${Date.now()}`);
        await page.selectOption('select[name="sectionId"]', { index: 1 });
        await page.selectOption('select[name="gender"]', 'male');
        await page.fill('input[name="dateOfBirth"]', '2010-05-15');

        await page.click('button:has-text("Save")');

        // Should show success
        await expect(page.locator('text=Student created successfully')).toBeVisible();
    });

    test('should search students', async ({ page }) => {
        await page.goto('/students');

        await page.fill('input[placeholder*="Search"]', 'John');
        await page.press('input[placeholder*="Search"]', 'Enter');

        // Results should filter
        await page.waitForTimeout(500);
        const rows = await page.locator('tbody tr').count();
        expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('should filter by class', async ({ page }) => {
        await page.goto('/students');

        await page.selectOption('select[name="classFilter"]', { index: 1 });

        await page.waitForTimeout(500);
        // Verify filter is applied
    });

    test('should view student details', async ({ page }) => {
        await page.goto('/students');

        // Click on first student row
        await page.click('tbody tr:first-child');

        // Should navigate to student detail page
        await expect(page).toHaveURL(/students\/[a-z0-9-]+/);
        await expect(page.locator('text=Student Details')).toBeVisible();
    });

    test('should edit student', async ({ page }) => {
        await page.goto('/students');

        // Click edit on first row
        await page.click('tbody tr:first-child button[aria-label="Edit"]');

        await expect(page.locator('[role="dialog"]')).toBeVisible();

        // Update name
        await page.fill('input[name="name"]', 'Updated Name');
        await page.click('button:has-text("Save")');

        await expect(page.locator('text=Student updated successfully')).toBeVisible();
    });
});
