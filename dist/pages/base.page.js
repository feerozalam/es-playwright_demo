"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
class BasePage {
    constructor(page) {
        this.page = page;
    }
    async navigate(url) {
        await this.page.goto(url);
    }
    async waitForElement(selector) {
        await this.page.waitForSelector(selector);
    }
    async click(selector) {
        await this.waitForElement(selector);
        await this.page.click(selector);
    }
    async type(selector, text) {
        await this.waitForElement(selector);
        await this.page.fill(selector, text);
    }
    async getText(selector) {
        await this.waitForElement(selector);
        return await this.page.innerText(selector);
    }
}
exports.BasePage = BasePage;
