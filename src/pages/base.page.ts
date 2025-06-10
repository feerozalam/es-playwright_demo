import { Locator, Page, expect } from '@playwright/test';
import { config } from '../config/env.config';

export class BasePage {
  constructor(protected page: Page) { } async navigate(endpoint: string) {
    await this.page.goto(`${config.baseUrl}${endpoint}`, {
      timeout: process.env.ENV === 'browserstack' ? 120000 : 30000,
      waitUntil: 'load'
    });
  }
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: 30000
    });
  }

  async click(selector: string) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async fill(selector: string, text: string) {
    await this.waitForElement(selector);
    await this.page.fill(selector, text);
  }

  async getText(selector: string) {
    await this.waitForElement(selector);
    return await this.page.innerText(selector);
  }

  async waitForPageLoad() {
    const timeout = process.env.ENV === 'browserstack' ? 120000 : 30000;
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      await this.page.waitForTimeout(1000); // Small delay to ensure basic interactivity
    } catch (error) {
      console.warn('Page load timeout, continuing with test...');
    }
  }

  async verifyElementDisplay(element: Locator, timeoutVal: number = process.env.ENV === 'browserstack' ? 30000 : 5000) {
    try {
      await element.waitFor({ state: 'visible', timeout: timeoutVal });
      await expect(element).toBeVisible();
      console.log(" Element is displayed");
    } catch (error) {
      console.log("ERROR: Element is not displayed");
      return false;
    }
  }

  async waitForClickable(element: Locator, timeoutVal: number = process.env.ENV === 'browserstack' ? 30000 : 5000) {
    await element.waitFor({ state: 'visible', timeout: timeoutVal });
    // Add a small delay for BrowserStack since elements might need time to be truly interactive
    if (process.env.ENV === 'browserstack') {
      await this.page.waitForTimeout(1000);
    }
    await element.waitFor({ state: 'attached', timeout: timeoutVal });
  }

}
