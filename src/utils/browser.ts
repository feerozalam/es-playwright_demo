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
  private static browser: Browser | AndroidDevice| null = null;
  private static context: any = null;
  private static page: Page | null = null;
  private static device: AndroidDevice | any | null = null;

  private static isAndroidSession(): boolean {
    const browserName = process.env.BROWSER?.toLowerCase() || 'chrome';
    return browserName.includes('android');
  }

  private static getBrowserType(): BrowserType {
    //TODO : Resolve to contains()
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
    const isIOS = browserName.includes('ios') || browserName.includes('iphone') || browserName.includes('ipad');
    const timestamp = new Date().toISOString();

    // Base BrowserStack-specific capabilities (no app-related fields)
    const baseBrowserStackCaps = {
      'browserstack.local': false,
      'browserstack.debug': true,
      'browserstack.console': 'verbose',
      'browserstack.networkLogs': true,
      'name': `Test Run - ${timestamp}`,
      'build': `${browserName} Build ${timestamp}`,
      'project': 'ES_Playwright_BDD_BS_TS'
    };

    if (isAndroid) {
      // Android web browser testing capabilities
      const androidEnv = browserEnv as any;
      
      return {
        ...baseBrowserStackCaps,
        'device': androidEnv.device || 'Samsung Galaxy S22',
        'os_version': androidEnv.os_version || '12.0',
        'browser': androidEnv.browser || 'chrome',
        'realMobile': true,
        'bstack:options': {
          'debug': true,
          'networkLogs': true,
          'consoleLogs': 'verbose',
          'deviceName': androidEnv.device || 'Samsung Galaxy S22',
          'osVersion': androidEnv.os_version || '12.0',
          'platformName': 'android',
          'browserName': androidEnv.browser || 'chrome'
        }
      };
    }

    if (isIOS) {
      // iOS web browser testing capabilities - NO app-related fields
      const iosEnv = browserEnv as any;
      
      return {
        ...baseBrowserStackCaps,
        'device': iosEnv.device || 'iPhone 14',
        'os_version': iosEnv.os_version || '16',
        'browser': 'safari', // iOS web testing always uses Safari
        'realMobile': true,
        'bstack:options': {
          'debug': true,
          'networkLogs': true,
          'consoleLogs': 'verbose',
          'deviceName': iosEnv.device || 'iPhone 14',
          'osVersion': iosEnv.os_version || '16',
          'platformName': 'ios',
          'browserName': 'safari'
        }
      };
    }

    // Desktop browser capabilities
    return {
      ...baseBrowserStackCaps,
      'browser': browserEnv.browser || 'chrome',
      'browser_version': browserEnv.browser_version || 'latest',
      'os': browserEnv.os || 'Windows',
      'os_version': browserEnv.os_version || '10',
      'resolution': '1920x1080',
      'bstack:options': {
        'debug': true,
        'networkLogs': true,
        'consoleLogs': 'verbose'
      }
    };
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
            platform: isAndroid ? 'Android' : (caps as any).os || 'Unknown',
            browser: (caps as any).browser,
            capabilities: caps,
            wsEndpoint
          });

          const maxRetries = 5;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              // Connect to BrowserStack with longer timeout for mobile devices
              if (isAndroid) {
                const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
                this.device = await _android.connect(wsEndpoint, { 
                  timeout: 180000,
                  headers: {
                    'Authorization': `Basic ${Buffer.from(`${browserStackConfig.user}:${browserStackConfig.key}`).toString('base64')}`
                  }
                });
                this.context = await this.device.launchBrowser();
                break;
              } else {
                this.browser = await browserType.connect({
                  wsEndpoint,
                  timeout: 180000,
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
              await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before retry
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

        // Only call newContext if this.browser is a Browser, not AndroidDevice
        if (!isAndroid && 'newContext' in this.browser) {
          this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
          });
        } else if (isAndroid && process.env.ENV === 'browserstack') {
          // For Android, context is already set via this.device.launchBrowser()
          // No action needed here
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
    console.log('BrowserManager.closeBrowser() called');
    try {
      // Close in reverse order of creation
      if (this.page) {
        console.log('Closing page...');
        try {
          await this.page.close().catch(() => { });
          console.log('Page closed successfully');
        } catch (err) {
          logger.warn('Non-critical error while closing page', { error: err });
        } finally {
          this.page = null;
        }
      }

      if (this.context) {
        console.log('Closing context...');
        try {
          // Simple close without validation to avoid protocol errors
          await Promise.resolve(this.context.close()).catch(() => { });
          console.log('Context closed successfully');
        } catch (err) {
          logger.warn('Non-critical error while closing context', { error: err });
        } finally {
          this.context = null;
        }
      }

      if (this.browser) {
        console.log('Closing browser...');
        try {
          if ('isConnected' in this.browser && typeof this.browser.isConnected === 'function') {
            const isConnected = this.browser.isConnected();
            console.log(`Browser connected status: ${isConnected}`);
            if (isConnected) {
              await Promise.resolve(this.browser.close()).catch(() => { });
            }
          } else {
            // For AndroidDevice, just attempt to close
            await Promise.resolve(this.browser.close()).catch(() => { });
          }
          console.log('Browser closed successfully');
        } catch (err) {
          logger.warn('Non-critical error while closing browser', { error: err });
        } finally {
          this.browser = null;
        }
      }

      if (this.device) {
        console.log('Closing Android device...');
        try {
          await Promise.resolve(this.device.close()).catch(() => { });
          console.log('Android device closed successfully');
        } catch (err) {
          logger.warn('Non-critical error while closing device', { error: err });
        } finally {
          this.device = null;
        }
      }

      logger.info('Browser cleanup completed');
      console.log('BrowserManager.closeBrowser() completed');
    } catch (error) {
      logger.error('Error during browser cleanup', { error });
      console.error('BrowserManager.closeBrowser() failed:', error);
    }
  }
}
