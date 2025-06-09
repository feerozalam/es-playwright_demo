"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const defaultConfig = {
    baseUrl: 'https://example.com',
    browser: 'chrome',
    timeout: 30000,
    viewport: {
        width: 1920,
        height: 1080,
    },
};
const environments = {
    local: {
        baseUrl: 'http://localhost:3000',
    },
    browserstack: {
        baseUrl: 'https://example.com',
    },
};
exports.config = {
    ...defaultConfig,
    ...(environments[process.env.ENV || 'local'] || {}),
};
