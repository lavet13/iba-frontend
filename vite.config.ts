import { defineConfig, loadEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import codegen from 'vite-plugin-graphql-codegen';
import dynamicImport from 'vite-plugin-dynamic-import';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  const devConfig: UserConfig = {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react(),
      cssInjectedByJsPlugin({
        relativeCSSInjection: true,
      }),
      codegen({ matchOnSchemas: true, debug: true, throwOnBuild: false }),
      chunkSplitPlugin({
        strategy: 'single-vendor',
        customChunk(context) {
          const { file } = context;
          console.log({ file });
          if (
            file.startsWith('src/pages') ||
            file.startsWith('src/components') ||
            file.startsWith('src/features') ||
            file.startsWith('src/hooks') ||
            file.startsWith('src/utils') ||
            file.startsWith('src/theme') ||
            file.startsWith('src/react-query') ||
            file.startsWith('src/graphql-client')
          ) {
            return file;
          }
        },
        customSplitting: {
          chakra: [/@chakra-ui/],
          tanstack: [/@tanstack/],
          'date-fns': [/date-fns/],
          'framer-motion': [/framer-motion/],
          emotion: [/@emotion/],
          popperjs: [/@popperjs/],
          'react-fast-compare': [/react-fast-compare/],
          'react-phone-number-input': [
            /react-phone-number-input/,
            /libphonenumber-js/,
          ],
          'react-icons': [/react-icons/],
          'chakra-react-select': [/chakra-react-select/, /react-select/],
          'react-error-boundary': [/react-error-boundary/],
          'lodash-es': [/lodash-es/],
          graphql: [/graphql/],
          zod: [/zod/, /zod-formik-adapter/],
          formik: [/formik/],
          vendor: [/node_modules/],
        },
      }),
      dynamicImport(),
    ],

    build: {
      minify: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: './src/main.tsx',
        output: {
          manualChunks: undefined,
        },
      },
    },
  };

  if (command === 'build') {
    return {
      ...devConfig,
      ssr: {
        // Add your external dependencies here for the SSR build, otherwise,
        // the bundled won't have enough libraries to render noExternal:
        // [/@\w+\/*/],
      },
    };
  }

  return devConfig;
});
