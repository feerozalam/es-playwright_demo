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

BeforeAll({timeout: 60000}, async function () {
  if (process.env.ENV === 'browserstack') {
    if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
      throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be provided');
    }

    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        bsLocal = new BrowserStackLocal.Local();
        await new Promise((resolve, reject) => {
          const connectTimeout = setTimeout(() => {
            reject(new Error('BrowserStack Local connection timeout'));
          }, 30000);

          bsLocal.start({ 
            key: process.env.BROWSERSTACK_ACCESS_KEY,
            forceLocal: true,
            verbose: true,
            force: true, // Kill other running BrowserStackLocal instances
            onlyAutomate: true, // Restrict to automation traffic only
          }, (error: Error) => {
            clearTimeout(connectTimeout);
            if (error) return reject(error);
            resolve(true);
          });
        });
        break; // Connection successful
      } catch (error) {
        retryCount++;
        console.error(`BrowserStack connection attempt ${retryCount} failed:`, error);
        
        if (retryCount === maxRetries) {
          throw new Error(`Failed to connect to BrowserStack after ${maxRetries} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
});

Before({ timeout: 180000 }, async function () {
  const page = await BrowserManager.getPage();
  this.page = page;
});

After({ timeout: 180000 }, async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    await ReportGenerator.captureScreenshot(scenario);
  }
});

AfterAll({ timeout: 60000 }, async function () {
  try {
    await BrowserManager.closeBrowser();
    
    if (process.env.ENV === 'browserstack' && bsLocal) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('BrowserStack Local stop timeout'));
        }, 30000);

        bsLocal.stop((error: Error | null) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error('Error in AfterAll hook:', error);
    throw error;
  }
});
