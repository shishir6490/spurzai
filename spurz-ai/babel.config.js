module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@components': './src/components',
            '@constants': './src/constants',
            '@utils': './src/utils',
            '@context': './src/context',
            '@types': './src/types'
          }
        }
      ]
    ]
  };
};