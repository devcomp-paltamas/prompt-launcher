import { test, expect } from '@playwright/test'

async function switchToAllCategory(page) {
  await page.locator('.dropdown-trigger').click()
  await page.locator('.dropdown-item').first().click()
}

async function openHomeInStableState(page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await switchToAllCategory(page)
  await expect(page.locator('.prompt-card').first()).toBeVisible()
}

test.describe('Visual Regression', () => {
  test('desktop kezdőoldal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openHomeInStableState(page)

    await expect(page).toHaveScreenshot('home-desktop.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    })
  })

  test('desktop modal nézet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openHomeInStableState(page)
    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    await expect(page).toHaveScreenshot('modal-desktop.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    })
  })

  test('mobil kezdőoldal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openHomeInStableState(page)

    await expect(page).toHaveScreenshot('home-mobile.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    })
  })
})
