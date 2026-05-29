const { test, expect } = require('@playwright/test');

test.describe('Header resize', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-input').waitFor();
  });

  test('Small is active by default', async ({ page }) => {
    const btn = page.getByTestId('size-small');
    // active button has blue background — check via aria or computed style
    await expect(btn).toBeVisible();
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(0, 122, 255)'); // #007AFF
  });

  test('clicking Medium makes header taller than Small', async ({ page }) => {
    const header = page.getByTestId('header');

    const smallHeight = await header.evaluate(el => el.getBoundingClientRect().height);

    await page.getByTestId('size-medium').click();
    const mediumHeight = await header.evaluate(el => el.getBoundingClientRect().height);

    expect(mediumHeight).toBeGreaterThan(smallHeight);
    expect(mediumHeight - smallHeight).toBeCloseTo(20, 0); // 10px top + 10px bottom
  });

  test('clicking Large makes header taller than Medium', async ({ page }) => {
    const header = page.getByTestId('header');

    await page.getByTestId('size-medium').click();
    const mediumHeight = await header.evaluate(el => el.getBoundingClientRect().height);

    await page.getByTestId('size-large').click();
    const largeHeight = await header.evaluate(el => el.getBoundingClientRect().height);

    expect(largeHeight).toBeGreaterThan(mediumHeight);
    expect(largeHeight - mediumHeight).toBeCloseTo(20, 0); // 10px top + 10px bottom
  });

  test('clicking Small returns header to original height', async ({ page }) => {
    const header = page.getByTestId('header');
    const smallHeight = await header.evaluate(el => el.getBoundingClientRect().height);

    await page.getByTestId('size-large').click();
    await page.getByTestId('size-small').click();

    const backToSmall = await header.evaluate(el => el.getBoundingClientRect().height);
    expect(backToSmall).toBe(smallHeight);
  });

  test('active size button is highlighted', async ({ page }) => {
    await page.getByTestId('size-large').click();

    const largeBg = await page.getByTestId('size-large')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    const smallBg = await page.getByTestId('size-small')
      .evaluate(el => getComputedStyle(el).backgroundColor);

    expect(largeBg).toBe('rgb(0, 122, 255)');   // active — blue
    expect(smallBg).not.toBe('rgb(0, 122, 255)'); // inactive — grey
  });
});
