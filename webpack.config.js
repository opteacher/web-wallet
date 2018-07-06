const resolve = require("path").resolve;
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    entry: "./src/main.js",
    output: {
        path: resolve(__dirname, "public/dist"),
        filename: "build.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: ["babel-loader"]
            },
            {
                test: /\.vue$/,
                use: ["vue-loader"]
            },
            {
                test: /\.s?css$/,
                use: ["vue-style-loader", "style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }]
            }
        ]
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, 'src'),
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['.js', '.vue', '.json', '.css']
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};