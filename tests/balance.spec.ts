import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'default' });

test.beforeEach(async({page}, testInfo) => {
    await page.goto('http://localhost/login');
    await page.getByRole('textbox', {name: "email"}).fill("balance.user@mail.ru");
    await page.getByRole('textbox', {name: "password"}).fill("user");
    await page.getByRole('button', {name: 'Login'}).click();
    await page.waitForResponse(response => response.status() == 200)
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const html = await page.content();
    await testInfo.attach('page-html', { body: html, contentType: 'text/html' });
    await page.getByRole('button', { name: 'Add balance' }).waitFor({ state: 'visible' });
  }
)

/*test.afterEach(async({page}, testInfo)=> {
  const modal = page.locator('.modal');
  if (await modal.isVisible()) {
    await modal.locator('.cancel-btn').click();
  }
  const button = page.getByRole('button').filter({ hasText: /^$/ });
  if (await button.isVisible()) {
    await button.click();
  }
})*/

async function extractBalance(page: Page) {
  const balanceElement = await page.getByRole('heading', { name: /Balance:/ }).textContent();
  console.log(balanceElement);
  const balance = parseInt(balanceElement?.replace('Balance:', '').trim() || '0', 10);
  return balance;
}

test('Balance top up for available amount',   {
  annotation: [
    { type: 'id', description: 'BLNC-01' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  const BALANCE_TO_TOP_UP = 10000;
  const startBalance = await extractBalance(page);
  await page.getByRole('button', { name: 'Add balance' }).click();
  await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString());
  await page.locator('.modal .confirm-btn').click();
  await page.reload();
  const resultBalance = await extractBalance(page);
  expect(resultBalance).toBe(startBalance + BALANCE_TO_TOP_UP);
});

test('Balance top up for negative amount',   {
  annotation: [
    { type: 'id', description: 'BLNC-02' },
    { type: 'issue', description: '' }
  ]},
  async ({ page }) => {
  const BALANCE_TO_TOP_UP = -10000;
  const startBalance = await extractBalance(page);
  await page.getByRole('button', { name: 'Add balance' }).click();
  await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString());
  await page.locator('.modal .confirm-btn').click();
  await page.reload();
  const resultBalance = await extractBalance(page);
  expect(resultBalance).toBe(startBalance);
});

test('Balance top up for 0 amount',   {
  annotation: [
    { type: 'id', description: 'BLNC-03' },
    { type: 'issue', description: '' }
  ]},
  async ({ page }) => {
  const BALANCE_TO_TOP_UP = 0;
  const startBalance = await extractBalance(page);
  await page.getByRole('button', { name: 'Add balance' }).click();
  await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString());
  await page.locator('.modal .confirm-btn').click();
  await page.reload();
  const resultBalance = await extractBalance(page);
  expect(resultBalance).toBe(startBalance);
});

test('Balance top up for amount of wrong type',   {
  annotation: [
    { type: 'id', description: 'BLNC-04' },
    { type: 'issue', description: '' }
  ]},
  async ({ page }) => {
  const BALANCE_TO_TOP_UP = "a";
  const startBalance = await extractBalance(page);
  await page.getByRole('button', { name: 'Add balance' }).click();
  await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString(), {force: true});
  await page.locator('.modal .confirm-btn').click();
  await expect(async() => {
    await page.reload();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance);
  }).toPass({
    timeout: 10000,
    intervals: [100, 250, 500, 1000],
  })
});