#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🧪 Testing BrowserStack Status Update with REST API...');

// Set environment variables for BrowserStack test
process.env.ENV = 'browserstack';
process.env.BROWSER = 'win_chrome';

// Ensure we have BrowserStack credentials
if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    console.error('❌ BrowserStack credentials not found!');
    console.log('Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables');
    process.exit(1);
}

console.log('✅ BrowserStack credentials found');
console.log('🔄 Running test with BrowserStack session tracking...');

// Run a simple test scenario
const command = 'npx cucumber-js src/features/homePage.feature --tags "not @ignore" --parallel 1';

console.log(`Executing: ${command}`);

const testProcess = exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    console.log('\n📊 Test Results:');
    console.log('STDOUT:', stdout);
    
    if (stderr) {
        console.log('STDERR:', stderr);
    }
    
    if (error) {
        console.log('❌ Test execution completed with issues:', error.message);
    } else {
        console.log('✅ Test execution completed successfully');
    }
    
    console.log('\n🔍 Check BrowserStack Dashboard:');
    console.log('   Dashboard: https://automate.browserstack.com/dashboard/v2');
    console.log('   Look for the session status to verify it\'s updated');
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Terminating test process...');
    testProcess.kill();
    process.exit(0);
});
