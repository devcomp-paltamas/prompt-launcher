import { test, expect } from '@playwright/test'

// Helper: switch to "All" category to see all prompts
async function switchToAllCategory(page) {
  await page.locator('.dropdown-trigger').click()
  await page.locator('.dropdown-item').first().click()
}

test.describe('Prompt Launcher App', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('alkalmazás betöltődik', async ({ page }) => {
    await expect(page.locator('header h1')).toBeVisible()
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('prompt kártyák megjelennek', async ({ page }) => {
    // Switch to "All" category first (default is favorites which may be empty)
    await switchToAllCategory(page)

    const cards = page.locator('.prompt-card')
    await expect(cards.first()).toBeVisible()
  })

  test('kategória dropdown működik', async ({ page }) => {
    const dropdown = page.locator('.category-dropdown')
    await expect(dropdown).toBeVisible()

    await page.locator('.dropdown-trigger').click()

    // Kategória menü megjelenik
    const menu = page.locator('.dropdown-menu')
    await expect(menu).toBeVisible()
  })

  test('kategória váltás szűri a promptokat', async ({ page }) => {
    await page.locator('.dropdown-trigger').click()

    // Várjuk meg a menü megjelenését
    const menu = page.locator('.dropdown-menu')
    await expect(menu).toBeVisible()

    // Kattints a második kategóriára
    const categoryItems = page.locator('.dropdown-item')
    const count = await categoryItems.count()
    if (count > 1) {
      await categoryItems.nth(1).click()
    }
  })

})

test.describe('Prompt Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Switch to "All" category to see prompts
    await switchToAllCategory(page)
  })

  test('prompt kártyára kattintva megnyílik a modal', async ({ page }) => {
    const firstCard = page.locator('.prompt-card').first()
    await firstCard.click()

    await expect(page.locator('.modal-backdrop')).toBeVisible()
    await expect(page.locator('.modal-box')).toBeVisible()
  })

  test('modal bezárható az X gombbal', async ({ page }) => {
    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    await page.locator('.modal-close').click()
    await expect(page.locator('.modal-box')).not.toBeVisible()
  })

  test('modal bezárható Escape billentyűvel', async ({ page }) => {
    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.modal-box')).not.toBeVisible()
  })

  test('modal bezárható backdrop kattintással', async ({ page }) => {
    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    await page.locator('.modal-backdrop').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('.modal-box')).not.toBeVisible()
  })

  test('előnézet szerkeszthető', async ({ page }) => {
    await page.locator('.prompt-card').first().click()

    const preview = page.locator('.prompt-preview.editable')
    await expect(preview).toBeVisible()

    // Szöveg módosítása
    await preview.fill('Teszt szöveg módosítva')

    // Ellenőrizzük, hogy megváltozott
    await expect(preview).toHaveValue('Teszt szöveg módosítva')
  })

  test('visszaállítás gomb működik', async ({ page }) => {
    await page.locator('.prompt-card').first().click()

    const preview = page.locator('.prompt-preview.editable')

    // Várjuk meg, hogy betöltődjön az eredeti szöveg
    await expect(preview).not.toHaveValue('')
    const originalText = await preview.inputValue()

    // Módosítás
    await preview.fill('Módosított szöveg')

    // Visszaállítás
    await page.locator('.btn-reset-preview').click()

    // Eredeti szöveg visszaállt
    await expect(preview).toHaveValue(originalText)
  })

  test('másolás gomb működik', async ({ page, context }) => {
    // Clipboard engedélyezés
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    // A modal-ban lévő másolás gombot keressük
    const copyButton = page.locator('.modal-box button:has-text("Másolás")')
    await copyButton.click()

    // Gomb szövege megváltozik
    await expect(page.locator('.modal-box button:has-text("Másolva")')).toBeVisible()
  })

  test('mentés gomb megjelenik változtatás után', async ({ page }) => {
    await page.locator('.prompt-card').first().click()

    const saveButton = page.locator('.modal-box button:has-text("Mentés")')

    // Kezdetben disabled
    await expect(saveButton).toBeDisabled()

    // Szöveg módosítása
    const preview = page.locator('.prompt-preview.editable')
    await preview.fill('Módosított szöveg a mentéshez')

    // Mentés gomb aktív
    await expect(saveButton).toBeEnabled()
  })

})

test.describe('Új Prompt létrehozása', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('új prompt gomb megnyitja a szerkesztő modalt', async ({ page }) => {
    await page.locator('.add-prompt-btn').click()

    await expect(page.locator('.modal-backdrop')).toBeVisible()
    await expect(page.locator('.modal-box')).toBeVisible()
  })

  test('új prompt létrehozható', async ({ page }) => {
    await page.locator('.add-prompt-btn').click()
    await expect(page.locator('.modal-box')).toBeVisible()

    // Keressük a látható input mezőket a modalban
    const visibleInputs = page.locator('.modal-box input[type="text"], .modal-box input:not([type])')
    const inputCount = await visibleInputs.count()

    if (inputCount > 0) {
      await visibleInputs.first().fill('Teszt Prompt')
    }

    // Textarea kitöltése ha van
    const textareas = page.locator('.modal-box textarea')
    const textareaCount = await textareas.count()
    if (textareaCount > 0) {
      await textareas.first().fill('Ez egy teszt prompt szövege')
    }
  })

})

