'use strict';

const path      = require('path');
const fs        = require('fs');
const webpack   = require('webpack');
const pkg       = require('./package.json');

module.exports = {
    entry: path.join(__dirname, 'src', 'ecs.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        library: 'ECS',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    'babel?cacheDirectory=true&presets[]=es2015-loose',
                ],
            },
        ],
    },
    plugins: [
        // don't emit output when there are errors
        new webpack.NoErrorsPlugin(),
    ],
};
