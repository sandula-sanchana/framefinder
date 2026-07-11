module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ❌ Remove these 3 lines
      // ['@babel/plugin-transform-class-properties', { loose: true }],
      // ['@babel/plugin-transform-private-methods', { loose: true }],
      // ['@babel/plugin-transform-private-property-in-object', { loose: true }],

      // ✅ Keep this
      'react-native-reanimated/plugin',
    ],
  };
};