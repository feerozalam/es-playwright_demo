import { Before, After, BeforeAll, AfterAll, setWorldConstructor, World } from '@cucumber/cucumber';
import { BrowserManager } from '../utils/browser';
import { config } from '../config/env.config';
import BrowserStackLocal from 'browserstack-local';
import { ReportGenerator } from '../utils/report';
import { Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

class CustomWorld extends World {
  page?: Page;
}

setWorldConstructor(CustomWorld);

let bsLocal: any;

BeforeAll(async function () {
  if (process.env.ENV === 'browserstack') {
    if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
      throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be provided');
    }
    bsLocal = new BrowserStackLocal.Local();
    await new Promise((resolve, reject) => {
      bsLocal.start({ 
        key: process.env.BROWSERSTACK_ACCESS_KEY,
        forceLocal: true,
        verbose: true
      }, (error: Error) => {
        if (error) return reject(error);
        resolve(true);
      });
    });
  }
});

Before({ timeout: 180000 }, async function () {
  const page = await BrowserManager.getPage();
  this.page = page;
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    await ReportGenerator.captureScreenshot(scenario);
  }
});

AfterAll(async function () {
  await BrowserManager.closeBrowser();
  if (process.env.ENV === 'browserstack' && bsLocal) {
    await new Promise((resolve) => bsLocal.stop(resolve));
  }
});
