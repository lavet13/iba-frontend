// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/web-dev/iba-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/web-dev/iba-frontend/node_modules/@vitejs/plugin-react-swc/index.mjs";
import cssInjectedByJsPlugin from "file:///D:/web-dev/iba-frontend/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import codegen from "file:///D:/web-dev/iba-frontend/node_modules/vite-plugin-graphql-codegen/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };
  const devConfig = {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    plugins: [
      react(),
      cssInjectedByJsPlugin({
        relativeCSSInjection: true
      }),
      codegen({ matchOnSchemas: true, debug: true, throwOnBuild: false })
    ],
    build: {
      minify: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: "./src/main.tsx",
        output: {
          manualChunks: void 0
        }
      }
    }
  };
  if (command === "build") {
    return {
      ...devConfig,
      ssr: {
        // Add your external dependencies here for the SSR build, otherwise,
        // the bundled won't have enough libraries to render noExternal:
        // [/@\w+\/*/],
      }
    };
  }
  return devConfig;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWItZGV2XFxcXGliYS1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcd2ViLWRldlxcXFxpYmEtZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3dlYi1kZXYvaWJhLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52LCBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWNzcy1pbmplY3RlZC1ieS1qcyc7XHJcbmltcG9ydCBjb2RlZ2VuIGZyb20gJ3ZpdGUtcGx1Z2luLWdyYXBocWwtY29kZWdlbic7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XHJcbiAgLy8gTG9hZCBlbnYgZmlsZSBiYXNlZCBvbiBgbW9kZWAgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXHJcbiAgLy8gU2V0IHRoZSB0aGlyZCBwYXJhbWV0ZXIgdG8gJycgdG8gbG9hZCBhbGwgZW52IHJlZ2FyZGxlc3Mgb2YgdGhlIGBWSVRFX2AgcHJlZml4LlxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gIHByb2Nlc3MuZW52ID0geyAuLi5wcm9jZXNzLmVudiwgLi4uZW52IH07XHJcblxyXG4gIGNvbnN0IGRldkNvbmZpZzogVXNlckNvbmZpZyA9IHtcclxuICAgIGRlZmluZToge1xyXG4gICAgICBfX0FQUF9FTlZfXzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYpLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luKHtcclxuICAgICAgICByZWxhdGl2ZUNTU0luamVjdGlvbjogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICAgIGNvZGVnZW4oeyBtYXRjaE9uU2NoZW1hczogdHJ1ZSwgZGVidWc6IHRydWUsIHRocm93T25CdWlsZDogZmFsc2UgfSksXHJcbiAgICBdLFxyXG5cclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG1pbmlmeTogdHJ1ZSxcclxuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgaW5wdXQ6ICcuL3NyYy9tYWluLnRzeCcsXHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBpZiAoY29tbWFuZCA9PT0gJ2J1aWxkJykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgLi4uZGV2Q29uZmlnLFxyXG4gICAgICBzc3I6IHtcclxuICAgICAgICAvLyBBZGQgeW91ciBleHRlcm5hbCBkZXBlbmRlbmNpZXMgaGVyZSBmb3IgdGhlIFNTUiBidWlsZCwgb3RoZXJ3aXNlLFxyXG4gICAgICAgIC8vIHRoZSBidW5kbGVkIHdvbid0IGhhdmUgZW5vdWdoIGxpYnJhcmllcyB0byByZW5kZXIgbm9FeHRlcm5hbDpcclxuICAgICAgICAvLyBbL0BcXHcrXFwvKi9dLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiBkZXZDb25maWc7XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZQLFNBQVMsY0FBYyxlQUEyQjtBQUMvUyxPQUFPLFdBQVc7QUFDbEIsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyxhQUFhO0FBR3BCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFHakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFVBQVEsTUFBTSxFQUFFLEdBQUcsUUFBUSxLQUFLLEdBQUcsSUFBSTtBQUV2QyxRQUFNLFlBQXdCO0FBQUEsSUFDNUIsUUFBUTtBQUFBLE1BQ04sYUFBYSxLQUFLLFVBQVUsSUFBSSxPQUFPO0FBQUEsSUFDekM7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLHNCQUFzQjtBQUFBLFFBQ3BCLHNCQUFzQjtBQUFBLE1BQ3hCLENBQUM7QUFBQSxNQUNELFFBQVEsRUFBRSxnQkFBZ0IsTUFBTSxPQUFPLE1BQU0sY0FBYyxNQUFNLENBQUM7QUFBQSxJQUNwRTtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsY0FBYztBQUFBLE1BQ2QsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZLFNBQVM7QUFDdkIsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSUw7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
