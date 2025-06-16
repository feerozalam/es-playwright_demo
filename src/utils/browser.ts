import { chromium, firefox, webkit, Page, Browser, BrowserType, _android, AndroidDevice } from '@playwright/test';
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
  userAgent?: string;
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
  private static device: AndroidDevice | null = null;

  private static isAndroidSession(): boolean {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
    return browserName.includes('android');
  }

  private static getBrowserType(): BrowserType {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';

    // Handle BrowserStack specific browsers
    if (process.env.ENV === 'browserstack') {
      if (browserName.includes('safari')) {
        return webkit;
      }
      // Android or other browsers use chromium
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
    const timestamp = new Date().toISOString();

    const baseCapabilities: BrowserStackCapabilities = {
      ...browserStackConfig.capabilities,
      ...browserEnv,
      'browserstack.debug': true,
      'browserstack.console': 'verbose',
      name: `Test Run - ${timestamp}`,
      build: `${browserName} Build ${timestamp}`,
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
          source: 'playwright-mobile',
          debug: true,
          networkLogs: true,
          consoleLogs: 'verbose',
          realMobile: true,
        }
      };
    }

    return baseCapabilities;
  }


  public static async getPage(): Promise<Page> {
    try {
      // If we have a valid page, return it
      if (this.page) {
        try {
          // Test if the page is still usable
          await this.page.evaluate(() => true);
          return this.page;
        } catch (error) {
          logger.info('Existing page is no longer valid, creating new one');
          this.page = null;
        }
      }

      if (!this.browser) {
        const browserType = this.getBrowserType();
        const isAndroid = this.isAndroidSession();
        logger.info(`Initializing browser with type: ${browserType.name()}, isAndroid: ${isAndroid}`);

        if (process.env.ENV === 'browserstack') {
          const caps = this.getBrowserStackCapabilities();

          // Construct the WebSocket endpoint based on device type          
          const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;

          logger.info('Connecting to BrowserStack...', {
            platform: isAndroid ? 'Android' : caps.os,
            browser: caps.browser,
            capabilities: caps,
            wsEndpoint
          });

          const maxRetries = 3;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              // Connect to BrowserStack with longer timeout for mobile devices
              if (isAndroid) {
                const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
                this.device = await _android.connect(wsEndpoint, { timeout: 180000 });
                await this.device.shell('am force-stop com.android.chrome');
                break;
              }
              else {
                this.browser = await browserType.connect({
                  wsEndpoint,
                  timeout: 120000,
                  headers: {
                    'Authorization': `Basic ${Buffer.from(`${browserStackConfig.user}:${browserStackConfig.key}`).toString('base64')}`
                  }
                });
                break;
              }
            }
            catch (error) {
              lastError = error;
              logger.warn(`Connection attempt ${attempt} failed:`, error);
              if (attempt === maxRetries) {
                throw new Error(`Failed to connect after ${maxRetries} attempts: ${error && typeof error === 'object' && 'message' in error ? (error as Error).message : String(error)}`);
              }
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            }
          }
        } else {
          this.browser = await browserType.launch({
            headless: process.env.HEADLESS !== 'false'
          });
        }
      }
      if (!this.context) {
        const isAndroid = this.isAndroidSession();

        if (!this.browser) {
          throw new Error('Browser instance is null when trying to create a context.');
        }

        if (isAndroid && process.env.ENV === 'browserstack') {
          // For Android, create a context with mobile-specific settings
          this.context = await this.browser.newContext({
            viewport: { width: 360, height: 740 },
            deviceScaleFactor: 2,
            isMobile: true,
            userAgent: 'Mozilla/5.0 (Linux; Android 13.0; Samsung Galaxy S23) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
          });
        } else {
          this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
          });
        }
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
  } static async closeBrowser(): Promise<void> {
    try {
      // Close in reverse order of creation
      if (this.page) {
        try {
          await this.page.close().catch(() => { });
        } catch (err) {
          logger.warn('Non-critical error while closing page', { error: err });
        } finally {
          this.page = null;
        }
      }

      if (this.context) {
        try {
          // Simple close without validation to avoid protocol errors
          await Promise.resolve(this.context.close()).catch(() => { });
        } catch (err) {
          logger.warn('Non-critical error while closing context', { error: err });
        } finally {
          this.context = null;
        }
      }

      if (this.browser) {
        try {
          const isConnected = this.browser.isConnected();
          if (isConnected) {
            await Promise.resolve(this.browser.close()).catch(() => { });
          }
        } catch (err) {
          logger.warn('Non-critical error while closing browser', { error: err });
        } finally {
          this.browser = null;
        }
      }

      logger.info('Browser cleanup completed');
    } catch (error) {
      logger.error('Error during browser cleanup', { error });
    }
  }
}
