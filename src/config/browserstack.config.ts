export const browserStackConfig = {
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
  capabilities: {
    'browserstack.local': false,
    'browserstack.debug': true,
    'browserstack.console': 'verbose',
    'browserstack.networkLogs': true,
    'browserstack.playwrightLogs': true,
    'browserstack.screenshot': true,
    'browserstack.networkProfile': null,
    'browserstack.selenium_version': '4.0.0',
    'browserstack.idleTimeout': 300,
    'name': `ES Rental Test`,
    'build': `ES Build ${new Date().toISOString()}`,
    'project': 'ES_Playwright_BDD_BS_TS',
    'browserstack.appiumLogs': true,
    'browserstack.deviceLogs': true,
    'autoGrantPermissions': true
  },
  environments: {
    win_chrome: {
      browser: 'chrome',
      browser_version: 'latest',
      os: 'Windows',
      os_version: '11',
    },
    mac_safari: {
      browser: 'playwright-webkit',
      browser_version: 'latest',
      os: 'OS X',
      os_version: 'Sequoia',
    },
    ios_safari: {
      device: 'iPhone 14',
      os: 'iOS',
      os_version: '16',
      browser: 'safari',
      browser_version: 'latest',
      realMobile: true,
    },
    android_chrome: {
      device: 'Samsung Galaxy S22',
      os: 'Android',
      os_version: '12.0',
      browser: 'chrome',
      channel: 'chrome',
      browser_version: 'latest',
      isAndroid: true,
      'bstack:options': {
        platformName: 'android',
        browserName: 'chrome',
      }
    }
  }
};
