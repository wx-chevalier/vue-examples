/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const process = require('process');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const RewriteImportPlugin = require('less-plugin-rewrite-import');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const rootPath = process.cwd();
const packageName = require(path.resolve(rootPath, 'package.json'));

const buildEnv = {
  rootPath,
  packageName,
  src: path.resolve(rootPath, './src'),
  public: path.resolve(rootPath, './public'),
  build: path.resolve(rootPath, './build')
};

const moduleCSSLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      mode: 'local',
      localIdentName: 'vtw_[hash:base64:5]_[local]'
    },
    sourceMap: false,
    importLoaders: 2
  }
};

const lessLoader = {
  loader: 'less-loader',
  options: {
    modifyVars: {
      'primary-color': '#5d4bff'
    },
    javascriptEnabled: true,
    paths: [path.resolve(rootPath, './node_modules'), path.resolve(rootPath, './src')],
    plugins: [
      new RewriteImportPlugin({
        paths: {
          '~antd/es/style/themes/default.less': function() {
            return 'antd/es/style/themes/default.less';
          }
        }
      })
    ]
  }
};

const fontsOptions = {
  limit: 8192,
  mimetype: 'application/font-woff',
  name: 'fonts/[name].[ext]'
};

module.exports = {
  context: rootPath,
  entry: {
    index: path.resolve(buildEnv.rootPath, './src/index.tsx')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css', '.less', 'vue'],
    plugins: [new TSConfigPathsPlugin()],
    alias: {
      '@': path.resolve(rootPath, './src/'),
      '~antd': path.resolve(rootPath, './node_modules/antd'),
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  output: {
    path: buildEnv.build,
    // 设置所有资源的默认公共路径，Webpack 会自动将 import 的资源改写为该路径
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    globalObject: 'this' // 避免全局使用 window
  },
  module: {
    rules: [
      {
        test: /.*ts-worker.*/,
        use: ['workerize-loader', 'ts-loader']
      },
      {
        test: /\.(ts|tsx)?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            scss: 'vue-style-loader!css-loader!sass-loader',
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
            less: 'vue-style-loader!css-loader!less-loader'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: fontsOptions
          }
        ]
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'file-loader',
            options: fontsOptions
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [/node_modules/, buildEnv.src]
      },
      {
        test: /\.less$/,
        use: ['style-loader', moduleCSSLoader, lessLoader],
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', lessLoader],
        include: /node_modules/
      },
      {
        test: /\.wasm$/,
        loader: 'wasm-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, eslint: true }),
    new webpack.WatchIgnorePlugin([/less\.d\.ts$/]),
    new webpack.IgnorePlugin(/\.js\.map$/),
    new VueLoaderPlugin()
  ],

  // 定义非直接引用依赖，使用方式即为 var $ = require("jquery")
  externals: {
    window: 'window',
    jquery: '$'
  },
  extra: {
    moduleCSSLoader,
    lessLoader,
    buildEnv
  }
};
