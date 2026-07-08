module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Required by Reanimated 4 (and @gorhom/bottom-sheet). MUST be listed last.
  plugins: ['react-native-worklets/plugin'],
};
