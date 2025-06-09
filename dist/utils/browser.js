"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPage = getPage;
exports.closeBrowser = closeBrowser;
const test_1 = require("@playwright/test");
const browserstack_config_1 = require("../config/browserstack.config");
const env_config_1 = require("../config/env.config");
let browser;
let page;
function getBrowser() {
    switch (env_config_1.config.browser.toLowerCase()) {
        case 'firefox':
            return test_1.firefox;
        case 'webkit':
        case 'safari':
            return test_1.webkit;
        default:
            return test_1.chromium;
    }
}
async function getPage() {
    if (!page) {
        const browserType = getBrowser();
        const launchOptions = process.env.ENV === 'browserstack'
            ? {
                ...browserstack_config_1.browserStackConfig.capabilities,
                ...(browserstack_config_1.browserStackConfig.environments[env_config_1.config.browser.toLowerCase()] || {})
            }
            : { headless: false };
        browser = await browserType.launch(launchOptions);
        const context = await browser.newContext({
            viewport: env_config_1.config.viewport
        });
        page = await context.newPage();
    }
    return page;
}
async function closeBrowser() {
    if (browser) {
        await browser.close();
    }
}
