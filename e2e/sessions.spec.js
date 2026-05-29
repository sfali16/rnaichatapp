const { test, expect } = require('@playwright/test');

test.describe('Sessions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-input').waitFor();
  });

  test('starts with Session 1 active', async ({ page }) => {
    await expect(page.getByTestId('session-selector')).toContainText('Session 1');
  });

  test('New button creates a second session', async ({ page }) => {
    await page.getByTestId('new-session-button').click();
    await expect(page.getByTestId('session-selector')).toContainText('Session 2');
  });

  test('new session starts with only the welcome message', async ({ page }) => {
    // send a message in session 1
    await page.getByTestId('chat-input').fill('Session 1 message');
    await page.getByTestId('send-button').click();

    // create session 2
    await page.getByTestId('new-session-button').click();

    // session 1 message should not be visible
    await expect(page.getByText('Session 1 message')).not.toBeVisible();
    // only the welcome bubble should be present
    await expect(page.getByTestId('message-bubble')).toHaveCount(1);
  });

  test('switching sessions restores message history', async ({ page }) => {
    // send in session 1
    await page.getByTestId('chat-input').fill('From session 1');
    await page.getByTestId('send-button').click();

    // switch to session 2
    await page.getByTestId('new-session-button').click();
    await expect(page.getByText('From session 1')).not.toBeVisible();

    // switch back to session 1
    await page.getByTestId('session-selector').click();
    await page.getByText('Session 1').click();

    await expect(page.getByText('From session 1')).toBeVisible();
  });

  test('session dropdown lists all sessions', async ({ page }) => {
    await page.getByTestId('new-session-button').click();
    await page.getByTestId('new-session-button').click();

    await page.getByTestId('session-selector').click();

    await expect(page.getByText('Session 1')).toBeVisible();
    await expect(page.getByText('Session 2')).toBeVisible();
    await expect(page.getByText('Session 3')).toBeVisible();
  });

  test('active session shows checkmark in dropdown', async ({ page }) => {
    await page.getByTestId('session-selector').click();
    // active session row should have a checkmark
    await expect(page.getByText('✓')).toBeVisible();
  });

  test('tapping outside dropdown closes it', async ({ page }) => {
    await page.getByTestId('session-selector').click();
    await expect(page.getByText('Sessions')).toBeVisible();

    // click the backdrop (top-left corner, away from the menu)
    await page.mouse.click(10, 10);
    await expect(page.getByText('Sessions')).not.toBeVisible();
  });
});
