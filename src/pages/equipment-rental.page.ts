import type { Page } from 'playwright';
import { logger } from '../utils/logger';
import { config } from '../config/env.config';

export class EquipmentRentalPage {
  private page: Page;
  private readonly pageHeadingSelector = 'h1';

  constructor(page: Page) {
    this.page = page;
  }
  async navigate() {
    const url = `${config.baseUrl}/rent`;
    logger.info(`Navigating to URL: ${url}`);
    try {      await this.page.goto(url, { 
        waitUntil: process.env.ENV === 'browserstack' ? 'load' : 'domcontentloaded',
        timeout: config.test.defaultTimeout
      });
      logger.info('Navigation successful');
      
      // Wait for the page to be stable
      await this.page.waitForLoadState(process.env.ENV === 'browserstack' ? 'load' : 'domcontentloaded', { 
        timeout: config.test.defaultTimeout / 2
      }).catch(() => {
        logger.warn('Network did not reach idle state, but continuing...');
      });
    } catch (error) {
      logger.error('Navigation failed:', error);
      throw error;
    }
  }

  async getPageHeading(): Promise<string> {
    try {
      await this.page.waitForSelector(this.pageHeadingSelector, { 
        state: 'visible',
        timeout: config.test.defaultTimeout
      });
      const headingText = await this.page.textContent(this.pageHeadingSelector);
      return headingText?.trim() || '';
    } catch (error) {
      logger.error('Failed to get page heading:', error);
      throw error;
    }
  }
}
