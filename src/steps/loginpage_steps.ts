import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { logger } from '../utils/logger';

Then('I should be navigated to the Login page', { timeout: 60000 }, async function () {
    if (!this.page) {
        throw new Error('Page not available in test context');
    }
    
    const loginPage = new LoginPage(this.page);
    await loginPage.waitForPageLoad();
    await loginPage.waitForClickable(loginPage.getWelcomeHeading);
    await expect(loginPage.getWelcomeHeading).toBeVisible();
    
    this.loginPage = loginPage;
    logger.info('Successfully navigated to Login page');
});

Then('I should see the Email field', { timeout: 30000 }, async function () {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getEmailAddress);
    await expect(loginPage.getEmailAddress).toBeVisible();
    logger.info('Email field is visible');
});

When('I enter {string} in the Email field', { timeout: 30000 }, async function (invalid_email_address: string) {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getEmailAddress);
    await loginPage.getEmailAddress.fill(invalid_email_address);
    logger.info(`Entered email: ${invalid_email_address}`);
});

When('I click on the Continue button', { timeout: 30000 }, async function () {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getContinueButton);
    await loginPage.getContinueButton.click();
    logger.info('Continue button clicked');
});

Then('I should see the Email validation message', { timeout: 30000 }, async function () {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getEmailErrorMessage);
    await expect(loginPage.getEmailErrorMessage).toBeVisible();
    logger.info('Email validation message is visible');
});

Then('I should see the Password field', { timeout: 30000 }, async function () {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getPassword);
    await expect(loginPage.getPassword).toBeVisible();
    logger.info('Password field is visible');
});

Then('I should see the Forgot Password link', { timeout: 30000 }, async function () {
    const loginPage = this.loginPage || new LoginPage(this.page);
    await loginPage.waitForClickable(loginPage.getForgotPasswordLink);
    await expect(loginPage.getForgotPasswordLink).toBeVisible();
    logger.info('Forgot Password link is visible');
});
