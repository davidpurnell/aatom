//const webpack = require("webpack");
const path = require("path");
const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge");

const parts = require("./webpack.parts.js");

const PATHS = {
  app: path.join(__dirname, "src"),
  build: path.join(__dirname, "dist"),
};

const commonConfig = merge([
  {
    entry: PATHS.app + "/affable.js",
    output: {
      path: PATHS.build,
      chunkFilename: "[name].[chunkhash:4].js",
      filename: "[name].[chunkhash:4].js",
    },
    resolve: {
      extensions: [".js"],
      alias: {
        jquery: "jquery/dist/jquery.js",
      },
    }
  }
]);

const productionConfig = merge([
  parts.clean(),
  parts.extractCSS(),
  parts.loadJavaScript({ include: PATHS.app }),
  parts.loadImages({
    limit: 10000,
    options: {
      svgo: {
        removeViewBox: true,
        removeTitle: true,
        convertPathData: false,
        cleanupIDs: false,
      },
      mozjpeg: {
        progressive: true,
        arithmetic: false,
      },
      optipng: {
        optimizationLevel: 5,
        bitDepthReduction: true,
        colorTypeReduction: true,
        paletteReduction: true,
      },
      pngquant: {
        enabled: false,
      },
      gifsicle: {
        interlaced: true,
        optimizationLevel: 2
      },
    },
  }),
  parts.buildPage(PATHS),
  parts.cpNetlify(PATHS),
]);

const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
    PATHS
  }),
  parts.loadCSS(),
  parts.loadImages({ limit: 10000 }),
  parts.buildPage(PATHS),
]);

const getConfig = (mode) => {
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};

module.exports = getConfig(mode);