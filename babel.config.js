module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['react-native-worklets-core/plugin'], // MUST BE HERE
    'react-native-reanimated/plugin',      // Usually here too
  ],
};