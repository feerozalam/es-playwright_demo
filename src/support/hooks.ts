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
    const isAndroid = process.env.BROWSER === 'android_chrome';
    const maxRetries = isAndroid ? 5 : 1;
    const retryDelayMs = 5000;
    let lastError;
    
    console.log(`Before hook started, isAndroid: ${isAndroid}, ENV: ${process.env.ENV}, BROWSER: ${process.env.BROWSER}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} to get browser page`);
            this.page = await BrowserManager.getPage();
            if (!this.page) {
                throw new Error('Failed to initialize browser page');
            }
            console.log('Browser page obtained successfully');
            await this.page.setViewportSize({ width: 1920, height: 1080 });
            console.log('Viewport size set successfully, Before hook completed');
            return;
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} to initialize browser page failed:`, error);
            if (attempt < maxRetries) {
                console.log(`Waiting ${retryDelayMs}ms before retry ${attempt + 1}`);
                await new Promise(res => setTimeout(res, retryDelayMs));
            }
        }
    }
    console.error('Error initializing test environment after retries:', lastError);
    throw lastError;
});

After({ timeout: 180000 }, async function (this: CustomWorld, scenario) {
    const isAndroid = process.env.BROWSER === 'android_chrome';
    console.log(`After hook started for scenario: ${scenario.pickle.name}, isAndroid: ${isAndroid}, result: ${scenario.result?.status}`);
    
    try {
        if (scenario.result?.status === 'FAILED' && this.page) {
            try {
                console.log('Attempting to capture screenshot for failed scenario');
                await ReportGenerator.captureScreenshot(scenario);
                console.log('Screenshot captured successfully');
            } catch (error) {
                console.warn('Failed to capture screenshot:', error);
            }
        }

        // For Android/BrowserStack, explicitly close page and context after each scenario
        if (this.page && isAndroid && process.env.ENV === 'browserstack') {
            try {
                console.log('Explicitly closing page for Android/BrowserStack');
                await this.page.close();
                console.log('Page closed successfully');
            } catch (error) {
                console.warn('Error closing page:', error);
            }
        }

        // Don't close the page here for non-Android, let BrowserManager handle it
        this.page = undefined;
        console.log('After hook completed successfully');
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
