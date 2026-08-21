import { test, expect, Page } from '@playwright/test';
import { extractBalance } from './sharedFunctions';

test.describe.configure({ mode: 'default' });

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost/login');
  await page.getByRole('textbox', { name: "email" }).fill("history.user@mail.ru");
  await page.getByRole('textbox', { name: "password" }).fill("user");
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForResponse(response => response.status() == 200)
  await page.getByText('Transfer by phone number').waitFor({ state: 'visible' });
}
)

async function extractTransactions(page: Page) {
  await page.locator('tbody tr').first().waitFor({ state: 'visible' });

  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  const transactions: { id: string; date: string; status: string; type: string; amount: string }[] = [];

  for (let i = 0; i < rowCount; i++) {
    const cells = rows.nth(i).locator('td');

    const id = await cells.nth(0).textContent() || '';
    const date = await cells.nth(1).textContent() || '';
    const status = await cells.nth(2).textContent() || '';
    const type = await cells.nth(3).textContent() || '';
    const amount = await cells.nth(4).textContent() || '';

    transactions.push({ id, date, status, type, amount });
  };

  return transactions;
};

test('Increase balance with correct amount and check transaction', {
  annotation: [
    { type: 'id', description: 'HIST-01' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const lengthOfStatedTransactions = (await extractTransactions(page)).length;
    await page.getByRole('button', { name: 'Add balance' }).waitFor({ state: 'visible' });
    const BALANCE_TO_TOP_UP = 100;
    const startBalance = await extractBalance(page);
    await page.getByRole('button', { name: 'Add balance' }).click();
    await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString());
    await page.locator('.modal .confirm-btn').click();
    await page.reload();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance + BALANCE_TO_TOP_UP);

    const transactions = await extractTransactions(page);
    expect(transactions.length).toBe(lengthOfStatedTransactions + 1);
    const transaction = transactions[0];
    expect(transaction.type).toBe("deposit");
    expect(transaction.amount).toBe(BALANCE_TO_TOP_UP.toString());
    expect(transaction.status).toBe("completed");
  }
);

test('Increase balance with incorrect amount and check transaction', {
  annotation: [
    { type: 'id', description: 'HIST-02' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const lengthOfStatedTransactions = (await extractTransactions(page)).length;
    await page.getByRole('button', { name: 'Add balance' }).waitFor({ state: 'visible' });
    const BALANCE_TO_TOP_UP = -100;
    const startBalance = await extractBalance(page);
    await page.getByRole('button', { name: 'Add balance' }).click();
    await page.locator('input[name="balance"]').fill(BALANCE_TO_TOP_UP.toString());
    await page.locator('.modal .confirm-btn').click();
    await page.reload();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance);

    const transactions = await extractTransactions(page);
    expect(transactions.length).toBe(lengthOfStatedTransactions);
  });

test('Check transaction after correct transfer', {
  annotation: [
    { type: 'id', description: 'HIST-03' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const lengthOfStatedTransactions = (await extractTransactions(page)).length;
    const startBalance = await extractBalance(page);

    await page.getByRole('link', { name: 'Main' }).click();
    await page.getByText('Transfer by phone number').waitFor({ state: 'visible' });

    const AMOUNT_TO_TRANSFER = 1000;
    await page.locator('input[name="phone"]').fill("+79222110007");
    await page.locator('input[name="amount"]').fill(AMOUNT_TO_TRANSFER.toString());
    await page.locator('input[name="purpose"]').fill("Корректный перевод на номер");
    await page.getByRole('button', { name: "Send" }).click();
    await page.locator('.success-text').waitFor({ state: 'visible' });

    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance - AMOUNT_TO_TRANSFER);
    const transactions = await extractTransactions(page);
    expect(transactions.length).toBe(lengthOfStatedTransactions + 1);
    const transaction = transactions[0];
    expect(transaction.type).toBe("withdrawal");
    expect(transaction.amount).toBe(AMOUNT_TO_TRANSFER.toString());
    expect(transaction.status).toBe("completed");
  });

test('Check transaction after incorrect transfer', {
  annotation: [
    { type: 'id', description: 'HIST-03' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]
},
  async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const lengthOfStatedTransactions = (await extractTransactions(page)).length;
    const startBalance = await extractBalance(page);

    await page.getByRole('link', { name: 'Main' }).click();
    await page.getByText('Transfer by phone number').waitFor({ state: 'visible' });

    const AMOUNT_TO_TRANSFER = -1000;
    await page.locator('input[name="phone"]').fill("+79222110007");
    await page.locator('input[name="amount"]').fill(AMOUNT_TO_TRANSFER.toString());
    await page.locator('input[name="purpose"]').fill("Корректный перевод на номер");
    await page.getByRole('button', { name: "Send" }).click();

    const errorSnackbar = page.locator('.snackbar.error');
    await expect(errorSnackbar).toBeVisible({ timeout: 2000 });
    await expect(errorSnackbar).toHaveText('Amount must be greater than zero');

    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.reload();
    const resultBalance = await extractBalance(page);
    expect(resultBalance).toBe(startBalance);
    const transactions = await extractTransactions(page);
    expect(transactions.length).toBe(lengthOfStatedTransactions);
  });
