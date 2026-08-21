import { test, expect, Page } from '@playwright/test';
import { extractBalance } from './sharedFunctions';

test.describe.configure({ mode: 'default' });

const NEGATIVE_AMOUNT_TRANSFER = -1000;
const CORRECT_AMOUNT_TO_TRANSFER = 1000;
const ZERO_AMOUNT_TO_TRANSFER = 0;

const invalidPhoneNumbers = [
  { phone: "abs", description: "Вместо номера буквы" },
  { phone: "+7922", description: "Неполный номер" },
  { phone: "+792200000000000000000", description: "Слишком длинный номер" },
  { phone: "++++++78978789798", description: "Несколько ведущих +" },
  { phone: "79220000000", description: "Номер  без ведущего +" },
  { phone: "+1234567890abc", description: "Добавлены символы в конец" },
  { phone: "+1a2b3c4d5e6f7g8h9i0j", description: "Мусор в номере" }
]

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost/login');
  await page.getByRole('textbox', { name: "email" }).fill("transfer.user@mail.ru");
  await page.getByRole('textbox', { name: "password" }).fill("user");
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForResponse(response => response.status() == 200)
  await page.getByText('Transfer by phone number').waitFor({ state: 'visible' });
}
)

test('Transfer correct amount to correct number', {
  annotation: [
    { type: 'id', description: 'TRNR-01' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    await page.locator('input[name="phone"]').fill("+79222110007");
    await page.locator('input[name="amount"]').fill(CORRECT_AMOUNT_TO_TRANSFER.toString());
    await page.locator('input[name="purpose"]').fill("Корректный перевод на номер");
    await page.getByRole('button', { name: "Send" }).click();
    await page.locator('.success-text').waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: 'Balance:' }).waitFor({ state: "visible" });
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance - CORRECT_AMOUNT_TO_TRANSFER);
  });

invalidPhoneNumbers.forEach(({ phone, description }) => {
  test(`Transfer correct amount to incorrect number: ${phone}`, {
    annotation: [
      { type: 'id', description: 'TRNR-02' },
      { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
    ]
  },
    async ({ page }) => {
      const startBalance = await extractBalance(page);
      const AMOUNT_TO_TRANSFER = 1000;
      await page.locator('input[name="phone"]').fill(phone);
      await page.locator('input[name="amount"]').fill(AMOUNT_TO_TRANSFER.toString());
      await page.locator('input[name="purpose"]').fill(description);
      await page.getByRole('button', { name: "Send" }).click();
      const resultBalance = await extractBalance(page);
      expect(resultBalance).toBe(startBalance);
    });
});

test('Transfer incorrect amount to correct number', {
  annotation: [
    { type: 'id', description: 'TRNR-03' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    await page.locator('input[name="phone"]').fill("+79222110007");
    await page.locator('input[name="amount"]').fill(NEGATIVE_AMOUNT_TRANSFER.toString());
    await page.locator('input[name="purpose"]').fill("Перевод отрицательной суммы");
    await page.getByRole('button', { name: "Send" }).click();
    const errorSnackbar = page.locator('.snackbar.error');
    await expect(errorSnackbar).toBeVisible({ timeout: 2000 });
    await expect(errorSnackbar).toHaveText('Amount must be greater than zero');
    const balance = await extractBalance(page);
    expect(balance).toBe(startBalance);
  });

test('Transfer correct amount to correct number with not enough', {
  annotation: [
    { type: 'id', description: 'TRNR-02' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    const startBalance = await extractBalance(page);
    const AMOUNT_TO_TRANSFER_WTIH_ADJUST = CORRECT_AMOUNT_TO_TRANSFER + 1000;
    await page.locator('input[name="phone"]').fill("+79222110007");
    await page.locator('input[name="amount"]').fill(AMOUNT_TO_TRANSFER_WTIH_ADJUST.toString());
    await page.locator('input[name="purpose"]').fill("Перевод выше баланса");
    await page.getByRole('button', { name: "Send" }).click();
    const errorSnackbar = page.locator('.snackbar.error');
    await expect(errorSnackbar).toBeVisible({ timeout: 2000 });
    await expect(errorSnackbar).toHaveText('Transfer failed. Check your balance.');
    const balance = await extractBalance(page);
    expect(balance).toBe(startBalance);
  });
