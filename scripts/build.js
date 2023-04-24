import webpack from 'webpack';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import ReactServerWebpackPlugin from 'react-server-dom-webpack/plugin';

const isProduction = process.env.NODE_ENV === 'production';
const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(
  new URL('.', import.meta.url),
);

const csrConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: false,
  entry: [resolve(__dirname, '../src/bootstrap.tsx')],
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'bootstrap.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('swc-loader'),
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              dynamicImport: true,
            },
            target: 'es2022',
            transform: {
              // Use a JSX runtime module (e.g. react/jsx-runtime introduced in React 17).
              react: {
                runtime: 'automatic',
              },
            },
          },
          isModule: true,
        },
      },
    ],
  },
  resolve: {
    extensionAlias: {
      '.js': ['.tsx', '.ts', '.js'],
    },
  },
  plugins: [
    new ReactServerWebpackPlugin({ isServer: false }),
  ],
};

const rscConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: false,
  entry: [resolve(__dirname, '../src/App.tsx')],
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'App.js',
    library: {
      type: 'module',
    },
  },
  target: 'node16',
  node: false,
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensionAlias: {
      '.js': ['.tsx', '.ts', '.js'],
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('swc-loader'),
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              dynamicImport: true,
            },
            target: 'es2022',
            transform: {
              // Use a JSX runtime module (e.g. react/jsx-runtime introduced in React 17).
              react: {
                runtime: 'automatic',
              },
            },
          },
          isModule: true,
        },
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: require.resolve(
            './plugins/RSCWebpackPlugin.js',
          ),
        },
      },
    ],
  },
};

webpack([csrConfig, rscConfig], (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
    return;
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    info.errors.forEach((e) => console.error(e));
    process.exit(1);
  } else {
    console.log('Finished running webpack.');
  }
});
