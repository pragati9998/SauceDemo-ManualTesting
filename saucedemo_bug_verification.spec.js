// saucedemo.com — Bug Verification Suite
// Covers: BUG_SD_001, BUG_SD_002, BUG_SD_003
//
// Requirements:
//   npm install -D @playwright/test
//   npx playwright install chromium
//
// Run all tests:
//   npx playwright test saucedemo_bug_verification.spec.js --headed
//
// Run a single test by title:
//   npx playwright test --grep "BUG_SD_001"

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.saucedemo.com';
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

// ---------------------------------------------------------------------------
// Helper: log in and land on the inventory page
// ---------------------------------------------------------------------------
async function login(page) {
  await page.goto(BASE_URL);
  await page.fill('#user-name', USERNAME);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);
}

// ---------------------------------------------------------------------------
// Helper: add the first product to the cart and navigate to checkout step one
// ---------------------------------------------------------------------------
async function goToCheckoutStepOne(page) {
  await login(page);
  await page.click('.btn_primary.btn_inventory >> nth=0');   // "Add to cart"
  await page.click('.shopping_cart_link');
  await page.click('[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one/);
}

// ---------------------------------------------------------------------------
// BUG_SD_001 — Zip Code field accepts letters and special characters
// ---------------------------------------------------------------------------
test('BUG_SD_001 — Zip Code accepts non-numeric input without error', async ({ page }) => {
  await goToCheckoutStepOne(page);

  // Fill first name and last name
  await page.fill('[data-test="firstName"]', 'Test');
  await page.fill('[data-test="lastName"]', 'User');

  // Enter clearly invalid postal code values and verify the form accepts them
  const invalidInputs = ['abc', '!@#$%', 'ABC123!', '   '];

  for (const value of invalidInputs) {
    await page.fill('[data-test="postalCode"]', value);
    await page.click('[data-test="continue"]');

    // BUG: form should reject non-numeric / invalid zip but it proceeds instead.
    // We assert the BUG is present — i.e. no validation error is shown.
    const errorBanner = page.locator('[data-test="error"]');
    const errorVisible = await errorBanner.isVisible().catch(() => false);

    if (!errorVisible) {
      // Confirm we moved forward (bug confirmed — no validation fired)
      await expect(page).toHaveURL(/checkout-step-two/);
      console.log(`BUG_SD_001 CONFIRMED: "${value}" was accepted with no validation error.`);
      // Navigate back to step one for the next iteration
      await page.goto(`${BASE_URL}/checkout-step-one.html`);
      await page.fill('[data-test="firstName"]', 'Test');
      await page.fill('[data-test="lastName"]', 'User');
    } else {
      console.log(`Input "${value}" was rejected (validation present — bug may be fixed).`);
    }
  }
});

// ---------------------------------------------------------------------------
// BUG_SD_002 — Sort order resets after returning from a product detail page
// ---------------------------------------------------------------------------
test('BUG_SD_002 — Sort order resets to default when returning from product detail', async ({ page }) => {
  await login(page);

  const sortDropdown = page.locator('.product_sort_container');

  // Change sort to "Price (low to high)"
  await sortDropdown.selectOption('lohi');
  await expect(sortDropdown).toHaveValue('lohi');
  console.log('Sort set to: Price (low to high)');

  // Click through to first product's detail page
  await page.click('.inventory_item_name >> nth=0');
  await expect(page).toHaveURL(/inventory-item/);

  // Go back
  await page.goBack();
  await expect(page).toHaveURL(/inventory/);

  // BUG: sort should still be "lohi" but resets to "az"
  const currentSort = await sortDropdown.inputValue();
  console.log(`Sort after Back navigation: "${currentSort}" (expected "lohi")`);

  if (currentSort !== 'lohi') {
    console.log('BUG_SD_002 CONFIRMED: sort order reset to default after Back navigation.');
    // Soft assertion so test output is descriptive
    expect(currentSort, 'Sort order should persist after Back navigation but it reset').toBe('lohi');
  } else {
    console.log('Sort order persisted — bug may be fixed.');
    expect(currentSort).toBe('lohi');
  }
});

// Also verify with "Name (Z to A)" to be thorough
test('BUG_SD_002 — Sort order resets (Z to A variant)', async ({ page }) => {
  await login(page);

  const sortDropdown = page.locator('.product_sort_container');
  await sortDropdown.selectOption('za');
  await expect(sortDropdown).toHaveValue('za');

  await page.click('.inventory_item_name >> nth=0');
  await page.goBack();
  await expect(page).toHaveURL(/inventory/);

  const currentSort = await sortDropdown.inputValue();
  console.log(`Sort after Back navigation (Z-A variant): "${currentSort}"`);
  expect(currentSort, 'Sort order should persist but reset').toBe('za');
});

// ---------------------------------------------------------------------------
// BUG_SD_003 — Browser Back after completed order shows old Checkout Overview
// ---------------------------------------------------------------------------
test('BUG_SD_003 — Browser Back after order completion shows stale Checkout Overview', async ({ page }) => {
  await goToCheckoutStepOne(page);

  // Fill in checkout info
  await page.fill('[data-test="firstName"]', 'QA');
  await page.fill('[data-test="lastName"]', 'Tester');
  await page.fill('[data-test="postalCode"]', '12345');
  await page.click('[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two/);

  // Capture the Checkout Overview URL before finishing
  const overviewUrl = page.url();
  console.log(`Checkout Overview URL: ${overviewUrl}`);

  // Complete the order
  await page.click('[data-test="finish"]');
  await expect(page).toHaveURL(/checkout-complete/);
  await expect(page.locator('.complete-header')).toContainText('Thank you');
  console.log('Order completed. Now pressing Back...');

  // Press Back — BUG: should redirect to home or show completed state,
  // instead it resurfaces the old Checkout Overview
  await page.goBack();

  const urlAfterBack = page.url();
  console.log(`URL after Back: "${urlAfterBack}"`);

  if (urlAfterBack.includes('checkout-step-two')) {
    console.log('BUG_SD_003 CONFIRMED: Back button returned to Checkout Overview after order completion.');
    // Check that the page actually rendered stale content
    const overviewVisible = await page.locator('[data-test="checkout-summary-container"]').isVisible().catch(() => false);
    if (overviewVisible) {
      console.log('Stale Checkout Overview content is visible — order appears re-entrant.');
    }
    // Fail the assertion to flag the bug explicitly
    expect(urlAfterBack, 'Should not be able to go Back to Checkout Overview after completing order').not.toContain('checkout-step-two');
  } else {
    console.log(`After Back, landed on: "${urlAfterBack}" — may not reproduce in this browser/cache state.`);
  }
});