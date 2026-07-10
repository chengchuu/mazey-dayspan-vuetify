import { expect, test } from '@playwright/test'

test('navigate, change views, create, edit and remove an event', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name:/July 2026/i })).toBeVisible()
  await page.getByRole('button', { name:'Next' }).click()
  await page.getByRole('button', { name:'Week', exact:true }).click()
  await page.getByRole('button', { name:/Fri/ }).first().dblclick()
  await expect(page.getByText('Create event')).toBeVisible()
  await page.getByLabel('Title').fill('E2E event')
  await page.getByRole('button', { name:'Save' }).click()
  await page.getByRole('button', { name:/E2E event/ }).click()
  await expect(page.getByText('Edit event')).toBeVisible()
  await page.getByLabel('Title').fill('Updated event')
  await page.getByRole('button', { name:'Save' }).click()
  await page.getByRole('button', { name:/Updated event/ }).click()
  await page.getByRole('button', { name:'Delete event' }).click()
  await expect(page.getByRole('button', { name:/Updated event/ })).toHaveCount(0)
})

test('shows generated recurring occurrences in agenda', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name:'Agenda', exact:true }).click()
  await expect(page.getByRole('button', { name:/Weekly review/ })).toHaveCount(4)
})

test('toolbar remains keyboard operable on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('/')
  await page.getByRole('button', { name:'Today' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name:'Next' })).toBeFocused()
})
