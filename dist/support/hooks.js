"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const browser_1 = require("../utils/browser");
const browser_2 = require("../utils/browser");
const browserstack_local_1 = __importDefault(require("browserstack-local"));
const report_1 = require("../utils/report");
let bsLocal;
(0, cucumber_1.BeforeAll)(async function () {
    if (process.env.ENV === 'browserstack') {
        bsLocal = new browserstack_local_1.default.Local();
        await new Promise((resolve, reject) => {
            bsLocal.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, (error) => {
                if (error)
                    return reject(error);
                resolve(true);
            });
        });
    }
});
(0, cucumber_1.Before)(async function () {
    const page = await (0, browser_2.getPage)();
    this.page = page;
});
(0, cucumber_1.After)(async function (scenario) {
    if (scenario.result?.status === 'FAILED') {
        await report_1.ReportGenerator.captureScreenshot(scenario);
    }
});
(0, cucumber_1.AfterAll)(async function () {
    await (0, browser_1.closeBrowser)();
    if (process.env.ENV === 'browserstack' && bsLocal) {
        await new Promise((resolve) => bsLocal.stop(resolve));
    }
});
