# Playwright-Cucumber-TypeScript Test Automation Framework

This is a test automation framework built with Playwright, Cucumber, and TypeScript, supporting both local and BrowserStack execution.

## Features

- Page Object Model design pattern
- BDD support with Cucumber
- Cross-browser testing with Playwright (Chrome, Firefox, Safari)
- BrowserStack integration for real device and cross-platform testing
- Environment-based configuration with support for local and remote execution
- Automatic screenshot capture on test failure
- Screenshots embedded directly in HTML reports
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

### Environment Variables

You have two options for setting up environment variables:

**Option 1: Using .env file (Recommended)**
Create a `.env` file in the project root:

```bash
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

**Option 2: System Environment Variables**
Set environment variables directly in your system or CI/CD pipeline.

**Note:** System environment variables take precedence over `.env` file values.

**Environment Variable Precedence (highest to lowest):**

1. System environment variables
2. Variables set via `cross-env` in npm scripts
3. Variables from `.env` file

### Application Configuration

Configure test environments in `src/config/env.config.ts`:

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

### BrowserStack Configuration

Configure BrowserStack capabilities in `src/config/browserstack.config.ts`:

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
npm run test:bs:win

# macOS Safari (latest)
npm run test:bs:mac

# iOS Safari (iPhone 14)
npm run test:bs:ios

# Android Chrome (Samsung Galaxy S23)
npm run test:bs:android

# Or use environment variables with the base command
BROWSER=win_chrome npm run test:bs
```

**Important:** Ensure your BrowserStack credentials are set in the `.env` file or as system environment variables before running BrowserStack tests.

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
# Environment validation and cleanup
npm run validate:env      # Validate environment variables and configuration
npm run clean             # Clean test results directory
npm run build             # Compile TypeScript files

# BrowserStack utilities
npm run test:bs:status    # Check BrowserStack account status
npm run test:bs:debug     # Run debug tests on BrowserStack with @debug tag

# Report generation
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

```text
├── src/
│   ├── config/          # Configuration files
│   │   ├── browserstack.config.ts    # BrowserStack configurations
│   │   └── env.config.ts             # Environment-specific settings
│   ├── features/        # Cucumber feature files
│   │   ├── equipment-rental.feature
│   │   ├── homePage.feature
│   │   └── loginPage.feature
│   ├── pages/          # Page Object Model classes
│   │   ├── base.page.ts              # Base page with common methods
│   │   ├── equipment-rental.page.ts  # Equipment rental page object
│   │   ├── home.page.ts              # Home page object
│   │   ├── login.page.ts             # Login page object
│   │   └── search.page.ts            # Search page object
│   ├── steps/          # Step definitions
│   │   ├── base_steps.ts
│   │   ├── equipment-rental.steps.ts
│   │   ├── homepage_steps.ts
│   │   └── loginpage_steps.ts
│   ├── support/        # Support files and hooks
│   │   └── hooks.ts                  # Test hooks and world setup
│   └── utils/          # Utility functions
│       ├── browser.ts                # Browser management
│       ├── browserstack.ts           # BrowserStack utilities
│       ├── logger.ts                 # Logging utilities
│       └── report.ts                 # Report generation
├── scripts/            # Utility scripts
│   ├── clean.js
│   ├── test-browser-config.js
│   ├── test-browserstack-status.js
│   └── validate-env.ts
├── test-results/       # Test execution artifacts
│   └── logs/          # Test execution logs
├── reports/           # Screenshots and test reports (generated)
├── .env               # Environment variables (create this file)
├── cucumber.js        # Cucumber configuration
├── cucumber-report.html # HTML test report (generated)
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Writing Tests

1. Create feature files in `src/features/`
2. Implement step definitions in `src/steps/`
3. Create page objects in `src/pages/`

## Troubleshooting

### BrowserStack Issues

**Authentication Errors:**

- Verify your BrowserStack credentials in the `.env` file
- Run `npm run test:bs:status` to check account status
- Ensure credentials don't have special characters that need escaping

**Test Failures:**

- Check BrowserStack dashboard for session details
- Review logs in `test-results/logs/` directory
- Use `npm run test:bs:debug` for debugging specific scenarios

### Local Execution Issues

**Browser Not Found:**

- Run `npx playwright install` to install browser dependencies
- Verify Node.js version (v22+ required)

**Port Conflicts:**

- Change the port for report server if 8080 is occupied
- Use `npx http-server . -p 3000 -o cucumber-report.html` for custom port

**Screenshot Issues:**

- Screenshots are now embedded directly in the Cucumber HTML report
- Backup PNG files are also saved in `reports/` directory for debugging
- If screenshots don't appear in report, check browser console for JavaScript errors

**Verifying Screenshot Integration:**

- Run a test that will fail: `npm run test:local -- --tags "@nonexistent"`
- Open `cucumber-report.html` after test execution
- Failed scenarios should show embedded screenshots directly in the report
- Check `reports/` directory for backup PNG files

## Reports and Logs

Test execution generates several types of artifacts for debugging and analysis:

### Test Reports

- `cucumber-report.html`: Comprehensive HTML report containing:
  - Test execution results and statistics
  - Step-by-step execution details
  - Error messages and stack traces
  - Test durations and timestamps

- Screenshots:
  - Auto-captured on test failures (both local and BrowserStack environments)
  - **Embedded directly in Cucumber HTML report** for easy viewing
  - Also saved as backup PNG files in `reports/` directory
  - Named with test scenario name and timestamp for easy identification

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
