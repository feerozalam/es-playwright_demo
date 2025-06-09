"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserStackConfig = void 0;
exports.browserStackConfig = {
    user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    capabilities: {
        'browserstack.local': true,
        'browserstack.debug': true,
        'browserstack.console': 'verbose',
    },
    environments: {
        chrome: {
            browser: 'chrome',
            browser_version: 'latest',
            os: 'Windows',
            os_version: '11',
        },
        safari: {
            browser: 'safari',
            browser_version: 'latest',
            os: 'OS X',
            os_version: 'Monterey',
        },
        iphone: {
            device: 'iPhone 14',
            os_version: '16',
            real_mobile: 'true',
        },
        android: {
            device: 'Samsung Galaxy S23',
            os_version: '13.0',
            real_mobile: 'true',
        }
    }
};
