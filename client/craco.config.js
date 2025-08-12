const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 简化的代码分割配置
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };

      return webpackConfig;
    },
  },
  devServer: {
    historyApiFallback: true,
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};