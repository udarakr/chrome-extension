"use strict";

const { merge } = require("webpack-merge");
const replace = require("replace-in-file-webpack-plugin");
const common = require("./webpack.common.js");
const PATHS = require("./paths");
const config = require("./environment.json");

module.exports = (env) =>
  merge(common, {
    entry: {
      index: PATHS.src + "/scripts/index.js",
      background: PATHS.src + "/scripts/background.js",
      styles: PATHS.src + "/styles/main.css",
    },
    plugins: [
      new replace([
        {
          dir: "build",
          files: ["manifest.json"],
          rules: [
            {
              search: "<APP_PERMISSION>",
              replace: config[env] + "/*",
            },
          ],
        },
        {
          dir: "build",
          files: ["index.js"],
          rules: [
            {
              search: /<APP_HOST>/gi,
              replace: config[env],
            },
          ],
        },
      ]),
    ],
  });
