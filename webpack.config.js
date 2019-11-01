'use strict';
const path = require('path');

module.exports = {
    entry: {
        gitpodify: './dist/gitpodify.js',
        options: './dist/options/options.js',
    },
    output: {
        filename: 'bundles/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader'
            }
        ]
    }
};

module.exports.devtool = 'source-map';
