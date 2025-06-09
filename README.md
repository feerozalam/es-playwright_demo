# Playwright-Cucumber-TypeScript Test Automation Framework

This is a test automation framework built with Playwright, Cucumber, and TypeScript, supporting both local and BrowserStack execution.

## Features

- Page Object Model design pattern
- BDD support with Cucumber
- Cross-browser testing with Playwright (Chrome, Firefox, Safari)
- BrowserStack integration for real device and cross-platform testing
- Environment-based configuration with support for local and remote execution
- Automatic screenshot capture on test failure
- Detailed HTML reporting with Cucumber
- TypeScript support for better type safety and IDE integration
- Enhanced retry mechanism for BrowserStack tests
- Built-in logging system with Winston
- Configurable timeouts and viewport settings

## Prerequisites

- Node.js (v22 or higher)
- npm (v10 or higher)
- BrowserStack account (for remote testing)
- Playwright installed globally (optional)

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browser dependencies
npx playwright install
```

## Configuration

1. Create a `.env` file in the project root:

   ```bash
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```

2. Configure test environments in `src/config/env.config.ts`:

   ```typescript
   {
     baseUrl: string;      // Application base URL
     browser: string;      // Default browser for local testing
     test: {
       defaultTimeout: number;  // Default timeout for test steps
     };
     viewport: {
       width: number;     // Browser viewport width
       height: number;    // Browser viewport height
     };
   }
   ```

3. Configure BrowserStack capabilities in `src/config/browserstack.config.ts`:

   ```typescript
   {
     capabilities: {
       'browserstack.local': true,    // For testing local/internal URLs
       'browserstack.debug': true,    // Enable debugging features
       'browserstack.console': 'verbose',
       'browserstack.networkLogs': true,
       'browserstack.screenshot': true,
     },
     environments: {
       win_chrome: { /* Windows Chrome config */ },
       mac_safari: { /* macOS Safari config */ },
       ios_safari: { /* iOS Safari config */ },
       android_chrome: { /* Android Chrome config */ }
     }
   }
   ```

## Running Tests

### Local Execution

Run all tests locally with Chrome (default browser):

```bash
npm run test:local
```

Run a specific feature file:

```bash
npm run test:local -- src/features/homePage.feature
```

### BrowserStack Execution

Tests can be run on different platforms and browsers using BrowserStack:

```bash
# Windows Chrome (latest)
BROWSER=win_chrome npm run test:bs

# macOS Safari (latest)
BROWSER=mac_safari npm run test:bs

# iOS Safari (iPhone 14)
BROWSER=ios_safari npm run test:bs:ios

# Android Chrome (Samsung Galaxy S23)
BROWSER=android_chrome npm run test:bs:android
```

Note: BrowserStack tests include a retry mechanism for better reliability in CI/CD pipelines.

## Available Scripts

The project includes several npm scripts for different testing scenarios:

### Test Execution Scripts

```bash
# Run tests with default configuration
npm test

# Local browser testing
npm run test:local            # Run tests locally with default browser
npm run test:local:chrome    # Run specifically with Chrome
npm run test:local:firefox   # Run specifically with Firefox
npm run test:local:webkit    # Run specifically with WebKit

# BrowserStack testing
npm run test:bs              # Run on BrowserStack with default config
npm run test:bs:win         # Run on Windows Chrome
npm run test:bs:mac         # Run on macOS Safari
npm run test:bs:ios         # Run on iOS Safari
npm run test:bs:android     # Run on Android Chrome

# Advanced execution options
npm run test:parallel       # Run tests in parallel (2 workers)
npm run test:tags          # Run tests with specific tags (e.g., npm run test:tags "@smoke")
```

### Utility Scripts

```bash
# Clean test artifacts
npm run clean              # Clean test results directory

# Check environment configuration
npm run check:env         # Display current test environment settings

# Generate and view reports
npm run report:open       # Open the Cucumber HTML report in default browser
```

Each script can be combined with additional Cucumber.js parameters as needed:

```bash
# Examples
npm run test:local -- --tags "@smoke"
npm run test:bs -- --tags "not @wip"
npm run test:local -- src/features/specific.feature
```

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   │   ├── browserstack.config.ts    # BrowserStack configurations
│   │   └── env.config.ts            # Environment-specific settings
│   ├── features/        # Cucumber feature files
│   ├── pages/          # Page Object Model classes
│   │   ├── base.page.ts            # Base page with common methods
│   │   ├── home.page.ts            # Home page object
│   │   └── login.page.ts           # Login page object
│   ├── steps/          # Step definitions
│   ├── support/        # Support files and hooks
│   └── utils/          # Utility functions
│       ├── browser.ts              # Browser management
│       └── logger.ts               # Logging utilities
├── test-results/       # Test execution artifacts
│   └── logs/          # Test execution logs
├── cucumber.js        # Cucumber configuration
├── cucumber-report.html # HTML test report
└── tsconfig.json      # TypeScript configuration
```

## Writing Tests

1. Create feature files in `src/features/`
2. Implement step definitions in `src/steps/`
3. Create page objects in `src/pages/`

## Reports and Logs

Test execution generates several types of artifacts for debugging and analysis:

### Test Reports

- `cucumber-report.html`: Comprehensive HTML report containing:
  - Test execution results and statistics
  - Step-by-step execution details
  - Error messages and stack traces
  - Test durations and timestamps

- Screenshots:
  - Auto-captured on test failures
  - Stored in `test-results/screenshots` directory
  - Named with the test scenario for easy identification

### Execution Logs

- `test-results/logs/combined.log`:
  - Complete test execution logs
  - Navigation events
  - Test step execution
  - Browser/page events

- `test-results/logs/error.log`:
  - Error-level logs only
  - Test failures
  - Browser errors
  - Network issues

### BrowserStack Integration

- Test Artifacts:
  - Session videos
  - Network logs
  - Console logs
  - Screenshots

- Debug Features:
  - Live test monitoring
  - Video recordings
  - Network traffic inspection
  - Browser console access
