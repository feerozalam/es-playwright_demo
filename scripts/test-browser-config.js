require('dotenv').config();

console.log('Environment Configuration:');
console.log('-------------------------');
console.log('ENVIRONMENT:', process.env.ENVIRONMENT || 'Local');
console.log('DEVICE:', process.env.DEVICE || 'Windows');
console.log('BROWSER:', process.env.BROWSER || 'Chrome');
console.log('TEST_CAPTURE_SCREENSHOTS:', process.env.TEST_CAPTURE_SCREENSHOTS || 'true');
console.log('TEST_CAPTURE_VIDEO:', process.env.TEST_CAPTURE_VIDEO || 'true');
console.log('TEST_TIMEOUT:', process.env.TEST_TIMEOUT || '60000');
console.log('TEST_RETRIES:', process.env.TEST_RETRIES || '0');
console.log();
console.log('BrowserStack Configuration:');
console.log('-------------------------');
console.log('BROWSERSTACK_USERNAME:', process.env.BROWSERSTACK_USERNAME ? 'Set' : 'Not Set');
console.log('BROWSERSTACK_ACCESS_KEY:', process.env.BROWSERSTACK_ACCESS_KEY ? 'Set' : 'Not Set');
