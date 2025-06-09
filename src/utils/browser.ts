import { chromium, firefox, webkit, Page, Browser, BrowserType } from '@playwright/test';
import { browserStackConfig } from '../config/browserstack.config';
import { config } from '../config/env.config';
import { logger } from './logger';

type BrowserEnv = typeof browserStackConfig.environments[keyof typeof browserStackConfig.environments];

export class BrowserManager {
  private static browser: Browser | null = null;
  private static page: Page | null = null;
  private static getBrowser(): BrowserType {
    if (process.env.ENV === 'browserstack') {
      const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
      if (browserName.includes('safari')) {
        return webkit;
      }
      return chromium;
    }

    switch (config.browser.toLowerCase()) {
      case 'firefox':
        return firefox;
      case 'webkit':
      case 'safari':
        return webkit;
      default:
        return chromium;
    }
  }

  static async getPage(): Promise<Page> {
    if (!this.browser) {
      const browserType = this.getBrowser();
      if (process.env.ENV === 'browserstack') {
        const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
        const browserEnv = browserStackConfig.environments[browserName as keyof typeof browserStackConfig.environments];
        if (!browserEnv) {
          throw new Error(`Unsupported browser environment: ${process.env.BROWSER}`);
        }

        const caps = {
          ...browserStackConfig.capabilities,
          ...browserEnv
        };

        const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
        
        logger.info('Connecting to BrowserStack...', { caps });
        this.browser = await browserType.connect(wsEndpoint, { 
          timeout: 120000,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${browserStackConfig.user}:${browserStackConfig.key}`).toString('base64')}`
          }
        });
        logger.info('Connected to BrowserStack successfully');
      } else {
        this.browser = await browserType.launch({ headless: false });
      }
    }

    if (!this.page) {
      const context = await this.browser.newContext({
        viewport: process.env.BROWSER?.toLowerCase().includes('phone') 
          ? { width: 375, height: 812 } 
          : config.viewport
      });
      await context.setDefaultTimeout(60000);
      await context.setDefaultNavigationTimeout(60000);
      this.page = await context.newPage();
    }

    return this.page;
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
