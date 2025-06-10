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

  // Update the Android capabilities in getBrowserStackCapabilities method
  private static getBrowserStackCapabilities() {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
    const browserEnv = browserStackConfig.environments[browserName as keyof typeof browserStackConfig.environments];

    if (!browserEnv) {
      throw new Error(`Unsupported browser environment: ${browserName}`);
    }

    // Add special handling for Android devices
    const isAndroid = process.env.PLATFORM === 'android';
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

  private static getBrowser(): BrowserType {
    const browserName = process.env.BROWSER?.toLowerCase() || config.browser.toLowerCase();
    const isAndroid = process.env.PLATFORM === 'android';

    // For BrowserStack
    if (process.env.ENV === 'browserstack') {
      // Always use chromium for Android devices
      if (isAndroid) {
        return chromium;
      }
      // For iOS/Safari use webkit
      if (browserName.includes('safari')) {
        return webkit;
      }
      return chromium;
    }

    // For local testing
    switch (browserName) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'safari':
        return webkit;
      default:
        return chromium;
    }
  }

  static async getPage(): Promise<Page> {
    try {
      if (!this.browser) {
        const browserType = this.getBrowser();
        const isAndroid = process.env.PLATFORM === 'android';

        if (process.env.ENV === 'browserstack') {
          const caps = this.getBrowserStackCapabilities();

          // Ensure proper capability structure for Android
          const formattedCaps = isAndroid ? {
            ...caps,
            'bstack:options': {
              ...caps['bstack:options'],
              source: 'playwright-cdp' // Required for Android
            }
          } : caps;

          // Simplified endpoint construction for Android
          const wsEndpoint = isAndroid
            ? `wss://cdp.browserstack.com/playwright-cdp/android?caps=${encodeURIComponent(JSON.stringify(caps))}`
            : `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;

          logger.info('Connecting to BrowserStack...', {
            platform: isAndroid ? 'Android' : 'Desktop',
            capabilities: caps,
            wsEndpoint
          });

          this.browser = await browserType.connect({
            wsEndpoint,
            timeout: 120000,
            headers: {
              'Authorization': `Basic ${Buffer.from(`${browserStackConfig.user}:${browserStackConfig.key}`).toString('base64')}`
            }
          });
          logger.info('Connected to BrowserStack successfully');
        } else {
          this.browser = await browserType.launch({ headless: false });
          logger.info('Launched local browser successfully');
        }

      }

      // Create new context and page
      if (!this.context || !this.page) {
        const isMobile = process.env.PLATFORM === 'mobile';
        this.context = await this.browser.newContext({
          viewport: isMobile
            ? { width: 375, height: 812 }
            : config.viewport || { width: 1920, height: 1080 }
        });

        await this.context.setDefaultTimeout(60000);
        await this.context.setDefaultNavigationTimeout(60000);
        this.page = await this.context.newPage();

        logger.info(`Created browser context with ${isMobile ? 'mobile' : 'desktop'} viewport`);
      }

      if (!this.page) {
        throw new Error('Failed to create browser page');
      }

      return this.page;
    } catch (error) {
      logger.error('Error in getPage:', error);
      await this.closeBrowser();
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
