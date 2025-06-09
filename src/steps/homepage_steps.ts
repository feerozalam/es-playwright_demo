import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

let homePage: HomePage;

Given('I am on the home page', { timeout: 180000 }, async function() {
    homePage = new HomePage(this.page);
    await homePage.open();
    await homePage.waitForPageLoad();
})

Then("I should see the 'Rent Equipment' button in the home page", async () => {
    await homePage.verifyElementDisplay(homePage.getRentEquipmentButton, 100000)
})

Then("I should see the 'Explore T3' button in the home page", async () => {
    await homePage.verifyElementDisplay(homePage.getExploreT3Button, 100000)
})

Then("I should see the 'Sign In' button in the home page", async () => {
    await homePage.verifyElementDisplay(homePage.getSignInButton, 100000)
})

When("I click on the 'User Icon' button", { timeout: 100000 }, async () => {
    await homePage.waitForClickable(homePage.getUserIconButton);
    await homePage.getUserIconButton.click();
})

When("I click on the 'Sign In' button", { timeout: 100000 }, async () => {
    await homePage.waitForClickable(homePage.getSignInButton);
    await homePage.getSignInButton.click();
})

