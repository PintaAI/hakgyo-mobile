const config = require('./app.json');

const APP_ENV = process.env.APP_ENV || 'production';

const baseName = 'hakgyo';
const basePackage = 'com.rorez.hakgyo';

const envConfig = {
  name: baseName,
  slug: baseName,
  scheme: baseName,
  bundleIdentifier: basePackage,
  package: basePackage,
};

if (APP_ENV === 'dev') {
  envConfig.name = `${baseName} (dev)`;
  envConfig.scheme = `${baseName}-dev`;
  envConfig.bundleIdentifier = `${basePackage}.dev`;
  envConfig.package = `${basePackage}.dev`;
} else if (APP_ENV === 'prev') {
  envConfig.name = `${baseName} (prev)`;
  envConfig.scheme = `${baseName}-prev`;
  envConfig.bundleIdentifier = `${basePackage}.prev`;
  envConfig.package = `${basePackage}.prev`;
}

module.exports = () => {
  return {
    ...config.expo,
    ...envConfig,
    ios: {
      ...config.expo.ios,
      bundleIdentifier: envConfig.bundleIdentifier,
    },
    android: {
      ...config.expo.android,
      package: envConfig.package,
    },
  };
};