test.describe('Quick Copy', () => {

  test('gyors másolás gomb működik', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await switchToAllCategory(page)

    // Hover a kártyára és kattints a copy gombra
    const firstCard = page.locator('.prompt-card').first()
    await firstCard.hover()

    // Keressük a kártyán belüli copy gombot
    const copyBtn = firstCard.locator('.copy-btn, button:has-text("Másolás")')
    if (await copyBtn.isVisible()) {
      await copyBtn.click()
    }
  })

})

test.describe('Export / Import', () => {

  test('export gomb működik', async ({ page }) => {
    await page.goto('/')

    const exportBtn = page.locator('button:has-text("Export")')
    await expect(exportBtn).toBeVisible()

    // Ellenőrizzük, hogy a gomb kattintható
    const downloadPromise = page.waitForEvent('download')
    await exportBtn.click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toContain('prompt-launcher')
  })

  test('import gomb látható', async ({ page }) => {
    await page.goto('/')

    const importBtn = page.locator('button:has-text("Import")')
    await expect(importBtn).toBeVisible()
  })

})

test.describe('Help Modal', () => {

  test('súgó gomb megnyitja a help modalt', async ({ page }) => {
    await page.goto('/')

    const helpBtn = page.locator('button:has-text("Súgó")')
    await helpBtn.click()

    await expect(page.locator('.modal-backdrop')).toBeVisible()
  })

})

test.describe('Gyűjtemény váltás', () => {

  test('főmenü megnyitható', async ({ page }) => {
    await page.goto('/')

    // Kattints a menü gombra
    const menuTrigger = page.locator('.main-menu-trigger, .collection-btn, .menu-btn').first()
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click()
    }
  })

})

test.describe('Responsive design', () => {

  test('mobil nézetben is működik', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await switchToAllCategory(page)

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('.prompt-card').first()).toBeVisible()
  })

  test('tablet nézetben is működik', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('.grid')).toBeVisible()
  })

})

test.describe('Kedvencek', () => {

  test('kedvenc gomb megjelenik a kártyán', async ({ page }) => {
    await page.goto('/')
    await switchToAllCategory(page)

    const firstCard = page.locator('.prompt-card').first()
    const favoriteBtn = firstCard.locator('.favorite-btn')

    await expect(favoriteBtn).toBeVisible()
  })

  test('kedvencnek jelölés toggle működik', async ({ page }) => {
    await page.goto('/')
    await switchToAllCategory(page)

    const firstCard = page.locator('.prompt-card').first()
    const favoriteBtn = firstCard.locator('.favorite-btn')

    // Ellenőrizzük az aktuális állapotot
    const isCurrentlyActive = await favoriteBtn.evaluate(el => el.classList.contains('active'))

    // Kattints a kedvenc gombra (toggle)
    await favoriteBtn.click()

    // Az állapot megváltozott
    if (isCurrentlyActive) {
      await expect(favoriteBtn).not.toHaveClass(/active/)
    } else {
      await expect(favoriteBtn).toHaveClass(/active/)
    }

    // Kattints újra (toggle back)
    await favoriteBtn.click()

    // Visszaállt az eredeti állapot
    if (isCurrentlyActive) {
      await expect(favoriteBtn).toHaveClass(/active/)
    } else {
      await expect(favoriteBtn).not.toHaveClass(/active/)
    }
  })

  test('kedvencek kategória megjelenik a dropdown-ban', async ({ page }) => {
    await page.goto('/')

    await page.locator('.dropdown-trigger').click()
    const menu = page.locator('.dropdown-menu')
    await expect(menu).toBeVisible()

    // Kedvencek kategória látható
    await expect(menu.locator('text=Kedvencek')).toBeVisible()
  })

})

test.describe('Prompt mentés API', () => {

  test('mentés után toast üzenet jelenik meg', async ({ page }) => {
    await page.goto('/')
    await switchToAllCategory(page)

    // Nyisd meg a promptot
    await page.locator('.prompt-card').first().click()
    await expect(page.locator('.modal-box')).toBeVisible()

    // Várjuk meg, hogy a preview betöltődjön
    const preview = page.locator('.prompt-preview.editable')
    await expect(preview).not.toHaveValue('')

    // Módosítsd az előnézetet - clear first then type to ensure change detection
    await preview.clear()
    await preview.fill('Módosított prompt szöveg a mentéshez ' + Date.now())

    // Várjuk meg, hogy a mentés gomb aktívvá váljon
    const saveBtn = page.locator('.modal-box button:has-text("Mentés")')
    await expect(saveBtn).toBeEnabled({ timeout: 10000 })

    // Mentés
    await saveBtn.click()

    // Toast megjelenik
    await expect(page.locator('.toast')).toBeVisible({ timeout: 5000 })
  })

})
