import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../config/env.config';
import { BrowserManager } from '../utils/browser';
import { EquipmentRentalPage } from '../pages/equipment-rental.page';
import { logger } from '../utils/logger';

Given('I navigate to the Equipment Rental home page', { timeout: config.test.defaultTimeout }, async function () {
  try {
    const page = await BrowserManager.getPage();
    if (!page) {
      throw new Error('Failed to get valid page from BrowserManager');
    }
    
    const equipmentRentalPage = new EquipmentRentalPage(page);
    logger.info('Navigating to Equipment Rental home page...');
    await equipmentRentalPage.navigate();
    logger.info('Navigation completed');
  } catch (error) {
    logger.error('Navigation failed:', error);
    throw error;
  }
});

Then('I should see the page heading {string}', { timeout: config.test.defaultTimeout }, async function (expectedHeading: string) {
  try {
    const page = await BrowserManager.getPage();
    const equipmentRentalPage = new EquipmentRentalPage(page);
    const actualHeading = await equipmentRentalPage.getPageHeading();
    expect(actualHeading).toBe(expectedHeading);
    logger.info(`Successfully verified page heading: ${expectedHeading}`);
  } catch (error) {
    logger.error(`Failed to verify page heading: ${expectedHeading}`, error);
    throw error;
  }
});
