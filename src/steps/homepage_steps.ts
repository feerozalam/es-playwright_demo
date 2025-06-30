import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { logger } from '../utils/logger';

Given('I am on the home page', { timeout: 180000 }, async function() {
    if (!this.page) {
        throw new Error('Page not available in test context');
    }
    
    const homePage = new HomePage(this.page);
    await homePage.open();
    await homePage.waitForPageLoad();
    
    // Store for reuse in other steps
    this.homePage = homePage;
    logger.info('Successfully navigated to home page');
});

Then("I should see the 'Rent Equipment' button in the home page", async function() {
    const homePage = this.homePage || new HomePage(this.page);
    await homePage.verifyElementDisplay(homePage.getRentEquipmentButton, 100000);
    logger.info('Rent Equipment button verified');
});

Then("I should see the 'Explore T3' button in the home page", async function() {
    const homePage = this.homePage || new HomePage(this.page);
    await homePage.verifyElementDisplay(homePage.getExploreT3Button, 100000);
    logger.info('Explore T3 button verified');
});

Then("I should see the 'Sign In' button in the home page", async function() {
    const homePage = this.homePage || new HomePage(this.page);
    await homePage.verifyElementDisplay(homePage.getSignInButton, 100000);
    logger.info('Sign In button verified');
});

When("I click on the 'User Icon' button", { timeout: 100000 }, async function() {
    const homePage = this.homePage || new HomePage(this.page);
    await homePage.waitForClickable(homePage.getUserIconButton);
    await homePage.getUserIconButton.click();
    logger.info('User Icon button clicked');
});

When("I click on the 'Sign In' button", { timeout: 100000 }, async function() {
    const homePage = this.homePage || new HomePage(this.page);
    await homePage.waitForClickable(homePage.getSignInButton);
    await homePage.getSignInButton.click();
    logger.info('Sign In button clicked');
});

