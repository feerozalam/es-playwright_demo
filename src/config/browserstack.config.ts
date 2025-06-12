export const browserStackConfig = {
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY', capabilities: {
    'browserstack.local': true,
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
    'project': 'ES_Playwright_BDD_BS_TS'
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
      os_version: '16',
      browser: 'safari',
      real_mobile: true,
    },
    android_chrome: {
      device: 'Samsung Galaxy S23',
      os_version: '13.0',
      browser: 'chrome',
      real_mobile: true,
    }
  }
};
