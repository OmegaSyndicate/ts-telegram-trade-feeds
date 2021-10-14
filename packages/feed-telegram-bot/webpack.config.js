const path = require('path');

module.exports = {
    entry: './main.ts',
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'server-bundle.js',
        path: path.resolve(__dirname, '.'),
    },
    externals: {
        "./workers/feed.worker": "./workers/feed.worker.js"
    }
}