import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'default' });

test.beforeEach(async({page}, testInfo) => {
    await page.goto('http://localhost/login');
    await page.getByRole('textbox', {name: "email"}).fill("balance.user@mail.ru");
    await page.getByRole('textbox', {name: "password"}).fill("user");
    await page.getByRole('button', {name: 'Login'}).click();
    await page.waitForResponse(response => response.status() == 200)
    await page.getByRole('link', { name: 'Main' }).click();
    await page.reload();
    const html = await page.content();
    await testInfo.attach('page-html', { body: html, contentType: 'text/html' });
    await page.getByText('Transfer by phone number').waitFor({ state: 'visible' });
  }
)

test('Transfer correct amount to correct number',   {
  annotation: [
    { type: 'id', description: 'TRNR-01' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  
});

test('Transfer correct amount to incorrect number',   {
  annotation: [
    { type: 'id', description: 'TRNR-02' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  
});

test('Transfer incorrect amount to correct number',   {
  annotation: [
    { type: 'id', description: 'TRNR-03' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  
});

test('Transfer incorrect amount to incorrect number',   {
  annotation: [
    { type: 'id', description: 'TRNR-04' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  
});

test('Transfer empty amount to correct number',   {
  annotation: [
    { type: 'id', description: 'TRNR-05' },
    { type: 'issue', description: 'https://docs.google.com/spreadsheets/d/10_uQOl30zzW0tErT7AcuVMNVRa4YzgPUxcB3ZtI3qtY/edit?gid=0#gid=0&range=A2' }
  ]},
  async ({ page }) => {
  
});

