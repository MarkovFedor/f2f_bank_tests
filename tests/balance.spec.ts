import { test, expect, Page } from '@playwright/test';
import { extractBalance } from './sharedFunctions';

test.describe.configure({ mode: 'default' });

const NEGATIVE_AMOUNT_TO_TOP_UP = -1000;
const CORRECT_AMOUNT_TO_TOP_UP = 1000;
const ZERO_AMOUNT_TO_TOP_UP = 0;

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost/login');
  await page.getByRole('textbox', { name: "email" }).fill("balance.user@mail.ru");
  await page.getByRole('textbox', { name: "password" }).fill("user");
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForResponse(response => response.status() == 200)
  await page.getByRole('link', { name: 'Transactions' }).click();
  await page.getByRole('button', { name: 'Add balance' }).waitFor({ state: 'visible' });
}
)

test('Balance top up for available amount', {
  annotation: [
    { type: 'id', description: 'BLNC-01' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    await page.getByRole('button', { name: 'Add balance' }).click();
    await page.locator('input[name="balance"]').fill(CORRECT_AMOUNT_TO_TOP_UP.toString());
    await page.locator('.modal .confirm-btn').click();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance + CORRECT_AMOUNT_TO_TOP_UP);
  });

test('Balance top up for negative amount', {
  annotation: [
    { type: 'id', description: 'BLNC-02' },
    { type: 'issue', description: '' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    await page.getByRole('button', { name: 'Add balance' }).click();
    await page.locator('input[name="balance"]').fill(NEGATIVE_AMOUNT_TO_TOP_UP.toString());
    await page.locator('.modal .confirm-btn').click();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance);
  });

test('Balance top up for 0 amount', {
  annotation: [
    { type: 'id', description: 'BLNC-03' },
    { type: 'issue', description: '' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    await page.getByRole('button', { name: 'Add balance' }).click();
    await page.locator('input[name="balance"]').fill(ZERO_AMOUNT_TO_TOP_UP.toString());
    await page.locator('.modal .confirm-btn').click();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance);
  });



