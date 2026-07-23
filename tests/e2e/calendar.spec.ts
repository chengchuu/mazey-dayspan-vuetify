import { expect, test } from '@playwright/test'

test('navigate, change views, create, edit and remove an event', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name:/July 2026/i })).toBeVisible()
  await page.getByRole('button', { name:'Next' }).click()
  await page.getByRole('button', { name:'Week', exact:true }).click()
  await page.getByRole('button', { name:/Fri/ }).first().focus()
  await page.keyboard.press('Shift+Enter')
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

test('toolbar remains keyboard operable on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This scenario only applies to the mobile project')
  await page.goto('/')
  await page.getByRole('button', { name:'Today' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name:'Next' })).toBeFocused()
})

test('keeps the theme control in the page header and preserves theme switching', async ({ page }) => {
  await page.goto('/')
  const themeControl = page.locator('header').getByRole('checkbox', { name:'Dark mode' })

  await expect(themeControl).toBeVisible()
  await expect(themeControl).not.toBeChecked()
  await themeControl.focus()
  await expect(themeControl).toBeFocused()
  await page.keyboard.press('Space')
  await expect(themeControl).toBeChecked()
  await expect(page.locator('.v-application')).toHaveClass(/v-theme--dark/)
})
