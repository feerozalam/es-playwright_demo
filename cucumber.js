module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/steps/*.ts', 'src/support/hooks.ts'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    paths: ['src/features/'],
    publishQuiet: true,
    timeout: 180000,
    retry: process.env.ENV === 'browserstack' ? 1 : 0
  }
};
