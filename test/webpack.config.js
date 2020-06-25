const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: {
		app: './src/main.tsx'
	},
	watch: true,
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules|dist/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	output: {
		publicPath: './dist/',
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
		watchContentBase: true,
		publicPath: '/dist/',
		hot: true,
		contentBase: ['.'],
		inline: true
	},
	optimization: {
		usedExports: true
	}
};
