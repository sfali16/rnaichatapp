const { test, expect } = require('@playwright/test');

// See chat.spec.js for why pressSequentially is used instead of fill()
async function typeIntoInput(page, text) {
  await page.getByTestId('chat-input').click();
  await page.getByTestId('chat-input').pressSequentially(text);
}

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
    await typeIntoInput(page, 'Session 1 message');
    await page.getByTestId('send-button').click();

    await page.getByTestId('new-session-button').click();

    await expect(page.getByText('Session 1 message')).not.toBeVisible();
    await expect(page.getByTestId('message-bubble')).toHaveCount(1);
  });

  test('switching sessions restores message history', async ({ page }) => {
    await typeIntoInput(page, 'From session 1');
    await page.getByTestId('send-button').click();

    // switch to session 2
    await page.getByTestId('new-session-button').click();
    await expect(page.getByText('From session 1')).not.toBeVisible();

    // open dropdown and switch back to session 1 using its testID
    await page.getByTestId('session-selector').click();
    await page.getByTestId('session-item-0').click();

    await expect(page.getByText('From session 1')).toBeVisible();
  });

  test('session dropdown lists all sessions', async ({ page }) => {
    await page.getByTestId('new-session-button').click();
    await page.getByTestId('new-session-button').click();

    await page.getByTestId('session-selector').click();

    // target items by testID to avoid ambiguity with the header title
    await expect(page.getByTestId('session-item-0')).toContainText('Session 1');
    await expect(page.getByTestId('session-item-1')).toContainText('Session 2');
    await expect(page.getByTestId('session-item-2')).toContainText('Session 3');
  });

  test('active session shows checkmark in dropdown', async ({ page }) => {
    await page.getByTestId('session-selector').click();
    await expect(page.getByText('✓')).toBeVisible();
  });

  test('tapping outside dropdown closes it', async ({ page }) => {
    await page.getByTestId('session-selector').click();
    await expect(page.getByText('Sessions')).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(page.getByText('Sessions')).not.toBeVisible();
  });
});
