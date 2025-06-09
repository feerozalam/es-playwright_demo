import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

let loginPage: LoginPage;

Then('I should be navigated to the Login page', { timeout: 60000 }, async function () {
    loginPage = new LoginPage(this.page);
    await loginPage.waitForPageLoad();
    await loginPage.waitForClickable(loginPage.getWelcomeHeading);
    await expect(loginPage.getWelcomeHeading).toBeVisible();
});

Then('I should see the Email field', { timeout: 30000 }, async function () {
    await loginPage.waitForClickable(loginPage.getEmailAddress);
    await expect(loginPage.getEmailAddress).toBeVisible();
});

When('I enter {string} in the Email field', { timeout: 30000 }, async function (invalid_email_address: string) {
    await loginPage.waitForClickable(loginPage.getEmailAddress);
    await loginPage.getEmailAddress.fill(invalid_email_address);
});

When('I click on the Continue button', { timeout: 30000 }, async function () {
    await loginPage.waitForClickable(loginPage.getContinueButton);
    await loginPage.getContinueButton.click();
});

Then('I should see the Email validation message', { timeout: 30000 }, async function () {
    await loginPage.waitForClickable(loginPage.getEmailErrorMessage);
    await expect(loginPage.getEmailErrorMessage).toBeVisible();
});

Then('I should see the Password field', { timeout: 30000 }, async () => {
    await loginPage.waitForClickable(loginPage.getPassword);
    await expect(loginPage.getPassword).toBeVisible();
});

Then('I should see the Forgot Password link', { timeout: 30000 }, async () => {
    await loginPage.waitForClickable(loginPage.getForgotPasswordLink);
    await expect(loginPage.getForgotPasswordLink).toBeVisible();
});
