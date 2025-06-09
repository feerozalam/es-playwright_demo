interface EnvironmentConfig {
  baseUrl: string;
  browser: string;
  test: {
    defaultTimeout: number;
  };
  viewport: {
    width: number;
    height: number;
  };
}

const defaultConfig: EnvironmentConfig = {
  baseUrl: 'https://equipmentshare-us-7fcd6ee2fbc58ac5b15ef.webflow.io',
  browser: 'chrome',
  test: {
    defaultTimeout: 60000
  },
  viewport: {
    width: 1920,
    height: 1080,
  },
};

const environments: { [key: string]: Partial<EnvironmentConfig> } = {
  local: {
    baseUrl: 'https://equipmentshare-us-7fcd6ee2fbc58ac5b15ef.webflow.io',
  },
  browserstack: {
    baseUrl: 'https://equipmentshare-us-7fcd6ee2fbc58ac5b15ef.webflow.io',
  },
};

export const config: EnvironmentConfig = {
  ...defaultConfig,
  ...(environments[process.env.ENV || 'local'] || {}),
};
