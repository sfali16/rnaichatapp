const { test, expect } = require('@playwright/test');

// React Native Web's controlled TextInput needs real keystroke events to
// update React state. Use pressSequentially() instead of fill() so that
// onChangeText fires correctly on every character.
async function typeIntoInput(page, text) {
  await page.getByTestId('chat-input').click();
  await page.getByTestId('chat-input').pressSequentially(text);
}

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-input').waitFor();
  });

  test('shows welcome message on load', async ({ page }) => {
    await expect(page.getByText('Hi! Type something below and press Send.')).toBeVisible();
  });

  test('Send button is disabled when input is empty', async ({ page }) => {
    const send = page.getByTestId('send-button');
    await expect(send).toHaveAttribute('aria-disabled', 'true');
  });

  test('Send button enables when input has text', async ({ page }) => {
    await typeIntoInput(page, 'hello');
    const send = page.getByTestId('send-button');
    await expect(send).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('sends a message by clicking Send', async ({ page }) => {
    await typeIntoInput(page, 'Hello world');
    await page.getByTestId('send-button').click();

    await expect(page.getByText('Hello world')).toBeVisible();
    await expect(page.getByText('You said: "Hello world"')).toBeVisible();
  });

  test('input is cleared after sending', async ({ page }) => {
    await typeIntoInput(page, 'Clear me');
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('chat-input')).toHaveValue('');
  });

  test('sends a message with the Enter key', async ({ page }) => {
    await typeIntoInput(page, 'Enter key test');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Enter key test')).toBeVisible();
  });

  test('Shift+Enter adds a new line instead of sending', async ({ page }) => {
    await typeIntoInput(page, 'Line one');
    await page.keyboard.press('Shift+Enter');
    await page.getByTestId('chat-input').pressSequentially('Line two');

    // message count should still be 1 (just the welcome message)
    await expect(page.getByTestId('message-bubble')).toHaveCount(1);
  });

  test('each sent message creates two bubbles (sent + echo)', async ({ page }) => {
    await typeIntoInput(page, 'First');
    await page.getByTestId('send-button').click();
    // 1 welcome + 1 sent + 1 echo = 3
    await expect(page.getByTestId('message-bubble')).toHaveCount(3);

    await typeIntoInput(page, 'Second');
    await page.getByTestId('send-button').click();
    // + 2 more = 5
    await expect(page.getByTestId('message-bubble')).toHaveCount(5);
  });
});
