import { chromium, firefox, webkit, Page, Browser, BrowserType } from '@playwright/test';
import { browserStackConfig } from '../config/browserstack.config';
import { config } from '../config/env.config';
import { logger } from './logger';

// Update BStackOptions interface to include required Android properties
interface BStackOptions {
  deviceName?: string;
  osVersion?: string;
  browserName?: string;
  platformName?: string;
  source?: string;
  local?: boolean;
  debug?: boolean;
  networkLogs?: boolean;
  consoleLogs?: string;
}

interface BrowserStackCapabilities {
  'browserstack.debug': boolean;
  'browserstack.console': string;
  'bstack:options': BStackOptions;
  name: string;
  build: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  'browserstack.local'?: boolean;
  project?: string;
}

export class BrowserManager {
  private static browser: Browser | null = null;
  private static context: any = null;
  private static page: Page | null = null;

  private static getBrowserType(): BrowserType {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
    
    // Handle BrowserStack specific browsers
    if (process.env.ENV === 'browserstack') {
      if (browserName.includes('safari')) {
        return webkit;
      }
      // Default to chromium for other BrowserStack browsers
      return chromium;
    }

    // Handle local browsers
    switch (browserName) {
      case 'firefox':
        return firefox;
      case 'webkit':
      case 'safari':
        return webkit;
      default:
        return chromium;
    }
  }

  private static getBrowserStackCapabilities() {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
    const browserEnv = browserStackConfig.environments[browserName as keyof typeof browserStackConfig.environments];

    if (!browserEnv) {
      throw new Error(`Unsupported browser environment: ${browserName}`);
    }

    const isAndroid = browserName.includes('android');
    const baseCapabilities: BrowserStackCapabilities = {
      ...browserStackConfig.capabilities,
      ...browserEnv,
      'browserstack.debug': true,
      'browserstack.console': 'verbose',
      name: `Test Run - ${new Date().toISOString()}`,
      build: `Build ${new Date().toISOString()}`,
      'bstack:options': {
        debug: true,
        networkLogs: true,
        consoleLogs: 'verbose'
      }
    };

    if (isAndroid) {
      return {
        ...baseCapabilities,
        'bstack:options': {
          ...baseCapabilities['bstack:options'],
          deviceName: process.env.DEVICE_NAME || 'Samsung Galaxy S23',
          osVersion: process.env.OS_VERSION || '13.0',
          platformName: 'android',
          browserName: 'chrome',
          source: 'playwright-cdp',
          debug: true,
          networkLogs: true,
          consoleLogs: 'verbose',
          real_mobile: true,
        }
      };
    }

    return baseCapabilities;
  }

  public static async getPage(): Promise<Page> {
    try {
      if (!this.browser) {
        const browserType = this.getBrowserType();
        logger.info(`Initializing browser with type: ${browserType.name()}`);

        if (process.env.ENV === 'browserstack') {
          const caps = this.getBrowserStackCapabilities();
          const isAndroid = process.env.BROWSER?.toLowerCase().includes('android');
          
          // Construct the WebSocket endpoint
          const wsEndpoint = isAndroid
            ? `wss://cdp.browserstack.com/playwright-cdp/android?caps=${encodeURIComponent(JSON.stringify(caps))}`
            : `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;

          logger.info('Connecting to BrowserStack...', {
            platform: isAndroid ? 'Android' : caps.os,
            browser: caps.browser,
            capabilities: caps,
            wsEndpoint
          });

          // For BrowserStack, always use chromium for the CDP connection
          this.browser = await chromium.connect({
            wsEndpoint,
            timeout: 120000,
            headers: {
              'Authorization': `Basic ${Buffer.from(`${browserStackConfig.user}:${browserStackConfig.key}`).toString('base64')}`
            }
          });
        } else {
          this.browser = await browserType.launch({
            headless: process.env.HEADLESS !== 'false'
          });
        }
      }

      if (!this.context) {
        this.context = await this.browser.newContext({
          viewport: { width: 1920, height: 1080 }
        });
      }

      if (!this.page) {
        this.page = await this.context.newPage();
      }

      if (!this.page) {
        throw new Error('Failed to create browser page');
      }

      return this.page;
    } catch (error) {
      logger.error('Failed to initialize browser/page:', error);
      throw error;
    }
  }

  static async closeBrowser(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => { });
        this.page = null;
      }
      if (this.context) {
        await this.context.close().catch(() => { });
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => { });
        this.browser = null;
      }
      logger.info('Browser closed successfully');
    } catch (error) {
      logger.error('Error in closeBrowser:', error);
    }
  }
}
