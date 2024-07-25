const path = require('path');

module.exports = {
  entry: './src/index.js', // Archivo de entrada principal
  output: {
    path: path.resolve(__dirname, 'dist'), // Directorio de salida
    filename: 'bundle.js' // Nombre del archivo de salida
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Aplica la siguiente regla a los archivos .js
        exclude: /node_modules/, // Excluye la carpeta node_modules
        use: {
          loader: 'babel-loader', // Usa Babel para transpilar archivos .js
          options: {
            presets: ['@babel/preset-env'] // Configura Babel con preset-env
          }
        }
      }
    ]
  }
};
