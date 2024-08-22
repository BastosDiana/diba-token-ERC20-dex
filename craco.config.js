const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        global: require.resolve('global'),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          global: 'global',
        })
      );

      return webpackConfig;
    },
  },
};
