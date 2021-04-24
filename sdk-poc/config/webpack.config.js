"use strict";

const { merge } = require("webpack-merge");
const replace = require("replace-in-file-webpack-plugin");
const common = require("./webpack.common.js");
const PATHS = require("./paths");

module.exports = merge(common, {
  entry: {
    index: PATHS.src + "/scripts/index.js",
    background: PATHS.src + "/scripts/background.js",
    styles: PATHS.src + "/styles/main.css"
  },
  plugins: [
    new replace([
      {
        dir: "build",
        files: ["manifest.json"],
        rules: [
          {
            search: "<APP_PERMISSION>",
            replace: "https://localhost:3101/*"
          },
        ],
      },
      {
        dir: "build",
        files: ["index.js"],
        rules: [
          {
            search: /<APP_HOST>/ig, 
            replace: "https://localhost:3101"
          },
        ],
      },
    ]),
  ],
});