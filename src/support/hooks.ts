import { Before, After, BeforeAll, AfterAll, setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, _android, AndroidDevice, Browser, BrowserContext, Page } from 'playwright';
import { BrowserManager } from '../utils/browser';
import { ReportGenerator } from '../utils/report';


let device: AndroidDevice | null = null;

class CustomWorld extends World {
    page?: Page;

    constructor(options: IWorldOptions) {
        super(options);
    }
}

setWorldConstructor(CustomWorld);


BeforeAll({ timeout: 60000 }, async function () {
    // Validate required environment variables
    if (process.env.ENV === 'browserstack') {
        if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
            throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be provided');
        }
    }
});

Before({ timeout: 180000 }, async function (this: CustomWorld) {
    try {
        this.page = await BrowserManager.getPage();
        if (!this.page) {
            throw new Error('Failed to initialize browser page');
        }
        await this.page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
        console.error('Error initializing test environment:', error);
        throw error;
    }
});

After({ timeout: 180000 }, async function (this: CustomWorld, scenario) {
    try {
        if (scenario.result?.status === 'FAILED' && this.page) {
            try {
                await ReportGenerator.captureScreenshot(scenario);
            } catch (error) {
                console.warn('Failed to capture screenshot:', error);
            }
        }
        // Don't close the page here, let BrowserManager handle it
        this.page = undefined;
    } catch (error) {
        console.error('Error in scenario cleanup:', error);
        throw error;
    } finally {
        this.page = undefined;
    }
});

AfterAll({ timeout: 60000 }, async function () {
    try {
        await BrowserManager.closeBrowser();
    } catch (error) {
        console.error('Error in AfterAll hook:', error);
        throw error;
    }
});
