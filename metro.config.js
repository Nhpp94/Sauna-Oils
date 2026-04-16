const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Explicitly set transformer path to avoid resolution issues when bundling
// for native targets (expo/node_modules resolution quirk with SDK 54)
config.transformer = {
  ...config.transformer,
  transformerPath: require.resolve(
    path.join(__dirname, 'node_modules/@expo/metro-config/build/transform-worker/transform-worker.js')
  ),
};

module.exports = config;
