const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix for 99.9% building issue
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'otf', 'woff', 'woff2'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
