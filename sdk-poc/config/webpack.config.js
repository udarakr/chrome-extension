"use strict";

const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const replace = require("replace-in-file-webpack-plugin");
const common = require("./webpack.common.js");
const PATHS = require("./paths");
const config = require("./environment.json");
const build = "extension_" + Date.now();

module.exports = (env) =>
  merge(common, {
    entry: {
      index: PATHS.src + "/scripts/index.js",
      background: PATHS.src + "/scripts/background.js",
      styles: PATHS.src + "/styles/main.css",
    },
    plugins: [
      new CleanWebpackPlugin({dry: false}),
      new replace([
        {
          dir: "dist",
          files: ["manifest.json"],
          rules: [
            {
              search: "<APP_PERMISSION>",
              replace: config[env] + "/*",
            },
          ],
        },
        {
          dir: "dist",
          files: ["index.js", "index.html"],
          rules: [
            {
              search: /<!--APP_HOST-->/gi,
              replace: config[env],
            },
          ],
        },
      ]),
      new ZipFilesPlugin({
        entries: [
          { src: './dist', dist: './' },
        ],
        output: './build/' + env + "_"+ build,
        format: 'zip',
      }),
    ],
  });
