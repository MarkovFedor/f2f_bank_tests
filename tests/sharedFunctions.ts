import {Page} from '@playwright/test'

export async function extractBalance(page: Page) {
    page.reload();
    await page.waitForResponse(
        (resp) => resp.url().includes('/users/balance') && resp.status() === 200,
        { timeout: 10000 }
    );
  const balanceElement = await page.getByRole('heading', { name: /Balance:/ }).textContent();
  const balance = parseInt(balanceElement?.replace('Balance:', '').trim() || '0', 10);
  return balance;
}