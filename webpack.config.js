'use strict';
const path = require('path');

module.exports = {
    mode: 'production',
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
                exclude: /node_modules/,
                enforce: 'pre',
            }
        ]
    }
};
