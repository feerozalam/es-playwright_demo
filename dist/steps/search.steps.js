"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const search_page_1 = require("../pages/search.page");
const browser_1 = require("../utils/browser");
let searchPage;
(0, cucumber_1.Given)('I am on the homepage', async () => {
    const page = await (0, browser_1.getPage)();
    searchPage = new search_page_1.SearchPage(page);
    await searchPage.navigate('https://example.com');
});
(0, cucumber_1.When)('I search for {string}', async (searchTerm) => {
    await searchPage.performSearch(searchTerm);
});
(0, cucumber_1.Then)('I should see search results', async () => {
    const hasResults = await searchPage.hasSearchResults();
    (0, test_1.expect)(hasResults).toBeTruthy();
});
