import { browserStackConfig } from '../src/config/browserstack.config';
import * as dotenv from 'dotenv';

dotenv.config();

function validateEnvironment() {
    const env = process.env.ENV;
    const browser = process.env.BROWSER;

    // Validate ENV
    if (!env) {
        throw new Error('ENV environment variable must be set to either "local" or "browserstack"');
    }
    if (!['local', 'browserstack'].includes(env)) {
        throw new Error('ENV must be either "local" or "browserstack"');
    }

    // Validate BrowserStack credentials if using browserstack
    if (env === 'browserstack') {
        if (!process.env.BROWSERSTACK_USERNAME) {
            throw new Error('BROWSERSTACK_USERNAME environment variable is required for browserstack tests');
        }
        if (!process.env.BROWSERSTACK_ACCESS_KEY) {
            throw new Error('BROWSERSTACK_ACCESS_KEY environment variable is required for browserstack tests');
        }

        // Validate browser configuration
        if (browser && !browserStackConfig.environments[browser as keyof typeof browserStackConfig.environments]) {
            throw new Error(`Invalid browser configuration for BrowserStack: ${browser}. Available options: ${Object.keys(browserStackConfig.environments).join(', ')}`);
        }
    }

    // Validate local browser configuration
    if (env === 'local' && browser && !['chrome', 'firefox', 'webkit'].includes(browser)) {
        throw new Error(`Invalid browser for local testing: ${browser}. Available options: chrome, firefox, webkit`);
    }

    console.log('✅ Environment validation passed');
    console.log(`Environment: ${env}`);
    console.log(`Browser: ${browser || 'default'}`);
}

validateEnvironment();
